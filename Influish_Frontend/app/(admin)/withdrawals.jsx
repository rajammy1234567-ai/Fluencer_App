/**
 * WithdrawalListScreen
 * Admin screen to view and manage influencer withdrawal requests
 * Accessible from More tab → Withdrawals
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminLayout from '../../components/admin/AdminLayout';
import PaymentStatusBadge from '../../components/admin/PaymentStatusBadge';
import { COLORS } from '../../constants/colors';
import {
  getAllWithdrawals,
  searchWithdrawals,
  formatCurrency,
} from '../../services/withdrawalAdmin.service';

const WithdrawalListScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadWithdrawals();
  }, [filterStatus]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const filters = filterStatus !== 'all' ? { status: filterStatus } : {};
      const result = await getAllWithdrawals(filters);
      
      if (result.success) {
        setWithdrawals(result.data);
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      loadWithdrawals();
      return;
    }

    const result = await searchWithdrawals(query);
    if (result.success) {
      setWithdrawals(result.data);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    loadWithdrawals();
  };

  const handleWithdrawalPress = (withdrawalId) => {
    router.push(`/(admin)/withdrawal-detail?id=${withdrawalId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderWithdrawalCard = (withdrawal) => (
    <TouchableOpacity
      key={withdrawal.id}
      style={styles.withdrawalCard}
      onPress={() => handleWithdrawalPress(withdrawal.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.influencerInfo}>
          <MaterialCommunityIcons
            name="account-star"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.influencerName}>{withdrawal.influencerName}</Text>
        </View>
        <PaymentStatusBadge status={withdrawal.status} type="withdrawal" />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.amountSection}>
          <Text style={styles.label}>Withdrawal Amount</Text>
          <Text style={styles.amount}>{formatCurrency(withdrawal.requestedAmount)}</Text>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="bank"
              size={16}
              color={COLORS.gray}
            />
            <Text style={styles.detailText} numberOfLines={1}>
              {withdrawal.bankAccountNumber}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="calendar"
              size={16}
              color={COLORS.gray}
            />
            <Text style={styles.detailText}>
              {formatDate(withdrawal.requestedAt)}
            </Text>
          </View>

          {withdrawal.status !== 'Pending' && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name={withdrawal.status === 'Approved' ? 'check-circle' : 'close-circle'}
                size={16}
                color={withdrawal.status === 'Approved' ? COLORS.success : COLORS.error}
              />
              <Text style={styles.detailText}>
                {withdrawal.status === 'Approved' ? 'Approved' : 'Rejected'} on{' '}
                {formatDate(
                  withdrawal.status === 'Approved'
                    ? withdrawal.approvedAt
                    : withdrawal.rejectedAt
                )}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.withdrawalId}>ID: {withdrawal.id}</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={COLORS.gray}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AdminLayout title="Withdrawals">
        <View style={styles.container}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={COLORS.gray}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search withdrawals..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor={COLORS.gray}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color={COLORS.gray}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {['all', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterTab,
                  filterStatus === status && styles.filterTabActive,
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filterStatus === status && styles.filterTabTextActive,
                  ]}
                >
                  {status === 'all' ? 'All' : status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Withdrawals List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <ScrollView
              style={styles.withdrawalsList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={COLORS.primary}
                />
              }
            >
              {withdrawals.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="cash-remove"
                    size={64}
                    color={COLORS.gray}
                  />
                  <Text style={styles.emptyText}>No withdrawals found</Text>
                </View>
              ) : (
                withdrawals.map(renderWithdrawalCard)
              )}
              <View style={{ height: 20 }} />
            </ScrollView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.primaryDark,
  },
  filterContainer: {
    maxHeight: 50,
    marginBottom: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
    alignItems: 'center',
  },
  filterTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  filterTabTextActive: {
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  withdrawalsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  withdrawalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  influencerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  influencerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    flex: 1,
  },
  cardBody: {
    marginBottom: 12,
  },
  amountSection: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  detailsSection: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.gray,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.blue[50],
  },
  withdrawalId: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: COLORS.gray,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
  },
});

export default WithdrawalListScreen;
