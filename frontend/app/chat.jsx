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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(getApiUrl(API.CHATS.LIST), { headers });

      const data = await response.json();

      if (response.ok && data.success) {
        setChats(data.chats || []);
      } else {
        // If chat system not set up yet, just show empty state
        console.log('Chat system not ready:', data.message);
        setChats([]);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      // On error, show empty state instead of crashing
      setChats([]);
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
    const messagesLeft = item.max_messages - item.message_count;
    const isActive = item.is_active === 1;
    const displayName = item.brand_name || 'Brand';
    const displayImage = item.brand_image;

    return (
      <TouchableOpacity
        style={styles.chatCard}
        activeOpacity={0.7}
        onPress={() => {
          console.log('🔥 CHAT CLICKED! Opening chat ID:', item.id);
          try {
            router.push(`/conversation?chatId=${item.id}`);
            console.log('✅ router.push() executed');
          } catch (error) {
            console.error('❌ Navigation error:', error.message);
            console.error('❌ Error stack:', error.stack);
          }
        }}
      >
        <View style={styles.avatarContainer}>
          {displayImage ? (
            <Image
              source={{ uri: displayImage }}
              style={styles.avatar}
            />
          ) : (
            <LinearGradient
              colors={[BLUE, BLUE_DARK]}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>
                {displayName?.charAt(0)?.toUpperCase() || 'B'}
              </Text>
            </LinearGradient>
          )}
          {(item.unread_count || 0) > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unread_count > 9 ? '9+' : item.unread_count}
              </Text>
            </View>
          )}
          {isActive && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.timeText}>
              {new Date(item.updated_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          <Text style={styles.campaignName} numberOfLines={1}>
            📢 {item.campaign_name}
          </Text>

          {item.last_message && (
            <Text style={styles.lastMessage} numberOfLines={2}>
              {item.last_message}
            </Text>
          )}

          <View style={styles.footer}>
            <View style={styles.messageCounter}>
              <MaterialCommunityIcons
                name="message-text"
                size={16}
                color={messagesLeft <= 2 ? '#ef4444' : BLUE}
              />
              <Text
                style={[
                  styles.counterText,
                  messagesLeft <= 2 && styles.counterWarning,
                ]}
              >
                {item.message_count}/{item.max_messages} messages
              </Text>
            </View>

            {!isActive && (
              <View style={styles.lockedBadge}>
                <MaterialCommunityIcons name="lock" size={14} color={COLORS.white} />
                <Text style={styles.lockedText}>Locked</Text>
              </View>
            )}
          </View>
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={28}
          color={BLUE_LIGHT}
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <LinearGradient 
        colors={[BLUE, BLUE_DARK]} 
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.white} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient 
      colors={[BLUE, BLUE_DARK]} 
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{chats.length}</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          {chats.length === 0 
            ? 'No active conversations' 
            : `${chats.length} ${chats.length === 1 ? 'conversation' : 'active conversations'}`
          }
        </Text>
      </View>

      <View style={styles.content}>
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push('/(tabs)/campaigns')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[BLUE, BLUE_DARK]}
                  style={styles.exploreGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.exploreButtonText}>Explore Campaigns</Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={20}
                    color={COLORS.white}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 36,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  headerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.95)',
    marginTop: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#0B0B10',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    marginTop: 16,
  },
  listContent: {
    padding: 20,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14141C',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.textGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarText: {
    fontSize: 26,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  unreadBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 7,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  unreadText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  timeText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.45)',
  },
  campaignName: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: BLUE,
    marginBottom: 6,
  },
  lastMessage: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 10,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messageCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  counterText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: BLUE,
  },
  counterWarning: {
    color: '#ef4444',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  lockedText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.white,
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
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
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
  exploreButton: {
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  exploreGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 36,
    gap: 10,
  },
  exploreButtonText: {
    fontSize: 17,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    letterSpacing: 0.2,
  },
});