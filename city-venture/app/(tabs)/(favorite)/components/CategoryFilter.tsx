import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Chip from '@/components/Chip';
import type { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <View style={styles.categoriesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((cat) => {
          const active = activeCategory === cat;
          return (
            <Chip
              key={cat}
              label={cat}
              variant={active ? 'solid' : 'outlined'}
              color={active ? 'primary' : 'neutral'}
              size="medium"
              onPress={() => onCategoryChange(cat)}
              style={{ marginRight: 8 }}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesContainer: {
    marginBottom: 16,
    height: 40,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
});
