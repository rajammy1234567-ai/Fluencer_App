import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { router } from 'expo-router';
import BackButton from '../components/BackButton';
import { storage } from '../utils/storage';
import { API_CONFIG } from '../constants/api';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [campaignUpdates, setCampaignUpdates] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Privacy & UGC Safety State
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);
  const [safeContentFilter, setSafeContentFilter] = useState(true);

  const handleRequestVerification = () => {
    Alert.alert(
      'Request Verification Badge',
      'Submit your profile for official badge verification. Our safety & compliance team reviews active collaborations, community authenticity, and profile metrics within 24-48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit Request', onPress: () => Alert.alert('Request Received', 'Your verification request has been queued for moderation review.') },
      ]
    );
  };

  const openPrivacyModal = async () => {
    setPrivacyModalVisible(true);
    fetchBlockedUsers();
  };

  const fetchBlockedUsers = async () => {
    setLoadingBlocked(true);
    try {
      const headers = await storage.getAuthHeader?.() || {};
      const token = await storage.getToken?.();
      const authHeader = headers.Authorization || (token ? `Bearer ${token}` : '');
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/moderation/blocked-users`, {
        headers: { 'Authorization': authHeader }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBlockedUsers(data.blocked_users || []);
      }
    } catch (e) {
      console.warn('Blocked users fetch note:', e);
    } finally {
      setLoadingBlocked(false);
    }
  };

  const handleUnblockUserFromSettings = (userId, name) => {
    Alert.alert(
      'Unblock User',
      `Allow ${name || 'this user'} to message you and interact with your content?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              const headers = await storage.getAuthHeader?.() || {};
              const token = await storage.getToken?.();
              const authHeader = headers.Authorization || (token ? `Bearer ${token}` : '');
              const res = await fetch(`${API_CONFIG.BASE_URL}/api/moderation/unblock`, {
                method: 'POST',
                headers: {
                  'Authorization': authHeader,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ targetUserId: userId })
              });
              const json = await res.json();
              if (res.ok && json.success) {
                setBlockedUsers(prev => prev.filter(u => u.blocked_user_id !== userId));
                Alert.alert('User Unblocked', `${name || 'User'} has been unblocked.`);
              } else {
                Alert.alert('Error', json.message || 'Failed to unblock user');
              }
            } catch (err) {
              Alert.alert('Error', 'Network error while unblocking user');
            }
          }
        }
      ]
    );
  };

  const openPrivacyPolicy = async () => {
    const url = 'https://fluencer-app.onrender.com/privacy-policy';
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        await WebBrowser.openBrowserAsync(url);
      }
    } catch (e) {
      Linking.openURL(url).catch(() => {});
    }
  };

  const openTermsOfService = async () => {
    const url = 'https://fluencer-app.onrender.com/terms';
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        await WebBrowser.openBrowserAsync(url);
      }
    } catch (e) {
      Linking.openURL(url).catch(() => {});
    }
  };

  const openSupport = () => {
    Linking.openURL('mailto:support@fluencer.app?subject=Fluencer%20App%20Support%20Request').catch(() => {
      Alert.alert('Support', 'Please email us directly at support@fluencer.app');
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account and all associated profile data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const token = await storage.getToken();
              if (token && !token.startsWith('guest')) {
                const res = await fetch(`${API_CONFIG.BASE_URL}/api/auth/delete-account`, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  }
                });
                const json = await res.json().catch(() => ({}));
                if (!res.ok || !json.success) {
                  Alert.alert(
                    'Deletion Failed',
                    json.message || 'Unable to delete account at this time. Please contact support@fluencer.app'
                  );
                  return;
                }
              }
              await storage.clearAuth();
              Alert.alert('Account Deleted', 'Your account and personal data have been removed.', [
                {
                  text: 'OK',
                  onPress: () => router.replace('/role-selection')
                }
              ]);
            } catch (err) {
              console.error('Account deletion error:', err);
              Alert.alert(
                'Network Error',
                'Unable to reach server to complete account deletion. Please verify your internet connection and try again.'
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingItem = ({ icon, title, subtitle, onPress, hasArrow = true, rightComponent }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: COLORS.background }]}>
          <MaterialCommunityIcons name={icon} size={24} color={COLORS.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (hasArrow && (
        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textGray} />
      ))}
    </TouchableOpacity>
  );

  const SettingToggle = ({ icon, title, subtitle, value, onValueChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: COLORS.background }]}>
          <MaterialCommunityIcons name={icon} size={24} color={COLORS.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
        thumbColor={COLORS.white}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={COLORS?.gradientPrimary || [COLORS?.primary || '#052659', COLORS?.primaryDark || '#021024']} style={styles.header}>
        <View style={styles.headerContent}>
          <BackButton 
            color={COLORS.white} 
            backgroundColor="rgba(255,255,255,0.2)"
            style={{ paddingRight: 10 }}
          />
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <SettingSection title="Account">
          <View style={styles.card}>
            <SettingItem
              icon="account-circle"
              title="Request Verification"
              subtitle="Submit profile for verified badge evaluation"
              onPress={handleRequestVerification}
              hasArrow={true}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-account"
              title="Privacy & Security"
              subtitle="Manage blocked accounts & safety settings"
              onPress={openPrivacyModal}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="delete-forever"
              title="Delete Account"
              subtitle="Permanently delete your account"
              onPress={handleDeleteAccount}
            />
          </View>
        </SettingSection>

        {/* Notifications Section */}
        <SettingSection title="Notifications">
          <View style={styles.card}>
            <SettingToggle
              icon="bell"
              title="All Notifications"
              subtitle="Enable or disable all notifications"
              value={notifications}
              onValueChange={setNotifications}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="email"
              title="Email Notifications"
              subtitle="Receive updates via email"
              value={emailNotifs}
              onValueChange={setEmailNotifs}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="bell-ring"
              title="Push Notifications"
              subtitle="Get push notifications on your device"
              value={pushNotifs}
              onValueChange={setPushNotifs}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="clipboard-check"
              title="Campaign Updates"
              subtitle="Get notified about campaign status"
              value={campaignUpdates}
              onValueChange={setCampaignUpdates}
            />
          </View>
        </SettingSection>

        {/* Support Section */}
        <SettingSection title="Support & About">
          <View style={styles.card}>
            <SettingItem
              icon="help-circle"
              title="Help & Support"
              subtitle="Email us at support@fluencer.app"
              onPress={openSupport}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="file-document"
              title="Terms & Conditions (EULA)"
              subtitle="Read our community standards & safety rules"
              onPress={openTermsOfService}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-check"
              title="Privacy Policy"
              subtitle="View our official privacy policy"
              onPress={openPrivacyPolicy}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="information"
              title="About"
              subtitle="Version 1.0.0"
              hasArrow={false}
              rightComponent={
                <Text style={styles.versionText}>v1.0.0</Text>
              }
            />
          </View>
        </SettingSection>

        {/* Danger Zone */}
        <View style={styles.dangerCard}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleDeleteAccount}
          >
            <MaterialCommunityIcons name="delete-alert" size={24} color="#FF6B6B" />
            <Text style={styles.dangerText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* PRIVACY & SAFETY MODAL */}
      <Modal
        visible={privacyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.privacyModalOverlay}>
          <View style={styles.privacyModalCard}>
            <View style={styles.privacyModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MaterialCommunityIcons name="shield-account" size={24} color="#C084FC" />
                <Text style={styles.privacyModalTitle}>Privacy & Safety</Text>
              </View>
              <TouchableOpacity onPress={() => setPrivacyModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.privacyToggleGroup}>
                <View style={styles.privacyToggleRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.privacyToggleLabel}>Public Creator Discovery</Text>
                    <Text style={styles.privacyToggleSub}>Allow verified brands and creators to find your profile in searches</Text>
                  </View>
                  <Switch
                    value={profileVisible}
                    onValueChange={setProfileVisible}
                    trackColor={{ false: '#3e3e3e', true: '#C084FC' }}
                    thumbColor={profileVisible ? '#fff' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.privacyDivider} />

                <View style={styles.privacyToggleRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.privacyToggleLabel}>Safety Content Filter</Text>
                    <Text style={styles.privacyToggleSub}>Automatically flag and filter sensitive or objectionable chat messages</Text>
                  </View>
                  <Switch
                    value={safeContentFilter}
                    onValueChange={setSafeContentFilter}
                    trackColor={{ false: '#3e3e3e', true: '#C084FC' }}
                    thumbColor={safeContentFilter ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>

              <Text style={styles.blockedSectionTitle}>
                Blocked Accounts ({blockedUsers.length})
              </Text>

              {loadingBlocked ? (
                <View style={{ paddingVertical: 20 }}>
                  <ActivityIndicator size="small" color="#C084FC" />
                </View>
              ) : blockedUsers.length === 0 ? (
                <View style={styles.emptyBlockedCard}>
                  <MaterialCommunityIcons name="shield-check-outline" size={28} color="#34D399" />
                  <Text style={styles.emptyBlockedText}>No accounts currently blocked</Text>
                  <Text style={styles.emptyBlockedSub}>You can block any abusive user directly in chat threads or profiles.</Text>
                </View>
              ) : (
                blockedUsers.map((item, idx) => (
                  <View key={item.blocked_user_id || idx} style={styles.blockedUserRow}>
                    <View style={styles.blockedUserAvatar}>
                      <Text style={styles.blockedUserAvatarText}>
                        {(item.name || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.blockedUserName}>{item.name || 'User'}</Text>
                      <Text style={styles.blockedUserDate}>
                        Blocked on {new Date(item.blocked_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.unblockActionBtn}
                      onPress={() => handleUnblockUserFromSettings(item.blocked_user_id, item.name)}
                    >
                      <Text style={styles.unblockActionBtnText}>Unblock</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              <View style={styles.privacyLinksGroup}>
                <TouchableOpacity style={styles.privacyLinkItem} onPress={openPrivacyPolicy}>
                  <MaterialCommunityIcons name="file-document-outline" size={20} color="#C084FC" />
                  <Text style={styles.privacyLinkText}>Official Privacy Policy</Text>
                  <MaterialCommunityIcons name="open-in-new" size={16} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.privacyLinkItem} onPress={openTermsOfService}>
                  <MaterialCommunityIcons name="shield-alert-outline" size={20} color="#C084FC" />
                  <Text style={styles.privacyLinkText}>Terms of Service & EULA</Text>
                  <MaterialCommunityIcons name="open-in-new" size={16} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.textGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#14141C',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.textDark,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textGray,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.background,
    marginLeft: 80,
  },
  badge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: '#F57C00',
  },
  versionText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textGray,
  },
  dangerCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: '#FFE5E5',
    marginBottom: 20,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  dangerText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#FF6B6B',
  },
  privacyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  privacyModalCard: {
    backgroundColor: '#161622',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  privacyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  privacyModalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  privacyToggleGroup: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 20,
  },
  privacyToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  privacyToggleLabel: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  privacyToggleSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  privacyDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 12,
  },
  blockedSectionTitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  emptyBlockedCard: {
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    gap: 6,
  },
  emptyBlockedText: {
    color: '#34D399',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyBlockedSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  blockedUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  blockedUserAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockedUserAvatarText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  blockedUserName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  blockedUserDate: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    marginTop: 2,
  },
  unblockActionBtn: {
    backgroundColor: '#34D399',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  unblockActionBtnText: {
    color: '#0B0B10',
    fontSize: 12,
    fontWeight: '700',
  },
  privacyLinksGroup: {
    marginTop: 10,
    gap: 10,
    marginBottom: 20,
  },
  privacyLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  privacyLinkText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
