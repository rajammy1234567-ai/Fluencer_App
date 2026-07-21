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
    // For now, show a demo alert since Razorpay requires a development build
    // In production, you would use a web-based payment flow or development build
    Alert.alert(
      'Payment Gateway',
      `Total Amount: ₹${amount}\n\n${description}\n\nNote: This is a demo. In production, payment gateway will be integrated.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            if (onFailure) onFailure({ message: 'Payment cancelled' });
          },
        },
        {
          text: 'Simulate Payment',
          onPress: () => {
            // Simulate successful payment for demo
            Alert.alert('Success', 'Payment successful (Demo Mode)', [
              {
                text: 'OK',
                onPress: () => {
                  if (onSuccess) onSuccess({ paymentId: 'demo_' + Date.now() });
                },
              },
            ]);
          },
        },
      ]
    );
  } catch (error) {
    console.error('Payment initialization error:', error);
    Alert.alert('Error', 'Failed to initialize payment');
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
