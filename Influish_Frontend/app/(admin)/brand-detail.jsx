/**
 * BrandDetailScreen
 * Detailed view of brand with admin actions
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
  getBrandById,
  blockBrand,
  unblockBrand,
} from '../../services/brandAdmin.service';

const BrandDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [brand, setBrand] = useState(null);

  useEffect(() => {
    loadBrand();
  }, [id]);

  const loadBrand = async () => {
    try {
      const response = await getBrandById(parseInt(id));
      if (response.success) {
        setBrand(response.data);
      } else {
        Alert.alert('Error', 'Brand not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading brand:', error);
      Alert.alert('Error', 'Failed to load brand details');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = () => {
    Alert.alert(
      'Block Brand',
      `Are you sure you want to block ${brand.businessName}?\n\nBlocked brand cannot:\n• Create campaigns\n• Chat with influencers\n• Make payments`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              const response = await blockBrand(brand.id);
              if (response.success) {
                Alert.alert('Success', response.message);
                loadBrand();
              } else {
                Alert.alert('Error', response.error);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to block brand');
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
      'Unblock Brand',
      `Are you sure you want to unblock ${brand.businessName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            setActionLoading(true);
            try {
              const response = await unblockBrand(brand.id);
              if (response.success) {
                Alert.alert('Success', response.message);
                loadBrand();
              } else {
                Alert.alert('Error', response.error);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to unblock brand');
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

  if (!brand) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AdminLayout>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons name="office-building" size={60} color={COLORS.primary} />
            </View>
            <Text style={styles.name}>{brand.businessName}</Text>
            <Text style={styles.email}>{brand.email}</Text>
            <View style={styles.statusContainer}>
              <StatusBadge status={brand.accountStatus} />
            </View>
          </View>

          {/* Info Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Information</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="account" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Contact Person</Text>
              </View>
              <Text style={styles.infoValue}>{brand.contactPerson}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="phone" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Phone</Text>
              </View>
              <Text style={styles.infoValue}>{brand.phone}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Location</Text>
              </View>
              <Text style={styles.infoValue}>{brand.location}</Text>
            </View>

            {brand.gstin && (
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="file-document" size={20} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>GSTIN</Text>
                </View>
                <Text style={styles.infoValue}>{brand.gstin}</Text>
              </View>
            )}

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Joined</Text>
              </View>
              <Text style={styles.infoValue}>
                {new Date(brand.joinedDate).toLocaleDateString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistics</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="briefcase" size={28} color={COLORS.primary} />
                <Text style={styles.statValue}>{brand.totalCampaigns}</Text>
                <Text style={styles.statLabel}>Total Campaigns</Text>
              </View>

              <View style={styles.statCard}>
                <MaterialCommunityIcons name="bullhorn" size={28} color="#10B981" />
                <Text style={styles.statValue}>{brand.activeCampaigns}</Text>
                <Text style={styles.statLabel}>Active Campaigns</Text>
              </View>
            </View>
          </View>

          {/* Financial */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financial</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="cash-multiple" size={20} color="#059669" />
                <Text style={styles.infoLabel}>Total Spend</Text>
              </View>
              <Text style={styles.walletAmount}>{formatCurrency(brand.totalSpend)}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            {brand.accountStatus === 'Active' ? (
              <ActionButton
                title="Block Brand"
                variant="destructive"
                onPress={handleBlock}
                loading={actionLoading}
              />
            ) : (
              <ActionButton
                title="Unblock Brand"
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

export default BrandDetailScreen;
