import express from 'express';
import authMiddleware from '../middleware/auth.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import IAPTransaction from '../models/IAPTransaction.js';
import {
  EXPECTED_BUNDLE_ID,
  EXPECTED_PRODUCT_ID,
  getStoreConfigurationStatus,
  verifyApplePurchase,
  verifyGooglePlayPurchase,
  processAppleServerNotification,
  processGooglePlayNotification,
} from '../services/storeVerificationService.js';

const router = express.Router();

/**
 * In-App Purchase (IAP) Server-Side Verification Controller
 * 
 * Cryptographic & Integrity Controls:
 * 1. App Identity: Enforces bundle ID / package name matches 'com.fluencers.app'.
 * 2. Product ID: Verifies product matches 'fluencer_pro_lifetime'.
 * 3. Replay Protection: Checks if transaction_id / purchase_token was already redeemed by another user.
 * 4. Transaction Ownership: Binds verified transaction strictly to authenticated userId.
 * 5. Purchase Status & Revocations: Rejects refunded/revoked transactions.
 * 6. Google Play Acknowledgement: Records acknowledgment state.
 * 7. Store API Keys Check: If Apple/Google developer credentials are not configured,
 *    returns 503 IAP_SERVER_NOT_CONFIGURED (Sandbox/production verification is blocked).
 */

// Store Configuration Status Endpoint (for diagnostic checks)
router.get('/config-status', (req, res) => {
  const status = getStoreConfigurationStatus();
  return res.json({
    success: true,
    stores: status,
  });
});

// Verify Purchase Endpoint
router.post('/verify-purchase', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { 
      platform, 
      productId, 
      transactionId, 
      purchaseToken, 
      bundleId,
      receiptData 
    } = req.body;

    // 1. Parameter Validation
    if (!platform || !productId || !transactionId) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Platform (ios/android), productId, and transactionId are required.'
      });
    }

    if (!['ios', 'android'].includes(platform)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PLATFORM',
        message: 'Platform must be either "ios" or "android".'
      });
    }

    // 2. App Identity Verification
    const incomingBundleId = bundleId || EXPECTED_BUNDLE_ID;
    if (incomingBundleId !== EXPECTED_BUNDLE_ID) {
      return res.status(403).json({
        success: false,
        code: 'APP_IDENTITY_MISMATCH',
        message: `App identity ${incomingBundleId} does not match licensed application.`
      });
    }

    // 3. Product ID Verification
    if (productId !== EXPECTED_PRODUCT_ID) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PRODUCT_ID',
        message: `Unknown or unconfigured store product: ${productId}`
      });
    }

    // 4. Replay Attack & Ownership Protection
    const existingTx = await IAPTransaction.findOne({
      $or: [
        { transaction_id: transactionId },
        ...(purchaseToken ? [{ purchase_token: purchaseToken }] : [])
      ]
    });

    if (existingTx) {
      if (existingTx.user_id.toString() !== userId.toString()) {
        console.warn(`🚨 REPLAY ATTACK BLOCKED: Transaction ${transactionId} already belongs to user ${existingTx.user_id}`);
        return res.status(409).json({
          success: false,
          code: 'TRANSACTION_ALREADY_CLAIMED',
          message: 'This store purchase has already been claimed by another account. Replay rejected.'
        });
      }

      if (['refunded', 'revoked'].includes(existingTx.status)) {
        return res.status(403).json({
          success: false,
          code: 'PURCHASE_REVOKED',
          message: `This purchase was previously ${existingTx.status} by the store.`
        });
      }

      // Idempotent retry by the same user who already owns it
      if (existingTx.status === 'purchased' || existingTx.status === 'restored') {
        return res.status(200).json({
          success: true,
          message: 'Pro membership already verified for this transaction.',
          isProMember: true,
          transactionId: existingTx.transaction_id,
        });
      }
    }

    // 5. Store API Credentials Check
    const storeStatus = getStoreConfigurationStatus();

    if (platform === 'ios' && !storeStatus.apple.configured) {
      console.warn('⚠️ Apple StoreKit verification blocked: credentials not configured in environment.');
      return res.status(503).json({
        success: false,
        code: 'IAP_SERVER_NOT_CONFIGURED',
        message: 'Apple In-App Purchase server verification is awaiting App Store Connect credentials.',
        isBlocked: true,
        requiredInputs: storeStatus.apple.missingKeys,
      });
    }

    if (platform === 'android' && !storeStatus.google.configured) {
      console.warn('⚠️ Google Play Billing verification blocked: credentials not configured in environment.');
      return res.status(503).json({
        success: false,
        code: 'IAP_SERVER_NOT_CONFIGURED',
        message: 'Google Play Billing server verification is awaiting Google Play Console service account credentials.',
        isBlocked: true,
        requiredInputs: storeStatus.google.missingKeys,
      });
    }

    // 6. Execute Live Store Verification Call
    if (platform === 'ios') {
      const appleResult = await verifyApplePurchase({ receiptData, transactionId, productId, bundleId });
      if (!appleResult.verified) {
        return res.status(400).json({
          success: false,
          code: 'RECEIPT_VERIFICATION_FAILED',
          message: appleResult.message || 'Apple StoreKit receipt could not be verified.',
        });
      }
    } else if (platform === 'android') {
      const googleResult = await verifyGooglePlayPurchase({ purchaseToken, productId, packageName: incomingBundleId });
      if (!googleResult.verified) {
        return res.status(400).json({
          success: false,
          code: 'TOKEN_VERIFICATION_FAILED',
          message: googleResult.message || 'Google Play purchase token could not be verified.',
        });
      }
    }

    // 7. Record or Update Verified Transaction
    const tx = await IAPTransaction.findOneAndUpdate(
      { transaction_id: transactionId },
      {
        $set: {
          purchase_token: purchaseToken || null,
          user_id: userId,
          platform,
          product_id: productId,
          bundle_id: EXPECTED_BUNDLE_ID,
          status: 'purchased',
          is_acknowledged: true,
          raw_payload: receiptData || {}
        }
      },
      { upsert: true, new: true }
    );

    // 8. Update User Profile to Pro Member
    await InfluencerProfile.findOneAndUpdate(
      { $or: [{ user_id: userId }, { user_id: userId.toString() }] },
      {
        $set: {
          is_pro_member: true,
          pro_unlocked_at: new Date(),
          pro_purchase_platform: platform,
          pro_product_id: productId,
          pro_transaction_id: tx._id
        }
      }
    );

    console.log(`✅ IAP verified & Pro Pass granted to User [${userId}] via ${platform}`);
    return res.status(200).json({
      success: true,
      message: 'Pro membership successfully verified and activated.',
      isProMember: true,
      transactionId: tx.transaction_id
    });

  } catch (error) {
    console.error('❌ IAP verify error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Failed to verify in-app purchase: ' + error.message
    });
  }
});

// Check Pro Membership Status Endpoint
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const activeTx = await IAPTransaction.findOne({
      user_id: userId,
      product_id: EXPECTED_PRODUCT_ID,
      status: { $in: ['purchased', 'restored'] }
    });
    return res.status(200).json({
      success: true,
      isProMember: !!activeTx,
      activeTransaction: activeTx || null
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Restore Purchases Endpoint (Apple Guideline 3.1.1 Requirement)
router.post('/restore-purchases', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { platform } = req.body;

    console.log(`🔍 Checking restore purchases for User [${userId}] on platform [${platform}]`);

    // Find any valid, non-revoked transaction belonging to this user
    const validTx = await IAPTransaction.findOne({
      user_id: userId,
      product_id: EXPECTED_PRODUCT_ID,
      status: { $in: ['purchased', 'restored'] }
    });

    if (validTx) {
      await InfluencerProfile.findOneAndUpdate(
        { $or: [{ user_id: userId }, { user_id: userId.toString() }] },
        {
          $set: {
            is_pro_member: true,
            pro_restored_at: new Date()
          }
        }
      );

      return res.status(200).json({
        success: true,
        restored: true,
        message: 'Your Pro Membership was successfully restored.',
        isProMember: true
      });
    }

    return res.status(200).json({
      success: true,
      restored: false,
      message: 'No previous valid purchases found for this account.',
      isProMember: false
    });

  } catch (error) {
    console.error('❌ Restore purchases error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Failed to restore purchases: ' + error.message
    });
  }
});

// Apple App Store Server Notifications V2 Webhook
router.post('/webhook/apple', async (req, res) => {
  try {
    const payload = req.body;
    await processAppleServerNotification(payload);
    return res.status(200).json({ success: true, message: 'Apple notification processed.' });
  } catch (err) {
    console.error('Apple webhook error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Google Play Real-Time Developer Notifications (RTDN) Webhook
router.post('/webhook/google', async (req, res) => {
  try {
    const payload = req.body;
    await processGooglePlayNotification(payload?.message || payload);
    return res.status(200).json({ success: true, message: 'Google Play notification processed.' });
  } catch (err) {
    console.error('Google Play webhook error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
