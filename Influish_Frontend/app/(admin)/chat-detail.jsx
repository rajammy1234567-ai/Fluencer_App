import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminLayout from '../../components/admin/AdminLayout'; // Assuming this component exists as used in chat-readonly
import { COLORS } from '../../constants/colors';
import { getAdminAuthHeader } from '../../utils/adminStorage';
import { getApiUrl } from '../../constants/api';

const ChatDetailScreen = () => {
  const router = useRouter();
  const { chatId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);

  useEffect(() => {
    if (chatId) {
      loadChatHistory();
    }
  }, [chatId]);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const headers = await getAdminAuthHeader();
      // Use the generic chat messages endpoint
      const response = await fetch(getApiUrl(`/api/chats/${chatId}/messages`), {
        headers,
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessages(data.messages);
        setChatInfo(data.chat);
      } else {
        Alert.alert('Error', data.message || 'Failed to load chat history');
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      Alert.alert('Error', 'Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = (message) => {
    // Determine sender type based on role stored in message or infer from chat info
    // The generic API returns `sender_role` in message object
    const isBrand = message.sender_role === 'brand';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isBrand ? styles.brandMessage : styles.influencerMessage,
        ]}
      >
        <View style={styles.messageHeader}>
          <View style={styles.senderInfo}>
            <MaterialCommunityIcons
              name={isBrand ? 'office-building' : 'account-star'}
              size={16}
              color={isBrand ? COLORS.primary : COLORS.success}
            />
            <Text style={styles.senderName}>{message.sender_name}</Text>
          </View>
          <Text style={styles.timestamp}>{formatTime(message.created_at)}</Text>
        </View>

        <View
          style={[
            styles.messageBubble,
            isBrand ? styles.brandBubble : styles.influencerBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isBrand ? styles.brandText : styles.influencerText,
            ]}
          >
            {message.message}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AdminLayout title="Conversation Details">
        <View style={styles.container}>
          {/* Header Info */}
          {!loading && chatInfo && (
            <View style={styles.chatHeader}>
                <View style={styles.campaignInfo}>
                    <Text style={styles.campaignLabel}>Campaign:</Text>
                    <Text style={styles.campaignValue}>{chatInfo.campaign_name}</Text>
                </View>
            </View>
          )}

          {/* Read-Only Notice */}
          <View style={styles.noticeBar}>
            <MaterialCommunityIcons
              name="eye"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.noticeText}>
              Monitoring Mode - Read Only
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="message-off"
                size={64}
                color={COLORS.gray}
              />
              <Text style={styles.emptyText}>No chat history available</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.messagesContent}
            >
              {messages.map(renderMessage)}
              <View style={{ height: 20 }} />
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
    backgroundColor: COLORS.background, // Assuming generic background
  },
  container: {
    flex: 1,
  },
  chatHeader: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  campaignInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campaignLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginRight: 8,
  },
  campaignValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  noticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  noticeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 16,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  brandMessage: {
    alignItems: 'flex-start',
    marginRight: 40,
  },
  influencerMessage: {
    alignItems: 'flex-end',
    marginLeft: 40,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  brandBubble: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  influencerBubble: {
    backgroundColor: '#EFF6FF',
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  brandText: {
    color: COLORS.textDark,
  },
  influencerText: {
    color: '#1E40AF',
  },
});

export default ChatDetailScreen;
