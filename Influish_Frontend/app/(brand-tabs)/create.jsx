import React, { useState, useEffect, useRef } from 'react';
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
  Dimensions,
  FlatList,
  ActivityIndicator,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Shadow } from 'react-native-shadow-2';
import { router } from 'expo-router';
import { initiatePayment, calculateCampaignCost, formatCurrency } from '../../utils/payment';

import { getAuthHeader } from '../../utils/storage';
import { API, getApiUrl } from '../../constants/api';
import * as ImagePicker from 'expo-image-picker';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

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

const SLIDES = [
  {
    id: 1,
    image: require('../../assets/images/campaign_1.png'),
    title: 'Create Your Campaign',
    subtitle: 'Reach thousands of influencers with your brand message',
  },
  {
    id: 2,
    image: require('../../assets/images/campaign_2.png'),
    title: 'Set Your Budget',
    subtitle: 'Choose between paid collaborations or barter deals',
  },
  {
    id: 3,
    image: require('../../assets/images/campiagn_3.png'),
    title: 'View Applicants',
    subtitle: 'Review and approve influencers who want to work with you',
  },
  {
    id: 4,
    image: require('../../assets/images/campaign_4.png'),
    title: 'Track Performance',
    subtitle: 'Monitor your campaign success in real-time',
  },
];

export default function CreateCampaign() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showForm, setShowForm] = useState(true);
  const flatListRef = useRef(null);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [location, setLocation] = useState('');
  const [campaignType, setCampaignType] = useState('paid');
  const [contentType, setContentType] = useState('');
  const [seats, setSeats] = useState('');
  const [minFollowers, setMinFollowers] = useState('');
  const [costPerInfluencer, setCostPerInfluencer] = useState('');
  const [description, setDescription] = useState('');
  const [productImage, setProductImage] = useState('');

  useEffect(() => {
    if (showForm) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = prev === SLIDES.length - 1 ? 0 : prev + 1;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [showForm]);

  const handlePickGalleryImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Please grant gallery access permission to upload product photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
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
        allowsEditing: true,
        quality: 0.8,
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
    if (!campaignName.trim()) { Alert.alert('Error', 'Please enter campaign name'); return false; }
    if (!location.trim()) { Alert.alert('Error', 'Please enter location'); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!contentType) { Alert.alert('Error', 'Please select content type'); return false; }
    if (!seats) { Alert.alert('Error', 'Please enter number of influencers'); return false; }
    if (campaignType === 'paid' && !costPerInfluencer) { Alert.alert('Error', 'Please enter cost'); return false; }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleNextToPayment = () => {
    if (validateStep2()) {
      // For barter campaigns, skip payment
      if (campaignType === 'barter') {
        handleSubmit();
      } else {
        setStep(3); // Go to payment confirmation
      }
    }
  };

  const handlePayment = () => {
    const campaignData = {
      campaign_name: campaignName,
      influencer_location: location,
      campaign_type: campaignType,
      content_type: contentType,
      // APK SAFETY: Add fallbacks to prevent Hermes crash on undefined values
      number_of_seats: parseInt(seats ?? "1"),
      min_followers: parseInt(minFollowers ?? "0"),
      cost_per_influencer: campaignType === 'paid' ? parseFloat(costPerInfluencer ?? "0") : 0,
      description: description.trim() || null,
    };

    const totalCost = calculateCampaignCost(campaignData);

    initiatePayment({
      amount: totalCost,
      description: `Payment for ${campaignName}`,
      campaignId: null,
      onSuccess: (paymentData) => {
        // Payment successful, now create campaign
        handleSubmit();
      },
      onFailure: (error) => {
        console.error('Payment failed:', error);
        setStep(2); // Go back to step 2
      },
    });
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
        // APK SAFETY: Add ?? fallbacks to prevent Hermes crash on undefined values
        number_of_seats: Number(seats ?? 1),
        min_followers: Number(minFollowers ?? 0),
        cost_per_influencer: campaignType === 'paid' ? Number(costPerInfluencer ?? 0) : 0,
        description,
        product_image: productImage.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        reference_images: [productImage.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80']
      };
      const res = await fetch(getApiUrl(API.CAMPAIGNS.CREATE), {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        Alert.alert('Success', 'Campaign Created!', [{ text: 'OK', onPress: () => { setShowForm(false); resetForm(); router.push('/(brand-tabs)/record'); }}]);
      } else {
        Alert.alert('Error', 'Failed to create campaign');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1); setCampaignName(''); setLocation(''); setCampaignType('paid');
    setContentType(''); setSeats(''); setMinFollowers(''); setCostPerInfluencer(''); setDescription('');
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.slideImage} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  const renderStep3 = () => {
    const campaignData = {
      campaign_name: campaignName,
      influencer_location: location,
      campaign_type: campaignType,
      content_type: contentType,
      // APK SAFETY: Add fallbacks to prevent Hermes crash on undefined values
      number_of_seats: parseInt(seats ?? "1"),
      min_followers: parseInt(minFollowers ?? "0"),
      cost_per_influencer: campaignType === 'paid' ? parseFloat(costPerInfluencer ?? "0") : 0,
    };

    const influencerCost = campaignData.number_of_seats * campaignData.cost_per_influencer;
    const platformFee = influencerCost * 0.1;
    const gst = (influencerCost + platformFee) * 0.18;
    const totalCost = calculateCampaignCost(campaignData);

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.paymentTitle}>Payment Summary</Text>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Campaign Name:</Text>
            <Text style={styles.summaryValue}>{campaignName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Content Type:</Text>
            <Text style={styles.summaryValue}>
              {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Number of Influencers:</Text>
            <Text style={styles.summaryValue}>{seats}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cost per Influencer:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(parseFloat(costPerInfluencer))}</Text>
          </View>
        </View>

        <View style={styles.costBreakdown}>
          <Text style={styles.breakdownTitle}>Cost Breakdown</Text>
          
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Influencer Payment</Text>
            <Text style={styles.costValue}>{formatCurrency(influencerCost)}</Text>
          </View>
          
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Platform Fee (10%)</Text>
            <Text style={styles.costValue}>{formatCurrency(platformFee)}</Text>
          </View>
          
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>GST (18%)</Text>
            <Text style={styles.costValue}>{formatCurrency(gst)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalCost)}</Text>
          </View>
        </View>

        <View style={styles.paymentNote}>
          <MaterialCommunityIcons name="information" size={20} color={COLORS.primary} />
          <Text style={styles.paymentNoteText}>
            You will be redirected to a secure payment gateway. All major UPI apps including 
            GPay, PhonePe, Paytm, and BHIM are supported.
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(2)}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePayment}
            disabled={loading}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={COLORS.gradientPrimary}
              style={[styles.button, { flex: 1 }]}
            >
              <MaterialCommunityIcons name="lock" size={20} color={COLORS.white} />
              <Text style={styles.buttonText}>
                {loading ? 'Processing...' : 'Proceed to Pay'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.white} />
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.headerTitle}>Campaigns</Text>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => router.push('/applications')}
        >
          <MaterialCommunityIcons name="account-check" size={24} color={THEME.primary} />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.sliderContainer}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setCurrentSlide(Math.round(e.nativeEvent.contentOffset.x / WIDTH))}
        />
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View key={index} style={[styles.dot, currentSlide === index && styles.dotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.createButton} onPress={() => setShowForm(true)}>
          <LinearGradient colors={[THEME.primary, THEME.primaryDark]} style={styles.createGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <MaterialCommunityIcons name="plus" size={24} color={THEME.white} />
            <Text style={styles.createButtonText}>Create New Campaign</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.viewApplicantsButton} onPress={() => router.push('/applications')}>
          <MaterialCommunityIcons name="account-group" size={24} color={THEME.primary} />
          <Text style={styles.viewApplicantsText}>View Applicants</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={THEME.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.myCampaignsButton} onPress={() => router.push('/(brand-tabs)/record')}>
          <MaterialCommunityIcons name="clipboard-list" size={24} color={THEME.textSecondary} />
          <Text style={styles.myCampaignsText}>My Campaigns</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={THEME.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Form Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { if (step === 2) setStep(1); else { setShowForm(false); resetForm(); } }}>
              <MaterialCommunityIcons name={step === 2 ? "arrow-left" : "close"} size={28} color={THEME.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{step === 1 ? 'Campaign Details' : 'Requirements'}</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotActive]}><Text style={styles.stepNumberActive}>1</Text></View>
            <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step === 2 && styles.stepDotActive]}><Text style={[styles.stepNumber, step === 2 && styles.stepNumberActive]}>2</Text></View>
          </View>

          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
              {step === 1 ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Campaign Name</Text>
                    <View style={styles.inputWrapper}>
                      <MaterialCommunityIcons name="bullhorn-outline" size={22} color={THEME.textMuted} />
                      <TextInput style={styles.input} value={campaignName} onChangeText={setCampaignName} placeholder="e.g., Summer Ethnic Wear Reel Collection Drop" placeholderTextColor={THEME.textMuted} />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Target Location</Text>
                    <View style={styles.inputWrapper}>
                      <MaterialCommunityIcons name="map-marker-outline" size={22} color={THEME.textMuted} />
                      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g., Mumbai, Delhi, Bangalore, All India" placeholderTextColor={THEME.textMuted} />
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
                    
                    {/* Selected Image Preview */}
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

                    {/* Dual Action Buttons: Gallery & Camera */}
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

                    {/* Optional URL Input */}
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
                      <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="e.g., Shoot a 30s Reel showcasing our summer collection in natural sunlight. Tag @krishnaprivatelimited and use hashtag #SummerVibes." placeholderTextColor={THEME.textMuted} multiline numberOfLines={4} />
                    </View>
                  </View>

                  <TouchableOpacity style={styles.primaryButton} onPress={() => validateStep1() && setStep(2)}>
                    <LinearGradient colors={[THEME.primary, THEME.primaryDark]} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      <Text style={styles.buttonText}>Continue</Text>
                      <MaterialCommunityIcons name="arrow-right" size={22} color={THEME.white} />
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Content Type</Text>
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
                    <Text style={styles.label}>Number of Influencers</Text>
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
                      <Text style={styles.label}>Cost per Influencer (Rs)</Text>
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
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15, backgroundColor: THEME.white },
  headerTitle: { fontSize: 28, fontWeight: '800', color: THEME.text },
  headerButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.surface, justifyContent: 'center', alignItems: 'center' },
  sliderContainer: { flex: 1, backgroundColor: THEME.surface },
  slide: { width: WIDTH, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  imageContainer: { width: WIDTH * 0.85, height: HEIGHT * 0.35, justifyContent: 'center', alignItems: 'center' },
  slideImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  textContainer: { alignItems: 'center', paddingHorizontal: 20, marginTop: 20 },
  slideTitle: { fontSize: 26, fontWeight: '800', color: THEME.text, textAlign: 'center', marginBottom: 12 },
  slideSubtitle: { fontSize: 16, color: THEME.textSecondary, textAlign: 'center', lineHeight: 24 },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.border, marginHorizontal: 4 },
  dotActive: { width: 24, backgroundColor: THEME.primary },
  actionContainer: { padding: 20, paddingBottom: 200, backgroundColor: THEME.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
  createButton: { borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  createGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  createButtonText: { fontSize: 17, fontWeight: '700', color: THEME.white },
  viewApplicantsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.surface, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, marginBottom: 12, borderWidth: 1, borderColor: THEME.border },
  viewApplicantsText: { flex: 1, fontSize: 16, fontWeight: '600', color: THEME.primary, marginLeft: 12 },
  myCampaignsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.surface, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, borderWidth: 1, borderColor: THEME.border },
  myCampaignsText: { flex: 1, fontSize: 16, fontWeight: '600', color: THEME.textSecondary, marginLeft: 12 },
  modalContainer: { flex: 1, backgroundColor: THEME.white },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: THEME.border },
  modalTitle: { fontSize: 20, fontWeight: '700', color: THEME.text },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  stepDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: THEME.border, justifyContent: 'center', alignItems: 'center' },
  stepDotActive: { backgroundColor: THEME.primary },
  stepNumber: { fontSize: 16, fontWeight: '700', color: THEME.textMuted },
  stepNumberActive: { color: THEME.white },
  stepLine: { width: 60, height: 3, backgroundColor: THEME.border, marginHorizontal: 8 },
  stepLineActive: { backgroundColor: THEME.primary },
  formScroll: { flex: 1 },
  formContent: { padding: 20, paddingBottom: 120 },
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: THEME.textSecondary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: THEME.text, marginTop: 20, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: THEME.textSecondary, textAlign: 'center', lineHeight: 22 },
  applicantsList: { padding: 16, paddingBottom: 100 },
  applicantCard: { backgroundColor: THEME.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: THEME.border },
  applicantHeader: { flexDirection: 'row', alignItems: 'center' },
  applicantAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: 56, height: 56, borderRadius: 28 },
  applicantInfo: { flex: 1, marginLeft: 14 },
  applicantName: { fontSize: 17, fontWeight: '700', color: THEME.text },
  applicantEmail: { fontSize: 13, color: THEME.textSecondary, marginTop: 2 },
  applicantMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  metaText: { fontSize: 12, color: THEME.primary, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#FEF3C7' },
  statusApproved: { backgroundColor: '#D1FAE5' },
  statusRejected: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 10, fontWeight: '700', color: '#D97706' },
  campaignInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: THEME.border, gap: 8 },
  campaignText: { fontSize: 13, color: THEME.textSecondary },
  actionButtons: { flexDirection: 'row', marginTop: 14, gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, gap: 6 },
  approveBtn: { backgroundColor: THEME.success },
  rejectBtn: { backgroundColor: THEME.danger },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: THEME.white },
});
