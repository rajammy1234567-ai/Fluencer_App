/**
 * InfluencerListScreen
 * Admin screen to manage influencers
 * Mock data used for admin panel — replace with APIs later
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AdminLayout from '../../components/admin/AdminLayout';
import SearchBar from '../../components/admin/SearchBar';
import UserRow from '../../components/admin/UserRow';
import EmptyState from '../../components/admin/EmptyState';
import { COLORS } from '../../constants/colors';
import {
  getAllInfluencers,
  searchInfluencers,
  formatNumber,
} from '../../services/influencerAdmin.service';

const InfluencerListScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [influencers, setInfluencers] = useState([]);
  const [filteredInfluencers, setFilteredInfluencers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInfluencers();
  }, []);

  const loadInfluencers = async () => {
    try {
      const response = await getAllInfluencers();
      if (response.success) {
        setInfluencers(response.data);
        setFilteredInfluencers(response.data);
      }
    } catch (error) {
      console.error('Error loading influencers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredInfluencers(influencers);
      return;
    }

    try {
      const response = await searchInfluencers(query);
      if (response.success) {
        setFilteredInfluencers(response.data);
      }
    } catch (error) {
      console.error('Error searching influencers:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    loadInfluencers();
  };

  const handleInfluencerPress = (influencer) => {
    router.push({
      pathname: '/(admin)/influencer-detail',
      params: { id: influencer.id },
    });
  };

  const renderInfluencer = ({ item }) => (
    <UserRow
      icon="account"
      iconColor="#E0F2FE"
      title={item.name}
      subtitle={item.email}
      stat={formatNumber(item.followers)}
      statLabel="Followers"
      status={item.accountStatus}
      onPress={() => handleInfluencerPress(item)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AdminLayout>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading influencers...</Text>
          </View>
        </AdminLayout>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AdminLayout>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Influencers</Text>
            <Text style={styles.subtitle}>
              {filteredInfluencers.length} total influencers
            </Text>
          </View>

          <View style={styles.content}>
            <SearchBar
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search by name or email..."
            />

            <FlatList
              data={filteredInfluencers}
              renderItem={renderInfluencer}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              ListEmptyComponent={
                <EmptyState
                  icon="account-search"
                  message={
                    searchQuery
                      ? 'No influencers found'
                      : 'No influencers yet'
                  }
                />
              }
            />
          </View>
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default InfluencerListScreen;
