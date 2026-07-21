/**
 * DisputeDetailScreen
 * Detailed view of a dispute with complete information
 * Admin can review evidence and take action (approve influencer/brand or reject)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminLayout from '../../components/admin/AdminLayout';
import EvidenceSection from '../../components/admin/EvidenceLink';
import AdminDecisionBar from '../../components/admin/AdminDecisionBar';
import { COLORS } from '../../constants/colors';
import {
  getDisputeById,
  approveInfluencer,
  approveBrand,
  rejectDispute,
  formatCurrency,
} from '../../services/disputeAdmin.service';

const DisputeDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [dispute, setDispute] = useState(null);

  useEffect(() => {
    loadDisputeDetails();
  }, [id]);

  const loadDisputeDetails = async () => {
    try {
      setLoading(true);
      const result = await getDisputeById(id);
      
      if (result.success) {
        setDispute(result.data);
      } else {
        Alert.alert('Error', 'Dispute not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading dispute details:', error);
      Alert.alert('Error', 'Failed to load dispute details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleApproveInfluencer = async (reason) => {
    try {
      setProcessing(true);
      const result = await approveInfluencer(id, reason);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Influencer approved. Wallet amount released.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to approve influencer');
      }
    } catch (error) {
      console.error('Error approving influencer:', error);
      Alert.alert('Error', 'Failed to approve influencer');
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveBrand = async (reason) => {
    try {
      setProcessing(true);
      const result = await approveBrand(id, reason);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Brand approved. Payment refunded.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to approve brand');
      }
    } catch (error) {
      console.error('Error approving brand:', error);
      Alert.alert('Error', 'Failed to approve brand');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectDispute = async (reason) => {
    try {
      setProcessing(true);
      const result = await rejectDispute(id, reason);
      
      if (result.success) {
        Alert.alert(
          'Rejected',
          'Dispute rejected. No fund movement.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to reject dispute');
      }
    } catch (error) {
      console.error('Error rejecting dispute:', error);
      Alert.alert('Error', 'Failed to reject dispute');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewChat = () => {
    router.push(`/(admin)/chat-readonly?disputeId=${id}`);
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
      <Text
        style={[
          styles.infoValue,
          valueColor && { color: valueColor },
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );

  const getStatusColor = (status) => {
    const colors = {
      Open: COLORS.warning,
      Resolved: COLORS.success,
      Rejected: COLORS.error,
    };
    return colors[status] || COLORS.gray;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AdminLayout title="Dispute Details">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        </AdminLayout>
      </SafeAreaView>
    );
  }

  if (!dispute) {
    return null;
  }

  const isOpen = dispute.status === 'Open';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AdminLayout title="Dispute Details">
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Card */}
            <View style={styles.headerCard}>
              <View style={styles.headerTop}>
                <View style={styles.idContainer}>
                  <MaterialCommunityIcons
                    name="shield-alert"
                    size={24}
                    color={COLORS.primary}
                  />
                  <Text style={styles.disputeId}>{dispute.id}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(dispute.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{dispute.status}</Text>
                </View>
              </View>

              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{dispute.type}</Text>
              </View>
            </View>

            {/* Parties Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dispute Parties</Text>
              <View style={styles.card}>
                <InfoRow
                  icon="office-building"
                  label="Brand"
                  value={dispute.brandName}
                />
                <InfoRow
                  icon="account-star"
                  label="Influencer"
                  value={dispute.influencerName}
                />
                <InfoRow
                  icon="bullhorn"
                  label="Campaign"
                  value={dispute.campaignName}
                />
              </View>
            </View>

            {/* Financial Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Financial Details</Text>
              <View style={styles.card}>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Payment Amount</Text>
                  <Text style={styles.amountValue}>
                    {formatCurrency(dispute.paymentAmount)}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>
                    Platform Commission ({dispute.commissionRate}%)
                  </Text>
                  <Text style={styles.amountValue}>
                    {formatCurrency(dispute.platformCommission)}
                  </Text>
                </View>

                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Influencer Share</Text>
                  <Text style={[styles.amountValue, { color: COLORS.success }]}>
                    {formatCurrency(dispute.influencerShare)}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.walletState}>
                  <View style={styles.walletStateHeader}>
                    <MaterialCommunityIcons
                      name="wallet"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.walletStateTitle}>Current Wallet State</Text>
                  </View>

                  <View style={styles.walletBalances}>
                    <View style={styles.walletBalance}>
                      <Text style={styles.walletBalanceLabel}>Pending</Text>
                      <Text style={[styles.walletBalanceValue, { color: COLORS.warning }]}>
                        {formatCurrency(dispute.walletState.pending)}
                      </Text>
                    </View>

                    <View style={styles.walletBalance}>
                      <Text style={styles.walletBalanceLabel}>Available</Text>
                      <Text style={[styles.walletBalanceValue, { color: COLORS.success }]}>
                        {formatCurrency(dispute.walletState.available)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.walletStatusBadge}>
                    <Text style={styles.walletStatusText}>
                      Status: {dispute.walletState.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Dispute Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dispute Information</Text>
              <View style={styles.card}>
                <View style={styles.claimContainer}>
                  <View style={styles.claimHeader}>
                    <MaterialCommunityIcons
                      name="office-building"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.claimTitle}>Brand's Rejection Reason</Text>
                  </View>
                  <Text style={styles.claimText}>{dispute.rejectionReason}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.claimContainer}>
                  <View style={styles.claimHeader}>
                    <MaterialCommunityIcons
                      name="account-star"
                      size={20}
                      color={COLORS.success}
                    />
                    <Text style={styles.claimTitle}>Influencer's Claim</Text>
                  </View>
                  <Text style={styles.claimText}>{dispute.influencerClaim}</Text>
                </View>

                <View style={styles.divider} />

                <InfoRow
                  icon="calendar-clock"
                  label="Created At"
                  value={formatDate(dispute.createdAt)}
                />

                {dispute.resolvedAt && (
                  <>
                    <InfoRow
                      icon="check-circle"
                      label="Resolved At"
                      value={formatDate(dispute.resolvedAt)}
                    />
                    <InfoRow
                      icon="gavel"
                      label="Admin Action"
                      value={dispute.adminAction}
                      valueColor={COLORS.primary}
                    />
                    {dispute.adminReason && (
                      <View style={styles.adminReasonContainer}>
                        <Text style={styles.adminReasonLabel}>Admin Reason:</Text>
                        <Text style={styles.adminReasonText}>
                          {dispute.adminReason}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>

            {/* Evidence Section */}
            <EvidenceSection dispute={dispute} />

            {/* View Chat Button */}
            <TouchableOpacity
              style={styles.chatButton}
              onPress={handleViewChat}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="message-text"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.chatButtonText}>View Chat History</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.primary}
              />
            </TouchableOpacity>

            <View style={{ height: isOpen ? 150 : 40 }} />
          </ScrollView>

          {/* Admin Decision Bar - Only for Open disputes */}
          {isOpen && (
            <AdminDecisionBar
              onApproveInfluencer={handleApproveInfluencer}
              onApproveBrand={handleApproveBrand}
              onRejectDispute={handleRejectDispute}
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
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disputeId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  typeBadge: {
    backgroundColor: COLORS.error + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.error,
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
    flex: 1,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  amountValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[100],
    marginVertical: 12,
  },
  walletState: {
    backgroundColor: COLORS.blue[50],
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  walletStateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  walletStateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  walletBalances: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  walletBalance: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  walletBalanceLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  walletBalanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  walletStatusBadge: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'center',
  },
  walletStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
  },
  claimContainer: {
    marginBottom: 0,
  },
  claimHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  claimTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  claimText: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 20,
    marginLeft: 28,
  },
  adminReasonContainer: {
    backgroundColor: COLORS.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  adminReasonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  adminReasonText: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 16,
  },
  chatButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    flex: 1,
    marginLeft: 8,
  },
});

export default DisputeDetailScreen;
