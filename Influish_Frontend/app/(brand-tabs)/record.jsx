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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { getAuthHeader } from '../../utils/storage';
import { API, getApiUrl } from '../../constants/api';

/* ================= THEME ================= */
const THEME = {
  primary: '#7C3AED',
  primaryDark: '#6D28FF',
  secondary: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  background: '#0B0B10',
  cardBg: '#14141C',
  text: '#FFFFFF',
  textLight: 'rgba(255,255,255,0.65)',
  border: 'rgba(255,255,255,0.12)',
  shadow: 'rgba(0, 0, 0, 0.4)',
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
    if (status === 'active') return { color: '#34D399', icon: 'check-circle', bg: 'rgba(16, 185, 129, 0.16)' };
    if (status === 'paused') return { color: '#FBBF24', icon: 'pause-circle', bg: 'rgba(245, 158, 11, 0.16)' };
    if (status === 'completed') return { color: '#C084FC', icon: 'check-all', bg: 'rgba(168, 85, 247, 0.2)' };
    return { color: '#F472B6', icon: 'check-all', bg: 'rgba(236, 72, 153, 0.18)' };
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
              <MaterialCommunityIcons name="map-marker" size={14} color="rgba(255,255,255,0.55)" />
              <Text style={styles.locationText}>{item.influencer_location}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <MaterialCommunityIcons name={statusInfo.icon} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Info Pills */}
        <View style={styles.pillsContainer}>
          <View style={styles.pill}>
            <MaterialCommunityIcons name="instagram" size={15} color="#C084FC" />
            <Text style={styles.pillText}>{item.content_type}</Text>
          </View>
          
          <View style={styles.pill}>
            <MaterialCommunityIcons name="account-group" size={15} color="#C084FC" />
            <Text style={styles.pillText}>{item.number_of_seats} seats</Text>
          </View>
          
          {item.campaign_type === 'paid' && (
            <View style={styles.pill}>
              <MaterialCommunityIcons name="currency-inr" size={15} color="#34D399" />
              <Text style={[styles.pillText, { color: '#34D399', fontWeight: '700' }]}>₹{item.cost_per_influencer}</Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(168, 85, 247, 0.16)' }]}>
              <MaterialCommunityIcons name="email-multiple" size={18} color="#C084FC" />
            </View>
            <Text style={styles.statValue}>{item.applications_count || 0}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.16)' }]}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#34D399" />
            </View>
            <Text style={[styles.statValue, { color: '#34D399' }]}>
              {item.accepted_count || 0}
            </Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.16)' }]}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#F87171" />
            </View>
            <Text style={[styles.statValue, { color: '#F87171' }]}>
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
              colors={item.status === 'completed' ? ['#4B5563', '#374151'] : item.status === 'paused' ? ['#10B981', '#059669'] : ['#F59E0B', '#D97706']}
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
            <MaterialCommunityIcons name="file-document-multiple" size={17} color="#C084FC" />
            <Text style={styles.actionBtnOutlineText}>Applications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.completeIconBtn}
            onPress={() => onComplete(item.id || item._id)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="check-circle-outline" size={22} color="#34D399" />
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
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;
    try {
      const headers = await getAuthHeader();
      const res = await fetch(getApiUrl(API.CAMPAIGNS.MY_CAMPAIGNS), {
        headers,
        signal: controller ? controller.signal : undefined,
      });
      if (timeoutId) clearTimeout(timeoutId);
      const data = await res.json();
      const rawCampaigns = data.campaigns || [];
      const unique = [];
      const seen = new Set();
      for (const c of rawCampaigns) {
        const nameKey = (c.campaign_name || '').trim().toLowerCase();
        if (!seen.has(nameKey)) {
          seen.add(nameKey);
          unique.push(c);
        }
      }
      setCampaigns(unique);
    } catch (e) {
      if (timeoutId) clearTimeout(timeoutId);
      console.log('fetchCampaigns error or timeout:', e);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
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

  const handleCompleteCampaign = async (id) => {
    // Optimistic status update for instant 0ms web & mobile response
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id || c._id === id ? { ...c, status: 'completed' } : c))
    );
    try {
      const headers = await getAuthHeader();
      await fetch(getApiUrl(`/api/campaigns/${id}`), {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
    } catch (e) {
      console.error('Error completing campaign:', e);
    } finally {
      fetchCampaigns();
    }
  };

  const handleToggleStatus = async (id, status) => {
    const newStatus = status === 'active' ? 'paused' : 'active';
    // Optimistic status update for instant 0ms web & mobile response
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id || c._id === id ? { ...c, status: newStatus } : c))
    );
    try {
      const headers = await getAuthHeader();
      await fetch(getApiUrl(`/api/campaigns/${id}`), {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error('Error toggling status:', e);
    } finally {
      fetchCampaigns();
    }
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
            <MaterialCommunityIcons name="bullhorn" size={38} color="rgba(255,255,255,0.25)" />
          </View>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'active', 'paused', 'completed'].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]} numberOfLines={1}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
            <View style={[styles.filterBadge, filter === f && styles.filterBadgeActive]}>
              <Text style={[styles.filterBadgeText, filter === f && styles.filterBadgeTextActive]}>
                {getFilterCount(f)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Campaign List */}
      {filteredCampaigns.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="inbox" size={70} color="rgba(255,255,255,0.2)" />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B0B10',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    gap: 4,
  },
  filterTabActive: {
    backgroundColor: THEME.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
  },
  filterTabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  filterBadgeTextActive: {
    color: '#fff',
  },

  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: THEME.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardTopLeft: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.6)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#1E1E2A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#1E1E2A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
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
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  actionBtnOutline: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C084FC',
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
  },
  actionBtnOutlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C084FC',
  },
  completeIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginTop: 16,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13.5,
    color: THEME.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});