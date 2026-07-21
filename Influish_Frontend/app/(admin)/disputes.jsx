/**
 * DisputeListScreen
 * Admin screen to view and manage all disputes
 * Accessible from More tab → Disputes
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
import AdminLayout from '../../components/admin/AdminLayout';
import DisputeCard from '../../components/admin/DisputeCard';
import { COLORS } from '../../constants/colors';
import {
  getAllDisputes,
  searchDisputes,
  getDisputeStats,
} from '../../services/disputeAdmin.service';

const DisputeListScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState({ open: 0, resolved: 0, rejected: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadDisputes();
    loadStats();
  }, [filterStatus]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const filters = filterStatus !== 'all' ? { status: filterStatus } : {};
      const result = await getAllDisputes(filters);
      
      if (result.success) {
        setDisputes(result.data);
      }
    } catch (error) {
      console.error('Error loading disputes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    const result = await getDisputeStats();
    if (result.success) {
      setStats(result.data);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      loadDisputes();
      return;
    }

    const result = await searchDisputes(query);
    if (result.success) {
      setDisputes(result.data);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    loadDisputes();
    loadStats();
  };

  const handleDisputePress = (disputeId) => {
    router.push(`/(admin)/dispute-detail?id=${disputeId}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AdminLayout title="Disputes">
        <View style={styles.container}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { borderColor: COLORS.warning }]}>
              <Text style={[styles.statValue, { color: COLORS.warning }]}>
                {stats.open}
              </Text>
              <Text style={styles.statLabel}>Open</Text>
            </View>

            <View style={[styles.statCard, { borderColor: COLORS.success }]}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>
                {stats.resolved}
              </Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>

            <View style={[styles.statCard, { borderColor: COLORS.error }]}>
              <Text style={[styles.statValue, { color: COLORS.error }]}>
                {stats.rejected}
              </Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
          </View>

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
              placeholder="Search disputes..."
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
            {['all', 'Open', 'Resolved'].map((status) => (
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

          {/* Disputes List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <ScrollView
              style={styles.disputesList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={COLORS.primary}
                />
              }
            >
              {disputes.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={64}
                    color={COLORS.gray}
                  />
                  <Text style={styles.emptyText}>No disputes found</Text>
                </View>
              ) : (
                disputes.map((dispute) => (
                  <DisputeCard
                    key={dispute.id}
                    dispute={dispute}
                    onPress={() => handleDisputePress(dispute.id)}
                  />
                ))
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
    backgroundColor: COLORS.blue[50],
  },
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.primaryDark,
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
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
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
  disputesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
  },
});

export default DisputeListScreen;
