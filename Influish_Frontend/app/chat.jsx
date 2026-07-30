// TAB 2: CHAT - Brand Conversations
// EXISTING FEATURE – Chat API endpoints exist in constants/api.js
// NEW IMPLEMENTATION – Creating chat UI for influencer module

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { getAuthHeader } from '../utils/storage';
import { API, getApiUrl } from '../constants/api';
import { router, useNavigation } from 'expo-router';

const BLUE = '#7C3AED';
const BLUE_DARK = '#6D28FF';
const BLUE_LIGHT = '#60a5fa';

export default function ChatList() {
  const navigation = useNavigation();
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (!Array.isArray(chats)) {
      setFilteredChats([]);
      return;
    }

    if (!searchQuery.trim()) {
      setFilteredChats(chats);
      return;
    }

    const q = searchQuery.toLowerCase().trim();

    // Filter matching conversations
    const matches = chats.filter((item) => {
      const name = (item.brand_name || item.influencer_name || '').toLowerCase();
      const camp = (item.campaign_name || '').toLowerCase();
      const msg = (item.last_message || '').toLowerCase();
      return name.includes(q) || camp.includes(q) || msg.includes(q);
    });

    // Sort matching item to the TOP of the list
    matches.sort((a, b) => {
      const aName = (a.brand_name || a.influencer_name || '').toLowerCase();
      const bName = (b.brand_name || b.influencer_name || '').toLowerCase();
      const aCamp = (a.campaign_name || '').toLowerCase();
      const bCamp = (b.campaign_name || '').toLowerCase();

      const aStarts = aName.startsWith(q) || aCamp.startsWith(q);
      const bStarts = bName.startsWith(q) || bCamp.startsWith(q);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

    setFilteredChats(matches);
  }, [chats, searchQuery]);

  const fetchChats = async () => {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(getApiUrl(API.CHATS.LIST), { headers });

      const data = await response.json();

      if (response.ok && data.success) {
        const list = data.chats || [];
        setChats(list);
        setFilteredChats(list);
      } else {
        console.log('Chat system not ready:', data.message);
        setChats([]);
        setFilteredChats([]);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
      setFilteredChats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchChats();
  };

  const renderChat = ({ item }) => {
    const isLocked = item.is_active === 0;
    const displayName = item.brand_name || 'Brand';
    const displayImage = item.brand_image;

    return (
      <TouchableOpacity
        style={styles.chatCard}
        activeOpacity={0.75}
        onPress={() => {
          try {
            router.push(`/conversation?chatId=${item.id}`);
          } catch (error) {
            console.error('Navigation error:', error);
          }
        }}
      >
        {/* Left Purple Stripe Accent */}
        <View style={styles.leftStripeAccent} />

        {/* Avatar Container */}
        <View style={styles.avatarContainer}>
          {displayImage ? (
            <Image
              source={{ uri: displayImage }}
              style={styles.avatar}
            />
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

        {/* Chat Info */}
        <View style={styles.chatInfo}>
          {/* Header Row: Name + Date + Dots */}
          <View style={styles.chatHeader}>
            <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.timeText}>
                {new Date(item.updated_at || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <MaterialCommunityIcons name="dots-vertical" size={16} color="rgba(255,255,255,0.35)" />
            </View>
          </View>

          {/* Campaign Row */}
          {item.campaign_name && (
            <View style={styles.campaignRow}>
              <MaterialCommunityIcons name="bullhorn" size={13} color="#C084FC" />
              <Text style={styles.campaignTitleText} numberOfLines={1}>
                {item.campaign_name}
              </Text>
            </View>
          )}

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
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={BLUE} />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.headerBlock}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeftCol}>
            <View style={styles.headerTitleRow}>
              <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.headerIconBox}>
                <MaterialCommunityIcons name="message-reply-text" size={22} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.headerTitle}>Messages</Text>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{filteredChats.length}</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>
              {filteredChats.length} active {filteredChats.length === 1 ? 'conversation' : 'conversations'}
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

      <FlatList
        data={filteredChats}
        renderItem={renderChat}
        keyExtractor={(item, idx) => item.id?.toString() || `chat-${idx}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
          filteredChats.length > 0 ? (
            <View style={styles.footerNoteContainer}>
              <MaterialCommunityIcons name="sparkles" size={14} color="#A855F7" />
              <Text style={styles.footerNoteText}>All your conversations are secure</Text>
            </View>
          ) : null
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={BLUE}
            colors={[BLUE]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <LinearGradient
                colors={[BLUE_LIGHT, BLUE]}
                style={styles.emptyIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons
                  name="chat-outline"
                  size={60}
                  color={COLORS.white}
                />
              </LinearGradient>
            </View>
            <Text style={styles.emptyText}>No Messages Yet</Text>
            <Text style={styles.emptySubtext}>
              Start connecting with brands by applying to campaigns.{'\n'}
              Your conversations will appear here.
            </Text>
          </View>
        }
      />
    </View>
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
  chatCard: {
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
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#07080F',
  },
  loadingText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 12,
  },
});