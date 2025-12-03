import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import type { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  colors: typeof Colors.light;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  colors,
}) => {
  return (
    <View style={styles.categoriesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => onCategoryChange(cat)}
            style={[
              styles.categoryPill,
              activeCategory === cat
                ? { backgroundColor: '#0F2043', borderColor: '#0F2043' }
                : {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
            ]}
          >
            <ThemedText
              type="label-medium"
              weight="semi-bold"
              style={{
                color:
                  activeCategory === cat ? '#FFFFFF' : colors.textSecondary,
              }}
            >
              {cat}
            </ThemedText>
          </Pressable>
        ))}
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
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
});
