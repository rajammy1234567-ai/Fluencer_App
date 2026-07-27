import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getAuthHeader } from '../../utils/storage';
import { API, getApiUrl } from '../../constants/api';
import * as ImagePicker from 'expo-image-picker';

const THEME = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  secondary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  white: '#FFFFFF',
};

export default function CreateCampaign() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [location, setLocation] = useState('');
  const [campaignType, setCampaignType] = useState('paid');
  const [contentType, setContentType] = useState('reel');
  const [seats, setSeats] = useState('');
  const [minFollowers, setMinFollowers] = useState('');
  const [costPerInfluencer, setCostPerInfluencer] = useState('');
  const [description, setDescription] = useState('');
  const [productImage, setProductImage] = useState('');

  const handlePickGalleryImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Please grant gallery access permission to upload product photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setProductImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Gallery pick error:', err);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const handleTakePhotoCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Please grant camera access permission to capture product photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setProductImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Camera capture error:', err);
      Alert.alert('Error', 'Failed to capture photo from camera');
    }
  };

  const validateStep1 = () => {
    if (!campaignName.trim()) { 
      Alert.alert('Error', 'Please enter campaign name'); 
      return false; 
    }
    if (!location.trim()) { 
      Alert.alert('Error', 'Please enter location'); 
      return false; 
    }
    return true;
  };

  const validateStep2 = () => {
    if (!contentType) { 
      Alert.alert('Error', 'Please select content type'); 
      return false; 
    }
    if (!seats) { 
      Alert.alert('Error', 'Please enter number of influencers'); 
      return false; 
    }
    if (campaignType === 'paid' && !costPerInfluencer) { 
      Alert.alert('Error', 'Please enter cost per influencer'); 
      return false; 
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const payload = {
        campaign_name: campaignName,
        influencer_location: location,
        campaign_type: campaignType,
        content_type: contentType,
        number_of_seats: Number(seats ?? 1),
        min_followers: Number(minFollowers ?? 0),
        cost_per_influencer: campaignType === 'paid' ? Number(costPerInfluencer ?? 0) : 0,
        description: description || 'No description provided.',
        product_image: productImage.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        reference_images: [productImage.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80']
      };
      const res = await fetch(getApiUrl(API.CAMPAIGNS.CREATE), {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        Alert.alert('🎉 Success', 'Campaign Created Successfully!', [
          { text: 'View My Campaigns', onPress: () => { resetForm(); router.navigate('/(brand-tabs)/record'); } }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to create campaign');
      }
    } catch (err) {
      console.error('Submit error:', err);
      Alert.alert('Error', 'Something went wrong while creating campaign');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1); 
    setCampaignName(''); 
    setLocation(''); 
    setCampaignType('paid');
    setContentType('reel'); 
    setSeats(''); 
    setMinFollowers(''); 
    setCostPerInfluencer(''); 
    setDescription(''); 
    setProductImage('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.white} />
      
      {/* Header */}
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={() => { if (step === 2) setStep(1); else router.navigate('/(brand-tabs)/home'); }}>
          <MaterialCommunityIcons name={step === 2 ? "arrow-left" : "close"} size={26} color={THEME.text} />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{step === 1 ? 'Create New Campaign' : 'Campaign Requirements'}</Text>
        <TouchableOpacity onPress={() => router.navigate('/applications')}>
          <MaterialCommunityIcons name="account-group" size={24} color={THEME.primary} />
        </TouchableOpacity>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.stepDotActive]}><Text style={styles.stepNumberActive}>1</Text></View>
        <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
        <View style={[styles.stepDot, step === 2 && styles.stepDotActive]}><Text style={[styles.stepNumber, step === 2 && styles.stepNumberActive]}>2</Text></View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
          {step === 1 ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Campaign Name *</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="bullhorn-outline" size={22} color={THEME.textMuted} />
                  <TextInput style={styles.input} value={campaignName} onChangeText={setCampaignName} placeholder="e.g., Summer Ethnic Wear Reel Drop" placeholderTextColor={THEME.textMuted} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Target Location *</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="map-marker-outline" size={22} color={THEME.textMuted} />
                  <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g., Mumbai, Delhi, All India" placeholderTextColor={THEME.textMuted} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Campaign Type</Text>
                <View style={styles.typeRow}>
                  <TouchableOpacity style={[styles.typeCard, campaignType === 'paid' && styles.typeCardActive]} onPress={() => setCampaignType('paid')}>
                    <View style={[styles.typeIcon, campaignType === 'paid' && styles.typeIconActive]}>
                      <MaterialCommunityIcons name="currency-inr" size={28} color={campaignType === 'paid' ? THEME.white : THEME.primary} />
                    </View>
                    <Text style={[styles.typeLabel, campaignType === 'paid' && styles.typeLabelActive]}>Paid</Text>
                    <Text style={styles.typeDesc}>Pay per post</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.typeCard, campaignType === 'barter' && styles.typeCardActiveBarter]} onPress={() => setCampaignType('barter')}>
                    <View style={[styles.typeIcon, campaignType === 'barter' && styles.typeIconActiveBarter]}>
                      <MaterialCommunityIcons name="swap-horizontal" size={28} color={campaignType === 'barter' ? THEME.white : '#EC4899'} />
                    </View>
                    <Text style={[styles.typeLabel, campaignType === 'barter' && styles.typeLabelActiveBarter]}>Barter</Text>
                    <Text style={styles.typeDesc}>Product exchange</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Product Image / Photo</Text>
                
                {productImage ? (
                  <View style={{ marginBottom: 12, borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
                    <Image source={{ uri: productImage }} style={{ width: '100%', height: 180, resizeMode: 'cover' }} />
                    <TouchableOpacity 
                      style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 20 }}
                      onPress={() => setProductImage('')}
                    >
                      <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : null}

                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                  <TouchableOpacity 
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, borderRadius: 14, paddingVertical: 12 }}
                    onPress={handlePickGalleryImage}
                  >
                    <MaterialCommunityIcons name="image-multiple-outline" size={20} color="#2563EB" />
                    <Text style={{ color: '#2563EB', fontWeight: '700', fontSize: 13 }}>Choose Gallery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1, borderRadius: 14, paddingVertical: 12 }}
                    onPress={handleTakePhotoCamera}
                  >
                    <MaterialCommunityIcons name="camera-outline" size={20} color="#16A34A" />
                    <Text style={{ color: '#16A34A', fontWeight: '700', fontSize: 13 }}>Take Photo</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="link-variant" size={20} color={THEME.textMuted} />
                  <TextInput 
                    style={styles.input} 
                    value={productImage} 
                    onChangeText={setProductImage} 
                    placeholder="Or paste image URL link..." 
                    placeholderTextColor={THEME.textMuted} 
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description & Guidelines (Optional)</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="e.g., Shoot a 30s Reel showcasing our collection..." placeholderTextColor={THEME.textMuted} multiline numberOfLines={4} />
                </View>
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={() => validateStep1() && setStep(2)}>
                <LinearGradient colors={[THEME.primary, THEME.primaryDark]} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.buttonText}>Continue to Requirements</Text>
                  <MaterialCommunityIcons name="arrow-right" size={22} color={THEME.white} />
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Content Type *</Text>
                <View style={styles.chipContainer}>
                  {['reel', 'post', 'story', 'video'].map((type) => (
                    <TouchableOpacity key={type} style={[styles.chip, contentType === type && styles.chipActive]} onPress={() => setContentType(type)}>
                      <MaterialCommunityIcons name={type === 'reel' ? 'movie-outline' : type === 'post' ? 'image-outline' : type === 'story' ? 'clock-outline' : 'video-outline'} size={20} color={contentType === type ? THEME.white : THEME.textSecondary} />
                      <Text style={[styles.chipText, contentType === type && styles.chipTextActive]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Number of Influencers *</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="account-group-outline" size={22} color={THEME.textMuted} />
                  <TextInput style={styles.input} value={seats} onChangeText={setSeats} placeholder="e.g., 10" placeholderTextColor={THEME.textMuted} keyboardType="numeric" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Minimum Followers</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="trending-up" size={22} color={THEME.textMuted} />
                  <TextInput style={styles.input} value={minFollowers} onChangeText={setMinFollowers} placeholder="e.g., 5000" placeholderTextColor={THEME.textMuted} keyboardType="numeric" />
                </View>
              </View>

              {campaignType === 'paid' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Cost per Influencer (₹) *</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="currency-inr" size={22} color={THEME.textMuted} />
                    <TextInput style={styles.input} value={costPerInfluencer} onChangeText={setCostPerInfluencer} placeholder="e.g., 5000" placeholderTextColor={THEME.textMuted} keyboardType="numeric" />
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
                <LinearGradient colors={[THEME.primary, THEME.primaryDark]} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  {loading ? <ActivityIndicator color={THEME.white} /> : <><Text style={styles.buttonText}>Create Campaign</Text><MaterialCommunityIcons name="check" size={22} color={THEME.white} /></>}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.white },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: THEME.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: THEME.text },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: THEME.border, justifyContent: 'center', alignItems: 'center' },
  stepDotActive: { backgroundColor: THEME.primary },
  stepNumber: { fontSize: 14, fontWeight: '700', color: THEME.textMuted },
  stepNumberActive: { color: THEME.white },
  stepLine: { width: 50, height: 3, backgroundColor: THEME.border, marginHorizontal: 8 },
  stepLineActive: { backgroundColor: THEME.primary },
  formScroll: { flex: 1 },
  formContent: { padding: 20, paddingBottom: 220 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', color: THEME.text, marginBottom: 10 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.surface, borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: THEME.border },
  input: { flex: 1, paddingVertical: 16, paddingHorizontal: 12, fontSize: 16, color: THEME.text },
  textAreaWrapper: { alignItems: 'flex-start' },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 16 },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeCard: { flex: 1, backgroundColor: THEME.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: THEME.border },
  typeCardActive: { borderColor: THEME.primary, backgroundColor: '#EFF6FF' },
  typeCardActiveBarter: { borderColor: '#EC4899', backgroundColor: '#FDF2F8' },
  typeIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: THEME.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: THEME.border },
  typeIconActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  typeIconActiveBarter: { backgroundColor: '#EC4899', borderColor: '#EC4899' },
  typeLabel: { fontSize: 16, fontWeight: '700', color: THEME.text, marginBottom: 4 },
  typeLabelActive: { color: THEME.primary },
  typeLabelActiveBarter: { color: '#EC4899' },
  typeDesc: { fontSize: 12, color: THEME.textMuted },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: THEME.surface, borderWidth: 1, borderColor: THEME.border, gap: 8 },
  chipActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: THEME.textSecondary },
  chipTextActive: { color: THEME.white },
  primaryButton: { marginTop: 24, borderRadius: 14, overflow: 'hidden' },
  gradientButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  buttonText: { fontSize: 17, fontWeight: '700', color: THEME.white },
});
