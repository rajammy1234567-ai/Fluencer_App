/**
 * SearchBar Component
 * Search input for filtering users
 */

import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const SearchBar = ({ value, onChangeText, placeholder }) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons 
        name="magnify" 
        size={20} 
        color={COLORS.gray[500]} 
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Search...'}
        placeholderTextColor={COLORS.gray[500]}
      />
      {value ? (
        <MaterialCommunityIcons 
          name="close-circle" 
          size={20} 
          color={COLORS.gray[500]} 
          style={styles.clearIcon}
          onPress={() => onChangeText('')}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: COLORS.primaryDark,
  },
  clearIcon: {
    marginLeft: 8,
  },
});

export default SearchBar;
