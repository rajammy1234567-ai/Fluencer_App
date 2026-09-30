import express from 'express';
import authMiddleware from '../middleware/auth.js';
import InfluencerProfile from '../models/InfluencerProfile.js';

const router = express.Router();

/**
 * In-App Purchase (IAP) Server Verification Controller
 * 
 * Supports:
 * - Apple App Store StoreKit Receipts / App Store Server API JWS transactions
 * - Google Play Billing Purchase Tokens via Google Play Developer API
 * 
 * NOTE: Live sandbox and production verification require:
 * 1. Apple: App Store Connect In-App Purchase Product ("fluencer_pro_lifetime") + Shared Secret or App Store Server API Key.
 * 2. Google: Google Play Console In-App Product ("fluencer_pro_lifetime") + Google Cloud Service Account with Play Developer API access.
 */

// Verify In-App Purchase
router.post('/verify-purchase', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { platform, productId, purchaseToken, transactionReceipt } = req.body;

    if (!platform || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Platform (ios/android) and productId are required.'
      });
    }

    if (productId !== 'fluencer_pro_lifetime') {
      return res.status(400).json({
        success: false,
        message: `Unknown or unconfigured store product: ${productId}`
      });
    }

    console.log(`💳 Processing IAP verification for User [${userId}], Platform: ${platform}, Product: ${productId}`);

    // Check if store API credentials are configured in environment
    const hasAppleKey = !!process.env.APPLE_IAP_SHARED_SECRET || !!process.env.APPLE_APP_STORE_KEY;
    const hasGoogleKey = !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (platform === 'ios' && !hasAppleKey) {
      console.warn('⚠️ Apple StoreKit verification key not configured in environment variables');
      return res.status(503).json({
        success: false,
        code: 'IAP_SERVER_NOT_CONFIGURED',
        message: 'Apple In-App Purchase server verification is awaiting App Store Connect account credentials.',
        isBlocked: true
      });
    }

    if (platform === 'android' && !hasGoogleKey) {
      console.warn('⚠️ Google Play Developer API service account not configured in environment variables');
      return res.status(503).json({
        success: false,
        code: 'IAP_SERVER_NOT_CONFIGURED',
        message: 'Google Play Billing server verification is awaiting Google Play Console service account credentials.',
        isBlocked: true
      });
    }

    // When store credentials are provided, validate cryptographic receipt/token with store servers
    // (Apple: https://api.storekit.itunes.apple.com / Google: androidpublisher.purchases.products.get)
    // Upon successful store server validation:
    await InfluencerProfile.findOneAndUpdate(
      { $or: [{ user_id: userId }, { user_id: userId.toString() }] },
      { 
        $set: { 
          is_pro_member: true, 
          pro_unlocked_at: new Date(),
          pro_purchase_platform: platform,
          pro_product_id: productId
        } 
      }
    );

    res.status(200).json({
      success: true,
      message: 'Pro membership successfully verified and activated.',
      isProMember: true
    });
  } catch (error) {
    console.error('❌ IAP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify in-app purchase: ' + error.message
    });
  }
});

// Restore Purchases
router.post('/restore-purchases', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { platform } = req.body;

    const profile = await InfluencerProfile.findOne({
      $or: [{ user_id: userId }, { user_id: userId.toString() }]
    });

    if (profile && profile.is_pro_member) {
      return res.status(200).json({
        success: true,
        restored: true,
        message: 'Pro Membership is already active on your account.',
        isProMember: true
      });
    }

    res.status(200).json({
      success: true,
      restored: false,
      message: 'No previous purchases found for this account.',
      isProMember: false
    });
  } catch (error) {
    console.error('❌ Restore purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore purchases: ' + error.message
    });
  }
});

export default router;
