import { ShopColors } from '@/constants/ShopColors';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type PhotoFilterType = 'all' | 'shop' | 'product' | 'ambiance' | 'customer';

interface ShopDetailPhotoFilterChipsProps {
  activeFilter: PhotoFilterType;
  onFilterSelect: (filter: PhotoFilterType) => void;
}

const FILTERS: { label: string; value: PhotoFilterType }[] = [
  { label: 'All Photos', value: 'all' },
  { label: 'Interior', value: 'shop' },
  { label: 'Menu & Food', value: 'product' },
  { label: 'Vibe', value: 'ambiance' },
  { label: 'Visitors', value: 'customer' },
];

const ShopDetailPhotoFilterChips: React.FC<ShopDetailPhotoFilterChipsProps> = ({
  activeFilter,
  onFilterSelect,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.chip,
                isActive && styles.chipActive,
              ]}
              onPress={() => onFilterSelect(filter.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive && styles.chipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  chipActive: {
    backgroundColor: ShopColors.accent,
    borderColor: ShopColors.accent,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});

export default ShopDetailPhotoFilterChips;

