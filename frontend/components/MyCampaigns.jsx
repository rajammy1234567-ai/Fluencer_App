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

  const renderCampaign = ({ item }) => {
    return (
      <View style={styles.campaignCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.campaignName}>{item.name}</Text>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {(item.status || 'unknown').toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <MaterialCommunityIcons
              name={item.campaign_type === 'paid' ? 'cash' : 'gift'}
              size={28}
              color={item.campaign_type === 'paid' ? COLORS.primary : '#10B981'}
            />
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <MaterialCommunityIcons
              name="calendar"
              size={16}
              color={COLORS.textGray}
            />
            <Text style={styles.statText}>
              {new Date(item.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          {item.campaign_type === 'paid' && item.budget && (
            <View style={styles.stat}>
              <MaterialCommunityIcons
                name="currency-inr"
                size={16}
                color={COLORS.textGray}
              />
              <Text style={styles.statText}>₹{item.budget.toLocaleString()}</Text>
            </View>
          )}

          <View style={styles.stat}>
            <MaterialCommunityIcons
              name="account-group"
              size={16}
              color={COLORS.textGray}
            />
            <Text style={styles.statText}>
              {item.applications_count || 0} applications
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewApplications(item.id)}
        >
          <LinearGradient
            colors={COLORS.gradientPrimary}
            style={styles.viewGradient}
          >
            <Text style={styles.viewButtonText}>View Applications</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={18}
              color={COLORS.white}
            />
          </LinearGradient>
        </TouchableOpacity>
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
    backgroundColor: '#14141C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 12,
  },
  campaignName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  description: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textGray,
    lineHeight: 20,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textGray,
  },
  viewButton: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.white,
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
