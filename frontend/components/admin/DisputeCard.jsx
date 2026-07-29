/**
 * DisputeCard Component
 * Reusable card for displaying dispute in list view
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const DisputeCard = ({ dispute, onPress }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      Open: COLORS.warning,
      Resolved: COLORS.success,
      Rejected: COLORS.error,
    };
    return colors[status] || COLORS.gray;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Content Rejection': 'file-alert',
      'Fake Rejection': 'alert-circle',
      'Post-Payment Cancellation': 'cancel',
    };
    return icons[type] || 'alert';
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.idContainer}>
          <MaterialCommunityIcons
            name="shield-alert"
            size={18}
            color={COLORS.primary}
          />
          <Text style={styles.disputeId}>{dispute.id}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(dispute.status) + '15' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(dispute.status) }]}
          >
            {dispute.status}
          </Text>
        </View>
      </View>

      {/* Type Badge */}
      <View style={styles.typeContainer}>
        <MaterialCommunityIcons
          name={getTypeIcon(dispute.type)}
          size={16}
          color={COLORS.error}
        />
        <Text style={styles.typeText}>{dispute.type}</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <MaterialCommunityIcons
            name="office-building"
            size={16}
            color={COLORS.gray}
          />
          <Text style={styles.label}>Brand:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {dispute.brandName}
          </Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons
            name="account-star"
            size={16}
            color={COLORS.gray}
          />
          <Text style={styles.label}>Influencer:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {dispute.influencerName}
          </Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons
            name="bullhorn"
            size={16}
            color={COLORS.gray}
          />
          <Text style={styles.label}>Campaign:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {dispute.campaignName}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <MaterialCommunityIcons
            name="calendar"
            size={14}
            color={COLORS.gray}
          />
          <Text style={styles.dateText}>{formatDate(dispute.createdAt)}</Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={COLORS.gray}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  disputeId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    backgroundColor: COLORS.error + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.error,
  },
  content: {
    gap: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.blue[50],
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.gray,
  },
});

export default DisputeCard;
