import { Alert, Platform } from 'react-native';
import { getAuthHeader, getUserId } from './storage';
import { getApiUrl } from '../constants/api';

const DEFAULT_RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_T4iwnAIVpqcNUl';

/**
 * Load official Razorpay JS Checkout script dynamically for Web
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initialize Official Razorpay Payment
 * Automatically supports Live Keys (rzp_live_...) & Test Keys (rzp_test_...) configured in backend .env
 */
export const initiatePayment = async ({
  amount,
  description,
  campaignId = null,
  onSuccess,
  onFailure,
}) => {
  try {
    let orderInfo = null;
    let authHeaders = {};
    const currentUserId = await getUserId();

    try {
      authHeaders = await getAuthHeader();
      const res = await fetch(getApiUrl('/api/payments/create-order'), {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description: description || 'Wallet Deposit',
          campaignId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.order) {
        orderInfo = data.order;
      }
    } catch (e) {
      console.warn('Backend create-order error, using fallback:', e);
    }

    const keyToUse = (orderInfo && orderInfo.key_id) || DEFAULT_RAZORPAY_KEY;
    const orderIdToUse = (orderInfo && orderInfo.id) || ('order_rzp_' + Math.floor(100000 + Math.random() * 900000));

    // Web Environment: Load Official Razorpay Checkout Modal
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const isLoaded = await loadRazorpayScript();
      if (isLoaded && window.Razorpay) {
        const options = {
          key: keyToUse,
          amount: amount * 100, // Amount in paise
          currency: 'INR',
          name: 'Fluencer Platform',
          description: description || 'Wallet Top Up',
          order_id: orderInfo ? orderInfo.id : undefined,
          image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=200',
          handler: async function (response) {
            try {
              // Verify payment on backend
              const verifyRes = await fetch(getApiUrl('/api/payments/verify-payment'), {
                method: 'POST',
                headers: {
                  ...authHeaders,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id || orderIdToUse,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  amount: amount,
                  description: description || 'Pro Membership Pass'
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                Alert.alert('✅ Payment Successful', `₹${amount} paid via Razorpay!\nPayment ID: ${response.razorpay_payment_id}`);
                if (onSuccess) onSuccess({ paymentId: response.razorpay_payment_id, newBalance: verifyData.newWalletBalance });
              } else {
                Alert.alert('❌ Verification Failed', verifyData.message || 'Payment signature could not be verified.');
                if (onFailure) onFailure({ message: 'Payment verification failed' });
              }
            } catch (err) {
              console.error('Verify error:', err);
              Alert.alert('❌ Error', 'Unable to reach verification server.');
              if (onFailure) onFailure({ message: 'Verification network error' });
            }
          },
          prefill: {
            name: 'Fluencer User',
            email: 'user@fluencer.app',
            contact: '9876543210'
          },
          theme: {
            color: '#7C3AED'
          },
          modal: {
            ondismiss: function () {
              Alert.alert('Payment Cancelled', 'You cancelled the payment. Features remain locked.');
              if (onFailure) onFailure({ message: 'Payment cancelled by user' });
            }
          }
        };

        try {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response) {
            Alert.alert('Payment Failed', response.error?.description || 'Transaction failed');
            if (onFailure) onFailure(response.error);
          });
          rzp.open();
          return;
        } catch (e) {
          console.warn('Razorpay JS init error, using fallback checkout:', e);
        }
      }
    }

    // Native Mobile Apps (iOS / Android APK): Open Live Razorpay Payment Gateway in WebBrowser
    try {
      const WebBrowser = require('expo-web-browser');
      const userParam = currentUserId ? `&userId=${encodeURIComponent(currentUserId)}` : '';
      const descParam = description ? `&description=${encodeURIComponent(description)}` : '';
      const checkoutUrl = getApiUrl(`/api/payments/checkout-page?orderId=${orderIdToUse}&amount=${amount}${userParam}${descParam}`);

      await WebBrowser.openBrowserAsync(checkoutUrl);

      // STRICT VERIFICATION: Do NOT assume success when browser closes!
      // Check backend to see if Razorpay actually verified and completed the order
      try {
        const statusRes = await fetch(getApiUrl(`/api/payments/order-status/${orderIdToUse}`));
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData && statusData.isCompleted) {
            Alert.alert(
              '🎉 Payment Successful',
              `₹${amount} confirmed via Razorpay!\nYour features have been unlocked.`
            );
            if (onSuccess) {
              onSuccess({
                paymentId: statusData.paymentId || 'pay_live_verified',
                orderId: orderIdToUse,
              });
            }
            return;
          }
        }

        // If not completed, payment was cancelled, cut, or failed
        Alert.alert(
          '❌ Payment Incomplete',
          'Payment was cancelled or closed before completing. Features remain locked.'
        );
        if (onFailure) onFailure({ message: 'Payment cancelled or not completed' });
        return;
      } catch (checkErr) {
        console.warn('Payment check error:', checkErr);
        Alert.alert(
          'Payment Pending',
          'Could not verify transaction. If money was deducted, click "Already Paid? Confirm & Unlock".'
        );
        if (onFailure) onFailure({ message: 'Could not verify payment' });
        return;
      }
    } catch (wbErr) {
      console.warn('WebBrowser open warning:', wbErr);
      Alert.alert('Error', 'Unable to launch payment gateway. Please try again.');
      if (onFailure) onFailure(wbErr);
    }
  } catch (globalErr) {
    console.error('Payment error:', globalErr);
    if (onFailure) onFailure(globalErr);
  }
};

