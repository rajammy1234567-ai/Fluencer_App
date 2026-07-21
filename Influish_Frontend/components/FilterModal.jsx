import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Dimensions, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const FilterModal = ({ visible, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('Category');
  const [selectedFilters, setSelectedFilters] = useState({});

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5; // Only respond to downward swipes
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Optional: Add visual feedback during drag
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) { // If swiped down more than 100px
          onClose();
        }
      },
    })
  ).current;

  const filterData = {
    Category: ['Medicine', 'Sports', 'Technology', 'Fashion', 'Food & Beverage', 'Travel', 'Fitness', 'Beauty'],
    Songs: ['Romantic', 'Pop', 'Hip Hop', 'Rock', 'Jazz', 'Classical', 'EDM', 'Country'],
    'Video Type': ['Reels', 'Stories', 'Posts', 'IGTV', 'Live', 'Carousel'],
    Budget: ['Under ₹5000', '₹5000-₹10000', '₹10000-₹25000', '₹25000-₹50000', 'Above ₹50000'],
    Duration: ['1-7 Days', '8-15 Days', '16-30 Days', '1-3 Months', 'Long Term'],
    'Brand Size': ['Startup', 'Small Business', 'Medium Enterprise', 'Large Corporation'],
  };

  const toggleFilter = (category, option) => {
    const key = `${category}-${option}`;
    setSelectedFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({});
  };

  const applyFilters = () => {
    // Here you can handle the filter application logic
    console.log('Applied Filters:', selectedFilters);
    onClose();
  };

  const selectedCount = Object.values(selectedFilters).filter(Boolean).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity 
          style={styles.backdropTouchable} 
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.container}>
          {/* Handle Bar with Pan Responder */}
          <View {...panResponder.panHandlers} style={styles.handleBarContainer}>
            <View style={styles.handleBar} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter Brands</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#373233" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.content}>
            {/* Left Sidebar */}
            <View style={styles.sidebar}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {Object.keys(filterData).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.sidebarItem,
                      selectedCategory === category && styles.sidebarItemActive
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <View style={[
                      styles.categoryDot,
                      selectedCategory === category && styles.categoryDotActive
                    ]} />
                    <Text style={[
                      styles.sidebarText,
                      selectedCategory === category && styles.sidebarTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Right Options */}
            <View style={styles.optionsContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.categoryTitle}>{selectedCategory}</Text>
                {filterData[selectedCategory]?.map((option) => {
                  const key = `${selectedCategory}-${option}`;
                  const isSelected = selectedFilters[key];
                  
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                      onPress={() => toggleFilter(selectedCategory, option)}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {option}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color="#826FCC" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Ionicons name="funnel" size={20} color="#fff" style={styles.applyIcon} />
              <Text style={styles.applyText}>
                Apply Filters {selectedCount > 0 ? `(${selectedCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  container: {
    height: height * 0.85,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handleBarContainer: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D0D0D0',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#030303',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  clearButton: {
    paddingVertical: 4,
  },
  clearText: {
    fontSize: 15,
    color: '#826FCC',
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7F6F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '38%',
    backgroundColor: '#FAFAFA',
    paddingTop: 8,
  },
  sidebarItem: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sidebarItemActive: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#826FCC',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  categoryDotActive: {
    backgroundColor: '#826FCC',
  },
  sidebarText: {
    fontSize: 15,
    color: '#7C7474',
  },
  sidebarTextActive: {
    fontWeight: '700',
    color: '#826FCC',
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#030303',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#F7F6F7',
  },
  optionItemSelected: {
    backgroundColor: '#F0E8FF',
    borderWidth: 1.5,
    borderColor: '#826FCC',
  },
  optionText: {
    fontSize: 15,
    color: '#373233',
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#826FCC',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  applyButton: {
    backgroundColor: '#826FCC',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#826FCC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  applyIcon: {
    marginRight: 4,
  },
  applyText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default FilterModal;
