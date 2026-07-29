/**
 * TransactionRow Component
 * Displays a single transaction row for wallet/payment history
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import PaymentStatusBadge from './PaymentStatusBadge';

const TransactionRow = ({ transaction }) => {
  const isCredit = transaction.type === 'Credit';
  const iconName = isCredit ? 'arrow-down-circle' : 'arrow-up-circle';
  const iconColor = isCredit ? '#10B981' : '#EF4444';
  const amountColor = isCredit ? '#10B981' : '#EF4444';
  const amountSign = isCredit ? '+' : '-';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>{transaction.description}</Text>
        <View style={styles.meta}>
          <Text style={styles.date}>{formatDate(transaction.date)}</Text>
          <PaymentStatusBadge status={transaction.status} type="transaction" />
        </View>
      </View>

      <Text style={[styles.amount, { color: amountColor }]}>
        {amountSign} {formatAmount(transaction.amount)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 12,
    color: COLORS.gray,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});

export default TransactionRow;
