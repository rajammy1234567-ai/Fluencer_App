import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import NotificationCard from '../../components/admin/NotificationCard';
import { getAdminAuthHeader } from '../../utils/adminStorage';
import { getApiUrl } from '../../constants/api';

const AdminNotificationsScreen = () => {
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);

  // Send Form State
  const [showSendForm, setShowSendForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('all_influencers');
  const [selectedInfluencer, setSelectedInfluencer] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  // User Lists for Dropdowns
  const [influencers, setInfluencers] = useState([]);
  const [brands, setBrands] = useState([]);

  // Filter State
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
    loadUserLists();
  }, []);

  const loadData = async () => {
    try {
      // Fetch notification history from backend
      const response = await fetch(getApiUrl('/api/notifications/admin/history'));
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        
        // Calculate stats from notifications
        const stats = {
          total: data.notifications.length,
          allInfluencers: data.notifications.filter(n => n.target_type === 'all_influencers').length,
          allBrands: data.notifications.filter(n => n.target_type === 'all_brands').length,
          specific: data.notifications.filter(n => n.target_type === 'brand' || n.target_type === 'influencer').length,
          last7Days: data.notifications.filter(n => {
            const date = new Date(n.created_at);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
          }).length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadUserLists = async () => {
    try {
      const headers = await getAdminAuthHeader();
      
      // Fetch influencers and brands from backend
      const [infResponse, brandResponse] = await Promise.all([
        fetch(getApiUrl('/api/admin/influencers'), { headers }),
        fetch(getApiUrl('/api/admin/brands'), { headers })
      ]);
      
      const infData = await infResponse.json();
      const brandData = await brandResponse.json();
      
      if (infData.success) {
        setInfluencers(infData.influencers || []);
      }
      if (brandData.success) {
        setBrands(brandData.brands || []);
      }
    } catch (error) {
      console.error('Error loading user lists:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSendNotification = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Validation Error', 'Please enter a message');
      return;
    }
    if (targetType === 'specific_influencer' && !selectedInfluencer) {
      Alert.alert('Validation Error', 'Please select an influencer');
      return;
    }
    if (targetType === 'specific_brand' && !selectedBrand) {
      Alert.alert('Validation Error', 'Please select a brand');
      return;
    }

    // Confirm before sending
    Alert.alert(
      'Confirm Send',
      `Send notification to ${getTargetLabel()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          style: 'default',
          onPress: async () => {
            setSending(true);
            try {
              let response;
              
              switch (targetType) {
                case 'all_influencers':
                  response = await fetch(getApiUrl('/api/notifications/admin/send-to-all-influencers'), {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title, message }),
                  });
                  break;
                  
                case 'all_brands':
                  response = await fetch(getApiUrl('/api/notifications/admin/send-to-all-brands'), {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title, message }),
                  });
                  break;
                  
                case 'specific_influencer':
                  response = await fetch(getApiUrl('/api/notifications/admin/send-to-specific'), {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      title,
                      message,
                      target_type: 'influencer',
                      target_id: selectedInfluencer,
                    }),
                  });
                  break;
                  
                case 'specific_brand':
                  response = await fetch(getApiUrl('/api/notifications/admin/send-to-specific'), {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      title,
                      message,
                      target_type: 'brand',
                      target_id: selectedBrand,
                    }),
                  });
                  break;
              }

              const result = await response.json();
              
              if (result.success) {
                Alert.alert('Success', 'Notification sent successfully!');
                
                // Reset form
                setTitle('');
                setMessage('');
                setTargetType('all_influencers');
                setSelectedInfluencer('');
                setSelectedBrand('');
                setShowSendForm(false);

                // Reload data
                await loadData();
              } else {
                Alert.alert('Error', result.message || 'Failed to send notification');
              }
            } catch (error) {
              console.error('Error sending notification:', error);
              Alert.alert('Error', 'Failed to send notification');
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteNotification = async (notificationId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this notification from history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete functionality can be added later if needed
              Alert.alert('Info', 'Delete functionality will be available soon');
              // const headers = await getAuthHeader();
              // await fetch(getApiUrl(`/api/notifications/admin/${notificationId}`), {
              //   method: 'DELETE',
              //   headers
              // });
              // await loadData();
              // Alert.alert('Success', 'Notification deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  const getTargetLabel = () => {
    switch (targetType) {
      case 'all_influencers':
        return 'All Influencers';
      case 'all_brands':
        return 'All Brands';
      case 'specific_influencer':
        return influencers.find((i) => i.id === selectedInfluencer)?.name || 'Selected Influencer';
      case 'specific_brand':
        return brands.find((b) => b.id === selectedBrand)?.name || 'Selected Brand';
      default:
        return '';
    }
  };

  const getFilteredNotifications = () => {
    let filtered = [...notifications];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((n) => n.targetType === filterType);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query) ||
          n.targetName.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredNotifications = getFilteredNotifications();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="bell-ring" size={28} color="#2196F3" />
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => setShowSendForm(true)}
        >
          <Icon name="send" size={20} color="#FFFFFF" />
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      {stats && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
          contentContainerStyle={styles.statsContent}
        >
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Icon name="bell-ring" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Sent</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Icon name="account-star" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.allInfluencers}</Text>
            <Text style={styles.statLabel}>All Influencers</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E1F5FE' }]}>
            <Icon name="office-building" size={24} color="#03A9F4" />
            <Text style={styles.statValue}>{stats.allBrands}</Text>
            <Text style={styles.statLabel}>All Brands</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Icon name="account-check" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{stats.specific}</Text>
            <Text style={styles.statLabel}>Specific Users</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
            <Icon name="clock-outline" size={24} color="#9C27B0" />
            <Text style={styles.statValue}>{stats.last7Days}</Text>
            <Text style={styles.statLabel}>Last 7 Days</Text>
          </View>
        </ScrollView>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#757575" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, message, or target..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#BDBDBD"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color="#757575" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { value: 'all', label: 'All', count: notifications.length },
          {
            value: 'all_influencers',
            label: 'All Influencers',
            count: notifications.filter((n) => n.targetType === 'all_influencers').length,
          },
          {
            value: 'all_brands',
            label: 'All Brands',
            count: notifications.filter((n) => n.targetType === 'all_brands').length,
          },
          {
            value: 'specific_influencer',
            label: 'Specific',
            count: notifications.filter(
              (n) =>
                n.targetType === 'specific_influencer' || n.targetType === 'specific_brand'
            ).length,
          },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterTab,
              filterType === filter.value && styles.filterTabActive,
            ]}
            onPress={() => setFilterType(filter.value)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterType === filter.value && styles.filterTabTextActive,
              ]}
            >
              {filter.label}
            </Text>
            <View
              style={[
                styles.filterBadge,
                filterType === filter.value && styles.filterBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.filterBadgeText,
                  filterType === filter.value && styles.filterBadgeTextActive,
                ]}
              >
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notifications List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="bell-off" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>No notifications found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Send your first notification'}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onDelete={handleDeleteNotification}
            />
          ))
        )}
      </ScrollView>

      {/* Send Notification Modal */}
      <Modal
        visible={showSendForm}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowSendForm(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSendForm(false)}>
              <Icon name="close" size={24} color="#212121" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Send Notification</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Target Audience */}
            <Text style={styles.fieldLabel}>Target Audience</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={targetType}
                onValueChange={setTargetType}
                style={styles.picker}
              >
                <Picker.Item label="All Influencers" value="all_influencers" />
                <Picker.Item label="All Brands" value="all_brands" />
                <Picker.Item label="Specific Influencer" value="specific_influencer" />
                <Picker.Item label="Specific Brand" value="specific_brand" />
              </Picker>
            </View>

            {/* Specific User Selection */}
            {targetType === 'specific_influencer' && (
              <>
                <Text style={styles.fieldLabel}>Select Influencer</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedInfluencer}
                    onValueChange={setSelectedInfluencer}
                    style={styles.picker}
                  >
                    <Picker.Item label="Choose an influencer..." value="" />
                    {influencers.map((inf) => (
                      <Picker.Item
                        key={inf.id}
                        label={`${inf.name} (${inf.username})`}
                        value={inf.id}
                      />
                    ))}
                  </Picker>
                </View>
              </>
            )}

            {targetType === 'specific_brand' && (
              <>
                <Text style={styles.fieldLabel}>Select Brand</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedBrand}
                    onValueChange={setSelectedBrand}
                    style={styles.picker}
                  >
                    <Picker.Item label="Choose a brand..." value="" />
                    {brands.map((brand) => (
                      <Picker.Item
                        key={brand.id}
                        label={`${brand.name} (${brand.username})`}
                        value={brand.id}
                      />
                    ))}
                  </Picker>
                </View>
              </>
            )}

            {/* Title */}
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter notification title..."
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            {/* Message */}
            <Text style={styles.fieldLabel}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter notification message..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{message.length}/500</Text>

            {/* Preview */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Preview</Text>
              <View style={styles.previewCard}>
                <Icon name="bell-ring" size={20} color="#FF9800" />
                <View style={styles.previewContent}>
                  <Text style={styles.previewTitle}>
                    {title || 'Notification Title'}
                  </Text>
                  <Text style={styles.previewMessage}>
                    {message || 'Notification message will appear here...'}
                  </Text>
                  <Text style={styles.previewTarget}>To: {getTargetLabel()}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Send Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalSendButton, sending && styles.modalSendButtonDisabled]}
              onPress={handleSendNotification}
              disabled={sending}
            >
              {sending ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.modalSendButtonText}>Sending...</Text>
                </>
              ) : (
                <>
                  <Icon name="send" size={20} color="#FFFFFF" />
                  <Text style={styles.modalSendButtonText}>Send Notification</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    maxHeight: 150,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    alignItems: 'center',
  },
  statCard: {
    width: 100,
    height: 110,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  statLabel: {
    fontSize: 11,
    color: '#616161',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
  },
  filterContainer: {
    maxHeight: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
    alignItems: 'center',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterTabActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#616161',
  },
  filterTabTextActive: {
    color: '#2196F3',
  },
  filterBadge: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: '#2196F3',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#616161',
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#616161',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
    marginTop: 16,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#212121',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'right',
    marginTop: 4,
  },
  previewContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 12,
  },
  previewCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewContent: {
    flex: 1,
    gap: 6,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  previewMessage: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
  },
  previewTarget: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
    marginTop: 4,
  },
  modalFooter: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalSendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
  },
  modalSendButtonDisabled: {
    opacity: 0.6,
  },
  modalSendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AdminNotificationsScreen;
