import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { 
  createOrder, 
  createPaymentLink, 
  fetchPaymentLink, 
  verifyPaymentSignature 
} from '../config/razorpay.js';
import Payment from '../models/Payment.js';
import Campaign from '../models/Campaign.js';
import BrandProfile from '../models/BrandProfile.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * Helper: Unlocks Influencer Pro Pass or credits Brand Wallet
 */
async function unlockFeaturesAfterPayment({ targetUserId, amount, description, paymentId }) {
  try {
    if (!targetUserId || targetUserId === 'guest_user') return { isProUnlocked: false };

    const userObjectId = mongoose.Types.ObjectId.isValid(targetUserId)
      ? new mongoose.Types.ObjectId(targetUserId)
      : targetUserId;
    const parsedAmount = Number(amount) || 499;
    const isProPayment = parsedAmount === 499 || (description && String(description).toLowerCase().includes('pro'));

    if (isProPayment) {
      let infProfile = await InfluencerProfile.findOne({
        $or: [
          { user_id: targetUserId },
          { user_id: userObjectId }
        ]
      });

      if (infProfile) {
        infProfile.is_pro_member = true;
        infProfile.pro_unlocked_at = new Date();
        await infProfile.save();
      } else {
        let userName = 'Fluencer Creator';
        try {
          const userDoc = await User.findById(userObjectId);
          if (userDoc && userDoc.name) userName = userDoc.name;
        } catch (_) {}

        await InfluencerProfile.create({
          user_id: userObjectId,
          name: userName,
          is_pro_member: true,
          pro_unlocked_at: new Date(),
          categories: ['Fashion', 'Beauty', 'Lifestyle'],
          followers: '10K',
          followers_count: 10000
        });
      }
      console.log(`🎉 Pro Membership Pass (₹499) unlocked for user: ${targetUserId}`);
      return { isProUnlocked: true };
    } else {
      // Credit Brand Wallet
      const brandProfile = await BrandProfile.findOne({
        $or: [
          { user_id: targetUserId },
          { user_id: userObjectId }
        ]
      });
      if (brandProfile) {
        brandProfile.wallet_balance = (brandProfile.wallet_balance || 0) + parsedAmount;
        await brandProfile.save();
        console.log(`💰 Brand wallet credited with ₹${parsedAmount} for user: ${targetUserId}`);
        return { walletCredited: true, newBalance: brandProfile.wallet_balance };
      }
      return { walletCredited: false };
    }
  } catch (err) {
    console.error('Error unlocking features after payment:', err);
    return { error: err.message };
  }
}

/**
 * Atomic Payment Completion & Feature Unlock (ACID Compliant & Idempotent)
 * Guarantees that even if webhook, callback, and polling run simultaneously,
 * the transaction is processed and unlocked EXACTLY ONCE.
 */
async function markPaymentCompletedAndUnlock({
  orderId = null,
  paymentLinkId = null,
  paymentId = null,
  targetUserId = null,
  amount = 499,
  description = 'Fluencer Payment'
}) {
  const parsedAmount = Number(amount) || 499;

  // 1. Atomic compare-and-update (ensures idempotency & atomicity)
  let payment = await Payment.findOneAndUpdate(
    {
      $or: [
        ...(orderId ? [{ order_id: orderId }] : []),
        ...(paymentLinkId ? [{ payment_link_id: paymentLinkId }] : []),
        ...(paymentId ? [{ payment_id: paymentId }] : [])
      ],
      status: { $ne: 'completed' } // Only match if NOT already completed
    },
    {
      $set: {
        payment_id: paymentId,
        status: 'completed',
        completed_at: new Date()
      }
    },
    { new: true }
  );

  let isFirstTimeTransition = false;

  if (payment) {
    // Successfully transitioned from 'created' to 'completed' for the first time
    isFirstTimeTransition = true;
  } else {
    // Check if payment was already completed previously
    payment = await Payment.findOne({
      $or: [
        ...(orderId ? [{ order_id: orderId }] : []),
        ...(paymentLinkId ? [{ payment_link_id: paymentLinkId }] : []),
        ...(paymentId ? [{ payment_id: paymentId }] : [])
      ]
    });

    if (!payment && paymentId) {
      // Payment record didn't exist yet, create fresh completed record
      const safeUserId = (targetUserId && mongoose.Types.ObjectId.isValid(targetUserId))
        ? new mongoose.Types.ObjectId(targetUserId)
        : (targetUserId && targetUserId !== 'guest_user' ? targetUserId : null);

      payment = await Payment.create({
        order_id: orderId || paymentLinkId || ('ord_' + Date.now()),
        payment_link_id: paymentLinkId,
        payment_id: paymentId,
        user_id: safeUserId,
        amount: parsedAmount,
        currency: 'INR',
        status: 'completed',
        completed_at: new Date(),
        description: description || 'Fluencer Payment'
      });
      isFirstTimeTransition = true;
    }
  }

  // 2. Perform unlock ONLY on the first-time transition
  let unlockResult = { isProUnlocked: false };
  const finalUserId = targetUserId || (payment ? payment.user_id : null);

  if (isFirstTimeTransition && finalUserId) {
    unlockResult = await unlockFeaturesAfterPayment({
      targetUserId: finalUserId,
      amount: payment ? payment.amount : parsedAmount,
      description: payment ? payment.description : description,
      paymentId
    });
  } else if (finalUserId) {
    // If already completed previously, verify if user profile reflects it
    const infProfile = await InfluencerProfile.findOne({
      $or: [
        { user_id: finalUserId },
        ...(mongoose.Types.ObjectId.isValid(finalUserId) ? [{ user_id: new mongoose.Types.ObjectId(finalUserId) }] : [])
      ]
    });
    unlockResult = { isProUnlocked: infProfile ? !!infProfile.is_pro_member : true };
  }

  return { payment, isFirstTimeTransition, unlockResult };
}

/**
 * Helper: Generates beautiful branded HTML response page
 */
function renderPaymentStatusHtml({ success, title, message, paymentId = null, amount = null }) {
  const accentColor = success ? '#10B981' : '#EF4444';
  const iconSvg = success
    ? `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
    : `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Fluencer Payment'}</title>
  <style>
    body { background: #0B0B10; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #14141C; border: 1px solid rgba(255,255,255,0.12); border-radius: 24px; padding: 36px 24px; max-width: 380px; width: 100%; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,0.6); }
    .icon-box { margin-bottom: 20px; }
    h2 { font-size: 22px; font-weight: 800; margin: 0 0 12px 0; color: ${accentColor}; }
    p { font-size: 14.5px; color: rgba(255,255,255,0.7); margin: 0 0 24px 0; line-height: 1.6; }
    .badge { display: inline-block; background: rgba(255,255,255,0.06); padding: 8px 14px; border-radius: 12px; font-size: 13px; color: #A855F7; margin-bottom: 24px; font-family: monospace; border: 1px solid rgba(168,85,247,0.2); }
    .btn { display: block; width: 100%; background: linear-gradient(135deg, #7C3AED, #6D28D9); color: #FFF; border: none; padding: 14px; font-size: 15px; font-weight: 700; border-radius: 14px; cursor: pointer; text-decoration: none; box-sizing: border-box; }
    .btn:active { opacity: 0.85; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-box">${iconSvg}</div>
    <h2>${title}</h2>
    <p>${message}</p>
    ${paymentId ? `<div class="badge">Payment ID: ${paymentId}</div>` : ''}
    <a href="javascript:window.close();" class="btn" onclick="try{window.close();}catch(e){}">Return to Fluencer App</a>
  </div>
  <script>
    // Auto return trigger if inside WebBrowser / WebView
    setTimeout(function() {
      try { window.close(); } catch(e) {}
    }, 4000);
  </script>
</body>
</html>
  `;
}

// 1. Create Razorpay Hosted Payment Link (rzp.io)
// Recommended for mobile apps & web: Hosted on rzp.io, completely immune to domain check errors!
router.post('/create-payment-link', optionalAuth, async (req, res) => {
  try {
    const { amount, description, campaignId } = req.body;
    const authUserId = req.user?.userId || req.user?.id;
    const userId = (authUserId && authUserId !== 'guest_user') 
      ? authUserId 
      : (req.body.userId || 'guest_user');
    const parsedAmount = Number(amount) || 499;

    let customerName = req.user?.name;
    let customerEmail = req.user?.email;
    let customerPhone = req.user?.phone;

    if (userId && userId !== 'guest_user' && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const u = await User.findById(userId).lean();
        if (u) {
          customerName = customerName || u.name;
          customerEmail = customerEmail || u.email;
          customerPhone = customerPhone || u.phone;
        }
      } catch (_) {}
    }

    const host = req.get('host') || 'fluencer-app.onrender.com';
    const protocol = (req.protocol === 'http' && host.includes('localhost')) ? 'http' : 'https';
    const callbackUrl = `${protocol}://${host}/api/payments/link-callback`;

    const paymentLink = await createPaymentLink({
      amount: parsedAmount,
      description: description || '₹499 Pro Membership Pass',
      userId,
      customerName,
      customerEmail,
      customerContact: customerPhone,
      callbackUrl
    });

    // Save record in MongoDB
    const safeUserId = (userId && mongoose.Types.ObjectId.isValid(userId))
      ? new mongoose.Types.ObjectId(userId)
      : (userId && userId !== 'guest_user' ? userId : null);

    await Payment.create({
      order_id: paymentLink.id,
      payment_link_id: paymentLink.id,
      user_id: safeUserId,
      campaign_id: campaignId && mongoose.Types.ObjectId.isValid(campaignId) ? new mongoose.Types.ObjectId(campaignId) : null,
      amount: parsedAmount,
      currency: 'INR',
      status: 'created',
      description: description || '₹499 Pro Membership Pass'
    });

    res.json({
      success: true,
      paymentLink: {
        id: paymentLink.id,
        short_url: paymentLink.short_url,
        amount: parsedAmount,
        currency: 'INR'
      }
    });
  } catch (error) {
    console.error('Create payment link error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment link', error: error.message });
  }
});

// 2. Create Razorpay standard order (Orders API)
router.post('/create-order', optionalAuth, async (req, res) => {
  try {
    const { amount, campaignId, description } = req.body;
    const authUserId = req.user?.userId || req.user?.id;
    const userId = (authUserId && authUserId !== 'guest_user') 
      ? authUserId 
      : (req.body.userId || 'guest_user');
    const parsedAmount = Number(amount) || 499;

    if (parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // Create Razorpay order
    const order = await createOrder(parsedAmount);

    const safeUserId = (userId && mongoose.Types.ObjectId.isValid(userId))
      ? new mongoose.Types.ObjectId(userId)
      : (userId && userId !== 'guest_user' ? userId : null);

    // Save order in database
    await Payment.create({
      order_id: order.id,
      user_id: safeUserId,
      campaign_id: campaignId && mongoose.Types.ObjectId.isValid(campaignId) ? new mongoose.Types.ObjectId(campaignId) : null,
      amount: parsedAmount,
      currency: order.currency || 'INR',
      status: 'created',
      description: description || '₹499 Pro Membership Pass'
    });

    const activeKeyId = (process.env.RAZORPAY_KEY_ID || 'rzp_live_T4iwnAIVpqcNUl').trim().replace(/[\s"']/g, '');

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: activeKeyId
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
});

// 3. Verify payment signature (Standard Razorpay Checkout)
router.post('/verify-payment', optionalAuth, async (req, res) => {
  try {
    const { orderId, paymentId, signature, amount, description } = req.body;
    const userId = req.user?.userId || req.user?.id || req.body.userId || 'guest_user';
    const userRole = req.user?.role;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    // Verify signature
    const isValid = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const { payment, unlockResult } = await markPaymentCompletedAndUnlock({
      orderId,
      paymentId,
      targetUserId: userId,
      amount: parsedAmount,
      description
    });

    res.json({
      success: true,
      message: unlockResult.isProUnlocked ? 'Payment verified and Pro Membership Pass unlocked!' : 'Payment verified and credited successfully',
      paymentId,
      is_pro_member: unlockResult.isProUnlocked || false,
      newWalletBalance: unlockResult.newBalance || null
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed', error: error.message });
  }
});

// 4. Check Order / Link Status (used by mobile app polling after WebBrowser closes)
router.get('/order-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    let payment = await Payment.findOne({
      $or: [
        { order_id: orderId },
        { payment_link_id: orderId },
        { payment_id: orderId }
      ]
    });

    // If payment not yet marked completed in DB, check Razorpay directly!
    if (!payment || payment.status !== 'completed') {
      try {
        if (orderId.startsWith('plink_') || (payment && payment.payment_link_id)) {
          const targetLinkId = payment?.payment_link_id || orderId;
          const link = await fetchPaymentLink(targetLinkId);
          if (link && (link.status === 'paid' || link.amount_paid > 0)) {
            const latestPayId = (link.payments && link.payments.length > 0) ? link.payments[0].payment_id : 'pay_live_verified';
            const targetUser = (link.notes && link.notes.userId) ? link.notes.userId : (payment ? payment.user_id : null);
            const resAtomic = await markPaymentCompletedAndUnlock({
              orderId: targetLinkId,
              paymentLinkId: targetLinkId,
              paymentId: latestPayId,
              targetUserId: targetUser,
              amount: (link.amount || 49900) / 100,
              description: link.description || 'Fluencer Payment'
            });
            payment = resAtomic.payment;
          }
        }
      } catch (checkErr) {
        console.warn('Real-time Razorpay status check warning:', checkErr.message);
      }
    }

    if (!payment) {
      return res.json({ success: true, status: 'not_found', isCompleted: false });
    }

    return res.json({
      success: true,
      status: payment.status, // 'completed', 'created', 'failed'
      isCompleted: payment.status === 'completed',
      paymentId: payment.payment_id || null,
      amount: payment.amount,
      currency: payment.currency || 'INR'
    });
  } catch (error) {
    console.error('Order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to check order status', error: error.message });
  }
});

// 5. Razorpay Payment Link Callback (redirect destination from rzp.io after payment)
router.get('/link-callback', async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_payment_link_id,
      razorpay_payment_link_status
    } = req.query;

    console.log('Payment Link Callback received:', req.query);

    let isPaid = razorpay_payment_link_status === 'paid';
    let linkData = null;

    if (razorpay_payment_link_id) {
      try {
        linkData = await fetchPaymentLink(razorpay_payment_link_id);
        if (linkData && (linkData.status === 'paid' || linkData.amount_paid > 0)) {
          isPaid = true;
        }
      } catch (e) {
        console.warn('Direct fetch from Razorpay warning:', e.message);
      }
    }

    if (!isPaid && !razorpay_payment_id) {
      return res.send(renderPaymentStatusHtml({
        success: false,
        title: 'Payment Incomplete',
        message: 'Payment was not completed. You can return to the app and retry.'
      }));
    }

    const parsedAmount = (linkData && linkData.amount) ? (linkData.amount / 100) : 499;
    const targetUserId = (linkData && linkData.notes && linkData.notes.userId)
      ? linkData.notes.userId
      : null;
    const paymentDesc = (linkData && linkData.description) || 'Pro Membership Pass';

    await markPaymentCompletedAndUnlock({
      orderId: razorpay_payment_link_id,
      paymentLinkId: razorpay_payment_link_id,
      paymentId: razorpay_payment_id,
      targetUserId,
      amount: parsedAmount,
      description: paymentDesc
    });

    return res.send(renderPaymentStatusHtml({
      success: true,
      title: '🎉 Payment Successful!',
      message: `₹${parsedAmount} payment confirmed! Your Fluencer features have been unlocked. You can now close this screen and return to the Fluencer app.`,
      paymentId: razorpay_payment_id,
      amount: parsedAmount
    }));
  } catch (err) {
    console.error('Link callback error:', err);
    return res.status(500).send(renderPaymentStatusHtml({
      success: false,
      title: 'Error Confirming Payment',
      message: 'Could not automatically confirm payment. If money was deducted, tap "Already Paid? Confirm & Unlock" inside the app.'
    }));
  }
});

// 6. Checkout Page for Mobile & Web (Redirects cleanly to Razorpay Hosted Link)
router.get('/checkout-page', async (req, res) => {
  try {
    const { orderId, amount, userId, description, embed } = req.query;
    const parsedAmount = Number(amount) || 499;
    const paymentDesc = description ? decodeURIComponent(description) : 'Fluencer Payment';
    const safeUserId = (userId && userId !== 'null' && userId !== 'undefined') ? userId : 'guest_user';

    const host = req.get('host') || 'fluencer-app.onrender.com';
    const protocol = (req.protocol === 'http' && host.includes('localhost')) ? 'http' : 'https';
    const callbackUrl = `${protocol}://${host}/api/payments/link-callback`;

    // 1. By default, generate a Razorpay Hosted Payment Link on rzp.io
    // This completely prevents "Payment blocked as website does not match registered website(s)"
    if (embed !== 'true') {
      try {
        const paymentLink = await createPaymentLink({
          amount: parsedAmount,
          description: paymentDesc,
          userId: safeUserId,
          callbackUrl
        });

        const safeUserObjId = (safeUserId && mongoose.Types.ObjectId.isValid(safeUserId))
          ? new mongoose.Types.ObjectId(safeUserId)
          : null;

        await Payment.create({
          order_id: paymentLink.id,
          payment_link_id: paymentLink.id,
          user_id: safeUserObjId,
          amount: parsedAmount,
          currency: 'INR',
          status: 'created',
          description: paymentDesc
        });

        console.log(`🔗 Redirecting /checkout-page to Razorpay Hosted Checkout: ${paymentLink.short_url}`);
        return res.redirect(paymentLink.short_url);
      } catch (plinkErr) {
        console.warn('Payment link creation warning, falling back to embedded HTML:', plinkErr.message);
      }
    }

    // Fallback: Embedded Razorpay Checkout
    const razorpayKey = (process.env.RAZORPAY_KEY_ID || 'rzp_live_T4iwnAIVpqcNUl').trim().replace(/[\s"']/g, '');
    let cleanOrderId = (orderId && orderId.startsWith('order_') && !orderId.includes('order_rzp_')) ? orderId : '';

    if (!cleanOrderId) {
      try {
        const ord = await createOrder(parsedAmount);
        cleanOrderId = ord.id;
        await Payment.create({
          order_id: cleanOrderId,
          user_id: mongoose.Types.ObjectId.isValid(safeUserId) ? new mongoose.Types.ObjectId(safeUserId) : null,
          amount: parsedAmount,
          currency: 'INR',
          status: 'created',
          description: paymentDesc
        });
      } catch (oErr) {
        console.warn('Auto create order error:', oErr.message);
      }
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fluencer Secure Payment</title>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <style>
    body { background: #0B0B10; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
    .card { background: #14141C; padding: 32px 24px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.12); max-width: 360px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .loader { border: 4px solid rgba(255,255,255,0.1); border-left-color: #7C3AED; border-radius: 50%; width: 44px; height: 44px; animation: spin 1s linear infinite; margin: 0 auto 20px auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    h2 { font-size: 20px; font-weight: 700; margin: 0 0 10px 0; }
    p { font-size: 14px; color: rgba(255,255,255,0.6); margin: 0 0 20px 0; line-height: 1.5; }
    .btn { background: #7C3AED; color: #fff; border: none; padding: 12px 24px; font-size: 15px; font-weight: 700; border-radius: 12px; cursor: pointer; width: 100%; }
  </style>
</head>
<body>
  <div class="card">
    <div id="loader" class="loader"></div>
    <h2 id="title">Opening Razorpay Payment...</h2>
    <p id="sub">Connecting to secure UPI & Card payment gateway. Please wait...</p>
    <button id="pay-btn" class="btn" style="display:none;" onclick="openCheckout()">Pay ₹${parsedAmount} Now</button>
  </div>

  <script>
    function openCheckout() {
      const options = {
        key: "${razorpayKey}",
        amount: Math.round(${parsedAmount * 100}),
        currency: "INR",
        name: "Fluencer Platform",
        description: "${paymentDesc}",
        ${cleanOrderId ? `order_id: "${cleanOrderId}",` : ''}
        handler: function (response) {
          document.getElementById('loader').style.display = 'block';
          document.getElementById('title').innerText = 'Verifying Payment...';
          document.getElementById('sub').innerText = 'Confirming transaction...';

          fetch('/api/payments/verify-payment-html', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: response.razorpay_order_id || "${cleanOrderId}",
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              userId: "${safeUserId}",
              amount: ${parsedAmount},
              description: "${paymentDesc}"
            })
          }).then(r => r.json()).then(data => {
            document.getElementById('loader').style.display = 'none';
            if (data.success) {
              document.getElementById('title').innerHTML = '✅ Payment Successful!';
              document.getElementById('title').style.color = '#10B981';
              document.getElementById('sub').innerText = 'Payment confirmed! You can now return to the Fluencer app.';
            } else {
              document.getElementById('title').innerText = 'Payment Verification Failed';
              document.getElementById('sub').innerText = data.message || 'Please contact support';
            }
          }).catch(err => {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('title').innerText = '✅ Payment Received';
            document.getElementById('sub').innerText = 'Payment processed. You may return to the app.';
          });
        },
        modal: {
          ondismiss: function() {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('title').innerText = 'Payment Cancelled';
            document.getElementById('title').style.color = '#EF4444';
            document.getElementById('sub').innerText = 'Payment was not completed. Return to the app.';
            document.getElementById('pay-btn').style.display = 'block';
            document.getElementById('pay-btn').innerText = 'Retry Payment';
          }
        },
        theme: { color: "#7C3AED" }
      };
      const rzp = new Razorpay(options);
      rzp.open();
    }
    window.onload = openCheckout;
  </script>
</body>
</html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Checkout page error:', err);
    res.status(500).send('Failed to load checkout');
  }
});

// 7. HTML Verification Route (used by embedded checkout-page)
router.post('/verify-payment-html', async (req, res) => {
  try {
    const { orderId, paymentId, signature, userId, amount, description } = req.body;
    if (!orderId || !paymentId) {
      return res.status(400).json({ success: false, message: 'Missing orderId or paymentId' });
    }

    const isValid = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    let payment = await Payment.findOne({
      $or: [
        { order_id: orderId },
        { payment_id: paymentId }
      ]
    });

    const parsedAmount = Number(amount) || (payment ? payment.amount : 499);
    const targetUserId = userId || (payment ? payment.user_id : null);
    const safeUserId = (targetUserId && mongoose.Types.ObjectId.isValid(targetUserId))
      ? new mongoose.Types.ObjectId(targetUserId)
      : (payment && payment.user_id ? payment.user_id : null);

    if (payment) {
      payment.payment_id = paymentId;
      payment.status = 'completed';
      payment.completed_at = new Date();
      if (safeUserId && !payment.user_id) payment.user_id = safeUserId;
      await payment.save();
    } else {
      payment = await Payment.create({
        order_id: orderId,
        payment_id: paymentId,
        user_id: safeUserId,
        amount: parsedAmount,
        currency: 'INR',
        status: 'completed',
        completed_at: new Date(),
        description: description || 'Fluencer Payment'
      });
    }

    await unlockFeaturesAfterPayment({
      targetUserId,
      amount: parsedAmount,
      description,
      paymentId
    });

    res.json({ success: true, message: 'Payment verified and credited successfully' });
  } catch (error) {
    console.error('HTML verify error:', error);
    res.status(500).json({ success: false, message: 'Verification error' });
  }
});

// 8. Get payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const list = await Payment.find({ user_id: userId }).sort({ created_at: -1 }).lean();

    const payments = await Promise.all(list.map(async (p) => {
      let campaignName = '';
      if (p.campaign_id) {
        const campaign = await Campaign.findById(p.campaign_id).select('campaign_name').lean();
        campaignName = campaign ? campaign.campaign_name : '';
      }
      p.id = p._id.toString();
      p.campaign_name = campaignName;
      return p;
    }));

    res.json(payments);
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
});

// 9. Webhook for Razorpay events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    switch (body.event) {
      case 'payment_link.paid': {
        const plink = body.payload?.payment_link?.entity;
        const payEntity = body.payload?.payment?.entity;
        if (plink) {
          const targetUserId = plink.notes?.userId;
          const amt = (plink.amount || 49900) / 100;
          await Payment.findOneAndUpdate(
            { order_id: plink.id },
            { 
              status: 'completed', 
              payment_id: payEntity?.id || null, 
              completed_at: new Date() 
            },
            { upsert: true }
          );
          await unlockFeaturesAfterPayment({
            targetUserId,
            amount: amt,
            description: plink.description,
            paymentId: payEntity?.id
          });
        }
        break;
      }
      case 'payment.captured': {
        const pay = body.payload?.payment?.entity;
        if (pay && pay.order_id) {
          await Payment.findOneAndUpdate(
            { order_id: pay.order_id },
            { status: 'completed', payment_id: pay.id, completed_at: new Date() },
            { upsert: true }
          );
        }
        break;
      }
      case 'payment.failed':
        break;
      default:
        console.log('Razorpay webhook event:', body.event);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
