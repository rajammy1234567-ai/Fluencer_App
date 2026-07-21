/**
 * AdminDashboardScreen
 * Main admin dashboard with statistics and recent activity
 * Uses mock data from adminDashboard.service - will be replaced by real APIs
 */

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AdminLayout from '../../../components/admin/AdminLayout';
import StatCard from '../../../components/admin/StatCard';
import SectionHeader from '../../../components/admin/SectionHeader';
import EmptyState from '../../../components/admin/EmptyState';
import { COLORS } from '../../../constants/colors';
import { isAdminAuthenticated } from '../../../utils/adminStorage';
import {
  getDashboardStats,
  getRecentCampaigns,
  getRecentPayments,
  getWithdrawRequests,
  formatCurrency,
} from '../../../services/adminDashboard.service';

const AdminDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);

  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      router.replace('/(admin)/login');
      return;
    }
    loadDashboardData();
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [statsRes, campaignsRes, paymentsRes, withdrawsRes] = await Promise.all([
        getDashboardStats(),
        getRecentCampaigns(5),
        getRecentPayments(5),
        getWithdrawRequests(5),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (campaignsRes.success) setRecentCampaigns(campaignsRes.data);
      if (paymentsRes.success) setRecentPayments(paymentsRes.data);
      if (withdrawsRes.success) setWithdrawRequests(withdrawsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <AdminLayout>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        </AdminLayout>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AdminLayout>
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
        {/* Statistics Cards */}
        <View style={styles.statsSection}>
          <SectionHeader 
            title="Platform Overview" 
            subtitle="Real-time statistics and metrics"
          />
          
          {stats && (
            <>
              <StatCard
                icon="account-group"
                title="Total Influencers"
                value={stats.totalInfluencers.toLocaleString()}
                iconColor={COLORS.primary}
              />
              
              <StatCard
                icon="office-building"
                title="Total Brands"
                value={stats.totalBrands.toLocaleString()}
                iconColor="#8B5CF6"
              />
              
              <StatCard
                icon="bullhorn"
                title="Total Campaigns"
                value={stats.totalCampaigns.toLocaleString()}
                iconColor="#10B981"
              />
              
              <StatCard
                icon="handshake"
                title="Active Deals"
                value={stats.activeDeals.toLocaleString()}
                iconColor="#F59E0B"
              />
              
              <StatCard
                icon="cash-multiple"
                title="Platform Earnings"
                value={formatCurrency(stats.platformEarnings)}
                iconColor="#059669"
              />
              
              <StatCard
                icon="bank-transfer"
                title="Pending Withdrawals"
                value={stats.pendingWithdrawals.toLocaleString()}
                iconColor="#EF4444"
              />
              
              <StatCard
                icon="alert-circle"
                title="Open Disputes"
                value={stats.openDisputes.toLocaleString()}
                iconColor="#DC2626"
              />
            </>
          )}
        </View>

        {/* Recent Campaigns Section */}
        <View style={styles.section}>
          <SectionHeader 
            title="Recent Campaigns" 
            subtitle="Last 5 campaigns on the platform"
          />
          
          {recentCampaigns.length > 0 ? (
            recentCampaigns.map((campaign) => (
              <View key={campaign.id} style={styles.listCard}>
                <View style={styles.listCardHeader}>
                  <Text style={styles.listCardTitle}>{campaign.campaignName}</Text>
                  <View style={[
                    styles.statusBadge,
                    campaign.status === 'Active' ? styles.statusActive : styles.statusCompleted
                  ]}>
                    <Text style={[
                      styles.statusText,
                      campaign.status === 'Active' ? styles.statusTextActive : styles.statusTextCompleted
                    ]}>
                      {campaign.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.listCardSubtitle}>{campaign.brandName}</Text>
                <View style={styles.listCardFooter}>
                  <Text style={styles.listCardMeta}>
                    Budget: {formatCurrency(campaign.budget)}
                  </Text>
                  <Text style={styles.listCardMeta}>
                    {new Date(campaign.createdAt).toLocaleDateString('en-IN')}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <EmptyState 
              icon="bullhorn-outline" 
              message="No recent campaigns" 
            />
          )}
        </View>

        {/* Recent Payments Section */}
        <View style={styles.section}>
          <SectionHeader 
            title="Recent Payments" 
            subtitle="Latest payment transactions"
          />
          
          {recentPayments.length > 0 ? (
            recentPayments.map((payment) => (
              <View key={payment.id} style={styles.listCard}>
                <View style={styles.listCardHeader}>
                  <Text style={styles.listCardTitle}>{payment.brandName}</Text>
                  <View style={[
                    styles.statusBadge,
                    payment.status === 'Success' ? styles.statusSuccess : styles.statusRefunded
                  ]}>
                    <Text style={[
                      styles.statusText,
                      payment.status === 'Success' ? styles.statusTextSuccess : styles.statusTextRefunded
                    ]}>
                      {payment.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.listCardFooter}>
                  <Text style={styles.amountText}>
                    {formatCurrency(payment.amount)}
                  </Text>
                  <Text style={styles.listCardMeta}>
                    {new Date(payment.transactionDate).toLocaleDateString('en-IN')}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <EmptyState 
              icon="cash-remove" 
              message="No recent payments" 
            />
          )}
        </View>

        {/* Withdraw Requests Section */}
        <View style={styles.section}>
          <SectionHeader 
            title="Withdraw Requests" 
            subtitle="Influencer withdrawal requests"
          />
          
          {withdrawRequests.length > 0 ? (
            withdrawRequests.map((request) => (
              <View key={request.id} style={styles.listCard}>
                <View style={styles.listCardHeader}>
                  <Text style={styles.listCardTitle}>{request.influencerName}</Text>
                  <View style={[
                    styles.statusBadge,
                    request.status === 'Pending' ? styles.statusPending : styles.statusApproved
                  ]}>
                    <Text style={[
                      styles.statusText,
                      request.status === 'Pending' ? styles.statusTextPending : styles.statusTextApproved
                    ]}>
                      {request.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.listCardFooter}>
                  <Text style={styles.amountText}>
                    {formatCurrency(request.amount)}
                  </Text>
                  <Text style={styles.listCardMeta}>
                    {new Date(request.requestDate).toLocaleDateString('en-IN')}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <EmptyState 
              icon="wallet-outline" 
              message="No withdraw requests" 
            />
          )}
        </View>

        {/* Data Source Notice */}
        <View style={styles.noticeContainer}>
          <Text style={styles.noticeText}>
            📊 Currently displaying mock data for development
          </Text>
          <Text style={styles.noticeSubtext}>
            Will be replaced with real API integration
          </Text>
        </View>
      </ScrollView>
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
    backgroundColor: '#F7F3FF',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F7F3FF',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  statsSection: {
    marginBottom: 8,
  },
  section: {
    marginBottom: 8,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  listCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  listCardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
  },
  listCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listCardMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusTextActive: {
    color: '#059669',
  },
  statusCompleted: {
    backgroundColor: '#E0E7FF',
  },
  statusTextCompleted: {
    color: '#4F46E5',
  },
  statusSuccess: {
    backgroundColor: '#D1FAE5',
  },
  statusTextSuccess: {
    color: '#059669',
  },
  statusRefunded: {
    backgroundColor: '#FEE2E2',
  },
  statusTextRefunded: {
    color: '#DC2626',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusTextPending: {
    color: '#D97706',
  },
  statusApproved: {
    backgroundColor: '#DBEAFE',
  },
  statusTextApproved: {
    color: '#2563EB',
  },
  noticeContainer: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  noticeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 4,
  },
  noticeSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
});

export default AdminDashboard;
