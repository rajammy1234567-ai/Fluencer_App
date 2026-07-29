import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { getAuthHeader } from './storage';
import { API, getApiUrl } from '../constants/api';

/**
 * Initialize Razorpay payment
 * @param {Object} paymentData - Payment details
 * @param {number} paymentData.amount - Amount in rupees
 * @param {string} paymentData.description - Payment description
 * @param {number} paymentData.campaignId - Campaign ID (optional)
 * @param {Function} onSuccess - Success callback
 * @param {Function} onFailure - Failure callback
 */
export const initiatePayment = async ({
  amount,
  description,
  campaignId = null,
  onSuccess,
  onFailure,
}) => {
  try {
    const headers = await getAuthHeader();
    headers['Content-Type'] = 'application/json';

    // Step 1: Create Order via Backend API
    const orderRes = await fetch(getApiUrl('/api/payments/create-order'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ amount, description, campaignId })
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok || !orderData.order) {
      throw new Error(orderData.message || 'Failed to create payment order');
    }

    const order = orderData.order;

    // Step 2: Show Payment Gateways (Razorpay standard modal or simulator)
    Alert.alert(
      '💳 Secure Razorpay Checkout',
      `Order ID: ${order.id}\nTotal Amount: ₹${amount}\n\n${description}\n\nSelect payment action:`,
      [
        {
          text: 'Cancel Payment',
          style: 'cancel',
          onPress: () => {
            if (onFailure) onFailure({ message: 'Payment cancelled' });
          },
        },
        {
          text: 'Pay with Razorpay / UPI',
          onPress: async () => {
            try {
              // Simulate Razorpay signature verification with backend
              const mockPaymentId = 'pay_' + Date.now().toString().slice(-10);
              const mockSignature = 'sig_' + Date.now();

              const verifyRes = await fetch(getApiUrl('/api/payments/verify-payment'), {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  orderId: order.id,
                  paymentId: mockPaymentId,
                  signature: mockSignature
                })
              });
              const verifyData = await verifyRes.json();

              if (verifyRes.ok && verifyData.success) {
                Alert.alert('✅ Payment Successful', `₹${amount} paid via Razorpay! Wallet updated.`, [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (onSuccess) onSuccess({ paymentId: mockPaymentId, newBalance: verifyData.newWalletBalance });
                    },
                  },
                ]);
              } else {
                Alert.alert('Payment Error', verifyData.message || 'Verification failed');
                if (onFailure) onFailure(verifyData);
              }
            } catch (err) {
              console.error('Verify error:', err);
              Alert.alert('Error', 'Failed to complete payment verification');
              if (onFailure) onFailure(err);
            }
          },
        },
      ]
    );
  } catch (error) {
    console.error('Payment initialization error:', error);
    Alert.alert('Error', error.message || 'Failed to initialize payment');
    if (onFailure) onFailure(error);
  }
};

/**
 * Calculate campaign creation cost
 * @param {Object} campaignData - Campaign details
 * @returns {number} Total cost
 */
export const calculateCampaignCost = (campaignData) => {
  const { number_of_seats, cost_per_influencer, campaign_type } = campaignData;
  
  if (campaign_type === 'barter') {
    return 0; // Barter campaigns are free or have different pricing
  }
  
  const influencerCost = number_of_seats * cost_per_influencer;
  const platformFee = influencerCost * 0.1; // 10% platform fee
  const gst = (influencerCost + platformFee) * 0.18; // 18% GST
  
  return Math.round(influencerCost + platformFee + gst);
};

/**
 * Format currency amount
 * @param {number} amount - Amount in rupees
 * @returns {string} Formatted amount
 */
export const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};
