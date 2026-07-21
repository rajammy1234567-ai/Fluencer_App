/**
 * CampaignListScreen
 * Admin screen to manage all campaigns
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
import { COLORS } from '../../../constants/colors';
import { getAuthHeader } from '../../../utils/storage';
import { API, getApiUrl } from '../../../constants/api';

const CampaignListScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadCampaigns();
  }, [filterStatus]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeader();
      const response = await fetch(getApiUrl(API.CAMPAIGNS.ALL), {
        headers,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        let filteredData = data.campaigns || [];
        
        // Apply status filter
        if (filterStatus !== 'all') {
          filteredData = filteredData.filter(c => c.status === filterStatus);
        }

        setCampaigns(filteredData);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    loadCampaigns();
  };

  const getFilteredCampaigns = () => {
    if (!searchQuery.trim()) return campaigns;

    return campaigns.filter(campaign =>
      campaign.campaign_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderCampaignCard = (campaign) => (
    <View key={campaign.id} style={styles.campaignCard}>
      <View style={styles.cardHeader}>
        <View style={styles.brandInfo}>
          <MaterialCommunityIcons
            name="bullhorn"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.campaignName} numberOfLines={1}>
            {campaign.campaign_name}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          campaign.status === 'active' ? styles.statusActive : styles.statusInactive
        ]}>
          <Text style={styles.statusText}>
            {campaign.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="office-building" size={16} color={COLORS.gray} />
          <Text style={styles.detailText}>{campaign.company_name}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.gray} />
          <Text style={styles.detailText}>{campaign.influencer_location}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="tag" size={16} color={COLORS.gray} />
          <Text style={styles.detailText}>{campaign.campaign_type} • {campaign.content_type}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account-group" size={16} color={COLORS.gray} />
          <Text style={styles.detailText}>{campaign.number_of_seats} seats</Text>
        </View>

        {campaign.campaign_type === 'paid' && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="currency-inr" size={16} color={COLORS.success} />
            <Text style={styles.priceText}>₹{campaign.cost_per_influencer}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          {formatDate(campaign.created_at)}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={COLORS.gray}
        />
      </View>
    </View>
  );

  const filteredCampaigns = getFilteredCampaigns();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AdminLayout title="Campaigns">
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
              placeholder="Search campaigns..."
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
            {['all', 'active', 'completed', 'cancelled'].map((status) => (
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
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Campaigns List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <ScrollView
              style={styles.campaignsList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[COLORS.primary]}
                />
              }
            >
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map(renderCampaignCard)
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="bullhorn-outline"
                    size={64}
                    color={COLORS.gray}
                  />
                  <Text style={styles.emptyText}>No campaigns found</Text>
                  <Text style={styles.emptySubtext}>
                    {searchQuery ? 'Try a different search term' : 'No campaigns created yet'}
                  </Text>
                </View>
              )}
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
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9D5FF',
  },
  searchIcon: {
    marginRight: 4,
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
  campaignsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  campaignCard: {
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
    marginBottom: 12,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  cardBody: {
    gap: 8,
    paddingVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.success,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
  },
});

export default CampaignListScreen;
