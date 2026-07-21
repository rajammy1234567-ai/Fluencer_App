/**
 * WalletDetailScreen
 * Detailed view of an influencer's wallet
 * Shows pending, available, and withdrawn balances with transaction history
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminLayout from '../../components/admin/AdminLayout';
import TransactionRow from '../../components/admin/TransactionRow';
import { COLORS } from '../../constants/colors';
import {
  getInfluencerWallet,
  formatCurrency,
} from '../../services/withdrawalAdmin.service';

const WalletDetailScreen = () => {
  const router = useRouter();
  const { influencerId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    loadWalletDetails();
  }, [influencerId]);

  const loadWalletDetails = async () => {
    try {
      setLoading(true);
      const result = await getInfluencerWallet(influencerId);
      
      if (result.success) {
        setWallet(result.data);
      } else {
        Alert.alert('Error', 'Wallet not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading wallet details:', error);
      Alert.alert('Error', 'Failed to load wallet details');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadWalletDetails();
  };

  const BalanceCard = ({ icon, label, amount, color }) => (
    <View style={[styles.balanceCard, { borderColor: color }]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={styles.balanceLabel}>{label}</Text>
      <Text style={[styles.balanceAmount, { color }]}>
        {formatCurrency(amount)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AdminLayout title="Wallet Details">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        </AdminLayout>
      </SafeAreaView>
    );
  }

  if (!wallet) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AdminLayout title="Wallet Details">
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Influencer Info */}
          <View style={styles.headerCard}>
            <MaterialCommunityIcons
              name="account-star"
              size={48}
              color={COLORS.primary}
            />
            <Text style={styles.influencerName}>{wallet.influencerName}</Text>
            <Text style={styles.influencerId}>ID: {wallet.influencerId}</Text>
          </View>

          {/* Balance Cards */}
          <View style={styles.balancesSection}>
            <Text style={styles.sectionTitle}>Wallet Balances</Text>
            <View style={styles.balancesGrid}>
              <BalanceCard
                icon="clock-outline"
                label="Pending"
                amount={wallet.pending}
                color={COLORS.warning}
              />
              <BalanceCard
                icon="cash-check"
                label="Available"
                amount={wallet.available}
                color={COLORS.success}
              />
              <BalanceCard
                icon="bank-transfer"
                label="Withdrawn"
                amount={wallet.withdrawn}
                color={COLORS.primary}
              />
            </View>
          </View>

          {/* Total Earnings */}
          <View style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Lifetime Earnings</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(wallet.pending + wallet.available + wallet.withdrawn)}
              </Text>
            </View>
          </View>

          {/* Transaction History */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            
            {wallet.transactions && wallet.transactions.length > 0 ? (
              <View style={styles.transactionsCard}>
                {wallet.transactions.map((transaction, index) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    isLast={index === wallet.transactions.length - 1}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="history"
                  size={48}
                  color={COLORS.gray}
                />
                <Text style={styles.emptyText}>No transactions yet</Text>
              </View>
            )}
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
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  influencerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginTop: 12,
  },
  influencerId: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: COLORS.gray,
    marginTop: 4,
    backgroundColor: COLORS.blue[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  balancesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 12,
    marginLeft: 4,
  },
  balancesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  balanceLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 8,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  historySection: {
    marginBottom: 16,
  },
  transactionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 12,
  },
});

export default WalletDetailScreen;
