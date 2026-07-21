import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Shadow } from 'react-native-shadow-2';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { getAuthHeader, getUserId } from '../../utils/storage';
import { API, getApiUrl } from '../../constants/api';
import { router, useNavigation } from 'expo-router';

// Premium blue gradient theme
const THEME = {
  primary: '#3b82f6',
  primaryDark: '#2563EB',
  gradientStart: '#4A90E2',
  gradientMid: '#87CEEB',
  gradientEnd: '#E6F3FF',
  blue: '#4A90E2',
  blueLight: '#87CEEB',
  blueDark: '#2E5984',
  pink: '#F472B6',
  green: '#10B981',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  text: '#2C5282',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
};

export default function BrandChat() {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Chats');
  const [filteredConversations, setFilteredConversations] = useState([]);

  // APK SAFETY: Add isMounted flag to prevent setState after unmount
  useEffect(() => {
    let isMounted = true;

    const fetchConversationsAsync = async () => {
      try {
        // APK SAFETY: Add request timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const headers = await getAuthHeader();
        
        // APK SAFETY: Validate token before API call
        if (!headers || !headers.Authorization) {
          console.warn('No auth token, cannot fetch conversations');
          if (isMounted) setLoading(false);
          return;
        }

        const response = await fetch(getApiUrl(API.CHATS.LIST), {
          headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (isMounted) {
          if (response.ok) {
            const data = await response.json();
            // APK SAFETY: Validate array before setting state
            const conversations = Array.isArray(data.chats) ? data.chats : [];
            console.log('✅ Chats loaded:', conversations.length, 'items');
            console.log('First chat:', conversations[0]);
            setConversations(conversations);
            setFilteredConversations(conversations);
          } else {
            setConversations([]);
            setFilteredConversations([]);
          }
          setLoading(false);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Conversations fetch timed out');
        } else {
          console.error('Error fetching conversations:', error);
        }
        if (isMounted) {
          setConversations([]);
          setFilteredConversations([]);
          setLoading(false);
        }
      }
    };

    fetchConversationsAsync();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // APK SAFETY: Validate conversations is array before operations
    if (!Array.isArray(conversations)) {
      setFilteredConversations([]);
      return;
    }
    
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(item =>
        item?.campaign_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.influencer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item?.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [conversations, searchQuery]);

  const fetchConversations = async () => {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(getApiUrl(API.CHATS.LIST), {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        const conversations = Array.isArray(data.chats) ? data.chats : [];
        console.log('✅ Chats loaded:', conversations.length, 'items');
        console.log('First chat:', conversations[0]);
        setConversations(conversations);
        setFilteredConversations(conversations);
      } else {
        setConversations([]);
        setFilteredConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
      setFilteredConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        const minutes = Math.floor(diffInHours * 60);
        return minutes < 1 ? 'Just now' : `${minutes}m ago`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      }
    } catch (error) {
      return '';
    }
  };

  const renderConversation = ({ item }) => {
    if (!item) return null;
    
    const displayName = item.influencer_name || item.campaign_name || 'Unknown';
    const displayImage = item.influencer_image;
    const messageCount = `${item.message_count || 0}/${item.max_messages || 10}`;
    
    return (
      <TouchableOpacity
        style={styles.conversationCard}
        activeOpacity={0.7}
        onPress={() => {
          console.log('🔥 CHAT CLICKED! Opening chat ID:', item.id);
          
          // APK SAFETY: Validate chat ID exists before navigation to prevent Hermes crash
          if (!item.id || item.id === 'undefined') {
            console.error('❌ Cannot navigate: Invalid chat ID');
            Alert.alert('Error', 'Cannot open chat. Invalid chat ID.');
            return;
          }

          try {
            router.push(`/conversation?chatId=${item.id}`);
            console.log('✅ router.push() executed');
          } catch (error) {
            console.error('❌ Navigation error:', error.message);
            console.error('❌ Error stack:', error.stack);
            Alert.alert('Error', 'Failed to open chat. Please try again.');
          }
        }}
      >
        <View style={styles.avatarContainer}>
          {displayImage ? (
            <Image source={{ uri: displayImage }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={['#3b82f6', '#2563EB']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {displayName?.charAt(0)?.toUpperCase() || 'C'}
              </Text>
            </LinearGradient>
          )}
          {(item.unread_count || 0) > 0 && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.timeText}>{formatTime(item.last_message_time)}</Text>
          </View>
          <View style={styles.messageRow}>
            <Text
              style={[
                styles.lastMessage,
                (item.unread_count || 0) > 0 && styles.unreadMessage,
              ]}
              numberOfLines={1}
            >
              {item.last_message || 'No messages yet'}
            </Text>
            <View style={styles.messageBadge}>
              <MaterialCommunityIcons name="message-text" size={12} color={COLORS?.textGray || '#666'} />
              <Text style={styles.messageCountText}>{messageCount}</Text>
            </View>
          </View>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS?.textGray || '#7DA0CA'} />
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="chat-outline"
        size={80}
        color={THEME.blueLight}
      />
      <Text style={styles.emptyTitle}>No Conversations Yet</Text>
      <Text style={styles.emptyText}>
        Start chatting with influencers who apply to your campaigns
      </Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={[THEME.gradientStart, THEME.gradientMid, THEME.gradientEnd]}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" backgroundColor={THEME.blue} />
        <LinearGradient colors={[THEME.blue, THEME.blueDark]} style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Messages</Text>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.blue} />
          <Text style={styles.tabContentText}>Loading conversations...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[THEME.primary, THEME.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSubtitle}>
              {filteredConversations.length} {filteredConversations.length === 1 ? 'Conversation' : 'Conversations'}
            </Text>
          </View>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons name="message-text" size={40} color="rgba(255,255,255,0.2)" />
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={THEME.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={THEME.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Chat List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={[
          styles.listContent,
          filteredConversations.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorCircle1: {
    position: 'absolute',
    top: 200,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: 300,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(244, 114, 182, 0.12)',
  },
  decorCircle3: {
    position: 'absolute',
    top: 500,
    right: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(167, 139, 250, 0.18)',
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: THEME.white,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  activeTabText: {
    color: THEME.purple,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: THEME.text,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.cardBg,
    borderRadius: 20,
    padding: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: THEME.green,
    borderWidth: 2,
    borderColor: THEME.white,
  },
  conversationContent: {
    flex: 1,
    marginLeft: 15,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: THEME.textLight,
  },
  lastMessage: {
    fontSize: 14,
    color: THEME.textLight,
    lineHeight: 20,
    flex: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(5, 38, 89, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageCountText: {
    fontSize: 11,
    fontFamily: FONTS?.medium || 'System',
    color: COLORS?.textGray || '#666',
  },
  unreadMessage: {
    color: THEME.text,
    fontWeight: '600',
  },
  conversationMeta: {
    alignItems: 'center',
    gap: 10,
  },
  unreadBadge: {
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.white,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  tabContentText: {
    fontSize: 16,
    color: THEME.textLight,
    textAlign: 'center',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: THEME.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
