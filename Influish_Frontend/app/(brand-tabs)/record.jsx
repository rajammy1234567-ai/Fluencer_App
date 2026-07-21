import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { getAuthHeader } from '../../utils/storage';
import { API, getApiUrl } from '../../constants/api';

/* ================= THEME ================= */
const THEME = {
  primary: '#3b82f6',
  primaryDark: '#2563EB',
  secondary: '#F472B6',
  success: '#10B981',
  warning: '#F59E0B',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  text: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

/* ================= ANIMATED CARD ================= */
const AnimatedCampaignCard = ({ item, onComplete, onToggleStatus }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getStatusInfo = (status) => {
    if (status === 'active') return { color: THEME.success, icon: 'check-circle', bg: '#DCFCE7' };
    if (status === 'paused') return { color: THEME.warning, icon: 'pause-circle', bg: '#FEF3C7' };
    if (status === 'completed') return { color: THEME.primary, icon: 'check-all', bg: '#DBEAFE' };
    return { color: THEME.secondary, icon: 'check-all', bg: '#FCE7F3' };
  };

  const statusInfo = getStatusInfo(item.status);

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.card}>
        {/* Top Section */}
        <View style={styles.cardTop}>
          <View style={styles.cardTopLeft}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.campaign_name}
            </Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={14} color={THEME.textLight} />
              <Text style={styles.locationText}>{item.influencer_location}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <MaterialCommunityIcons name={statusInfo.icon} size={16} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Info Pills */}
        <View style={styles.pillsContainer}>
          <View style={styles.pill}>
            <MaterialCommunityIcons name="instagram" size={16} color={THEME.primary} />
            <Text style={styles.pillText}>{item.content_type}</Text>
          </View>
          
          <View style={styles.pill}>
            <MaterialCommunityIcons name="account-group" size={16} color={THEME.primary} />
            <Text style={styles.pillText}>{item.number_of_seats} seats</Text>
          </View>
          
          {item.campaign_type === 'paid' && (
            <View style={styles.pill}>
              <MaterialCommunityIcons name="currency-inr" size={16} color={THEME.success} />
              <Text style={styles.pillText}>₹{item.cost_per_influencer}</Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
              <MaterialCommunityIcons name="email-multiple" size={20} color={THEME.primary} />
            </View>
            <Text style={styles.statValue}>{item.applications_count || 0}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
              <MaterialCommunityIcons name="check-circle" size={20} color={THEME.success} />
            </View>
            <Text style={[styles.statValue, { color: THEME.success }]}>
              {item.accepted_count || 0}
            </Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FCE7F3' }]}>
              <MaterialCommunityIcons name="close-circle" size={20} color={THEME.secondary} />
            </View>
            <Text style={[styles.statValue, { color: THEME.secondary }]}>
              {item.rejected_count || 0}
            </Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onToggleStatus(item.id, item.status)}
            activeOpacity={0.7}
            disabled={item.status === 'completed'}
          >
            <LinearGradient
              colors={item.status === 'completed' ? ['#9CA3AF', '#6B7280'] : item.status === 'paused' ? [THEME.success, '#059669'] : ['#F59E0B', '#D97706']}
              style={styles.actionBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons 
                name={item.status === 'completed' ? 'check-all' : item.status === 'paused' ? 'play' : 'pause'} 
                size={16} 
                color="#fff" 
              />
              <Text style={[styles.actionBtnText, item.status === 'completed' && { fontSize: 12 }]}>
                {item.status === 'completed' ? 'Completed' : item.status === 'paused' ? 'Activate' : 'Pause'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBtnOutline} 
            activeOpacity={0.7}
            onPress={() => router.push(`/applications?campaignId=${item.id}`)}
          >
            <MaterialCommunityIcons name="file-document-multiple" size={18} color={THEME.primary} />
            <Text style={styles.actionBtnOutlineText}>View Applications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.completeIconBtn}
            onPress={() => onComplete(item.id)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="check-circle-outline" size={22} color={THEME.success} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

/* ================= MAIN COMPONENT ================= */
export default function CampaignRecord() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(getApiUrl(API.CAMPAIGNS.MY_CAMPAIGNS), { headers });
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteCampaign = (id) => {
    Alert.alert(
      'Delete Campaign',
      'Are you sure you want to delete this campaign? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const headers = await getAuthHeader();
            await fetch(getApiUrl(API.CAMPAIGNS.DELETE.replace(':id', id)), {
              method: 'DELETE',
              headers,
            });
            fetchCampaigns();
          },
        },
      ]
    );
  };

  const handleCompleteCampaign = (id) => {
    Alert.alert(
      'Mark as Complete',
      'Are you sure you want to mark this campaign as completed? This will hide it from influencers.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            const headers = await getAuthHeader();
            await fetch(getApiUrl(API.CAMPAIGNS.UPDATE.replace(':id', id)), {
              method: 'PUT',
              headers: { ...headers, 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'completed' }),
            });
            fetchCampaigns();
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (id, status) => {
    const newStatus = status === 'active' ? 'paused' : 'active';
    const headers = await getAuthHeader();

    await fetch(getApiUrl(API.CAMPAIGNS.UPDATE.replace(':id', id)), {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    fetchCampaigns();
  };

  const filteredCampaigns =
    filter === 'all'
      ? campaigns
      : campaigns.filter((c) => c.status === filter);

  const getFilterCount = (filterType) => {
    if (filterType === 'all') return campaigns.length;
    return campaigns.filter((c) => c.status === filterType).length;
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loaderText}>Loading campaigns...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[THEME.primary, THEME.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Campaigns</Text>
            <Text style={styles.headerSubtitle}>
              {campaigns.length} {campaigns.length === 1 ? 'Campaign' : 'Campaigns'} Total
            </Text>
          </View>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons name="bullhorn" size={40} color="rgba(255,255,255,0.2)" />
          </View>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {['all', 'active', 'paused', 'completed'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
              <View style={[styles.filterBadge, filter === f && styles.filterBadgeActive]}>
                <Text style={[styles.filterBadgeText, filter === f && styles.filterBadgeTextActive]}>
                  {getFilterCount(f)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Campaign List */}
      {filteredCampaigns.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="inbox" size={80} color={THEME.border} />
          <Text style={styles.emptyTitle}>No campaigns found</Text>
          <Text style={styles.emptyText}>
            {filter === 'all'
              ? 'Create your first campaign to get started'
              : `No ${filter} campaigns at the moment`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCampaigns}
          renderItem={({ item }) => (
            <AnimatedCampaignCard
              item={item}
              onComplete={handleCompleteCampaign}
              onToggleStatus={handleToggleStatus}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchCampaigns();
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: THEME.textLight,
  },

  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: THEME.background,
    gap: 8,
  },
  filterTabActive: {
    backgroundColor: THEME.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
  },
  filterTabTextActive: {
    color: '#fff',
  },
  filterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.text,
  },
  filterBadgeTextActive: {
    color: '#fff',
  },

  listContent: {
    padding: 20,
    paddingBottom: 100,
  },

  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: THEME.cardBg,
    borderRadius: 20,
    padding: 20,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: THEME.border,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTopLeft: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 6,
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: THEME.textLight,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: THEME.background,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.text,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: THEME.background,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: THEME.textLight,
    fontWeight: '500',
  },

  divider: {
    height: 1,
    backgroundColor: THEME.border,
    marginBottom: 16,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  actionBtnOutline: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: THEME.primary,
    backgroundColor: 'rgba(74, 144, 226, 0.05)',
  },
  actionBtnOutlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.primary,
  },
  completeIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: THEME.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});