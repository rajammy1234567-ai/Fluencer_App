/**
 * UsersTabScreen
 * Tab 2: User Management with toggle between Influencers and Brands
 * High-frequency admin screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminLayout from '../../../components/admin/AdminLayout';
import { COLORS } from '../../../constants/colors';
import {
  getAllInfluencers,
  searchInfluencers,
} from '../../../services/influencerAdmin.service';
import {
  getAllBrands,
  searchBrands,
} from '../../../services/brandAdmin.service';

const UsersTabScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('influencers'); // 'influencers' or 'brands'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = activeTab === 'influencers' 
        ? await getAllInfluencers()
        : await getAllBrands();
      
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      loadUsers();
      return;
    }

    const result = activeTab === 'influencers'
      ? await searchInfluencers(query)
      : await searchBrands(query);
    
    if (result.success) {
      setUsers(result.data);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    loadUsers();
  };

  const handleUserPress = (userId) => {
    if (activeTab === 'influencers') {
      router.push(`/(admin)/influencer-detail?id=${userId}`);
    } else {
      router.push(`/(admin)/brand-detail?id=${userId}`);
    }
  };

  const renderUserRow = (user) => {
    const isInfluencer = activeTab === 'influencers';
    
    return (
      <TouchableOpacity
        key={user.id}
        style={styles.userRow}
        onPress={() => handleUserPress(user.id)}
        activeOpacity={0.7}
      >
        <View style={styles.userAvatar}>
          <MaterialCommunityIcons
            name={isInfluencer ? 'account-star' : 'office-building'}
            size={24}
            color={COLORS.primary}
          />
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user.name || user.brandName || user.businessName}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {isInfluencer && user.location && (
            <Text style={styles.userCategory}>📍 {user.location}</Text>
          )}
          {!isInfluencer && user.address && (
            <Text style={styles.userCategory}>📍 {user.address}</Text>
          )}
        </View>

        <View style={styles.userMeta}>
          {user.isBlocked && (
            <View style={styles.blockedBadge}>
              <Text style={styles.blockedText}>Blocked</Text>
            </View>
          )}
          {!user.isBlocked && user.isVerified && (
            <MaterialCommunityIcons
              name="check-decagram"
              size={20}
              color={COLORS.success}
            />
          )}
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={COLORS.gray}
            style={{ marginLeft: 8 }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AdminLayout title="Users">
        <View style={styles.container}>
          {/* Tab Toggle */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'influencers' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('influencers')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="account-star"
                size={20}
                color={activeTab === 'influencers' ? COLORS.white : COLORS.gray}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'influencers' && styles.activeTabText,
                ]}
              >
                Influencers
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'brands' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('brands')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="office-building"
                size={20}
                color={activeTab === 'brands' ? COLORS.white : COLORS.gray}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'brands' && styles.activeTabText,
                ]}
              >
                Brands
              </Text>
            </TouchableOpacity>
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
              placeholder={`Search ${activeTab}...`}
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

          {/* User List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <ScrollView
              style={styles.userList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={COLORS.primary}
                />
              }
            >
              {users.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="account-off"
                    size={64}
                    color={COLORS.gray}
                  />
                  <Text style={styles.emptyText}>
                    No {activeTab} found
                  </Text>
                </View>
              ) : (
                users.map(renderUserRow)
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
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    gap: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: COLORS.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  userList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
  },
  userCategory: {
    fontSize: 12,
    color: '#8B5CF6',
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blockedBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  blockedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
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

export default UsersTabScreen;
