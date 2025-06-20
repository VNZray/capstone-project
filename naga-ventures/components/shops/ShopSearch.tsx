import { ShopColors } from '@/constants/ShopColors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { ShopSearchProps } from './types';

const ShopSearch: React.FC<ShopSearchProps> = ({
  onSearch,
  placeholder = 'Search shops...',
  value = '',
}) => {
  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16, // Reduced from 20
      paddingVertical: 8, // Reduced from 12
      backgroundColor: ShopColors.background,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: ShopColors.cardBackground,
      borderRadius: 10, // Slightly smaller radius
      paddingHorizontal: 14, // Reduced from 16
      paddingVertical: 10, // Reduced from 12
      borderWidth: 1,
      borderColor: ShopColors.border,
      shadowColor: ShopColors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    searchIcon: {
      marginRight: 10, // Reduced from 12
    },
    searchInput: {
      flex: 1,
      fontSize: 15, // Reduced from 16
      fontFamily: 'Poppins-Regular',
      color: ShopColors.textPrimary,
      padding: 0,
    },
    clearButton: {
      marginLeft: 6, // Reduced from 8
      padding: 4,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={18} // Reduced from 20
          color={ShopColors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={ShopColors.textSecondary}
          value={value}
          onChangeText={onSearch}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <Ionicons
            name="close-circle"
            size={18} // Reduced from 20
            color={ShopColors.textSecondary}
            style={styles.clearButton}
            onPress={() => onSearch('')}
          />
        )}
      </View>
    </View>
  );
};

export default ShopSearch;
