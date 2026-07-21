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

  useEffect(() => {
  let isMounted = true;
  let timeoutId;

  const fetchWalletData = async () => {
    try {
      timeoutId = setTimeout(() => {
        if (!isMounted) return;

        setBalance({
          total: 12500,
          pending: 3200,
          available: 9300,
        });

        setTransactions([
          { id: 1, type: 'credit', amount: 500, description: 'Campaign Payment - Nike Summer', date: '2024-01-25', status: 'completed' },
          { id: 2, type: 'credit', amount: 1200, description: 'Campaign Payment - Tech Review', date: '2024-01-20', status: 'completed' },
          { id: 3, type: 'debit', amount: 300, description: 'Withdrawal to Bank', date: '2024-01-18', status: 'completed' },
          { id: 4, type: 'credit', amount: 800, description: 'Campaign Payment - Fashion Haul', date: '2024-01-15', status: 'pending' },
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Wallet fetch error:', error);
      if (isMounted) setLoading(false);
    }
  };

  fetchWalletData();

  return () => {
    isMounted = false;
    if (timeoutId) clearTimeout(timeoutId);
  };
}, []);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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
              <Text style={styles.balanceLabel}>Total Earnings</Text>
            </View>
            <Text style={styles.balanceAmount}>₹{balance.total.toLocaleString()}</Text>
          </View>

          <View style={styles.subBalanceRow}>
            <View style={[styles.subBalanceCard, { backgroundColor: '#FFF7ED' }]}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#F59E0B" />
              <Text style={styles.subBalanceLabel}>Pending</Text>
              <Text style={[styles.subBalanceAmount, { color: '#F59E0B' }]}>
                ₹{balance.pending.toLocaleString()}
              </Text>
            </View>

            <View style={[styles.subBalanceCard, { backgroundColor: '#ECFDF5' }]}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
              <Text style={styles.subBalanceLabel}>Available</Text>
              <Text style={[styles.subBalanceAmount, { color: '#10B981' }]}>
                ₹{balance.available.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.actionGradient}
            >
              <MaterialCommunityIcons name="bank-transfer-out" size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>Withdraw</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionGradient, { backgroundColor: '#F1F5F9' }]}>
              <MaterialCommunityIcons name="file-document" size={24} color={COLORS.primary} />
              <Text style={[styles.actionText, { color: COLORS.primary }]}>Statement</Text>
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
