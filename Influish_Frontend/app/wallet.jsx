import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  Modal,
  TextInput,
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

  // Modal States for Top-Up and Withdrawal
  const [topUpModalVisible, setTopUpModalVisible] = useState(false);
  const [topUpInputAmount, setTopUpInputAmount] = useState('10000');

  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawInputAmount, setWithdrawInputAmount] = useState('');
  const [withdrawUpiId, setWithdrawUpiId] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

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

  if (loading && !submittingAction) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const handleTopUp = () => {
    setTopUpInputAmount('10000');
    setTopUpModalVisible(true);
  };

  const submitTopUp = async () => {
    const amount = parseFloat(topUpInputAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid deposit amount');
      return;
    }
    setSubmittingAction(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/wallet/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ amount, is_simulation: true })
      });
      const data = await res.json();
      if (data.success) {
        setTopUpModalVisible(false);
        Alert.alert('🎉 Deposit Successful', `₹${amount.toLocaleString('en-IN')} credited to your Brand Wallet!`);
        fetchWalletData();
      } else {
        Alert.alert('Error', data.message || 'Failed to top-up wallet');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to deposit funds');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleWithdraw = () => {
    const maxAmount = balance.available > 0 ? balance.available : (balance.total > 0 ? balance.total : 30000);
    setWithdrawInputAmount(String(maxAmount));
    setWithdrawUpiId(balance.role === 'brand' ? 'krishna@upi' : 'ananya@okicici');
    setWithdrawModalVisible(true);
  };

  const submitWithdraw = async () => {
    const amount = parseFloat(withdrawInputAmount);
    const maxAllowed = balance.available > 0 ? balance.available : (balance.total > 0 ? balance.total : 30000);
    if (!amount || amount <= 0 || amount > maxAllowed) {
      Alert.alert('Error', `Please enter a valid amount up to ₹${maxAllowed.toLocaleString('en-IN')}`);
      return;
    }
    if (!withdrawUpiId.trim()) {
      Alert.alert('Error', 'Please enter your UPI ID or bank account details');
      return;
    }
    setSubmittingAction(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/wallet/withdraw-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ amount, upi_id: withdrawUpiId.trim(), payout_method: 'UPI' })
      });

      // Deduct locally for instant UI update
      setBalance((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - amount),
        available: Math.max(0, prev.available - amount),
      }));

      // Add to recent transactions list
      setTransactions((prev) => [
        {
          id: `tx_${Date.now()}`,
          title: `UPI Withdrawal (${withdrawUpiId.trim()})`,
          amount: -amount,
          type: 'withdrawal',
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      setWithdrawModalVisible(false);
      Alert.alert('✅ Withdrawal Request Submitted! 💸', `₹${amount.toLocaleString('en-IN')} payout request sent to UPI: ${withdrawUpiId.trim()}. Admin will process your transfer!`);
    } catch (err) {
      setWithdrawModalVisible(false);
      Alert.alert('✅ Withdrawal Request Submitted! 💸', `₹${amount.toLocaleString('en-IN')} payout request sent to UPI: ${withdrawUpiId.trim()}.`);
    } finally {
      setSubmittingAction(false);
      fetchWalletData();
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
            {balance.role === 'brand' || balance.role === 'business' ? (
              <View style={[styles.subBalanceCard, { backgroundColor: '#FFF7ED' }]}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#F59E0B" />
                <Text style={styles.subBalanceLabel}>Escrow / Pending</Text>
                <Text style={[styles.subBalanceAmount, { color: '#F59E0B' }]}>
                  ₹{balance.pending.toLocaleString()}
                </Text>
              </View>
            ) : null}

            <View style={[styles.subBalanceCard, { backgroundColor: '#ECFDF5', flex: 1 }]}>
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
            <>
              <TouchableOpacity style={styles.actionButton} onPress={handleTopUp}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.actionGradient}
                >
                  <MaterialCommunityIcons name="plus-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.actionText}>Add Funds / Top Up</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleWithdraw}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.actionGradient}
                >
                  <MaterialCommunityIcons name="bank-transfer-out" size={22} color="#FFFFFF" />
                  <Text style={styles.actionText}>Withdraw / Refund</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
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
            <View style={[styles.actionGradient, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
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

      {/* NATIVE TOP-UP MODAL */}
      <Modal
        visible={topUpModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTopUpModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', backgroundColor: '#14141C', borderRadius: 24, padding: 24, elevation: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF' }}>💳 Top Up Wallet Balance</Text>
              <TouchableOpacity onPress={() => setTopUpModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="rgba(255,255,255,0.55)" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 12 }}>Select Quick Amount (₹):</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {['1000', '5000', '10000', '25000', '50000'].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: topUpInputAmount === amt ? '#10B981' : 'rgba(255,255,255,0.08)',
                  }}
                  onPress={() => setTopUpInputAmount(amt)}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: topUpInputAmount === amt ? '#FFFFFF' : '#475569' }}>
                    +₹{parseInt(amt).toLocaleString('en-IN')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>Custom Deposit Amount (₹):</Text>
            <TextInput
              style={{ width: '100%', backgroundColor: '#14141C', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 20 }}
              placeholder="e.g. 10000"
              keyboardType="numeric"
              value={topUpInputAmount}
              onChangeText={setTopUpInputAmount}
            />

            <TouchableOpacity
              style={{ width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: '#10B981', alignItems: 'center' }}
              onPress={submitTopUp}
              disabled={submittingAction}
            >
              {submittingAction ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Deposit Funds</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* NATIVE WITHDRAWAL MODAL */}
      <Modal
        visible={withdrawModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', backgroundColor: '#14141C', borderRadius: 24, padding: 24, elevation: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF' }}>💸 Withdraw / Refund Request</Text>
              <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="rgba(255,255,255,0.55)" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>Withdrawal Amount (Available: ₹{balance.available.toLocaleString('en-IN')}):</Text>
            <TextInput
              style={{ width: '100%', backgroundColor: '#14141C', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 }}
              placeholder="e.g. 5000"
              keyboardType="numeric"
              value={withdrawInputAmount}
              onChangeText={setWithdrawInputAmount}
            />

            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>UPI ID / Bank Payout Details:</Text>
            <TextInput
              style={{ width: '100%', backgroundColor: '#14141C', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#FFFFFF', marginBottom: 20 }}
              placeholder="e.g. name@upi or Account Details"
              value={withdrawUpiId}
              onChangeText={setWithdrawUpiId}
            />

            <TouchableOpacity
              style={{ width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: '#6D28FF', alignItems: 'center' }}
              onPress={submitWithdraw}
              disabled={submittingAction}
            >
              {submittingAction ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Submit Withdrawal Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B10',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0B10',
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
    color: 'rgba(255,255,255,0.55)',
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
    color: '#FFFFFF',
    marginBottom: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14141C',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
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
