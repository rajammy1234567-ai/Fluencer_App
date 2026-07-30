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

import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { getAuthHeader, getUserId } from '../../utils/storage';
import { API, getApiUrl } from '../../constants/api';
import { router, useNavigation } from 'expo-router';
import { StaggerItem, SlideUp } from '../../components/motion';

const THEME = {
  primary: '#7C3AED',
  primaryDark: '#6D28FF',
  gradientStart: '#0B0B10',
  gradientMid: 'rgba(124, 58, 237, 0.18)',
  gradientEnd: '#0B0B10',
  blue: '#7C3AED',
  blueLight: '#A855F7',
  blueDark: '#6D28FF',
  pink: '#EC4899',
  green: '#10B981',
  cardBg: '#14141F',
  searchBg: '#181826',
  text: '#FFFFFF',
  textLight: 'rgba(255,255,255,0.65)',
  white: '#FFFFFF',
  background: '#0B0B10',
  border: 'rgba(255,255,255,0.12)',
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

  const renderConversation = ({ item, index }) => {
    if (!item) return null;
    
    const displayName = item.influencer_name || item.brand_name || item.campaign_name || 'Brand';
    const displayImage = item.influencer_image || item.brand_image;
    const isLocked = item.is_active === 0;
    
    return (
      <StaggerItem index={index} baseDelay={55}>
      <TouchableOpacity
        style={styles.conversationCard}
        activeOpacity={0.75}
        onPress={() => {
          if (!item.id || item.id === 'undefined') {
            Alert.alert('Error', 'Cannot open chat. Invalid chat ID.');
            return;
          }
          try {
            router.push(`/conversation?chatId=${item.id}`);
          } catch (error) {
            Alert.alert('Error', 'Failed to open chat.');
          }
        }}
      >
        {/* Left Purple Stripe Accent */}
        <View style={styles.leftStripeAccent} />

        {/* Avatar with Online Indicator */}
        <View style={styles.avatarContainer}>
          {displayImage ? (
            <Image source={{ uri: displayImage }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={['#7C3AED', '#4C1D95']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {displayName?.charAt(0)?.toUpperCase() || 'B'}
              </Text>
            </LinearGradient>
          )}
          <View style={styles.onlineIndicator} />
        </View>

        {/* Conversation Info */}
        <View style={styles.conversationContent}>
          {/* Header Line: Name + Time + Menu */}
          <View style={styles.conversationHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {displayName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.timeText}>{formatTime(item.last_message_time || item.updated_at)}</Text>
              <MaterialCommunityIcons name="dots-vertical" size={16} color="rgba(255,255,255,0.35)" />
            </View>
          </View>

          {/* Campaign Title Row */}
          {Boolean(item.campaign_name) ? (
            <View style={styles.campaignRow}>
              <MaterialCommunityIcons name="bullhorn" size={13} color="#C084FC" />
              <Text style={styles.campaignTitleText} numberOfLines={1}>
                {item.campaign_name}
              </Text>
            </View>
          ) : null}

          {/* Last Message / Escrow Status */}
          <Text style={styles.lastMessageText} numberOfLines={1}>
            {item.last_message || 'Brand deposited funds into Escrow. Creator can now shoot...'}
          </Text>

          {/* Bottom Pills Row */}
          <View style={styles.pillsRow}>
            <View style={styles.msgCountPill}>
              <MaterialCommunityIcons name="message-text-outline" size={12} color="#C084FC" />
              <Text style={styles.msgCountPillText}>
                {item.message_count || 0}/{item.max_messages || 10} messages
              </Text>
            </View>

            <View style={isLocked ? styles.lockedPill : styles.activePill}>
              <MaterialCommunityIcons
                name={isLocked ? "lock-outline" : "check-circle-outline"}
                size={12}
                color={isLocked ? "#F87171" : "#34D399"}
              />
              <Text style={isLocked ? styles.lockedPillText : styles.activePillText}>
                {isLocked ? 'Locked' : 'Active'}
              </Text>
            </View>
          </View>
        </View>

        {/* Right Arrow Chevron */}
        <MaterialCommunityIcons name="chevron-right" size={22} color="#A855F7" style={{ marginLeft: 6 }} />
      </TouchableOpacity>
      </StaggerItem>
    );
  };

  const renderEmpty = () => (
    <SlideUp delay={100}>
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="chat-outline"
        size={80}
        color={THEME.blueLight}
      />
      <Text style={styles.emptyTitle}>No Conversations Yet</Text>
      <Text style={styles.emptyText}>
        Start chatting with creators who apply to your campaigns
      </Text>
    </View>
    </SlideUp>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.tabContentText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#07080F" />

      {/* Top Header Block */}
      <View style={styles.headerBlock}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeftCol}>
            <View style={styles.headerTitleRow}>
              <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.headerIconBox}>
                <MaterialCommunityIcons name="message-reply-text" size={22} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.headerTitle}>Messages</Text>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{filteredConversations.length}</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>
              {filteredConversations.length} active {filteredConversations.length === 1 ? 'conversation' : 'conversations'}
            </Text>
          </View>

          {/* Inline Compact Search Input */}
          <View style={styles.searchInlineBox}>
            <MaterialCommunityIcons name="magnify" size={16} color="rgba(255,255,255,0.4)" />
            <TextInput
              style={styles.searchInlineInput}
              placeholder="Search conversations..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>

      {/* Chat List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item, index) => item.id?.toString() || `chat-${index}`}
        contentContainerStyle={[
          styles.listContent,
          filteredConversations.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={() => (
          filteredConversations.length > 0 ? (
            <View style={styles.footerNoteContainer}>
              <MaterialCommunityIcons name="auto-fix" size={14} color="#A855F7" />
              <Text style={styles.footerNoteText}>All your conversations are secure</Text>
            </View>
          ) : null
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080F',
  },
  headerBlock: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeftCol: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  countPill: {
    backgroundColor: '#231B3D',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  countPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A855F7',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 4,
  },
  searchInlineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F111E',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.22)',
    maxWidth: 160,
  },
  searchInlineInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 12,
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F111E',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  leftStripeAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    backgroundColor: '#7C3AED',
  },
  avatarContainer: {
    position: 'relative',
    marginLeft: 4,
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0F111E',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  userName: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  campaignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  campaignTitleText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#C084FC',
    flex: 1,
  },
  lastMessageText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 18,
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  msgCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1C1536',
    borderWidth: 1,
    borderColor: '#3B296B',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  msgCountPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#C084FC',
  },
  lockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  lockedPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#F87171',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  activePillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#34D399',
  },
  footerNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 24,
  },
  footerNoteText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '500',
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
    backgroundColor: '#07080F',
  },
  tabContentText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 12,
  },
});
