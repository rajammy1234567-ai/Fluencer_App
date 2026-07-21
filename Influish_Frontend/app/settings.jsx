import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { router } from 'expo-router';
import BackButton from '../components/BackButton';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [campaignUpdates, setCampaignUpdates] = useState(true);

  const handleRequestVerification = () => {
    Alert.alert(
      'Request Verification',
      'We will review your profile and get back to you within 24-48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit Request', onPress: () => Alert.alert('Success', 'Verification request submitted!') },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => Alert.alert('Account Deleted', 'Your account has been deleted successfully.'),
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
              subtitle="Coming Soon"
              onPress={handleRequestVerification}
              rightComponent={
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Coming Soon</Text>
                </View>
              }
              hasArrow={false}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-account"
              title="Privacy & Security"
              subtitle="Manage your privacy settings"
              onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon!')}
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
              subtitle="Get help with your account"
              onPress={() => Alert.alert('Support', 'Contact us at support@influish.com')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="file-document"
              title="Terms & Conditions"
              subtitle="Read our terms of service"
              onPress={() => Alert.alert('Terms', 'Terms & Conditions will open here')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-check"
              title="Privacy Policy"
              subtitle="View our privacy policy"
              onPress={() => Alert.alert('Privacy', 'Privacy Policy will open here')}
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
    backgroundColor: COLORS.white,
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
});
