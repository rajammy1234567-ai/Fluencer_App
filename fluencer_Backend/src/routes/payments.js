import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createOrder, verifyPaymentSignature } from '../config/razorpay.js';
import Payment from '../models/Payment.js';
import Campaign from '../models/Campaign.js';
import BrandProfile from '../models/BrandProfile.js';

const router = express.Router();

// Create payment order
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, campaignId, description } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Create Razorpay order
    const order = await createOrder(amount);

    // Save order in database
    await Payment.create({
      order_id: order.id,
      user_id: userId,
      campaign_id: campaignId || null,
      amount: amount,
      currency: order.currency,
      status: 'created',
      description: description || ''
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// Verify payment
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const userId = req.user.userId;

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

    // Update payment status in database
    const payment = await Payment.findOneAndUpdate(
      { order_id: orderId, user_id: userId },
      { payment_id: paymentId, status: 'completed', completed_at: new Date() },
      { new: true }
    );

    // Credit Brand Wallet Balance upon successful Razorpay Payment
    const brandProfile = await BrandProfile.findOne({ user_id: userId });
    if (brandProfile && payment && payment.amount) {
      brandProfile.wallet_balance = (brandProfile.wallet_balance || 0) + payment.amount;
      await brandProfile.save();
    }

    res.json({
      success: true,
      message: 'Payment verified and wallet credited successfully',
      paymentId,
      newWalletBalance: brandProfile ? brandProfile.wallet_balance : null
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

// HTML Checkout Page for Native Mobile Apps (Expo / Android APK)
router.get('/checkout-page', async (req, res) => {
  try {
    const { orderId, amount, userId } = req.query;
    const razorpayKey = (process.env.RAZORPAY_KEY_ID || 'rzp_live_T4iwnAIVpqcNUl').trim().replace(/[\s"']/g, '');

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
        description: "Wallet Deposit",
        order_id: "${orderId || ''}",
        handler: function (response) {
          document.getElementById('loader').style.display = 'block';
          document.getElementById('title').innerText = 'Verifying Payment...';
          document.getElementById('sub').innerText = 'Updating your wallet balance...';

          fetch('/api/payments/verify-payment-html', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: response.razorpay_order_id || "${orderId || ''}",
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              userId: "${userId || ''}"
            })
          }).then(r => r.json()).then(data => {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('title').innerHTML = '✅ Payment Successful!';
            document.getElementById('title').style.color = '#10B981';
            document.getElementById('sub').innerText = '₹${amount} credited to wallet! Payment ID: ' + response.razorpay_payment_id;
          }).catch(err => {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('title').innerText = '✅ Payment Received';
            document.getElementById('sub').innerText = 'Payment processed successfully.';
          });
        },
        modal: {
          ondismiss: function() {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('title').innerText = 'Payment Pending';
            document.getElementById('sub').innerText = 'Click below if payment checkout closed.';
            document.getElementById('pay-btn').style.display = 'block';
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
    const { orderId, paymentId, signature, userId } = req.body;
    if (!orderId || !paymentId || !userId) {
      return res.status(400).json({ success: false, message: 'Missing details' });
    }

    const isValid = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const payment = await Payment.findOneAndUpdate(
      { order_id: orderId },
      { payment_id: paymentId, status: 'completed', completed_at: new Date(), user_id: userId },
      { new: true, upsert: true }
    );

    const brandProfile = await BrandProfile.findOne({ user_id: userId });
    if (brandProfile && payment && payment.amount) {
      brandProfile.wallet_balance = (brandProfile.wallet_balance || 0) + payment.amount;
      await brandProfile.save();
    }

    res.json({ success: true, message: 'Wallet credited successfully' });
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
