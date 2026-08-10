import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { getAuthHeader } from '../utils/storage';
import { API, getApiUrl } from '../constants/api';
import { router } from 'expo-router';

export default function MyCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(getApiUrl(API.CAMPAIGNS.MY_CAMPAIGNS), {
        headers,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCampaigns(data.campaigns || []);
      } else {
        console.error('Failed to fetch campaigns:', data.message);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return '#10B981';
      case 'closed':
        return '#EF4444';
      case 'paused':
        return '#F59E0B';
      default:
        return COLORS.textGray;
    }
  };

  const handleViewApplications = (campaignId) => {
    router.push(`/applications?campaignId=${campaignId}`);
  };

  const [pausingId, setPausingId] = useState(null);

  const handleTogglePause = async (campaignId, currentStatus) => {
    try {
      setPausingId(campaignId);
      const headers = await getAuthHeader();
      const newStatus = currentStatus === 'paused' ? 'open' : 'paused';
      const res = await fetch(getApiUrl(`/api/campaigns/${campaignId}/status`), {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchCampaigns();
      }
    } catch (e) {
      console.warn('Status toggle error:', e);
    } finally {
      setPausingId(null);
    }
  };

  const renderCampaign = ({ item }) => {
    const imgUri = item.product_image || (item.reference_images && item.reference_images[0]) || item.brand_image || item.company_logo || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
    const cId = item.id || item._id;
    const isPaused = item.status === 'paused';

    return (
      <View style={styles.campaignCard}>
        {/* Top Header: Image, Title, Location & Status Badge */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.avatarGlowRing}>
            <Image
              source={{ uri: imgUri }}
              style={styles.campaignAvatar}
              resizeMode="cover"
            />
          </View>

          <View style={styles.headerInfoCol}>
            <Text style={styles.campaignNameText} numberOfLines={2}>
              {item.name || item.campaign_name}
            </Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={14} color="rgba(255, 255, 255, 0.45)" />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.influencer_location || item.location || 'Pan India'}
              </Text>
            </View>
          </View>

          <View style={[styles.statusPill, isPaused ? styles.statusPillPaused : styles.statusPillOpen]}>
            <MaterialCommunityIcons
              name={isPaused ? "pause-circle" : "check-all"}
              size={13}
              color={isPaused ? "#F59E0B" : "#EC4899"}
            />
            <Text style={[styles.statusPillText, { color: isPaused ? "#F59E0B" : "#F472B6" }]}>
              {isPaused ? 'Paused' : 'Open'}
            </Text>
          </View>
        </View>

        {/* Specs Badges Row */}
        <View style={styles.specsRow}>
          <View style={styles.specBadge}>
            <MaterialCommunityIcons name="instagram" size={14} color="#C084FC" />
            <Text style={styles.specBadgeText}>{(item.content_type || 'reel').toLowerCase()}</Text>
          </View>

          <View style={styles.specBadge}>
            <MaterialCommunityIcons name="account-group" size={14} color="#C084FC" />
            <Text style={styles.specBadgeText}>{item.number_of_seats || item.seats || 5} seats</Text>
          </View>

          <View style={styles.specBadge}>
            <MaterialCommunityIcons name="currency-inr" size={14} color="#10B981" />
            <Text style={[styles.specBadgeText, { color: '#10B981', fontWeight: '700' }]}>
              ₹{item.cost_per_influencer || item.budget || 5000}
            </Text>
          </View>
        </View>

        {/* Stats Grid Row (Applications, Accepted, Rejected) */}
        <View style={styles.statsGridRow}>
          <View style={styles.statGridCard}>
            <View style={[styles.statIconBadge, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
              <MaterialCommunityIcons name="email-multiple" size={16} color="#C084FC" />
            </View>
            <Text style={styles.statGridNumber}>{item.applications_count || 0}</Text>
            <Text style={styles.statGridLabel}>Applications</Text>
          </View>

          <View style={styles.statGridCard}>
            <View style={[styles.statIconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
            </View>
            <Text style={styles.statGridNumber}>{item.accepted_count || 0}</Text>
            <Text style={styles.statGridLabel}>Accepted</Text>
          </View>

          <View style={styles.statGridCard}>
            <View style={[styles.statIconBadge, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <MaterialCommunityIcons name="close-circle" size={16} color="#EF4444" />
            </View>
            <Text style={styles.statGridNumber}>{item.rejected_count || 0}</Text>
            <Text style={styles.statGridLabel}>Rejected</Text>
          </View>
        </View>

        {/* Bottom Action Bar: Pause, Applications & Complete */}
        <View style={styles.actionsBarRow}>
          <TouchableOpacity
            style={[styles.pauseActionBtn, isPaused && { backgroundColor: '#10B981' }]}
            onPress={() => handleTogglePause(cId, item.status)}
            disabled={pausingId === cId}
            activeOpacity={0.85}
          >
            {pausingId === cId ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name={isPaused ? "play" : "pause"}
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.pauseBtnText}>{isPaused ? 'Resume' : 'Pause'}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.appsActionBtn}
            onPress={() => handleViewApplications(cId)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="file-document-outline" size={18} color="#C084FC" />
            <Text style={styles.appsBtnText}>Applications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.completeCheckBtn}
            onPress={() => handleViewApplications(cId)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="check-circle-outline" size={20} color="#10B981" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Campaigns</Text>
        <Text style={styles.headerSubtitle}>
          {campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'}
        </Text>
      </View>

      <View style={styles.listContent}>
        {campaigns.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="bullhorn-outline"
              size={64}
              color={COLORS.textGray}
            />
            <Text style={styles.emptyText}>No Campaigns Yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first campaign to get started
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.navigate('/(brand-tabs)/create')}
            >
              <LinearGradient
                colors={COLORS.gradientPrimary}
                style={styles.createGradient}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.createButtonText}>Create Campaign</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          campaigns.map((campaign) => (
            <View key={(campaign.id || campaign._id || Math.random()).toString()}>
              {renderCampaign({ item: campaign })}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textGray,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  campaignCard: {
    backgroundColor: '#12121A',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarGlowRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#9333EA',
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  campaignAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  headerInfoCol: {
    flex: 1,
  },
  campaignNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '500',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusPillOpen: {
    backgroundColor: 'rgba(190, 24, 93, 0.22)',
    borderColor: 'rgba(219, 39, 119, 0.4)',
  },
  statusPillPaused: {
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  specBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsGridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statGridCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statGridNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statGridLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.55)',
  },
  actionsBarRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  pauseActionBtn: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pauseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appsActionBtn: {
    flex: 1.4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  appsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C084FC',
  },
  completeCheckBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textGray,
    marginTop: 8,
    textAlign: 'center',
  },
  createButton: {
    marginTop: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
  createGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});
