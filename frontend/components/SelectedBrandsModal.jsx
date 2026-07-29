import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

const SelectedBrandsModal = ({ visible, onClose, brands }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="heart" size={24} color={COLORS.primary} />
              <Text style={styles.headerTitle}>Selected Brands</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Brands List */}
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {brands.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💔</Text>
                <Text style={styles.emptyText}>No brands selected yet</Text>
              </View>
            ) : (
              <View style={styles.brandsList}>
                {brands.map((brand, index) => (
                  <View key={brand.id} style={styles.brandCard}>
                    <View style={styles.brandNumber}>
                      <Text style={styles.numberText}>{index + 1}</Text>
                    </View>
                    
                    <Image source={brand.image} style={styles.brandImage} />
                    
                    <View style={styles.brandInfo}>
                      <View style={styles.brandNameRow}>
                        <Text style={styles.brandName}>{brand.name}</Text>
                        {brand.verified && (
                          <MaterialIcons name="verified" size={18} color={COLORS.primary} />
                        )}
                      </View>
                      
                      <Text style={styles.brandCategory}>{brand.category}</Text>
                      
                      <View style={styles.brandRating}>
                        <Ionicons name="star" size={14} color="#FFB800" />
                        <Text style={styles.ratingText}>{brand.rating}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          {brands.length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity style={styles.proceedButton} activeOpacity={0.8}>
                <Text style={styles.proceedText}>Proceed with {brands.length} brand{brands.length !== 1 ? 's' : ''}</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.textWhite} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: LAYOUT.borderRadius.xl,
    borderTopRightRadius: LAYOUT.borderRadius.xl,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: LAYOUT.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  brandsList: {
    padding: LAYOUT.spacing.md,
  },
  brandCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: LAYOUT.borderRadius.md,
    padding: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  brandNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.spacing.md,
  },
  numberText: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
  brandImage: {
    width: 60,
    height: 60,
    borderRadius: LAYOUT.borderRadius.sm,
    backgroundColor: COLORS.gray[100],
    marginRight: LAYOUT.spacing.md,
  },
  brandInfo: {
    flex: 1,
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  brandCategory: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  brandRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  footer: {
    padding: LAYOUT.spacing.lg,
    paddingTop: LAYOUT.spacing.md,
  },
  proceedButton: {
    backgroundColor: COLORS.primary,
    borderRadius: LAYOUT.borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: LAYOUT.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  proceedText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SelectedBrandsModal;
