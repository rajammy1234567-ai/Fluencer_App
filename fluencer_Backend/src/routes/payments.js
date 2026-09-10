import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/auth.js';
import { createOrder, verifyPaymentSignature } from '../config/razorpay.js';
import Payment from '../models/Payment.js';
import Campaign from '../models/Campaign.js';
import BrandProfile from '../models/BrandProfile.js';
import InfluencerProfile from '../models/InfluencerProfile.js';

const router = express.Router();

// Create payment order
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, campaignId, description } = req.body;
    const userId = req.user.userId || req.user.id || 'guest_user';

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // Create Razorpay order
    const order = await createOrder(amount);

    // Save order in database
    await Payment.create({
      order_id: order.id,
      user_id: userId,
      campaign_id: campaignId || null,
      amount: amount,
      currency: order.currency || 'INR',
      status: 'created',
      description: description || ''
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

// Verify payment
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    const { orderId, paymentId, signature, amount, description } = req.body;
    const userId = req.user.userId || req.user.id || 'guest_user';
    const userRole = req.user.role;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: 'Missing payment details' });
    }

    // Verify signature
    const isValid = verifyPaymentSignature(orderId, paymentId, signature);

    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature' 
      });
    }

    // Update or create payment record in database
    let payment = await Payment.findOne({
      $or: [
        { order_id: orderId },
        { payment_id: paymentId }
      ]
    });

    const parsedAmount = Number(amount) || (payment ? payment.amount : 499);

    if (payment) {
      payment.payment_id = paymentId;
      payment.status = 'completed';
      payment.completed_at = new Date();
      if (!payment.user_id || payment.user_id === 'guest_user') {
        payment.user_id = userId;
      }
      await payment.save();
    } else {
      payment = await Payment.create({
        order_id: orderId,
        payment_id: paymentId,
        user_id: userId,
        amount: parsedAmount,
        currency: 'INR',
        status: 'completed',
        completed_at: new Date(),
        description: description || '₹499 Pro Membership Pass'
      });
    }

    const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const isProPayment = parsedAmount === 499 || userRole === 'influencer' || (description && String(description).toLowerCase().includes('pro'));

    let isProMemberUnlocked = false;

    // 1. Check and unlock Influencer Pro Membership
    let infProfile = await InfluencerProfile.findOne({
      $or: [
        { user_id: userId },
        { user_id: userObjectId }
      ]
    });

    if (isProPayment || userRole === 'influencer' || infProfile) {
      if (infProfile) {
        infProfile.is_pro_member = true;
        infProfile.pro_unlocked_at = new Date();
        if (typeof infProfile.user_id === 'string' && mongoose.Types.ObjectId.isValid(infProfile.user_id)) {
          infProfile.user_id = new mongoose.Types.ObjectId(infProfile.user_id);
        }
        await infProfile.save();
        isProMemberUnlocked = true;
      } else if (userId && userId !== 'guest_user') {
        infProfile = await InfluencerProfile.create({
          user_id: userObjectId,
          name: req.user.name || 'Fluencer Creator',
          is_pro_member: true,
          pro_unlocked_at: new Date(),
          categories: ['Fashion', 'Beauty', 'Lifestyle'],
          followers: '10K',
          followers_count: 10000
        });
        isProMemberUnlocked = true;
      }
      console.log(`🎉 Pro Membership unlocked via /verify-payment for user: ${userId}, payment: ${paymentId}`);
    }

    // 2. Credit Brand Wallet Balance upon successful deposit
    const brandProfile = await BrandProfile.findOne({
      $or: [
        { user_id: userId },
        { user_id: userObjectId }
      ]
    });

    if (brandProfile && !isProPayment && userRole !== 'influencer') {
      brandProfile.wallet_balance = (brandProfile.wallet_balance || 0) + parsedAmount;
      await brandProfile.save();
    }

    res.json({
      success: true,
      message: isProMemberUnlocked ? 'Payment verified and Pro Membership Pass unlocked!' : 'Payment verified and wallet credited successfully',
      paymentId,
      is_pro_member: isProMemberUnlocked || (infProfile ? !!infProfile.is_pro_member : false),
      newWalletBalance: brandProfile ? brandProfile.wallet_balance : null
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

// Check Order Payment Status (used by mobile app after WebBrowser closes)
router.get('/order-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const payment = await Payment.findOne({
      $or: [
        { order_id: orderId },
        { payment_id: orderId }
      ]
    }).lean();

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

// HTML Checkout Page for Native Mobile Apps (Expo / Android APK)
router.get('/checkout-page', async (req, res) => {
  try {
    const { orderId, amount, userId, description } = req.query;
    const razorpayKey = (process.env.RAZORPAY_KEY_ID || 'rzp_live_T4iwnAIVpqcNUl').trim().replace(/[\s"']/g, '');
    const cleanOrderId = (orderId && orderId.startsWith('order_') && !orderId.includes('order_rzp_')) ? orderId : '';
    const paymentDesc = description ? decodeURIComponent(description) : 'Fluencer Payment';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fluencer Secure Payment</title>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <style>
    body { background: #0B0B10; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
    .card { background: #14141C; padding: 32px 24px; borderRadius: 24px; border: 1px solid rgba(255,255,255,0.12); max-width: 360px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
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
    <button id="pay-btn" class="btn" style="display:none;" onclick="openCheckout()">Pay ₹${amount || ''} Now</button>
  </div>

  <script>
    function openCheckout() {
      const options = {
        key: "${razorpayKey}",
        amount: Math.round(${parseFloat(amount || 0) * 100}),
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
              orderId: response.razorpay_order_id || "${orderId || ''}",
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              userId: "${userId || ''}",
              amount: ${parseFloat(amount || 0)},
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

// HTML Verification Route (used by checkout-page)
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

    // Find existing payment record if created by /create-order
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
      : (payment && payment.user_id ? payment.user_id : new mongoose.Types.ObjectId());

    if (payment) {
      payment.payment_id = paymentId;
      payment.status = 'completed';
      payment.completed_at = new Date();
      if (targetUserId && mongoose.Types.ObjectId.isValid(targetUserId) && !payment.user_id) {
        payment.user_id = safeUserId;
      }
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

    if (targetUserId && targetUserId !== 'guest_user') {
      const userObjectId = mongoose.Types.ObjectId.isValid(targetUserId) ? new mongoose.Types.ObjectId(targetUserId) : targetUserId;
      const isProPayment = parsedAmount === 499 || (description && String(description).toLowerCase().includes('pro'));

      if (isProPayment) {
        // Unlock Influencer Pro Membership
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
          await InfluencerProfile.create({
            user_id: userObjectId,
            name: 'Fluencer Creator',
            is_pro_member: true,
            pro_unlocked_at: new Date(),
            categories: ['Fashion', 'Beauty', 'Lifestyle'],
            followers: '10K',
            followers_count: 10000
          });
        }
        console.log(`🎉 Pro Membership unlocked via HTML checkout for user: ${targetUserId}`);
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
        }
      }
    }

    res.json({ success: true, message: 'Payment verified and credited successfully' });
  } catch (error) {
    console.error('HTML verify error:', error);
    res.status(500).json({ success: false, message: 'Verification error' });
  }
});

// Get payment history
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

// Webhook for Razorpay events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    // Verify webhook signature here
    // Implementation depends on your security requirements

    // Handle different events
    switch (body.event) {
      case 'payment.captured':
        // Update payment status
        break;
      case 'payment.failed':
        // Handle failed payment
        break;
      default:
        console.log('Unhandled event:', body.event);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
