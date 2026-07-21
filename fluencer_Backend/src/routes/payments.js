import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createOrder, verifyPaymentSignature } from '../config/razorpay.js';
import Payment from '../models/Payment.js';
import Campaign from '../models/Campaign.js';

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
    await Payment.findOneAndUpdate(
      { order_id: orderId, user_id: userId },
      { payment_id: paymentId, status: 'completed', completed_at: new Date() }
    );

    res.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
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
