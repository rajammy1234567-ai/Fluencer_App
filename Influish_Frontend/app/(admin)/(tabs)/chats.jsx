import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts'; // Assuming this exists or using default
import { getApiUrl } from '../../../constants/api';
import { getAdminAuthHeader } from '../../../utils/adminStorage';

const AdminChatsScreen = () => {
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);

  const fetchChats = async () => {
    try {
      const headers = await getAdminAuthHeader();
      // Ensure the endpoint matches what we created in backend
      const response = await fetch(getApiUrl('/api/chats/admin/all'), {
        headers,
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setChats(data.chats);
        setFilteredChats(data.chats);
      } else {
        console.error('Failed to fetch chats:', data.message);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChats();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = chats.filter((chat) => 
        (chat.brand_name?.toLowerCase().includes(lowerQuery)) ||
        (chat.influencer_name?.toLowerCase().includes(lowerQuery)) ||
        (chat.campaign_name?.toLowerCase().includes(lowerQuery))
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  const renderChatItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.chatCard}
        onPress={() => {
          // Navigate to a read-only chat view or existing chat view
          // For now, let's assume we can reuse existing chat if we pass a flag,
          // OR create a new chat-readonly page.
          // Since user asked for monitoring, let's point to chat-readonly if exists, 
          // or reuse conversation with readOnly param.
          router.push({
            pathname: '/(admin)/chat-detail',
            params: { chatId: item.id }
          });
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.campaignName} numberOfLines={1}>{item.campaign_name}</Text>
          <Text style={styles.timeText}>
            {item.last_message_time ? new Date(item.last_message_time).toLocaleDateString() : 'New'}
          </Text>
        </View>

        <View style={styles.participantsContainer}>
            {/* Brand */}
            <View style={styles.userInfo}>
                <Image 
                    source={item.brand_image ? { uri: item.brand_image } : { uri: 'https://via.placeholder.com/40' }} 
                    style={styles.avatar} 
                />
                <Text style={styles.userName} numberOfLines={1}>{item.brand_name || 'Brand'}</Text>
            </View>

            <MaterialCommunityIcons name="swap-horizontal" size={20} color={COLORS.textLight} />

            {/* Influencer */}
            <View style={[styles.userInfo, { justifyContent: 'flex-end' }]}>
                <Text style={[styles.userName, { textAlign: 'right' }]} numberOfLines={1}>{item.influencer_name || 'Influencer'}</Text>
                <Image 
                    source={item.influencer_image ? { uri: item.influencer_image } : { uri: 'https://via.placeholder.com/40' }} 
                    style={styles.avatar} 
                />
            </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.messagePreview}>
            <Text style={styles.lastMessage} numberOfLines={2}>
                {item.last_message || 'No messages yet'}
            </Text>
            {item.total_messages > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.total_messages}</Text>
                </View>
            )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>All Conversations</Text>
        <Text style={styles.headerSubtitle}>Monitor Brand-Influencer interactions</Text>
        
        <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textLight} style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Search by Brand, Influencer or Campaign..."
                placeholderTextColor={COLORS.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.textLight} />
                </TouchableOpacity>
            )}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="chat-remove-outline" size={60} color={COLORS.gray} />
                <Text style={styles.emptyText}>No conversations found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  chatCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  campaignName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 13,
    color: COLORS.textLight,
    flex: 1,
    marginRight: 10,
    fontStyle: 'italic',
  },
  badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
  },
});

export default AdminChatsScreen;
