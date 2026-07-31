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
  Modal,
  Linking,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { getAuthHeader, getUserId, getRole } from '../utils/storage';
import { getApiUrl } from '../constants/api';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLUE = '#7C3AED';
const BLUE_DARK = '#6D28FF';
const BLUE_LIGHT = '#60a5fa';

export default function ConversationScreen() {
  const { chatId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  
  // Reel Proof Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [reelUrlInput, setReelUrlInput] = useState('');
  const [reelNotesInput, setReelNotesInput] = useState('');
  const [submittingWork, setSubmittingWork] = useState(false);

  // Image Attachment & Lightbox State
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  // Restriction Alert Modal State
  const [restrictionModalVisible, setRestrictionModalVisible] = useState(false);
  const [restrictionModalMsg, setRestrictionModalMsg] = useState('');

  const flatListRef = useRef(null);
  const isMountedRef = useRef(true);

  // Pick image from device library (Cross-platform Web & Native)
  const handlePickImage = async () => {
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64Data = event.target.result;
              setSelectedImage({
                uri: base64Data,
                fileName: file.name,
                mimeType: file.type || 'image/jpeg',
                file: file,
                base64: base64Data.includes(',') ? base64Data.split(',')[1] : base64Data,
              });
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow gallery permissions to send photos in chat.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Could not select photo');
    }
  };

  // Load User Info
  useEffect(() => {
    isMountedRef.current = true;

    const loadUserData = async () => {
      try {
        const userId = await getUserId();
        const role = await getRole();
        if (isMountedRef.current) {
          setCurrentUserId(userId);
          setCurrentUserRole(role);
        }
      } catch (error) {
        console.error('Error loading userData:', error);
      }
    };

    loadUserData();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Top-Level Fetch Messages Function (Scope-Safe)
  const fetchMessages = async () => {
    if (!chatId || chatId === 'undefined') {
      if (isMountedRef.current) setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const headers = await getAuthHeader();
      if (!headers || !headers.Authorization) {
        if (isMountedRef.current) setLoading(false);
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

      if (response.status === 401) {
        if (isMountedRef.current) {
          router.replace('/role-selection');
        }
        return;
      }

      const data = await response.json();

      if (isMountedRef.current && response.ok && data.success) {
        setMessages(Array.isArray(data.messages) ? data.messages : []);
        setChatInfo(data.chat || null);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching messages:', error);
      }
    } finally {
      clearTimeout(timeoutId);
      if (isMountedRef.current) setLoading(false);
    }
  };

  // Poll for Messages
  useEffect(() => {
    let interval = null;

    const timer = setTimeout(() => {
      if (isMountedRef.current) fetchMessages();
    }, 0);

    interval = setInterval(() => {
      if (isMountedRef.current) fetchMessages();
    }, 4000);

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [chatId]);

  // Send Message (Text or Photo)
  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedImage) || sending) return;

    if (newMessage.trim()) {
      const strippedText = String(newMessage).replace(/[\s\-\.\(\)\+\/]/g, '');
      const containsPhone = /\d{10}/.test(strippedText) || /(?:91)?[6-9]\d{9}/.test(strippedText) || /(?:zero|one|two|three|four|five|six|seven|eight|nine)[\s\-\.\,]*(?:zero|one|two|three|four|five|six|seven|eight|nine)[\s\-\.\,]*(?:zero|one|two|three|four|five|six|seven|eight|nine)/i.test(newMessage);

      if (containsPhone) {
        setRestrictionModalMsg('Sharing phone numbers or personal contact details is strictly prohibited in chat for user security. Please communicate directly within the Fluencer platform!');
        setRestrictionModalVisible(true);
        return;
      }
    }

    setSending(true);

    try {
      const headers = await getAuthHeader();

      // CASE 1: SENDING ATTACHED PHOTO
      if (selectedImage) {
        let uploadSuccess = false;

        try {
          const formData = new FormData();
          if (Platform.OS === 'web') {
            const res = await fetch(selectedImage.uri);
            const blob = await res.blob();
            formData.append('chat_file', blob, selectedImage.fileName || 'photo.jpg');
          } else {
            formData.append('chat_file', {
              uri: selectedImage.uri,
              name: selectedImage.fileName || `photo_${Date.now()}.jpg`,
              type: selectedImage.mimeType || 'image/jpeg',
            });
          }

          const uploadHeaders = { ...headers };
          delete uploadHeaders['Content-Type'];

          const response = await fetch(getApiUrl(`/api/chats/${chatId}/upload-image`), {
            method: 'POST',
            headers: uploadHeaders,
            body: formData,
          });

          const data = await response.json();
          if (response.ok && data.success) {
            uploadSuccess = true;
          }
        } catch (e) {
          console.warn('FormData upload failed, trying base64 fallback:', e);
        }

        // Base64 Fallback
        if (!uploadSuccess && selectedImage.base64) {
          const base64Str = `data:${selectedImage.mimeType || 'image/jpeg'};base64,${selectedImage.base64}`;
          const response = await fetch(getApiUrl(`/api/chats/${chatId}/upload-image`), {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image_base64: base64Str,
            }),
          });

          const data = await response.json();
          if (response.ok && data.success) {
            uploadSuccess = true;
          } else {
            Alert.alert('Error', data.message || 'Failed to send photo');
          }
        }

        if (uploadSuccess) {
          setSelectedImage(null);
          // If text caption was also entered
          if (newMessage.trim()) {
            await fetch(getApiUrl(`/api/chats/${chatId}/messages`), {
              method: 'POST',
              headers: {
                ...headers,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: newMessage.trim(),
                message_type: 'text',
              }),
            });
            setNewMessage('');
          }
          fetchMessages();
          Keyboard.dismiss();
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } else {
        // CASE 2: NORMAL TEXT MESSAGE
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
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Submit Work Reel Proof Handler
  const handleWorkSubmission = async () => {
    if (!reelUrlInput.trim()) {
      Alert.alert('Missing URL', 'Please enter your Instagram Reel URL.');
      return;
    }

    let formattedUrl = reelUrlInput.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setSubmittingWork(true);
    try {
      const headers = await getAuthHeader();
      headers['Content-Type'] = 'application/json';

      const res = await fetch(getApiUrl(`/api/chats/${chatId}/submit-work`), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          submission_url: formattedUrl,
          submission_notes: reelNotesInput.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowSubmitModal(false);
        setReelUrlInput('');
        setReelNotesInput('');
        Alert.alert('🎬 Success!', 'Your Reel proof has been submitted to the Brand for review!');
        fetchMessages();
      } else {
        Alert.alert('Submission Error', data.message || data.error || 'Failed to submit work proof');
      }
    } catch (err) {
      console.error('Submit work error:', err);
      Alert.alert('Error', 'Failed to submit work proof');
    } finally {
      setSubmittingWork(false);
    }
  };

  // Render Message Item with Reel Links & Click Support
  const renderMessage = ({ item }) => {
    const isMe = String(item.sender_id) === String(currentUserId);
    const isSystem = item.message_type === 'system' || item.message.startsWith('🔒') || item.message.startsWith('🎬') || item.message.startsWith('✅') || item.message.startsWith('💳');
    
    // Detect URLs in message
    const urlMatch = item.message.match(/https?:\/\/[^\s]+/g);
    const foundUrl = urlMatch ? urlMatch[0] : null;

    if (isSystem) {
      const cleanText = item.message.replace(/🔒|🎬|✅|💳/g, '').trim();
      return (
        <View style={styles.cleanSystemContainer}>
          <View style={styles.cleanSystemCard}>
            <MaterialCommunityIcons name="shield-check-outline" size={15} color="#0284C7" />
            <Text style={styles.cleanSystemText}>{cleanText}</Text>
          </View>
          {foundUrl && (
            <TouchableOpacity
              style={styles.openUrlButtonInline}
              onPress={() => Linking.openURL(foundUrl)}
            >
              <MaterialCommunityIcons name="open-in-new" size={14} color="#6D28FF" />
              <Text style={styles.openUrlButtonTextInline}>Watch Submitted Reel 🎬</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    const isImageMsg = item.message_type === 'image' || (
      item.message && (
        item.message.startsWith('data:image') ||
        item.message.startsWith('/uploads/') ||
        ((item.message.startsWith('http://') || item.message.startsWith('https://')) &&
         (item.message.includes('cloudinary') || item.message.includes('uploads') || item.message.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)))
      )
    );

    let imageUrl = item.message;
    if (isImageMsg && imageUrl.startsWith('/uploads/')) {
      imageUrl = getApiUrl(imageUrl);
    }

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
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
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble, isImageMsg && { padding: 4, overflow: 'hidden' }]}>
          {isImageMsg ? (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => setFullScreenImage(imageUrl)}
              style={styles.chatImageWrapper}
            >
              <Image
                source={{ uri: imageUrl }}
                style={styles.chatImageContent}
                resizeMode="cover"
              />
              <View style={styles.imageOverlayBadge}>
                <MaterialCommunityIcons name="magnify-plus-outline" size={14} color="#FFF" />
                <Text style={styles.imageOverlayText}>View Photo</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                {item.message}
              </Text>
              {foundUrl && (
                <TouchableOpacity
                  style={[styles.linkBadge, isMe ? { backgroundColor: 'rgba(255,255,255,0.2)' } : { backgroundColor: 'rgba(168, 85, 247, 0.16)' }]}
                  onPress={() => Linking.openURL(foundUrl)}
                >
                  <MaterialCommunityIcons name="link-variant" size={16} color={isMe ? '#FFF' : BLUE} />
                  <Text style={[styles.linkBadgeText, isMe && { color: '#FFF' }]}>Open Link: {foundUrl}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
          <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText, isImageMsg && { paddingHorizontal: 6, paddingBottom: 2, paddingTop: 4 }]}>
            {new Date(item.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
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
          </View>
        </LinearGradient>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </View>
    );
  }

  const handleBackNav = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      const isBrand = (chatInfo?.is_brand_owner || currentUserRole === 'brand');
      router.replace(isBrand ? '/(brand-tabs)/home' : '/(tabs)/home');
    }
  };

  const isBrandOwnerView = chatInfo ? chatInfo.is_brand_owner : (currentUserRole === 'brand');

  const handleLockDeal = async () => {
    const amount = chatInfo?.deal_amount || chatInfo?.cost_per_influencer || 5000;
    const runLock = async () => {
      try {
        const headers = await getAuthHeader();
        const res = await fetch(getApiUrl(`/api/chats/${chatId}/lock-deal`), { method: 'POST', headers });
        const data = await res.json();
        if (!data.success && (data.message?.toLowerCase().includes('insufficient') || res.status === 400)) {
          if (Platform.OS === 'web') {
            if (window.confirm(`⚠️ Insufficient Wallet Balance!\n\nRequired: ₹${amount.toLocaleString('en-IN')}.\nWould you like to Top Up your Brand Wallet now?`)) {
              router.push('/wallet');
            }
          } else {
            Alert.alert(
              '⚠️ Insufficient Balance',
              `Required: ₹${amount.toLocaleString('en-IN')}.\nWould you like to Top Up your Brand Wallet now?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: '💳 Top Up Wallet', onPress: () => router.push('/wallet') }
              ]
            );
          }
          return;
        }

        if (Platform.OS === 'web') {
          window.alert(data.success ? `🔒 Success: Deal locked and ₹${data.dealAmount || amount} deposited into Escrow!` : 'Error: ' + (data.message || data.error));
        } else {
          Alert.alert(data.success ? 'Success' : 'Error', data.message || data.error);
        }
        fetchMessages();
      } catch (err) {
        console.error('Lock deal error:', err);
        if (Platform.OS === 'web') window.alert('Error: Failed to lock deal');
        else Alert.alert('Error', 'Failed to lock deal');
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Lock deal with this creator and deposit ₹${amount} into Escrow?`)) {
        await runLock();
      }
    } else {
      Alert.alert('🔒 Lock Deal & Deposit Escrow', `Lock deal with this creator and deposit ₹${amount} into Escrow?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Lock Deal', onPress: runLock }
      ]);
    }
  };

  const handleApproveWork = async () => {
    const runApprove = async () => {
      try {
        const headers = await getAuthHeader();
        const res = await fetch(getApiUrl(`/api/chats/${chatId}/approve-work`), { method: 'POST', headers });
        const data = await res.json();
        if (Platform.OS === 'web') {
          window.alert(data.success ? '✅ Success: Creator work deliverable approved successfully!' : 'Error: ' + (data.message || data.error));
        } else {
          Alert.alert(data.success ? 'Success' : 'Error', data.message || data.error);
        }
        fetchMessages();
      } catch (err) {
        console.error('Approve work error:', err);
        if (Platform.OS === 'web') window.alert('Error: Failed to approve work');
        else Alert.alert('Error', 'Failed to approve work');
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Confirm creator work quality and approve for admin escrow payout?')) {
        await runApprove();
      }
    } else {
      Alert.alert('✅ Confirm & Approve Work', 'Confirm creator work quality and approve for admin escrow payout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve Work', onPress: runApprove }
      ]);
    }
  };

  const dedupedMessages = messages.filter((msg, index, self) => {
    const isSys = msg.message_type === 'system' || msg.message.startsWith('🔒') || msg.message.startsWith('🎬') || msg.message.startsWith('✅') || msg.message.startsWith('💳');
    if (isSys) {
      const firstIdx = self.findIndex(m => m.message === msg.message);
      return index === firstIdx;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient 
        colors={[BLUE, BLUE_DARK]} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={handleBackNav} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
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
            <MaterialCommunityIcons name="chat" size={32} color="rgba(255,255,255,0.25)" />
          </View>
        </View>
      </LinearGradient>

      {/* PROMINENT SUBMITTED REEL BANNER FOR BRAND REVIEW ONLY */}
      {isBrandOwnerView && chatInfo?.submission_url && (
        <TouchableOpacity
          style={{ backgroundColor: '#6D28FF', paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          onPress={() => Linking.openURL(chatInfo.submission_url)}
        >
          <MaterialCommunityIcons name="play-circle-outline" size={20} color="#FFF" />
          <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13 }}>
            🎬 Creator Reel Submitted! Tap to Watch & Review Video
          </Text>
          <MaterialCommunityIcons name="open-in-new" size={16} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* IN-CHAT ACTION BAR */}
      {isBrandOwnerView ? (
        // BRAND OWNER VIEW ONLY
        <View style={styles.actionBarContainer}>
          {(chatInfo?.deliverable_status === 'approved' || chatInfo?.deliverable_status === 'brand_approved' || chatInfo?.deliverable_status === 'payout_released') ? (
            <View style={[styles.actionBtn, { backgroundColor: '#15803D', flex: 1 }]}>
              <MaterialCommunityIcons name="check-decagram" size={18} color="#FFF" />
              <Text style={styles.actionBtnText}>✅ Work Approved · Escrow Payout Ready for Admin Release</Text>
            </View>
          ) : chatInfo?.deal_locked ? (
            <>
              {chatInfo?.submission_url || chatInfo?.deliverable_status === 'submitted' ? (
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: '#16A34A', flex: 1 }]}
                  onPress={handleApproveWork}
                >
                  <MaterialCommunityIcons name="check-circle" size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>✅ Review & Approve Work</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.actionBtn, { backgroundColor: '#0284C7', flex: 1 }]}>
                  <MaterialCommunityIcons name="shield-check" size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>🔒 Escrow Paid & Locked · Waiting for Creator Reel Proof</Text>
                </View>
              )}
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#0284C7', flex: 1 }]}
              onPress={handleLockDeal}
            >
              <MaterialCommunityIcons name="lock-check" size={18} color="#FFF" />
              <Text style={styles.actionBtnText}>🔒 Lock Deal & Pay Escrow (₹{(chatInfo?.deal_amount || chatInfo?.cost_per_influencer || 5000).toLocaleString('en-IN')})</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        // INFLUENCER / CREATOR VIEW ONLY
        <View style={styles.actionBarContainer}>
          {(chatInfo?.deliverable_status === 'approved' || chatInfo?.deliverable_status === 'brand_approved' || chatInfo?.deliverable_status === 'payout_released') ? (
            <View style={[styles.actionBtn, { backgroundColor: '#15803D', flex: 1 }]}>
              <MaterialCommunityIcons name="check-decagram" size={18} color="#FFF" />
              <Text style={styles.actionBtnText}>✅ Work Approved by Brand · Escrow Payout Ready</Text>
            </View>
          ) : (chatInfo?.deliverable_status === 'submitted' || chatInfo?.submission_url) ? (
            <View style={[styles.actionBtn, { backgroundColor: '#6D28FF', flex: 1 }]}>
              <MaterialCommunityIcons name="check-all" size={18} color="#FFF" />
              <Text style={styles.actionBtnText}>⏳ Reel Submitted · Awaiting Brand Review</Text>
            </View>
          ) : (chatInfo?.status === 'accepted' || chatInfo?.status === 'locked' || chatInfo?.status === 'escrow_locked' || chatInfo?.deal_locked) ? (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#16A34A', flex: 1 }]}
              onPress={() => setShowSubmitModal(true)}
            >
              <MaterialCommunityIcons name="video-check" size={20} color="#FFF" />
              <Text style={styles.actionBtnText}>🎬 Submit Reel Proof</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.actionBtn, { backgroundColor: '#334155', flex: 1, opacity: 0.85 }]}>
              <MaterialCommunityIcons name="lock-clock" size={18} color="rgba(255,255,255,0.16)" />
              <Text style={[styles.actionBtnText, { color: 'rgba(255,255,255,0.16)' }]}>
                🔒 Waiting for Brand to Lock Deal & Deposit Escrow (₹{chatInfo?.cost_per_influencer || 5000})
              </Text>
            </View>
          )}
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={dedupedMessages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item.id?.toString() || `msg-${index}`}
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

        {/* ATTACHED PHOTO PREVIEW BANNER */}
        {selectedImage && (
          <View style={styles.imagePreviewBanner}>
            <Image source={{ uri: selectedImage.uri }} style={styles.imagePreviewThumb} />
            <View style={styles.imagePreviewDetails}>
              <Text style={styles.imagePreviewTitle}>Photo Attached 📷</Text>
              <Text style={styles.imagePreviewSub}>Tap send button to post image</Text>
            </View>
            <TouchableOpacity style={styles.imagePreviewRemoveBtn} onPress={() => setSelectedImage(null)}>
              <MaterialCommunityIcons name="close-circle" size={22} color="#F87171" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Box */}
        {(() => {
          const isCompletedDeal = chatInfo?.status === 'completed' || chatInfo?.deliverable_status === 'approved' || chatInfo?.deliverable_status === 'brand_approved';
          const canSend = (newMessage.trim() || selectedImage) && !sending && !isCompletedDeal;
          return (
            <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 10 }, isCompletedDeal && { backgroundColor: '#14141C', borderTopColor: 'rgba(255,255,255,0.12)' }]}>
              <View style={[styles.inputCapsule, isCompletedDeal && { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.16)' }]}>
                {!isCompletedDeal && (
                  <TouchableOpacity
                    style={styles.attachInsideBtn}
                    onPress={handlePickImage}
                    disabled={sending}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={selectedImage ? "image-check" : "camera"}
                      size={22}
                      color={selectedImage ? '#C084FC' : 'rgba(255,255,255,0.7)'}
                    />
                  </TouchableOpacity>
                )}

                <TextInput
                  style={[styles.inputInside, isCompletedDeal && { color: '#475569', fontWeight: '600' }]}
                  placeholder={isCompletedDeal ? "🔒 Deal completed & approved! Chat is closed." : selectedImage ? "Add an optional message..." : "Type your message or deal offer..."}
                  placeholderTextColor={isCompletedDeal ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.45)"}
                  value={isCompletedDeal ? "🔒 Deal Completed · Work Approved (Chat Closed)" : newMessage}
                  onChangeText={setNewMessage}
                  multiline={!isCompletedDeal}
                  editable={!isCompletedDeal && !sending}
                  maxLength={1000}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !canSend && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!canSend}
              >
                <LinearGradient
                  colors={
                    !canSend
                      ? ['#cbd5e1', 'rgba(255,255,255,0.45)']
                      : [BLUE, BLUE_DARK]
                  }
                  style={styles.sendGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <MaterialCommunityIcons name={isCompletedDeal ? "lock" : "send"} size={20} color={COLORS.white} />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          );
        })()}
      </KeyboardAvoidingView>

      {/* REEL SUBMISSION MODAL DIALOG (CROSS PLATFORM WEB & NATIVE) */}
      <Modal visible={showSubmitModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="movie-play-outline" size={28} color={BLUE} />
              <Text style={styles.modalTitle}>Submit Deliverable Reel</Text>
            </View>

            <Text style={styles.modalSub}>
              Enter the published Instagram Reel link for brand review and payout release:
            </Text>

            <Text style={styles.inputLabel}>Instagram Reel URL *</Text>
            <TextInput
              style={styles.modalInput}
              value={reelUrlInput}
              onChangeText={setReelUrlInput}
              placeholder="e.g. https://instagram.com/p/C_sample_reel"
              placeholderTextColor="rgba(255,255,255,0.45)"
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Special Notes (Optional)</Text>
            <TextInput
              style={[styles.modalInput, { height: 70 }]}
              value={reelNotesInput}
              onChangeText={setReelNotesInput}
              placeholder="e.g. Tagged @brand, used hashtag #SummerVibes"
              placeholderTextColor="rgba(255,255,255,0.45)"
              multiline
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowSubmitModal(false)}
                disabled={submittingWork}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitModalBtn}
                onPress={handleWorkSubmission}
                disabled={submittingWork}
              >
                {submittingWork ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#FFF" />
                    <Text style={styles.submitModalBtnText}>Submit Reel</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FULL SCREEN PHOTO LIGHTBOX MODAL */}
      <Modal
        visible={!!fullScreenImage}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <View style={styles.lightboxOverlay}>
          <TouchableOpacity
            style={styles.lightboxCloseBtn}
            onPress={() => setFullScreenImage(null)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          {fullScreenImage && (
            <Image
              source={{ uri: fullScreenImage }}
              style={styles.lightboxImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* CUSTOM GLASSMORPHIC RESTRICTION ALERT MODAL */}
      <Modal
        visible={restrictionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRestrictionModalVisible(false)}
      >
        <View style={styles.alertModalOverlay}>
          <View style={styles.alertModalContainer}>
            <LinearGradient
              colors={['#1E1B2E', '#12101F']}
              style={styles.alertModalGradient}
            >
              <View style={styles.alertIconBadge}>
                <MaterialCommunityIcons name="shield-alert" size={32} color="#EF4444" />
              </View>
              <Text style={styles.alertModalTitle}>Action Restricted 🚫</Text>
              <Text style={styles.alertModalBody}>
                {restrictionModalMsg}
              </Text>
              <TouchableOpacity
                style={styles.alertModalButton}
                onPress={() => setRestrictionModalVisible(false)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={styles.alertModalButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.alertModalButtonText}>I Understand</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B10' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, fontFamily: FONTS.regular, color: 'rgba(255,255,255,0.55)', marginTop: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 16,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.white, letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 13, fontFamily: FONTS.regular, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  headerIconContainer: { padding: 4 },
  actionBarContainer: {
    backgroundColor: '#14141C',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'space-between',
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  actionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  messagesList: { padding: 16, flexGrow: 1 },
  messageContainer: { marginBottom: 14, maxWidth: '82%' },
  myMessage: { alignSelf: 'flex-end' },
  theirMessage: { alignSelf: 'flex-start' },
  senderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, marginLeft: 4 },
  avatarSmall: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  avatarText: { fontSize: 12, fontFamily: FONTS.bold, color: COLORS.white },
  senderName: { fontSize: 12, fontFamily: FONTS.bold, color: 'rgba(255,255,255,0.55)' },
  messageBubble: { borderRadius: 18, padding: 12 },
  myBubble: { backgroundColor: BLUE, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#14141C', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  messageText: { fontSize: 15, fontFamily: FONTS.regular, lineHeight: 21 },
  myMessageText: { color: COLORS.white },
  theirMessageText: { color: '#FFFFFF' },
  timeText: { fontSize: 10, fontFamily: FONTS.regular, marginTop: 4 },
  myTimeText: { color: 'rgba(255,255,255,0.85)', textAlign: 'right' },
  theirTimeText: { color: 'rgba(255,255,255,0.45)' },
  cleanSystemContainer: { marginVertical: 10, alignItems: 'center' },
  cleanSystemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderHeight: 1, borderColor: 'rgba(255,255,255,0.16)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cleanSystemText: { color: '#334155', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  openUrlButtonInline: { marginTop: 6, backgroundColor: 'rgba(168, 85, 247, 0.16)', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  openUrlButtonTextInline: { color: '#6D28FF', fontWeight: '700', fontSize: 12 },
  linkBadge: { marginTop: 8, padding: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  linkBadgeText: { fontSize: 12, fontWeight: '600', color: BLUE },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32 },
  emptyIconContainer: { marginBottom: 20 },
  emptyIconGradient: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 20, fontFamily: FONTS.bold, color: '#FFFFFF', marginTop: 8 },
  emptySubtext: { fontSize: 14, fontFamily: FONTS.regular, color: 'rgba(255,255,255,0.55)', marginTop: 6, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#14141C', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', gap: 10 },
  inputCapsule: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 24, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  attachInsideBtn: { padding: 6, marginRight: 4, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  inputInside: { flex: 1, paddingVertical: 8, fontSize: 14.5, fontFamily: FONTS.regular, maxHeight: 100, color: '#FFFFFF' },
  warningBadge: { position: 'absolute', top: -8, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  warningText: { fontSize: 11, fontFamily: FONTS.bold, color: '#f59e0b' },
  sendButton: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  sendButtonDisabled: { opacity: 0.4 },
  sendGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  imagePreviewBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1B2E', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#3B296B', gap: 10 },
  imagePreviewThumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#000' },
  imagePreviewDetails: { flex: 1 },
  imagePreviewTitle: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  imagePreviewSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  imagePreviewRemoveBtn: { padding: 4 },
  chatImageWrapper: { width: 220, height: 180, borderRadius: 14, overflow: 'hidden', backgroundColor: '#000', position: 'relative' },
  chatImageContent: { width: '100%', height: '100%' },
  imageOverlayBadge: { position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 },
  imageOverlayText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
  lightboxOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  lightboxCloseBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  lightboxImage: { width: '92%', height: '80%' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFF', width: '100%', maxWidth: 450, borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  modalSub: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 18, lineHeight: 18 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 },
  modalInput: { backgroundColor: '#14141C', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#FFFFFF' },
  modalBtnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  cancelBtnText: { color: 'rgba(255,255,255,0.55)', fontWeight: '700', fontSize: 14 },
  submitModalBtn: { flex: 1.5, paddingVertical: 12, borderRadius: 10, backgroundColor: '#16A34A', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  submitModalBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  alertModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertModalContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  alertModalGradient: {
    padding: 24,
    alignItems: 'center',
  },
  alertIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  alertModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  alertModalBody: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  alertModalButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  alertModalButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  alertModalButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});