import { ShopColors } from '@/constants/color';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type FilterType = 'all' | 'recent' | 'highest' | 'lowest' | 'photos';

interface ShopDetailFilterChipsProps {
  activeFilter: FilterType;
  onFilterSelect: (filter: FilterType) => void;
}

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All Reviews', value: 'all' },
  { label: 'Most Recent', value: 'recent' },
  { label: 'Highest Rated', value: 'highest' },
  { label: 'Lowest Rated', value: 'lowest' },
  { label: 'With Photos', value: 'photos' },
];

const ShopDetailFilterChips: React.FC<ShopDetailFilterChipsProps> = ({
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

export default ShopDetailFilterChips;

