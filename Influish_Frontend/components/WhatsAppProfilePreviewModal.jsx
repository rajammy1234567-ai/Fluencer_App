import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WhatsAppProfilePreviewModal({
  visible,
  imageUri,
  userName = 'Profile Preview',
  onClose,
  onConfirm,
  onChooseAnother,
  uploading = false,
}) {
  if (!visible || !imageUri) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header Bar */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={onClose} disabled={uploading}>
              <MaterialCommunityIcons name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.headerTitle} numberOfLines={1}>
              {userName}
            </Text>

            {onChooseAnother ? (
              <TouchableOpacity style={styles.iconButton} onPress={onChooseAnother} disabled={uploading}>
                <MaterialCommunityIcons name="pencil" size={22} color="#C084FC" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>WhatsApp-style Profile Preview</Text>

          {/* WhatsApp Circular Avatar Preview Container */}
          <View style={styles.previewContainer}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: imageUri }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
              <View style={styles.avatarBorderOverlay} />
            </View>

            <Text style={styles.helperText}>
              This is how your profile picture will look to brands & creators across Fluencer.
            </Text>
          </View>

          {/* Action Buttons Bar */}
          <View style={styles.actionsBar}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={uploading}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtnWrap}
              onPress={onConfirm}
              disabled={uploading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#7C3AED', '#6D28FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmBtn}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.confirmText}>Set Profile Photo</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarWrap: {
    width: Math.min(SCREEN_WIDTH * 0.72, 280),
    height: Math.min(SCREEN_WIDTH * 0.72, 280),
    borderRadius: Math.min(SCREEN_WIDTH * 0.72, 280) / 2,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
    backgroundColor: '#14141C',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarBorderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Math.min(SCREEN_WIDTH * 0.72, 280) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  helperText: {
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 28,
    maxWidth: 300,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#0B0B10',
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '700',
    fontSize: 14.5,
  },
  confirmBtnWrap: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  confirmBtn: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
