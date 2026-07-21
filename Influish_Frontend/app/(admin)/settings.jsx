import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ToggleSetting from '../../components/admin/ToggleSetting';
import InputSetting from '../../components/admin/InputSetting';
import SaveBar from '../../components/admin/SaveBar';
import {
  getSettings,
  updatePlatformSettings,
  updateSecuritySettings,
  updateAppSettings,
  validateSetting,
  formatLastUpdated,
  getImpactMessage,
} from '../../services/adminSettings.service';

const AdminSettingsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Original settings from server
  const [originalSettings, setOriginalSettings] = useState(null);
  
  // Current form values
  const [platformSettings, setPlatformSettings] = useState({
    commissionPercentage: 20,
    minWithdrawalAmount: 500,
    maxCampaignsPerBrand: '',
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    withdrawalsEnabled: true,
    campaignCreationEnabled: true,
  });
  
  const [appSettings, setAppSettings] = useState({
    maintenanceMode: false,
    noticeMessage: '',
    noticeEnabled: false,
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Confirmation modal
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    title: '',
    message: '',
    impact: '',
    onConfirm: null,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  // Check for unsaved changes whenever settings change
  useEffect(() => {
    if (originalSettings) {
      const hasChanges = checkForChanges();
      setHasUnsavedChanges(hasChanges);
    }
  }, [platformSettings, securitySettings, appSettings, originalSettings]);

  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      setOriginalSettings(settings);
      
      // Set form values
      setPlatformSettings({
        commissionPercentage: settings.platform.commissionPercentage,
        minWithdrawalAmount: settings.platform.minWithdrawalAmount,
        maxCampaignsPerBrand: settings.platform.maxCampaignsPerBrand || '',
      });
      
      setSecuritySettings({
        withdrawalsEnabled: settings.security.withdrawalsEnabled,
        campaignCreationEnabled: settings.security.campaignCreationEnabled,
      });
      
      setAppSettings({
        maintenanceMode: settings.app.maintenanceMode,
        noticeMessage: settings.app.noticeMessage,
        noticeEnabled: settings.app.noticeEnabled,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const checkForChanges = () => {
    if (!originalSettings) return false;
    
    return (
      platformSettings.commissionPercentage !== originalSettings.platform.commissionPercentage ||
      platformSettings.minWithdrawalAmount !== originalSettings.platform.minWithdrawalAmount ||
      platformSettings.maxCampaignsPerBrand !== (originalSettings.platform.maxCampaignsPerBrand || '') ||
      securitySettings.withdrawalsEnabled !== originalSettings.security.withdrawalsEnabled ||
      securitySettings.campaignCreationEnabled !== originalSettings.security.campaignCreationEnabled ||
      appSettings.maintenanceMode !== originalSettings.app.maintenanceMode ||
      appSettings.noticeMessage !== originalSettings.app.noticeMessage ||
      appSettings.noticeEnabled !== originalSettings.app.noticeEnabled
    );
  };

  const validateAllSettings = () => {
    const newErrors = {};

    const commissionValidation = validateSetting('commissionPercentage', platformSettings.commissionPercentage);
    if (!commissionValidation.valid) newErrors.commissionPercentage = commissionValidation.error;

    const withdrawalValidation = validateSetting('minWithdrawalAmount', platformSettings.minWithdrawalAmount);
    if (!withdrawalValidation.valid) newErrors.minWithdrawalAmount = withdrawalValidation.error;

    if (platformSettings.maxCampaignsPerBrand !== '') {
      const maxCampaignsValidation = validateSetting('maxCampaignsPerBrand', platformSettings.maxCampaignsPerBrand);
      if (!maxCampaignsValidation.valid) newErrors.maxCampaignsPerBrand = maxCampaignsValidation.error;
    }

    if (appSettings.noticeMessage) {
      const noticeValidation = validateSetting('noticeMessage', appSettings.noticeMessage);
      if (!noticeValidation.valid) newErrors.noticeMessage = noticeValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    // Validate all settings
    if (!validateAllSettings()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    // Show confirmation modal with impact
    const impacts = [];
    
    if (platformSettings.commissionPercentage !== originalSettings.platform.commissionPercentage) {
      impacts.push(getImpactMessage('commissionPercentage', platformSettings.commissionPercentage));
    }
    if (platformSettings.minWithdrawalAmount !== originalSettings.platform.minWithdrawalAmount) {
      impacts.push(getImpactMessage('minWithdrawalAmount', platformSettings.minWithdrawalAmount));
    }
    if (platformSettings.maxCampaignsPerBrand !== (originalSettings.platform.maxCampaignsPerBrand || '')) {
      impacts.push(getImpactMessage('maxCampaignsPerBrand', platformSettings.maxCampaignsPerBrand || null));
    }
    if (securitySettings.withdrawalsEnabled !== originalSettings.security.withdrawalsEnabled) {
      impacts.push(getImpactMessage('withdrawalsEnabled', securitySettings.withdrawalsEnabled));
    }
    if (securitySettings.campaignCreationEnabled !== originalSettings.security.campaignCreationEnabled) {
      impacts.push(getImpactMessage('campaignCreationEnabled', securitySettings.campaignCreationEnabled));
    }
    if (appSettings.maintenanceMode !== originalSettings.app.maintenanceMode) {
      impacts.push(getImpactMessage('maintenanceMode', appSettings.maintenanceMode));
    }
    if (appSettings.noticeEnabled !== originalSettings.app.noticeEnabled) {
      impacts.push(getImpactMessage('noticeEnabled', appSettings.noticeEnabled));
    }

    setConfirmModal({
      visible: true,
      title: 'Confirm Settings Change',
      message: 'Are you sure you want to save these changes?',
      impact: impacts.join('\n\n'),
      onConfirm: saveSettings,
    });
  };

  const saveSettings = async () => {
    setConfirmModal({ ...confirmModal, visible: false });
    setSaving(true);

    try {
      // Update platform settings
      const platformUpdates = {};
      if (platformSettings.commissionPercentage !== originalSettings.platform.commissionPercentage) {
        platformUpdates.commissionPercentage = parseFloat(platformSettings.commissionPercentage);
      }
      if (platformSettings.minWithdrawalAmount !== originalSettings.platform.minWithdrawalAmount) {
        platformUpdates.minWithdrawalAmount = parseFloat(platformSettings.minWithdrawalAmount);
      }
      if (platformSettings.maxCampaignsPerBrand !== (originalSettings.platform.maxCampaignsPerBrand || '')) {
        platformUpdates.maxCampaignsPerBrand = platformSettings.maxCampaignsPerBrand ? parseInt(platformSettings.maxCampaignsPerBrand) : null;
      }

      if (Object.keys(platformUpdates).length > 0) {
        await updatePlatformSettings(platformUpdates, 'Admin updated platform settings');
      }

      // Update security settings
      const securityUpdates = {};
      if (securitySettings.withdrawalsEnabled !== originalSettings.security.withdrawalsEnabled) {
        securityUpdates.withdrawalsEnabled = securitySettings.withdrawalsEnabled;
      }
      if (securitySettings.campaignCreationEnabled !== originalSettings.security.campaignCreationEnabled) {
        securityUpdates.campaignCreationEnabled = securitySettings.campaignCreationEnabled;
      }

      if (Object.keys(securityUpdates).length > 0) {
        await updateSecuritySettings(securityUpdates, 'Admin updated security settings');
      }

      // Update app settings
      const appUpdates = {};
      if (appSettings.maintenanceMode !== originalSettings.app.maintenanceMode) {
        appUpdates.maintenanceMode = appSettings.maintenanceMode;
      }
      if (appSettings.noticeMessage !== originalSettings.app.noticeMessage) {
        appUpdates.noticeMessage = appSettings.noticeMessage;
      }
      if (appSettings.noticeEnabled !== originalSettings.app.noticeEnabled) {
        appUpdates.noticeEnabled = appSettings.noticeEnabled;
      }

      if (Object.keys(appUpdates).length > 0) {
        await updateAppSettings(appUpdates, 'Admin updated app settings');
      }

      Alert.alert('Success', 'Settings saved successfully!');
      
      // Reload settings
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard all unsaved changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            // Reset to original values
            if (originalSettings) {
              setPlatformSettings({
                commissionPercentage: originalSettings.platform.commissionPercentage,
                minWithdrawalAmount: originalSettings.platform.minWithdrawalAmount,
                maxCampaignsPerBrand: originalSettings.platform.maxCampaignsPerBrand || '',
              });
              
              setSecuritySettings({
                withdrawalsEnabled: originalSettings.security.withdrawalsEnabled,
                campaignCreationEnabled: originalSettings.security.campaignCreationEnabled,
              });
              
              setAppSettings({
                maintenanceMode: originalSettings.app.maintenanceMode,
                noticeMessage: originalSettings.app.noticeMessage,
                noticeEnabled: originalSettings.app.noticeEnabled,
              });
              
              setErrors({});
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="cog" size={28} color="#2196F3" />
          <Text style={styles.headerTitle}>Global Settings</Text>
        </View>
        <View style={styles.lastUpdated}>
          <Icon name="clock-outline" size={14} color="#757575" />
          <Text style={styles.lastUpdatedText}>
            {formatLastUpdated(originalSettings?.platform.lastUpdated)}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* PLATFORM SETTINGS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="currency-inr" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Platform Settings</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Configure platform-wide financial settings. Changes apply to new transactions only.
          </Text>

          <InputSetting
            label="Platform Commission Percentage"
            description="Commission charged on all new campaigns"
            value={platformSettings.commissionPercentage}
            onChangeText={(value) => {
              setPlatformSettings({ ...platformSettings, commissionPercentage: value });
            }}
            icon="percent"
            suffix="%"
            keyboardType="numeric"
            error={errors.commissionPercentage}
          />

          <InputSetting
            label="Minimum Withdrawal Amount"
            description="Minimum amount influencers can withdraw"
            value={platformSettings.minWithdrawalAmount}
            onChangeText={(value) => {
              setPlatformSettings({ ...platformSettings, minWithdrawalAmount: value });
            }}
            icon="cash"
            suffix="₹"
            keyboardType="numeric"
            error={errors.minWithdrawalAmount}
          />

          <InputSetting
            label="Max Campaigns Per Brand (Optional)"
            description="Leave empty for unlimited campaigns"
            value={platformSettings.maxCampaignsPerBrand}
            onChangeText={(value) => {
              setPlatformSettings({ ...platformSettings, maxCampaignsPerBrand: value });
            }}
            icon="counter"
            placeholder="Unlimited"
            keyboardType="numeric"
            error={errors.maxCampaignsPerBrand}
          />
        </View>

        {/* SECURITY SETTINGS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="shield-check" size={24} color="#F44336" />
            <Text style={styles.sectionTitle}>Security Settings</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Emergency controls to disable platform features. Use with caution.
          </Text>

          <ToggleSetting
            label="Enable Withdrawals"
            description="Allow influencers to request new withdrawals"
            value={securitySettings.withdrawalsEnabled}
            onValueChange={(value) => {
              setSecuritySettings({ ...securitySettings, withdrawalsEnabled: value });
            }}
            icon="cash-check"
            warning={!securitySettings.withdrawalsEnabled}
          />

          <ToggleSetting
            label="Enable Campaign Creation"
            description="Allow brands to create new campaigns"
            value={securitySettings.campaignCreationEnabled}
            onValueChange={(value) => {
              setSecuritySettings({ ...securitySettings, campaignCreationEnabled: value });
            }}
            icon="plus-circle"
            warning={!securitySettings.campaignCreationEnabled}
          />
        </View>

        {/* APP SETTINGS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="application-cog" size={24} color="#9C27B0" />
            <Text style={styles.sectionTitle}>App Settings</Text>
          </View>
          <Text style={styles.sectionDescription}>
            App-wide configurations and maintenance controls.
          </Text>

          <ToggleSetting
            label="Maintenance Mode"
            description="Block all user access to the app"
            value={appSettings.maintenanceMode}
            onValueChange={(value) => {
              setAppSettings({ ...appSettings, maintenanceMode: value });
            }}
            icon="wrench"
            warning={appSettings.maintenanceMode}
          />

          <ToggleSetting
            label="Show Notice Banner"
            description="Display notice message to all users"
            value={appSettings.noticeEnabled}
            onValueChange={(value) => {
              setAppSettings({ ...appSettings, noticeEnabled: value });
            }}
            icon="alert"
          />

          {appSettings.noticeEnabled && (
            <InputSetting
              label="Notice Message"
              description="Message shown in app-wide notice banner"
              value={appSettings.noticeMessage}
              onChangeText={(value) => {
                setAppSettings({ ...appSettings, noticeMessage: value });
              }}
              icon="message-text"
              placeholder="Enter notice message..."
              maxLength={200}
              error={errors.noticeMessage}
            />
          )}
        </View>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <Icon name="alert-circle" size={20} color="#FF9800" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Important</Text>
            <Text style={styles.warningText}>
              • Changes apply only to NEW actions{'\n'}
              • Existing deals are NOT affected{'\n'}
              • All changes are logged for audit
            </Text>
          </View>
        </View>

        {/* Spacer for SaveBar */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Save Bar */}
      <SaveBar
        visible={hasUnsavedChanges}
        onSave={handleSave}
        onDiscard={handleDiscard}
        saving={saving}
      />

      {/* Confirmation Modal */}
      <Modal
        visible={confirmModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModal({ ...confirmModal, visible: false })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Icon name="alert-circle" size={28} color="#FF9800" />
              <Text style={styles.modalTitle}>{confirmModal.title}</Text>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalMessage}>{confirmModal.message}</Text>
              
              {confirmModal.impact && (
                <View style={styles.impactContainer}>
                  <Text style={styles.impactTitle}>Impact:</Text>
                  <Text style={styles.impactText}>{confirmModal.impact}</Text>
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setConfirmModal({ ...confirmModal, visible: false })}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmModal.onConfirm}
              >
                <Icon name="check" size={18} color="#FFFFFF" />
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#757575',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#757575',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    marginTop: 8,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 6,
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 22,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    backgroundColor: '#FFF3E0',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E65100',
    flex: 1,
  },
  modalContent: {
    padding: 20,
  },
  modalMessage: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 16,
    lineHeight: 22,
  },
  impactContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  impactText: {
    fontSize: 13,
    color: '#616161',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#616161',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AdminSettingsScreen;
