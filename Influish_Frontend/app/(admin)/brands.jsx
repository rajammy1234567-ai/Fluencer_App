/**
 * BrandListScreen
 * Admin screen to manage brands
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
  getAllBrands,
  searchBrands,
} from '../../services/brandAdmin.service';

const BrandListScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const response = await getAllBrands();
      if (response.success) {
        setBrands(response.data);
        setFilteredBrands(response.data);
      }
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredBrands(brands);
      return;
    }

    try {
      const response = await searchBrands(query);
      if (response.success) {
        setFilteredBrands(response.data);
      }
    } catch (error) {
      console.error('Error searching brands:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    loadBrands();
  };

  const handleBrandPress = (brand) => {
    router.push({
      pathname: '/(admin)/brand-detail',
      params: { id: brand.id },
    });
  };

  const renderBrand = ({ item }) => (
    <UserRow
      icon="office-building"
      iconColor="#FEF3C7"
      title={item.businessName}
      subtitle={item.email}
      stat={item.totalCampaigns}
      statLabel="Campaigns"
      status={item.accountStatus}
      onPress={() => handleBrandPress(item)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AdminLayout>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading brands...</Text>
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
            <Text style={styles.title}>Brands</Text>
            <Text style={styles.subtitle}>
              {filteredBrands.length} total brands
            </Text>
          </View>

          <View style={styles.content}>
            <SearchBar
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search by name or email..."
            />

            <FlatList
              data={filteredBrands}
              renderItem={renderBrand}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              ListEmptyComponent={
                <EmptyState
                  icon="office-building-outline"
                  message={
                    searchQuery
                      ? 'No brands found'
                      : 'No brands yet'
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

export default BrandListScreen;
