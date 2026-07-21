/**
 * PaymentListScreen
 * Admin screen to view all brand payments with transaction details
 * Tab 4: High-frequency admin screen
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
import AdminLayout from '../../../components/admin/AdminLayout';
import PaymentStatusBadge from '../../../components/admin/PaymentStatusBadge';
import { COLORS } from '../../../constants/colors';
import {
  getAllPayments,
  searchPayments,
  formatCurrency,
} from '../../../services/paymentAdmin.service';

const PaymentListScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadPayments();
  }, [filterStatus]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const filters = filterStatus !== 'all' ? { status: filterStatus } : {};
      const result = await getAllPayments(filters);
      
      if (result.success) {
        setPayments(result.data);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      loadPayments();
      return;
    }

    const result = await searchPayments(query);
    if (result.success) {
      setPayments(result.data);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    loadPayments();
  };

  const handlePaymentPress = (paymentId) => {
    router.push(`/(admin)/payment-detail?id=${paymentId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderPaymentCard = (payment) => (
    <TouchableOpacity
      key={payment.id}
      style={styles.paymentCard}
      onPress={() => handlePaymentPress(payment.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.brandInfo}>
          <MaterialCommunityIcons
            name="office-building"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.brandName}>{payment.brandName}</Text>
        </View>
        <PaymentStatusBadge status={payment.paymentStatus} type="payment" />
      </View>

      <Text style={styles.campaignName}>{payment.campaignName}</Text>
      
      <View style={styles.cardDivider} />

      <View style={styles.cardBody}>
        <View style={styles.amountSection}>
          <Text style={styles.label}>Paid Amount</Text>
          <Text style={styles.amount}>{formatCurrency(payment.totalAmount)}</Text>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="account-star"
              size={16}
              color={COLORS.gray}
            />
            <Text style={styles.detailText}>{payment.influencerName}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="calendar"
              size={16}
              color={COLORS.gray}
            />
            <Text style={styles.detailText}>{formatDate(payment.paymentDate)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.transactionId}>
          {payment.razorpayTransactionId}
        </Text>
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
      <AdminLayout title="Payments">
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
              placeholder="Search payments..."
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
            {['all', 'Success', 'Refunded'].map((status) => (
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

          {/* Payments List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <ScrollView
              style={styles.paymentsList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={COLORS.primary}
                />
              }
            >
              {payments.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="credit-card-off"
                    size={64}
                    color={COLORS.gray}
                  />
                  <Text style={styles.emptyText}>No payments found</Text>
                </View>
              ) : (
                payments.map(renderPaymentCard)
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
    backgroundColor: '#F7F3FF',
  },
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
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
  paymentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
  },
  campaignName: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E9D5FF',
    marginBottom: 12,
  },
  cardBody: {
    marginBottom: 12,
  },
  amountSection: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
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
    color: '#64748B',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3E8FF',
  },
  transactionId: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#64748B',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
});

export default PaymentListScreen;
