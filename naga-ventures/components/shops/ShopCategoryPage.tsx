import { ShopColors } from '@/constants/ShopColors';
import type { ShopData } from '@/types/shop';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShopCard from './ShopCard';

interface ShopCategoryPageProps {
  category: {
    id: string;
    name: string;
    icon: string;
  } | null;
  shops: ShopData[];
}

const ShopCategoryPage: React.FC<ShopCategoryPageProps> = ({
  category,
  shops,
}) => {
  // Handle case where category is not found
  if (!category) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: ShopColors.background }}
        edges={['top']}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: 'Poppins-SemiBold',
              color: ShopColors.textPrimary,
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            Category Not Found
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'Poppins-Regular',
              color: ShopColors.textSecondary,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            The category you are looking for does not exist.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: ShopColors.accent,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontFamily: 'Poppins-Medium',
                fontSize: 16,
              }}
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ShopColors.background,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    statsContainer: {
      backgroundColor: ShopColors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: ShopColors.border,
    },
    shopCount: {
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      color: ShopColors.textPrimary,
      marginBottom: 4,
    },
    shopCountSubtext: {
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: ShopColors.textSecondary,
    },
    gridContainer: {
      justifyContent: 'space-between',
    },
    shopCard: {
      width: '48%',
      marginBottom: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyIcon: {
      backgroundColor: ShopColors.cardBackground,
      borderRadius: 32,
      width: 64,
      height: 64,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: ShopColors.border,
    },
    emptyTitle: {
      fontSize: 18,
      fontFamily: 'Poppins-SemiBold',
      color: ShopColors.textPrimary,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
      color: ShopColors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
  });

  const handleShopPress = (shopId: string) => {
    router.push(`/TouristApp/(tabs)/(home)/(shops)/(details)/${shopId}`);
  };

  const renderShopCard = ({ item }: { item: ShopData }) => (
    <View style={styles.shopCard}>
      <ShopCard
        shop={item}
        onPress={handleShopPress}
        showRating={true}
        showCategory={false}
      />
    </View>
  );
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <Text style={styles.shopCount}>
            {shops.length} {shops.length === 1 ? 'Shop' : 'Shops'}
          </Text>
          <Text style={styles.shopCountSubtext}>
            Browse all {category.name.toLowerCase()} shops in your area
          </Text>
        </View>

        {shops.length > 0 ? (
          <FlatList
            data={shops}
            renderItem={renderShopCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>

              <Ionicons
                name="storefront-outline"
                size={32}
                color={ShopColors.textSecondary}
              />
            </View>
            <Text style={styles.emptyTitle}>No Shops Found</Text>
            <Text style={styles.emptyText}>
              There are currently no shops available in the
              {category.name.toLowerCase()} category. Please check back later or
              explore other categories.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ShopCategoryPage;
