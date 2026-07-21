/**
 * PaymentDetailScreen
 * Detailed view of a single brand payment transaction
 * Shows commission breakdown, refund status, and full transaction details
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminLayout from '../../components/admin/AdminLayout';
import PaymentStatusBadge from '../../components/admin/PaymentStatusBadge';
import { COLORS } from '../../constants/colors';
import {
  getPaymentById,
  formatCurrency,
} from '../../services/paymentAdmin.service';

const PaymentDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    loadPaymentDetails();
  }, [id]);

  const loadPaymentDetails = async () => {
    try {
      setLoading(true);
      const result = await getPaymentById(id);
      
      if (result.success) {
        setPayment(result.data);
      } else {
        Alert.alert('Error', 'Payment not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading payment details:', error);
      Alert.alert('Error', 'Failed to load payment details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const InfoRow = ({ icon, label, value, valueColor }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        <MaterialCommunityIcons name={icon} size={20} color={COLORS.gray} />
        <Text style={styles.infoLabelText}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>
        {value}
      </Text>
    </View>
  );

  const AmountRow = ({ label, amount, highlight }) => (
    <View style={styles.amountRow}>
      <Text style={styles.amountLabel}>{label}</Text>
      <Text
        style={[
          styles.amountValue,
          highlight && { color: COLORS.primary, fontWeight: 'bold' },
        ]}
      >
        {formatCurrency(amount)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AdminLayout title="Payment Details">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        </AdminLayout>
      </SafeAreaView>
    );
  }

  if (!payment) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AdminLayout title="Payment Details">
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.statusContainer}>
              <PaymentStatusBadge
                status={payment.paymentStatus}
                type="payment"
              />
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(payment.totalAmount)}
              </Text>
            </View>

            <Text style={styles.transactionId}>
              {payment.razorpayTransactionId}
            </Text>
          </View>

          {/* Brand & Campaign Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Campaign Details</Text>
            <View style={styles.card}>
              <InfoRow
                icon="office-building"
                label="Brand"
                value={payment.brandName}
              />
              <InfoRow
                icon="bullhorn"
                label="Campaign"
                value={payment.campaignName}
              />
              <InfoRow
                icon="account-star"
                label="Influencer"
                value={payment.influencerName}
              />
            </View>
          </View>

          {/* Commission Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Commission Breakdown</Text>
            <View style={styles.card}>
              <AmountRow
                label="Total Amount"
                amount={payment.totalAmount}
                highlight
              />
              <View style={styles.divider} />
              <AmountRow
                label={`Platform Commission (${payment.commissionRate}%)`}
                amount={payment.platformCommission}
              />
              <AmountRow
                label="Influencer Share"
                amount={payment.influencerShare}
              />
              
              {payment.paymentStatus === 'Refunded' && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.refundInfo}>
                    <MaterialCommunityIcons
                      name="alert-circle"
                      size={20}
                      color={COLORS.error}
                    />
                    <View style={styles.refundTextContainer}>
                      <Text style={styles.refundText}>
                        This payment was refunded to the brand.
                      </Text>
                      <Text style={styles.refundDate}>
                        Refunded on {formatDate(payment.refundedAt)}
                      </Text>
                      {payment.refundReason && (
                        <Text style={styles.refundReason}>
                          Reason: {payment.refundReason}
                        </Text>
                      )}
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Payment Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <View style={styles.card}>
              <InfoRow
                icon="calendar"
                label="Payment Date"
                value={formatDate(payment.paymentDate)}
              />
              <InfoRow
                icon="credit-card"
                label="Payment Method"
                value={payment.paymentMethod}
              />
              <InfoRow
                icon="bank"
                label="Payment Gateway"
                value="Razorpay"
              />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.backButtonText}>Back to Payments</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </AdminLayout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.blue[50],
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  headerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  statusContainer: {
    marginBottom: 16,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  transactionId: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: COLORS.gray,
    backgroundColor: COLORS.blue[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.blue[50],
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  infoLabelText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
    textAlign: 'right',
    marginLeft: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[100],
    marginVertical: 8,
  },
  refundInfo: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.error + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  refundTextContainer: {
    flex: 1,
  },
  refundText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: 4,
  },
  refundDate: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  refundReason: {
    fontSize: 13,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginTop: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default PaymentDetailScreen;
