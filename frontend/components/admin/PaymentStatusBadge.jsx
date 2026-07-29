/**
 * PaymentStatusBadge Component
 * Displays payment or withdrawal status with appropriate styling
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PaymentStatusBadge = ({ status, type = 'payment' }) => {
  const getStatusConfig = () => {
    // Payment statuses
    if (type === 'payment') {
      const configs = {
        'Success': {
          bgColor: 'rgba(16, 185, 129, 0.15)',
          textColor: '#34d399',
          icon: 'check-circle',
        },
        'Refunded': {
          bgColor: 'rgba(239, 68, 68, 0.15)',
          textColor: '#f87171',
          icon: 'arrow-u-left-top',
        },
        'Pending': {
          bgColor: 'rgba(245, 158, 11, 0.15)',
          textColor: '#fbbf24',
          icon: 'clock-outline',
        },
        'Failed': {
          bgColor: 'rgba(239, 68, 68, 0.15)',
          textColor: '#f87171',
          icon: 'close-circle',
        },
      };
      return configs[status] || configs['Pending'];
    }

    // Withdrawal statuses
    if (type === 'withdrawal') {
      const configs = {
        'Pending': {
          bgColor: 'rgba(245, 158, 11, 0.15)',
          textColor: '#fbbf24',
          icon: 'clock-outline',
        },
        'Approved': {
          bgColor: 'rgba(16, 185, 129, 0.15)',
          textColor: '#34d399',
          icon: 'check-decagram',
        },
        'Rejected': {
          bgColor: 'rgba(239, 68, 68, 0.15)',
          textColor: '#f87171',
          icon: 'close-octagon',
        },
      };
      return configs[status] || configs['Pending'];
    }

    // Transaction statuses
    const configs = {
      'Completed': {
        bgColor: 'rgba(16, 185, 129, 0.15)',
        textColor: '#34d399',
        icon: 'check-circle',
      },
      'Pending': {
        bgColor: 'rgba(245, 158, 11, 0.15)',
        textColor: '#fbbf24',
        icon: 'clock-outline',
      },
    };
    return configs[status] || configs['Pending'];
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <MaterialCommunityIcons
        name={config.icon}
        size={14}
        color={config.textColor}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: config.textColor }]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PaymentStatusBadge;
