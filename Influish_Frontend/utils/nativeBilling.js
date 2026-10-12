import { Platform, Alert } from 'react-native';
import { getAuthHeader } from './storage';
import { getApiUrl } from '../constants/api';
import { initiatePayment as initiateWebRazorpay } from './payment';
import { fetchWithTimeoutAndRetry } from './apiClient';

/**
 * Native In-App Billing Client
 * 
 * Primary Native SDK: `react-native-iap` (Supports Apple StoreKit 2 on iOS & Google Play Billing v7 on Android)
 * Target Product: `fluencer_pro_lifetime` (Non-Consumable Lifetime Pro Pass)
 * Target Bundle / Package ID: `com.fluencers.app`
 * 
 * Architecture Rules (Apple Guideline 3.1.1 & Google Play Billing Policy):
 * 1. Digital memberships MUST use native StoreKit / Play Billing on mobile platforms.
 * 2. External web checkouts (Razorpay) are strictly isolated to Web Desktop (Platform.OS === 'web').
 * 3. Client state NEVER grants Pro membership locally; only backend server verification unlocks features.
 * 4. Transactions must be finished (acknowledged) only after server verification succeeds.
 */

export const PRO_PASS_PRODUCT_ID = 'fluencer_pro_lifetime';
export const PRO_PASS_PRODUCT_ID_IOS = 'fluencer_pro_lifetime_ios';
export const EXPECTED_BUNDLE_ID = 'com.fluencers.app';
export const EXPECTED_ANDROID_PACKAGE = 'com.fluencer.official';
export const NATIVE_BILLING_SDK = 'react-native-iap';

/**
 * Returns the store product ID for the active platform:
 * - iOS: 'fluencer_pro_lifetime_ios'
 * - Android: 'fluencer_pro_lifetime'
 */
export const getProProductId = () => (Platform.OS === 'ios' ? PRO_PASS_PRODUCT_ID_IOS : PRO_PASS_PRODUCT_ID);

// Helper to safely load react-native-iap native module in compiled or dev client
const getIapModule = () => {
  try {
    return require('react-native-iap');
  } catch (err) {
    return null;
  }
};

let cachedProduct = null;

/**
 * Fetch Pro Pass Product Details dynamically from Apple StoreKit / Google Play
 * Complies with Apple Guideline 3.1.1 requiring dynamic localized pricing display.
 */
export const fetchProPassProduct = async () => {
  if (cachedProduct) return cachedProduct;

  const platform = Platform.OS;
  const targetProductId = getProProductId();
  const defaultFallback = {
    productId: targetProductId,
    price: 499,
    displayPrice: '₹499',
    currency: 'INR',
    title: 'Fluencer Pro Lifetime Pass',
  };

  if (platform === 'web') {
    cachedProduct = defaultFallback;
    return cachedProduct;
  }

  const RNIap = getIapModule();
  if (!RNIap || typeof RNIap.initConnection !== 'function') {
    return defaultFallback;
  }

  try {
    await RNIap.initConnection();
    let products = [];
    if (typeof RNIap.fetchProducts === 'function') {
      products = await RNIap.fetchProducts({ skus: [targetProductId], type: 'in-app' });
    } else if (typeof RNIap.getProducts === 'function') {
      products = await RNIap.getProducts({ skus: [targetProductId] });
    }

    if (products && products.length > 0) {
      const prod = products[0];
      const displayPrice = prod.displayPrice || prod.localizedPrice || (prod.currency ? `${prod.currency} ${prod.price}` : '₹499');
      cachedProduct = {
        productId: prod.id || prod.productId || targetProductId,
        displayPrice,
        price: prod.price || 499,
        currency: prod.currency || (displayPrice.includes('$') ? 'USD' : 'INR'),
        title: prod.displayName || prod.title || 'Fluencer Pro Lifetime Pass',
        description: prod.description || 'Unlimited Brand Campaign Access',
        raw: prod,
      };
      return cachedProduct;
    }
  } catch (err) {
    console.warn('Dynamic store product price fetch note:', err?.message);
  }

  return defaultFallback;
};

/**
 * Purchase Pro Pass Initiation
 */
export const purchaseProPass = async ({ onStart, onSuccess, onError }) => {
  try {
    if (onStart) onStart();

    const platform = Platform.OS; // 'ios', 'android', 'web'

    // 1. Web Platform: Can use Razorpay payment gateway
    if (platform === 'web') {
      console.log('🌐 Web platform detected: using web checkout for Pro Pass');
      initiateWebRazorpay({
        amount: 499,
        description: '₹499 Pro Membership Pass - Unlimited Brand Campaign Access',
        onSuccess: async (payRes) => {
          try {
            const headers = await getAuthHeader();
            const unlockRes = await fetchWithTimeoutAndRetry(
              getApiUrl('/api/influencers/unlock-pass'),
              {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: payRes?.paymentId }),
              },
              { timeoutMs: 35000, retries: 2 }
            );
            const unlockData = await unlockRes.json();
            if (unlockRes.ok && unlockData.success) {
              if (onSuccess) onSuccess({ isProMember: true });
            } else {
              if (onError) onError(new Error(unlockData.message || 'Unlock failed'));
            }
          } catch (e) {
            if (onError) onError(e);
          }
        },
        onFailure: (err) => {
          if (onError) onError(new Error(err?.message || 'Payment cancelled'));
        },
      });
      return;
    }

    const targetProductId = getProProductId();
    const isUserCancel = (err) => {
      if (!err) return false;
      const code = err.code;
      const msg = (err.message || '').toLowerCase();
      return code === 'E_USER_CANCELLED' || msg.includes('cancel') || msg.includes('user cancelled') || msg.includes('user canceled');
    };

    // 2. Native Mobile Platforms (iOS / Android)
    console.log(`📱 Native billing purchase initiated for [${targetProductId}] on [${platform}] using [${NATIVE_BILLING_SDK}]`);

    const RNIap = getIapModule();

    let transactionId = null;
    let purchaseToken = null;
    let receiptData = null;
    let purchase = null;

    if (RNIap && typeof RNIap.initConnection === 'function') {
      try {
        // Initialize connection with StoreKit / Google Play Billing
        await RNIap.initConnection();
        console.log('🔌 Connected to native store billing service.');

        // Fetch product information from App Store / Play Store (v14 fetchProducts & legacy getProducts)
        let products = [];
        try {
          if (typeof RNIap.fetchProducts === 'function') {
            products = await RNIap.fetchProducts({ skus: [targetProductId], type: 'in-app' });
          } else if (typeof RNIap.getProducts === 'function') {
            products = await RNIap.getProducts({ skus: [targetProductId] });
          }
        } catch (fetchErr) {
          console.warn('⚠️ Product fetch error from store:', fetchErr);
        }
        console.log('📦 Available store products:', products);

        if (!products || products.length === 0) {
          const notAvailableMsg = 'Purchase is temporarily unavailable. Please try again later.';
          console.warn(notAvailableMsg);
          Alert.alert('Store Notice', notAvailableMsg);
          if (onError) onError(new Error(notAvailableMsg));
          return;
        }

        // Helper to safely extract single purchase object from array or object
        const unwrapPurchase = (res) => {
          if (Array.isArray(res) && res.length > 0) return res[0];
          return res;
        };

        // Request native purchase sheet (Supports Play Billing 8 / v14 requestPurchase & event listeners)
        if (typeof RNIap.fetchProducts === 'function') {
          purchase = await new Promise((resolve, reject) => {
            let updateSub = null;
            let errorSub = null;
            let isResolved = false;

            const cleanup = () => {
              if (updateSub?.remove) updateSub.remove();
              if (errorSub?.remove) errorSub.remove();
            };

            const timer = setTimeout(() => {
              if (!isResolved) {
                isResolved = true;
                cleanup();
                resolve(null);
              }
            }, 60000);

            if (typeof RNIap.purchaseUpdatedListener === 'function') {
              updateSub = RNIap.purchaseUpdatedListener((p) => {
                const item = unwrapPurchase(p);
                if (item && !isResolved) {
                  isResolved = true;
                  clearTimeout(timer);
                  cleanup();
                  resolve(item);
                }
              });
            }

            if (typeof RNIap.purchaseErrorListener === 'function') {
              errorSub = RNIap.purchaseErrorListener((err) => {
                if (!isResolved) {
                  isResolved = true;
                  clearTimeout(timer);
                  cleanup();
                  reject(err);
                }
              });
            }

            RNIap.requestPurchase({
              request: {
                apple: { sku: targetProductId, andDangerouslyFinishTransactionAutomatically: false },
                ios: { sku: targetProductId, andDangerouslyFinishTransactionAutomatically: false },
                android: { skus: [targetProductId] },
                google: { skus: [targetProductId] }
              },
              type: 'in-app'
            }).then(directRes => {
              const item = unwrapPurchase(directRes);
              if (item && (item.transactionId || item.id || item.purchaseToken || item.transactionReceipt) && !isResolved) {
                isResolved = true;
                clearTimeout(timer);
                cleanup();
                resolve(item);
              }
            }).catch(reqErr => {
              if (!isResolved) {
                isResolved = true;
                clearTimeout(timer);
                cleanup();
                reject(reqErr);
              }
            });
          });
        } else {
          purchase = await RNIap.requestPurchase({
            sku: targetProductId,
            andDangerouslyFinishTransactionAutomaticallyIOS: false,
          });
        }

        if (purchase) {
          const actualPurchase = unwrapPurchase(purchase);
          transactionId = actualPurchase.transactionId || actualPurchase.id;
          purchaseToken = actualPurchase.purchaseToken || actualPurchase.transactionReceipt;
          receiptData = actualPurchase.transactionReceipt || actualPurchase.jwsRepresentationIOS || actualPurchase.purchaseToken;
        }
      } catch (iapNativeErr) {
        console.warn('⚠️ Native store sheet returned error or cancelled:', iapNativeErr);
        if (isUserCancel(iapNativeErr)) {
          console.log('Purchase was cancelled by user silently.');
          if (onError) onError({ isCancelled: true, message: 'User cancelled' });
          return;
        }
        Alert.alert('Purchase Error', iapNativeErr?.message || 'Unable to complete in-app purchase with the store.');
        if (onError) onError(iapNativeErr);
        return;
      } finally {
        try {
          if (RNIap.endConnection) await RNIap.endConnection();
        } catch (e) {}
      }
    } else {
      console.log('ℹ️ Running in non-prebuilt / Expo Go environment without linked StoreKit/Play binary.');
    }

    // If native store purchase was not completed, do not proceed with verification
    if (!purchase && (platform === 'ios' || platform === 'android')) {
      const incompleteMsg = 'Purchase could not be completed. Please try again.';
      Alert.alert('Notice', incompleteMsg);
      if (onError) onError(new Error(incompleteMsg));
      return;
    }

    // 3. Fallback / Standard Verification Bridge: Transmit store receipt to server for verification
    const headers = await getAuthHeader();
    const verifyPayload = {
      platform,
      productId: targetProductId,
      bundleId: platform === 'android' ? EXPECTED_ANDROID_PACKAGE : EXPECTED_BUNDLE_ID,
      transactionId,
      purchaseToken,
      receiptData,
    };

    const verifyResponse = await fetchWithTimeoutAndRetry(
      getApiUrl('/api/iap/verify-purchase'),
      {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verifyPayload),
      },
      { timeoutMs: 35000, retries: 2 }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyData.success || !verifyData.isProMember) {
      const failMsg = verifyData.message || 'In-App Purchase verification could not be completed.';
      Alert.alert('Verification Issue', failMsg);
      if (onError) onError(new Error(failMsg));
      return;
    }

    // Acknowledge / Finish transaction in native StoreKit / Play Billing
    if (RNIap && typeof RNIap.finishTransaction === 'function' && transactionId) {
      try {
        const purchaseObj = (purchase && (Array.isArray(purchase) ? purchase[0] : purchase)) || { id: transactionId, transactionId, purchaseToken };
        await RNIap.finishTransaction({
          purchase: purchaseObj,
          isConsumable: false,
        });
        console.log('✅ Native transaction acknowledged with store.');
      } catch (finishErr) {
        console.warn('Transaction acknowledgement note:', finishErr);
        try {
          await RNIap.finishTransaction({ id: transactionId, transactionId }, false);
        } catch (e2) {}
      }
    }

    // Server-verified activation
    Alert.alert('🎉 Pro Membership Unlocked!', 'Your Pro Membership is verified and active.');
    if (onSuccess) onSuccess({ isProMember: true });

  } catch (err) {
    console.error('Native billing error:', err);
    if (!isUserCancel(err)) {
      Alert.alert('Error', err.message || 'Unable to process purchase.');
    }
    if (onError) onError(err);
  }
};

/**
 * Restore Purchases Flow (Required for App Store Review Guideline 3.1.1)
 */
export const restorePurchases = async ({ onStart, onSuccess, onError }) => {
  try {
    if (onStart) onStart();

    const platform = Platform.OS;
    const targetProductId = getProProductId();
    const validProductIds = [PRO_PASS_PRODUCT_ID, PRO_PASS_PRODUCT_ID_IOS];
    const headers = await getAuthHeader();
    const RNIap = getIapModule();

    let localPurchases = [];
    if (RNIap && typeof RNIap.getAvailablePurchases === 'function') {
      try {
        await RNIap.initConnection();
        localPurchases = await RNIap.getAvailablePurchases();
        console.log('📦 Local store available purchases found:', localPurchases ? localPurchases.length : 0);
      } catch (e) {
        console.warn('Native getAvailablePurchases notice:', e.message);
      } finally {
        try {
          if (RNIap.endConnection) await RNIap.endConnection();
        } catch (e) {}
      }
    }

    // If local purchases exist on device, attempt server verification sync first
    let targetPurchase = null;
    if (localPurchases && localPurchases.length > 0) {
      targetPurchase = localPurchases.find(p => validProductIds.includes(p.productId || p.sku)) || localPurchases[0];
      if (targetPurchase) {
        try {
          const syncPayload = {
            platform,
            productId: targetPurchase.productId || targetPurchase.sku || targetProductId,
            bundleId: platform === 'android' ? EXPECTED_ANDROID_PACKAGE : EXPECTED_BUNDLE_ID,
            transactionId: targetPurchase.transactionId || targetPurchase.id,
            purchaseToken: targetPurchase.purchaseToken || targetPurchase.transactionReceipt,
            receiptData: targetPurchase.transactionReceipt || targetPurchase.jwsRepresentationIOS || targetPurchase.purchaseToken,
          };
          const syncRes = await fetchWithTimeoutAndRetry(
            getApiUrl('/api/iap/verify-purchase'),
            {
              method: 'POST',
              headers: { ...headers, 'Content-Type': 'application/json' },
              body: JSON.stringify(syncPayload),
            },
            { timeoutMs: 35000, retries: 1 }
          );
          const syncData = await syncRes.json();
          if (syncRes.ok && syncData.success && syncData.isProMember) {
            // Acknowledge restored transaction with store
            if (RNIap && typeof RNIap.finishTransaction === 'function') {
              try {
                await RNIap.finishTransaction({
                  purchase: targetPurchase,
                  isConsumable: false,
                });
              } catch (fErr) {}
            }
            Alert.alert('✅ Restored', 'Your previous Pro Membership has been successfully restored.');
            if (onSuccess) onSuccess({ isProMember: true });
            return;
          }
        } catch (syncErr) {
          console.warn('Local purchase sync note:', syncErr.message);
        }
      }
    }

    const response = await fetchWithTimeoutAndRetry(
      getApiUrl('/api/iap/restore-purchases'),
      {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          platform,
          productId: targetPurchase ? (targetPurchase.productId || targetPurchase.sku || targetProductId) : targetProductId,
          transactionId: targetPurchase ? (targetPurchase.transactionId || targetPurchase.id) : undefined,
          purchaseToken: targetPurchase ? (targetPurchase.purchaseToken || targetPurchase.transactionReceipt) : undefined,
          receiptData: targetPurchase ? (targetPurchase.transactionReceipt || targetPurchase.jwsRepresentationIOS || targetPurchase.purchaseToken) : undefined,
          localReceiptsCount: localPurchases ? localPurchases.length : 0,
        }),
      },
      { timeoutMs: 35000, retries: 2 }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      const msg = data.message || 'Failed to restore purchases.';
      Alert.alert('Restore Failed', msg);
      if (onError) onError(new Error(msg));
      return;
    }

    if (data.restored && data.isProMember) {
      Alert.alert('✅ Restored', 'Your previous Pro Membership has been successfully restored.');
      if (onSuccess) onSuccess({ isProMember: true });
    } else {
      Alert.alert('Notice', 'No previous active purchases were found for this account.');
      if (onSuccess) onSuccess({ isProMember: false });
    }
  } catch (err) {
    console.error('Restore purchases error:', err);
    Alert.alert('Error', err.message || 'Unable to reach restore server.');
    if (onError) onError(err);
  }
};

/**
 * Setup Native Purchase Listeners for App Startup & Lifecycle Recovery
 * 
 * Implements Google Play & Apple StoreKit recovery requirement:
 * If an app crashes or restarts while a purchase is in-flight or pending parent approval,
 * `purchaseUpdatedListener` will immediately receive the unfinished purchase on app startup.
 * 
 * @param {Object} callbacks
 * @param {Function} callbacks.onPurchaseVerified - called when a purchase is verified by server
 * @param {Function} callbacks.onPurchaseError - called on purchase error or cancellation
 * @returns {Function} cleanup function to unsubscribe listeners
 */
export const setupPurchaseListeners = ({ onPurchaseVerified, onPurchaseError } = {}) => {
  const RNIap = getIapModule();
  if (!RNIap || typeof RNIap.purchaseUpdatedListener !== 'function') {
    return () => {};
  }

  const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
    console.log('🔄 Purchase listener received transaction update:', purchase.transactionId);
    
    // Check pending state (e.g. Ask to Buy on iOS or Pending Bank Authorization on Android)
    if (purchase.purchaseStateAndroid === 2 /* PENDING */) {
      console.log('⏳ Purchase is currently pending payment authorization.');
      return;
    }

    try {
      const targetProductId = getProProductId();
      const headers = await getAuthHeader();
      const verifyResponse = await fetchWithTimeoutAndRetry(
        getApiUrl('/api/iap/verify-purchase'),
        {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: Platform.OS,
            productId: purchase.productId || targetProductId,
            bundleId: Platform.OS === 'android' ? EXPECTED_ANDROID_PACKAGE : EXPECTED_BUNDLE_ID,
            transactionId: purchase.transactionId,
            purchaseToken: purchase.purchaseToken || purchase.transactionReceipt,
            receiptData: purchase.transactionReceipt,
          }),
        },
        { timeoutMs: 35000, retries: 2 }
      );

      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok && verifyData.success && verifyData.isProMember) {
        // Acknowledge / Finish transaction after successful backend verification
        if (typeof RNIap.finishTransaction === 'function') {
          await RNIap.finishTransaction({ purchase, isConsumable: false });
          console.log('✅ In-flight purchase verified and finished with store.');
        }
        if (onPurchaseVerified) onPurchaseVerified(verifyData);
      } else {
        console.warn('Backend rejected in-flight purchase:', verifyData.message);
      }
    } catch (err) {
      console.error('Error verifying in-flight purchase:', err);
    }
  });

  const purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
    console.warn('Purchase error listener event:', error);
    const msg = (error?.message || '').toLowerCase();
    if (error.code === 'E_USER_CANCELLED' || msg.includes('cancel')) {
      console.log('User cancelled purchase silently.');
      return;
    }
    if (onPurchaseError) onPurchaseError(error);
  });

  return () => {
    if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
    if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
  };
};

/**
 * Check current Pro membership status with backend
 */
export const checkCurrentProStatus = async () => {
  try {
    const headers = await getAuthHeader();
    const res = await fetchWithTimeoutAndRetry(
      getApiUrl('/api/iap/status'),
      {
        method: 'GET',
        headers,
      },
      { timeoutMs: 15000, retries: 1 }
    );
    if (res.ok) {
      const data = await res.json();
      return data.isProMember || false;
    }
    return false;
  } catch (e) {
    return false;
  }
};

