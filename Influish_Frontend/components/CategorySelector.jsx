import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

const CategorySelector = ({ categories, selected, onToggle, onSelectAll, onUnselectAll }) => {
  const hasSelection = selected.length > 0;
  const allSelected = selected.length === categories.length;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Select Brand Categories</Text>
      <Text style={styles.subtitle}>Choose one or more categories to find brands</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* All Button */}
        <TouchableOpacity
          onPress={onSelectAll}
          style={[
            styles.chip,
            styles.specialChip,
            allSelected && styles.activeChip
          ]}
          activeOpacity={0.7}
        >
          {allSelected && (
            <Ionicons name="checkmark-circle" size={16} color={COLORS.textWhite} style={styles.icon} />
          )}
          <Text style={[
            styles.text,
            styles.specialText,
            allSelected && styles.activeText
          ]}>
            All
          </Text>
        </TouchableOpacity>

        {/* Unselect Button */}
        {hasSelection && (
          <TouchableOpacity
            onPress={onUnselectAll}
            style={[styles.chip, styles.unselectChip]}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={16} color="#FF4458" style={styles.icon} />
            <Text style={[styles.text, styles.unselectText]}>
              Unselect All
            </Text>
          </TouchableOpacity>
        )}

        {categories.map(cat => {
          const isActive = selected.includes(cat);
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => onToggle(cat)}
              style={[
                styles.chip,
                isActive && styles.activeChip
              ]}
              activeOpacity={0.7}
            >
              {isActive && (
                <Ionicons name="checkmark-circle" size={16} color={COLORS.textWhite} style={styles.icon} />
              )}
              <Text style={[
                styles.text,
                isActive && styles.activeText
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  container: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: COLORS.gray[100],
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    marginHorizontal: 4,
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeText: {
    color: COLORS.textWhite,
  },
  specialChip: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.blue[50],
  },
  specialText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  unselectChip: {
    borderWidth: 2,
    borderColor: '#FF4458',
    backgroundColor: '#FFF5F7',
  },
  unselectText: {
    fontWeight: '700',
    color: '#FF4458',
  },
});

export default CategorySelector;
