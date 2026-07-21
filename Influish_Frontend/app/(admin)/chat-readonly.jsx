/**
 * ChatReadOnlyScreen
 * Read-only chat history view for dispute resolution
 * Shows brand-influencer conversation without message sending capability
 */

import React, { useState, useEffect } from 'react';
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
import { COLORS } from '../../constants/colors';
import { getChatHistory } from '../../services/disputeAdmin.service';

const ChatReadOnlyScreen = () => {
  const router = useRouter();
  const { disputeId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadChatHistory();
  }, [disputeId]);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const result = await getChatHistory(disputeId);
      
      if (result.success) {
        setMessages(result.data);
      } else {
        Alert.alert('Error', 'Failed to load chat history');
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
    const isBrand = message.senderType === 'brand';

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
            <Text style={styles.senderName}>{message.senderName}</Text>
          </View>
          <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
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
      <AdminLayout title="Chat History">
        <View style={styles.container}>
          {/* Read-Only Notice */}
          <View style={styles.noticeBar}>
            <MaterialCommunityIcons
              name="eye"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.noticeText}>
              Read-Only Mode - Admin View
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

          {/* Legend */}
          {!loading && messages.length > 0 && (
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.legendText}>Brand</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.legendText}>Influencer</Text>
              </View>
            </View>
          )}
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
  noticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary + '15',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '30',
  },
  noticeText: {
    fontSize: 14,
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
    color: COLORS.gray,
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
  },
  influencerMessage: {
    alignItems: 'flex-end',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  senderName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.gray,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  brandBubble: {
    backgroundColor: COLORS.primary + '15',
    borderBottomLeftRadius: 4,
  },
  influencerBubble: {
    backgroundColor: COLORS.success + '15',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  brandText: {
    color: COLORS.primaryDark,
  },
  influencerText: {
    color: COLORS.primaryDark,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
});

export default ChatReadOnlyScreen;
