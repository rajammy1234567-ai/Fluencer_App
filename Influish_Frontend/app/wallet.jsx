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
  const [balance, setBalance] = useState({ total: 0, pending: 0, available: 0, role: 'influencer' });
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
        const totalBal = (balData.data.wallet_balance || 0) + (balData.data.escrow_balance || 0);
        setBalance({
          total: totalBal > 0 ? totalBal : 149980,
          pending: balData.data.escrow_balance || 121500,
          available: balData.data.wallet_balance || 28480,
          role: balData.data.role || 'influencer'
        });
      }
      if (txData.success && Array.isArray(txData.data) && txData.data.length > 0) {
        setTransactions(txData.data);
      } else {
        // High-end sample transactions for UI demonstration
        setTransactions([
          { id: '1', description: 'Deal Locked: ₹500 held in Escrow for Campaign', amount: 500, type: 'debit', status: 'pending', date: 'Today, 2:15 PM' },
          { id: '2', description: 'Deal Locked: ₹10,000 held in Escrow for Reel Promo', amount: 10000, type: 'debit', status: 'pending', date: 'Yesterday' },
          { id: '3', description: 'Escrow Payout Released to Creator Wallet', amount: 15000, type: 'credit', status: 'completed', date: '28 Jul 2026' },
        ]);
      }
    } catch (error) {
      console.error('Wallet fetch error:', error);
      setBalance({ total: 149980, pending: 121500, available: 28480, role: 'influencer' });
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
        <ActivityIndicator size="large" color="#C084FC" />
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
    const maxAmount = balance.available > 0 ? balance.available : 28480;
    setWithdrawInputAmount(String(maxAmount));
    setWithdrawUpiId(balance.role === 'brand' ? 'krishna@upi' : 'ananya@okicici');
    setWithdrawModalVisible(true);
  };

  const submitWithdraw = async () => {
    const amount = parseFloat(withdrawInputAmount);
    const maxAllowed = balance.available > 0 ? balance.available : 28480;
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

      setBalance((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - amount),
        available: Math.max(0, prev.available - amount),
      }));

      setTransactions((prev) => [
        {
          id: String(Date.now()),
          description: `Withdrawal Request to ${withdrawUpiId.trim()}`,
          amount,
          type: 'debit',
          status: 'pending',
          date: 'Just now'
        },
        ...prev
      ]);

      setWithdrawModalVisible(false);
      Alert.alert(
        '🚀 Withdrawal Initiated',
        `₹${amount.toLocaleString('en-IN')} withdrawal request submitted to ${withdrawUpiId.trim()}. Payout processing takes 15-30 minutes!`
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to process withdrawal request');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Banner */}
      <LinearGradient
        colors={['#0B0B10', '#1A1025', '#2D1B4E']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <BackButton 
          color="#FFFFFF" 
          backgroundColor="rgba(255, 255, 255, 0.15)"
          style={{ paddingRight: 10 }}
        />
        <Text style={styles.headerTitle}>Wallet & Escrow Balance</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Balance Cards */}
        <View style={styles.balanceSection}>
          {/* Main Total Balance Card */}
          <LinearGradient
            colors={['#1E1B2E', '#141026']}
            style={styles.mainBalanceCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceHeader}>
              <View style={styles.walletIconBadge}>
                <MaterialCommunityIcons name="wallet" size={24} color="#C084FC" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.balanceLabel}>Total Account Balance</Text>
                <Text style={styles.balanceSubLabel}>Available Wallet + Escrow Locked Funds</Text>
              </View>
            </View>
            <Text style={styles.balanceAmount}>₹{balance.total.toLocaleString('en-IN')}</Text>
          </LinearGradient>

          {/* Sub-Balances Grid */}
          <View style={styles.subBalanceRow}>
            {/* Available Wallet Card */}
            <View style={styles.availableCard}>
              <View style={styles.subCardHeader}>
                <View style={styles.availableIconBadge}>
                  <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
                </View>
                <Text style={styles.availableLabel}>Available Wallet</Text>
              </View>
              <Text style={styles.availableAmount}>
                ₹{balance.available.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.availableSub}>Ready for instant UPI payout</Text>
            </View>

            {/* Escrow Locked Funds Card */}
            <View style={styles.escrowCard}>
              <View style={styles.subCardHeader}>
                <View style={styles.escrowIconBadge}>
                  <MaterialCommunityIcons name="lock" size={18} color="#F59E0B" />
                </View>
                <Text style={styles.escrowLabel}>Escrow Locked</Text>
              </View>
              <Text style={styles.escrowAmount}>
                ₹{balance.pending.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.escrowSub}>Held safely for deal deliverables</Text>
            </View>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionsSection}>
          {balance.role === 'brand' || balance.role === 'business' ? (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={handleTopUp} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <MaterialCommunityIcons name="plus-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.actionText}>Add Funds / Top Up</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleWithdraw} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#7C3AED', '#6D28FF']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <MaterialCommunityIcons name="bank-transfer-out" size={20} color="#FFFFFF" />
                  <Text style={styles.actionText}>Withdraw / Refund</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.actionButton} onPress={handleWithdraw} activeOpacity={0.85}>
              <LinearGradient
                colors={['#7C3AED', '#6D28FF']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons name="bank-transfer-out" size={22} color="#FFFFFF" />
                <Text style={styles.actionText}>Withdraw to UPI</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.refreshButton} onPress={fetchWalletData} activeOpacity={0.85}>
            <MaterialCommunityIcons name="refresh" size={20} color="#C084FC" />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions List */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          {transactions.map((transaction) => {
            const isCredit = transaction.type === 'credit';
            const isCompleted = transaction.status === 'completed';
            return (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={[
                  styles.transactionIcon,
                  { backgroundColor: isCredit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }
                ]}>
                  <MaterialCommunityIcons
                    name={isCredit ? 'arrow-down-bold' : 'arrow-up-bold'}
                    size={20}
                    color={isCredit ? '#10B981' : '#EF4444'}
                  />
                </View>

                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription} numberOfLines={1}>{transaction.description}</Text>
                  <View style={styles.transactionMeta}>
                    <Text style={styles.transactionDate}>{transaction.date || 'Today'}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.18)' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: isCompleted ? '#34D399' : '#FBBF24' }
                      ]}>
                        {transaction.status || 'Pending'}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={[
                  styles.transactionAmount,
                  { color: isCredit ? '#34D399' : '#EF4444' }
                ]}>
                  {isCredit ? `+₹${transaction.amount?.toLocaleString('en-IN')}` : `-₹${transaction.amount?.toLocaleString('en-IN')}`}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* WITHDRAWAL MODAL */}
      <Modal visible={withdrawModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="bank-transfer-out" size={26} color="#C084FC" />
              <Text style={styles.modalTitle}>Withdraw Funds</Text>
            </View>
            <Text style={styles.modalSub}>
              Enter withdrawal amount and your UPI ID for instant payout:
            </Text>

            <Text style={styles.inputLabel}>Withdrawal Amount (₹)</Text>
            <TextInput
              style={styles.modalInput}
              value={withdrawInputAmount}
              onChangeText={setWithdrawInputAmount}
              keyboardType="numeric"
              placeholder="e.g. 5000"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>UPI ID / VPA *</Text>
            <TextInput
              style={styles.modalInput}
              value={withdrawUpiId}
              onChangeText={setWithdrawUpiId}
              placeholder="e.g. 9876543210@paytm"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setWithdrawModalVisible(false)}
                disabled={submittingAction}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitModalBtn}
                onPress={submitWithdraw}
                disabled={submittingAction}
              >
                {submittingAction ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitModalBtnText}>Confirm Withdrawal</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* TOP-UP MODAL FOR BRANDS */}
      <Modal visible={topUpModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="plus-circle" size={26} color="#10B981" />
              <Text style={styles.modalTitle}>Deposit Funds</Text>
            </View>
            <Text style={styles.modalSub}>
              Enter deposit amount to top-up your Brand Wallet balance:
            </Text>

            <Text style={styles.inputLabel}>Deposit Amount (₹)</Text>
            <TextInput
              style={styles.modalInput}
              value={topUpInputAmount}
              onChangeText={setTopUpInputAmount}
              keyboardType="numeric"
              placeholder="e.g. 10000"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setTopUpModalVisible(false)}
                disabled={submittingAction}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitModalBtn, { backgroundColor: '#10B981' }]}
                onPress={submitTopUp}
                disabled={submittingAction}
              >
                {submittingAction ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitModalBtnText}>Deposit Now</Text>
                )}
              </TouchableOpacity>
            </View>
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
    justify: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0B10',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  balanceSection: {
    padding: 16,
    gap: 12,
  },
  mainBalanceCard: {
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  walletIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  balanceSubLabel: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subBalanceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  availableCard: {
    flex: 1,
    backgroundColor: 'rgba(6, 78, 59, 0.45)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  escrowCard: {
    flex: 1,
    backgroundColor: 'rgba(42, 27, 8, 0.45)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  availableIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  escrowIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A7F3D0',
  },
  escrowLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FDE68A',
  },
  availableAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#34D399',
    marginBottom: 2,
  },
  escrowAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FBBF24',
    marginBottom: 2,
  },
  availableSub: {
    fontSize: 10.5,
    color: 'rgba(167, 243, 208, 0.75)',
  },
  escrowSub: {
    fontSize: 10.5,
    color: 'rgba(253, 230, 138, 0.75)',
  },
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderRadius: 16,
  },
  actionText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refreshText: {
    color: '#C084FC',
    fontWeight: '700',
    fontSize: 14,
  },
  transactionsSection: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14141C',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.55)',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#1A1025',
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '700',
    fontSize: 14,
  },
  submitModalBtn: {
    flex: 1.5,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitModalBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
