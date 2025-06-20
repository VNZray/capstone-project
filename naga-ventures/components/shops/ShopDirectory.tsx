import { ShopColors } from '@/constants/ShopColors';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import SearchInput from './SearchInput';
import SearchResultsList from './SearchResultsList';

// Import self-contained sections
import {
  CategoriesSection,
  DiscoverMoreSection,
  FeaturedSection,
  RecommendedSection,
  SpecialOffersSection,
} from './sections';

interface ShopDirectoryProps {
  categories: {
    id: string;
    name: string;
    icon: string;
  }[];
}

const ShopDirectory: React.FC<ShopDirectoryProps> = ({ categories }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ShopColors.background,
    },
    content: {
      paddingTop: 0,
    },
    scrollViewContent: {
      paddingBottom: 16,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SearchInput onSearch={setSearchQuery} value={searchQuery} />

        {!searchQuery.trim() ? (
          <>
            <FeaturedSection />
            <SpecialOffersSection />
            <CategoriesSection categories={categories} />
            <RecommendedSection />
            <DiscoverMoreSection />
          </>
        ) : (
          <SearchResultsList query={searchQuery} />
        )}
      </ScrollView>
    </View>
  );
};

export default ShopDirectory;
