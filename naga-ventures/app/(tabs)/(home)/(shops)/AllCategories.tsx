import { ErrorState } from '@/components/shops/ErrorState';
import { ShopColors } from '@/constants/ShopColors';
import { useMainCategories } from '@/hooks/useShops';
import { ShopNavigator } from '@/navigation/ShopNavigator';
import type { MainCategory, ShopCategory } from '@/types/shop';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const SUBCATEGORY_GAP = 12;
const SUBCATEGORIES_PER_ROW = 3;
const SUBCATEGORY_WIDTH =
  (width - SUBCATEGORY_GAP * (SUBCATEGORIES_PER_ROW + 1)) /
  SUBCATEGORIES_PER_ROW;

const AllCategoriesPage = () => {
  const {
    data: mainCategoriesData,
    isLoading,
    isError,
    refetch,
  } = useMainCategories();

  const handleMainCategoryPress = (mainCategoryId: string) => {
    ShopNavigator.goToMainCategory(mainCategoryId);
  };
  const handleSubcategoryPress = (subcategoryId: string) => {
    ShopNavigator.goToSubcategory(subcategoryId);
  };

  const renderSubcategoryItem = ({
    item,
    index,
  }: {
    item: ShopCategory;
    index: number;
  }) => {
    const isLastInRow = (index + 1) % SUBCATEGORIES_PER_ROW === 0;
    const iconName =
      item.icon && typeof item.icon === 'string' && item.icon.trim() !== ''
        ? item.icon
        : 'help-circle-outline'; // A default fallback icon

    return (
      <TouchableOpacity
        style={[
          styles.subcategoryCard,
          {
            backgroundColor: ShopColors.subcategoryCard,
            borderColor: ShopColors.subcategoryBorder,
            width: SUBCATEGORY_WIDTH,
            marginRight: isLastInRow ? 0 : SUBCATEGORY_GAP,
          },
        ]}
        onPress={() => handleSubcategoryPress(item.id)}
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel={item.name}
        accessibilityRole="button"
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: ShopColors.accent + '20' },
          ]}
        >
          <Ionicons
            name={iconName as any} // Use the verified or fallback iconName
            size={24}
            color={ShopColors.accent}
          />
        </View>
        <Text
          style={[styles.subcategoryTitle, { color: ShopColors.textPrimary }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMainCategorySection = (mainCategory: MainCategory) => {
    const subcategoryCount = mainCategory.subcategories.length;

    return (
      <View key={mainCategory.id} style={styles.sectionContainer}>
        {/* Main Category Header */}
        <View style={styles.sectionHeader}>
          <TouchableOpacity
            style={styles.mainCategoryButton}
            onPress={() => handleMainCategoryPress(mainCategory.id)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel={`View all ${mainCategory.name} businesses`}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.mainCategoryTitle,
                { color: ShopColors.textPrimary },
              ]}
            >
              {mainCategory.name}
            </Text>
            <Text
              style={[
                styles.subcategoryCount,
                { color: ShopColors.textSecondary },
              ]}
            >
              {subcategoryCount}{' '}
              {subcategoryCount === 1 ? 'category' : 'categories'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => handleMainCategoryPress(mainCategory.id)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel={`See all ${mainCategory.name}`}
            accessibilityRole="button"
          >
            <Text style={[styles.seeAllText, { color: ShopColors.textAccent }]}>
              See All
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={ShopColors.textAccent}
            />
          </TouchableOpacity>
        </View>

        {/* Divider Line */}
        <View
          style={[styles.divider, { backgroundColor: ShopColors.divider }]}
        />

        {/* Subcategories Grid */}
        <FlatList
          data={mainCategory.subcategories}
          renderItem={renderSubcategoryItem}
          keyExtractor={(item) => item.id}
          numColumns={SUBCATEGORIES_PER_ROW}
          scrollEnabled={false}
          contentContainerStyle={styles.subcategoriesGrid}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  // 3. Handle Loading State
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={ShopColors.accent} />
      </View>
    );
  }

  // 4. Handle Error State
  if (isError) {
    return (
      <ErrorState
        message="Could not load shop categories. Please try again."
        onRetry={refetch}
      />
    );
  }

  // 5. Handle Empty State (API returns no categories)
  if (!mainCategoriesData || mainCategoriesData.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No categories found.</Text>
      </View>
    );
  }

  // 6. Render the final UI with the fetched data
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mainCategoriesData.map((mainCategory, index) =>
          renderMainCategorySection(mainCategory)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ShopColors.background,
  },
  scrollContent: {
    paddingVertical: 16, // Changed from paddingVertical to only apply bottom padding
  },
  sectionContainer: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  mainCategoryButton: {
    flex: 1,
  },
  mainCategoryTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    marginBottom: 2,
  },
  subcategoryCount: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  subcategoriesGrid: {
    paddingBottom: 8,
  },
  gridRow: {
    justifyContent: 'flex-start',
    marginBottom: SUBCATEGORY_GAP,
  },
  subcategoryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    shadowColor: ShopColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  subcategoryTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default AllCategoriesPage;
