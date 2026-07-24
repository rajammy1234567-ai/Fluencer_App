import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import BackButton from '../components/BackButton';
import { COLORS } from '../constants/colors';
import { getAuthHeader } from '../utils/storage';
import { API_CONFIG } from '../constants/api';

export default function Wallet() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({ total: 0, pending: 0, available: 0 });
  const [transactions, setTransactions] = useState([]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeader();
      const apiBase = API_CONFIG.BASE_URL;

      // Fetch Balance
      const balRes = await fetch(`${apiBase}/api/wallet/balance`, { headers });
      const balData = await balRes.json();

      // Fetch Transactions
      const txRes = await fetch(`${apiBase}/api/wallet/transactions`, { headers });
      const txData = await txRes.json();

      if (balData.success) {
        setBalance({
          total: (balData.data.wallet_balance || 0) + (balData.data.escrow_balance || 0),
          pending: balData.data.escrow_balance || 0,
          available: balData.data.wallet_balance || 0,
          role: balData.data.role || 'influencer'
        });
      }
      if (txData.success) {
        setTransactions(txData.data || []);
      }
    } catch (error) {
      console.error('Wallet fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const handleTopUp = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeader();
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/wallet/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ amount: 10000, is_simulation: true })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', '₹10,000 added to your Brand Wallet (Simulation Mode)!');
        fetchWalletData();
      } else {
        Alert.alert('Error', data.message || 'Failed to top-up wallet');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (balance.available <= 0) {
      if (Platform.OS === 'web') window.alert('Notice: You have no available balance to withdraw.');
      else Alert.alert('Notice', 'You have no available balance to withdraw.');
      return;
    }

    if (Platform.OS === 'web') {
      const amountStr = window.prompt(`Enter amount to withdraw to UPI (Max Available: ₹${balance.available}):`, String(balance.available));
      if (!amountStr) return;
      const upiId = window.prompt(`Enter your UPI ID for payout (e.g. name@upi):`, 'ananya@okicici');
      if (!upiId) return;

      const amount = parseFloat(amountStr);
      if (!amount || amount <= 0 || amount > balance.available) {
        return window.alert('Invalid Amount: Please enter a valid amount within your available balance.');
      }
      try {
        setLoading(true);
        const headers = await getAuthHeader();
        const res = await fetch(`${API_CONFIG.BASE_URL}/api/wallet/withdraw-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({ amount, upi_id: upiId, payout_method: 'UPI' })
        });
        const data = await res.json();
        if (data.success) {
          window.alert('✅ Success: Cash withdrawal request submitted! Admin will process your payout.');
          fetchWalletData();
        } else {
          window.alert('Error: ' + (data.message || 'Withdrawal failed'));
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        window.alert('Error: Withdrawal request failed');
        setLoading(false);
      }
    } else {
      Alert.alert(
        'Withdraw Cash to UPI',
        `Request payout of ₹${balance.available} to your UPI account? Admin will process your payment.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Submit Request',
            onPress: async () => {
              try {
                setLoading(true);
                const headers = await getAuthHeader();
                const res = await fetch(`${API_CONFIG.BASE_URL}/api/wallet/withdraw-request`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', ...headers },
                  body: JSON.stringify({ amount: balance.available, upi_id: 'ananya@okicici', payout_method: 'UPI' })
                });
                const data = await res.json();
                if (data.success) {
                  Alert.alert('Success', 'Withdrawal request submitted! Admin will process your payout.');
                  fetchWalletData();
                } else {
                  Alert.alert('Error', data.message || 'Withdrawal failed');
                  setLoading(false);
                }
              } catch (err) {
                console.error(err);
                setLoading(false);
              }
            }
          }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <BackButton 
          color="#FFFFFF" 
          backgroundColor="rgba(255, 255, 255, 0.2)"
          style={{ paddingRight: 10 }}
        />
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Balance Cards */}
        <View style={styles.balanceSection}>
          <View style={styles.mainBalanceCard}>
            <View style={styles.balanceHeader}>
              <MaterialCommunityIcons name="wallet" size={28} color="#FFFFFF" />
              <Text style={styles.balanceLabel}>Total Balance</Text>
            </View>
            <Text style={styles.balanceAmount}>₹{balance.total.toLocaleString()}</Text>
          </View>

          <View style={styles.subBalanceRow}>
            <View style={[styles.subBalanceCard, { backgroundColor: '#FFF7ED' }]}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#F59E0B" />
              <Text style={styles.subBalanceLabel}>Escrow / Pending</Text>
              <Text style={[styles.subBalanceAmount, { color: '#F59E0B' }]}>
                ₹{balance.pending.toLocaleString()}
              </Text>
            </View>

            <View style={[styles.subBalanceCard, { backgroundColor: '#ECFDF5' }]}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
              <Text style={styles.subBalanceLabel}>Available Wallet</Text>
              <Text style={[styles.subBalanceAmount, { color: '#10B981' }]}>
                ₹{balance.available.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          {balance.role === 'brand' || balance.role === 'business' ? (
            <TouchableOpacity style={styles.actionButton} onPress={handleTopUp}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.actionGradient}
              >
                <MaterialCommunityIcons name="plus-circle" size={24} color="#FFFFFF" />
                <Text style={styles.actionText}>Top-Up +₹10,000</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionButton} onPress={handleWithdraw}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.actionGradient}
              >
                <MaterialCommunityIcons name="bank-transfer-out" size={24} color="#FFFFFF" />
                <Text style={styles.actionText}>Withdraw to UPI</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionButton} onPress={fetchWalletData}>
            <View style={[styles.actionGradient, { backgroundColor: '#F1F5F9' }]}>
              <MaterialCommunityIcons name="refresh" size={24} color={COLORS.primary} />
              <Text style={[styles.actionText, { color: COLORS.primary }]}>Refresh</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={[
                styles.transactionIcon,
                { backgroundColor: transaction.type === 'credit' ? '#ECFDF5' : '#FEF2F2' }
              ]}>
                <MaterialCommunityIcons
                  name={transaction.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                  size={20}
                  color={transaction.type === 'credit' ? '#10B981' : '#EF4444'}
                />
              </View>

              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <View style={styles.transactionMeta}>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                  <View style={[
                    styles.statusBadge,
                    {  backgroundColor: transaction.status === 'completed' ? '#ECFDF5' : '#FFF7ED' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: transaction.status === 'completed' ? '#10B981' : '#F59E0B' }
                    ]}>
                      {transaction.status}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[
                styles.transactionAmount,
                { color: transaction.type === 'credit' ? '#10B981' : '#EF4444' }
              ]}>
                {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  balanceSection: {
    padding: 16,
  },
  mainBalanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 12,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 12,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subBalanceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  subBalanceCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  subBalanceLabel: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '500',
  },
  subBalanceAmount: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  transactionsSection: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionDate: {
    fontSize: 13,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
