/**
 * WithdrawalDetailScreen
 * Detailed view of a withdrawal request with approve/reject actions
 * Admin can view bank details and approve or reject with reason
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminLayout from '../../components/admin/AdminLayout';
import PaymentStatusBadge from '../../components/admin/PaymentStatusBadge';
import ApproveRejectBar from '../../components/admin/ApproveRejectBar';
import { COLORS } from '../../constants/colors';
import {
  getWithdrawalById,
  approveWithdrawal,
  rejectWithdrawal,
  formatCurrency,
} from '../../services/withdrawalAdmin.service';

const WithdrawalDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [withdrawal, setWithdrawal] = useState(null);

  useEffect(() => {
    loadWithdrawalDetails();
  }, [id]);

  const loadWithdrawalDetails = async () => {
    try {
      setLoading(true);
      const result = await getWithdrawalById(id);
      
      if (result.success) {
        setWithdrawal(result.data);
      } else {
        Alert.alert('Error', 'Withdrawal request not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading withdrawal details:', error);
      Alert.alert('Error', 'Failed to load withdrawal details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      const result = await approveWithdrawal(id);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Withdrawal request approved successfully',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to approve withdrawal');
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      Alert.alert('Error', 'Failed to approve withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (reason) => {
    try {
      setProcessing(true);
      const result = await rejectWithdrawal(id, reason);
      
      if (result.success) {
        Alert.alert(
          'Rejected',
          'Withdrawal request rejected successfully',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to reject withdrawal');
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      Alert.alert('Error', 'Failed to reject withdrawal');
    } finally {
      setProcessing(false);
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

  const InfoRow = ({ icon, label, value, copyable }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        <MaterialCommunityIcons name={icon} size={20} color={COLORS.gray} />
        <Text style={styles.infoLabelText}>{label}</Text>
      </View>
      <View style={styles.infoValueContainer}>
        <Text style={styles.infoValue}>{value}</Text>
        {copyable && (
          <MaterialCommunityIcons
            name="content-copy"
            size={16}
            color={COLORS.primary}
          />
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AdminLayout title="Withdrawal Details">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        </AdminLayout>
      </SafeAreaView>
    );
  }

  if (!withdrawal) {
    return null;
  }

  const isPending = withdrawal.status === 'Pending';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AdminLayout title="Withdrawal Details">
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Card */}
            <View style={styles.headerCard}>
              <View style={styles.statusContainer}>
                <PaymentStatusBadge
                  status={withdrawal.status}
                  type="withdrawal"
                />
              </View>

              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Withdrawal Amount</Text>
                <Text style={styles.totalAmount}>
                  {formatCurrency(withdrawal.amount)}
                </Text>
              </View>

              <Text style={styles.withdrawalId}>ID: {withdrawal.id}</Text>
            </View>

            {/* Influencer Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Influencer Details</Text>
              <View style={styles.card}>
                <InfoRow
                  icon="account-star"
                  label="Name"
                  value={withdrawal.influencerName}
                />
                <InfoRow
                  icon="identifier"
                  label="Influencer ID"
                  value={withdrawal.influencerId}
                />
              </View>
            </View>

            {/* Bank Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bank Account Details</Text>
              <View style={styles.card}>
                <InfoRow
                  icon="bank"
                  label="Bank Name"
                  value={withdrawal.bankName}
                />
                <InfoRow
                  icon="credit-card"
                  label="Account Number"
                  value={withdrawal.bankAccountNumber}
                  copyable
                />
                <InfoRow
                  icon="barcode"
                  label="IFSC Code"
                  value={withdrawal.ifscCode}
                  copyable
                />
                <InfoRow
                  icon="account"
                  label="Account Holder"
                  value={withdrawal.accountHolderName}
                />
              </View>
            </View>

            {/* Request Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Request Information</Text>
              <View style={styles.card}>
                <InfoRow
                  icon="calendar-clock"
                  label="Requested At"
                  value={formatDate(withdrawal.requestedAt)}
                />
                
                {withdrawal.status === 'Approved' && (
                  <>
                    <InfoRow
                      icon="check-circle"
                      label="Approved At"
                      value={formatDate(withdrawal.approvedAt)}
                    />
                    <InfoRow
                      icon="bank-transfer"
                      label="Transaction ID"
                      value={withdrawal.transactionId}
                      copyable
                    />
                  </>
                )}

                {withdrawal.status === 'Rejected' && (
                  <>
                    <InfoRow
                      icon="close-circle"
                      label="Rejected At"
                      value={formatDate(withdrawal.rejectedAt)}
                    />
                    {withdrawal.rejectionReason && (
                      <View style={styles.rejectionInfo}>
                        <MaterialCommunityIcons
                          name="alert-circle"
                          size={20}
                          color={COLORS.error}
                        />
                        <View style={styles.rejectionTextContainer}>
                          <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
                          <Text style={styles.rejectionText}>
                            {withdrawal.rejectionReason}
                          </Text>
                        </View>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>

            <View style={{ height: isPending ? 100 : 40 }} />
          </ScrollView>

          {/* Action Bar - Only for pending withdrawals */}
          {isPending && (
            <ApproveRejectBar
              onApprove={handleApprove}
              onReject={handleReject}
              disabled={processing}
            />
          )}
        </View>
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
  },
  scrollView: {
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
  withdrawalId: {
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
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
    textAlign: 'right',
  },
  rejectionInfo: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.error + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  rejectionTextContainer: {
    flex: 1,
  },
  rejectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 13,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
});

export default WithdrawalDetailScreen;
