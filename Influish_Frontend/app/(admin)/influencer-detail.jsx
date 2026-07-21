/**
 * InfluencerDetailScreen
 * Detailed view of influencer with admin actions
 * Mock data used for admin panel — replace with APIs later
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/admin/StatusBadge';
import ActionButton from '../../components/admin/ActionButton';
import { COLORS } from '../../constants/colors';
import { formatCurrency } from '../../services/adminDashboard.service';
import {
  getInfluencerById,
  blockInfluencer,
  unblockInfluencer,
} from '../../services/influencerAdmin.service';

const InfluencerDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [influencer, setInfluencer] = useState(null);

  useEffect(() => {
    loadInfluencer();
  }, [id]);

  const loadInfluencer = async () => {
    try {
      const response = await getInfluencerById(parseInt(id));
      if (response.success) {
        setInfluencer(response.data);
      } else {
        Alert.alert('Error', 'Influencer not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading influencer:', error);
      Alert.alert('Error', 'Failed to load influencer details');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = () => {
    Alert.alert(
      'Block Influencer',
      `Are you sure you want to block ${influencer.name}?\n\nBlocked influencer cannot:\n• Chat with brands\n• Accept deals\n• Withdraw money`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              const response = await blockInfluencer(influencer.id);
              if (response.success) {
                Alert.alert('Success', response.message);
                loadInfluencer();
              } else {
                Alert.alert('Error', response.error);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to block influencer');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUnblock = () => {
    Alert.alert(
      'Unblock Influencer',
      `Are you sure you want to unblock ${influencer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            setActionLoading(true);
            try {
              const response = await unblockInfluencer(influencer.id);
              if (response.success) {
                Alert.alert('Success', response.message);
                loadInfluencer();
              } else {
                Alert.alert('Error', response.error);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to unblock influencer');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AdminLayout>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading details...</Text>
          </View>
        </AdminLayout>
      </SafeAreaView>
    );
  }

  if (!influencer) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AdminLayout>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons name="account" size={60} color={COLORS.primary} />
            </View>
            <Text style={styles.name}>{influencer.name}</Text>
            <Text style={styles.email}>{influencer.email}</Text>
            <View style={styles.statusContainer}>
              <StatusBadge status={influencer.accountStatus} />
            </View>
          </View>

          {/* Info Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Information</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="gender-male-female" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Gender</Text>
              </View>
              <Text style={styles.infoValue}>{influencer.gender}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Location</Text>
              </View>
              <Text style={styles.infoValue}>{influencer.location}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Joined</Text>
              </View>
              <Text style={styles.infoValue}>
                {new Date(influencer.joinedDate).toLocaleDateString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expertise</Text>
            <View style={styles.categoriesContainer}>
              {influencer.categories.map((category, index) => (
                <View key={index} style={styles.categoryChip}>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistics</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="account-group" size={28} color={COLORS.primary} />
                <Text style={styles.statValue}>{influencer.followers.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>

              <View style={styles.statCard}>
                <MaterialCommunityIcons name="briefcase" size={28} color="#8B5CF6" />
                <Text style={styles.statValue}>{influencer.totalCampaigns}</Text>
                <Text style={styles.statLabel}>Campaigns</Text>
              </View>
            </View>
          </View>

          {/* Wallet */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wallet</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="wallet" size={20} color="#059669" />
                <Text style={styles.infoLabel}>Available Balance</Text>
              </View>
              <Text style={styles.walletAmount}>{formatCurrency(influencer.walletBalance)}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#F59E0B" />
                <Text style={styles.infoLabel}>Pending Amount</Text>
              </View>
              <Text style={styles.walletAmount}>{formatCurrency(influencer.pendingAmount)}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            {influencer.accountStatus === 'Active' ? (
              <ActionButton
                title="Block Influencer"
                variant="destructive"
                onPress={handleBlock}
                loading={actionLoading}
              />
            ) : (
              <ActionButton
                title="Unblock Influencer"
                variant="primary"
                onPress={handleUnblock}
                loading={actionLoading}
              />
            )}
          </View>
        </ScrollView>
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
  },
  profileHeader: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
  },
  statusContainer: {
    marginTop: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.primaryDark,
  },
  walletAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  actionsSection: {
    marginTop: 8,
    gap: 12,
  },
});

export default InfluencerDetailScreen;
