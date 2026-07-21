import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { getAuthHeader, getUserId } from '../utils/storage';
import { API, getApiUrl } from '../constants/api';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLUE = '#3b82f6';
const BLUE_DARK = '#2563eb';
const BLUE_LIGHT = '#60a5fa';

export default function ConversationScreen() {
  const { chatId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  console.log('🚀 ConversationScreen component loaded! chatId:', chatId);
  
  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const flatListRef = useRef(null);

  // APK SAFETY: Proper async cleanup to prevent memory leaks in Hermes engine
  useEffect(() => {
    let isMounted = true;

    const loadUserId = async () => {
      try {
        const userId = await getUserId();
        if (isMounted) {
          setCurrentUserId(userId);
        }
      } catch (error) {
        console.error('Error loading userId:', error);
      }
    };

    loadUserId();

    return () => {
      isMounted = false;
    };
  }, []);

  // APK SAFETY: Validate chatId and add proper cleanup with isMounted flag
  useEffect(() => {
    let isMounted = true;
    let interval = null;

    // APK SAFETY: Validate chatId exists and is not undefined before proceeding
    if (!chatId || chatId === 'undefined') {
      console.log('⚠️ Invalid or missing chatId, blocking fetch');
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      // APK SAFETY: Add timeout to prevent hanging on poor network
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        // APK SAFETY: Validate token before API call
        const headers = await getAuthHeader();
        if (!headers || !headers.Authorization) {
          console.warn('No auth token, cannot fetch messages');
          if (isMounted) setLoading(false);
          return;
        }

        const response = await fetch(
          getApiUrl(`/api/chats/${chatId}/messages`),
          { 
            headers,
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        // APK SAFETY: Handle 401 unauthorized
        if (response.status === 401) {
          console.warn('Unauthorized, redirecting to login');
          if (isMounted) {
            setTimeout(() => router.replace('/role-selection'), 100);
          }
          return;
        }

        const data = await response.json();

        if (isMounted && response.ok && data.success) {
          // APK SAFETY: Validate arrays before setting state
          setMessages(Array.isArray(data.messages) ? data.messages : []);
          setChatInfo(data.chat || null);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Message fetch timed out');
        } else {
          console.error('Error fetching messages:', error);
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) setLoading(false);
      }
    };

    console.log('💬 Conversation screen opened with chatId:', chatId);
    fetchMessages();
    
    // Poll for new messages every 5 seconds
    interval = setInterval(() => {
      if (isMounted) fetchMessages();
    }, 5000);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [chatId]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    // Check for phone numbers (10 digits, +91, or written in words)
    // Matches:
    // 1. 10 digits (\b\d{10}\b)
    // 2. +91
    // 3. Number words sequence (at least 3 consecutive number words to avoid false positives on normal sentences)
    const numberWords = 'one|two|three|four|five|six|seven|eight|nine|zero';
    const numberWordRegex = new RegExp(`\\b(${numberWords})\\s+(${numberWords})\\s+(${numberWords})`, 'i');
    
    const phoneRegex = /\b\d{10}\b|\+91/g;
    
    if (phoneRegex.test(newMessage) || numberWordRegex.test(newMessage)) {
      Alert.alert(
        'Action Restricted',
        'Sharing phone numbers or contact details is not allowed on this platform.'
      );
      return;
    }

    setSending(true);

    try {
      const headers = await getAuthHeader();
      const response = await fetch(
        getApiUrl(`/api/chats/${chatId}/messages`),
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: newMessage.trim(),
            message_type: 'text',
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setNewMessage('');
        fetchMessages();
        Keyboard.dismiss();
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Error', data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    // Check if message is from current user
    const isMe = item.sender_id === currentUserId;
    
    // Check if message contains phone number (10 digits)
    const phoneRegex = /\b\d{10}\b/g;
    const hasPhoneNumber = phoneRegex.test(item.message);

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        {!isMe && (
          <View style={styles.senderHeader}>
            <LinearGradient
              colors={[BLUE_LIGHT, BLUE]}
              style={styles.avatarSmall}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>
                {(item.sender_name || 'U').charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <Text style={styles.senderName}>{item.sender_name || 'User'}</Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myBubble : styles.theirBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.message}
          </Text>
          {hasPhoneNumber && (
            <View style={styles.phoneTag}>
              <MaterialCommunityIcons 
                name="phone" 
                size={14} 
                color={isMe ? COLORS.white : BLUE} 
              />
              <Text style={[styles.phoneTagText, isMe && { color: COLORS.white }]}>
                Contact Info
              </Text>
            </View>
          )}
          <Text
            style={[
              styles.timeText,
              isMe ? styles.myTimeText : styles.theirTimeText,
            ]}
          >
            {new Date(item.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  const messagesRemaining = chatInfo
    ? chatInfo.max_messages - chatInfo.message_count
    : 0;

  console.log('📊 Conversation state:', { loading, chatId, messagesCount: messages.length, chatInfo: !!chatInfo });

  const THEME = {
    primary: '#3b82f6',
    primaryDark: '#2563EB',
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient 
          colors={[BLUE, BLUE_DARK]} 
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Loading...</Text>
            </View>
            <View style={styles.headerIconContainer}>
              <MaterialCommunityIcons name="chat" size={40} color="rgba(255,255,255,0.2)" />
            </View>
          </View>
        </LinearGradient>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient 
        colors={[BLUE, BLUE_DARK]} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {chatInfo?.other_user_name || 'Chat'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {chatInfo?.campaign_name || 'Campaign'}
            </Text>
          </View>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons name="chat" size={40} color="rgba(255,255,255,0.2)" />
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
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
                    name="message-text-outline"
                    size={50}
                    color={COLORS.white}
                  />
                </LinearGradient>
              </View>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
                Start the conversation by sending a message below
              </Text>
            </View>
          }
        />

        {/* Input Box */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 10 }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor="#94a3b8"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
              editable={!sending}
            />
            {messagesRemaining <= 3 && (
              <View style={styles.warningBadge}>
                <MaterialCommunityIcons 
                  name="alert" 
                  size={12} 
                  color={messagesRemaining === 0 ? '#ef4444' : '#f59e0b'} 
                />
                <Text style={[
                  styles.warningText,
                  messagesRemaining === 0 && { color: '#ef4444' }
                ]}>
                  {messagesRemaining} left
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newMessage.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            <LinearGradient
              colors={
                !newMessage.trim() || sending
                  ? ['#cbd5e1', '#94a3b8']
                  : [BLUE, BLUE_DARK]
              }
              style={styles.sendGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {sending ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <MaterialCommunityIcons name="send" size={22} color={COLORS.white} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: '#64748b',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 10,
    zIndex: 10,
    padding: 8,
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.95)',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  messageCountText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  infoButton: {
    padding: 8,
  },
  messagesList: {
    padding: 20,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 4,
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  senderName: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: '#64748b',
  },
  messageBubble: {
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  myBubble: {
    backgroundColor: BLUE,
    borderBottomRightRadius: 6,
  },
  theirBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  myMessageText: {
    color: COLORS.white,
  },
  theirMessageText: {
    color: '#1e293b',
  },
  timeText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    marginTop: 6,
  },
  myTimeText: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  theirTimeText: {
    color: '#94a3b8',
  },
  phoneTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
    gap: 6,
  },
  phoneTagText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: BLUE,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyText: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: '#1e293b',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONTS.regular,
    maxHeight: 110,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  warningBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  warningText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: '#f59e0b',
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
  },
  sendGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});