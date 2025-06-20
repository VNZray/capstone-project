import { ShopColors } from '@/constants/ShopColors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ShopCard from './ShopCard';
import type { ShopListProps } from './types';

const ShopList: React.FC<ShopListProps> = ({
  shops,
  onShopPress,
  title,
  horizontal = false,
  showRating = true,
  showCategory = true,
  showViewAll = true,
  onViewAllPress,
  emptyMessage = 'No shops found',
  width = 180,
  gridLayout = false,
  numColumns = 2,
}) => {
  const styles = StyleSheet.create({
    container: {
      marginBottom: 8, // Standardized spacing for drop shadow
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 16,
    },
    title: {
      fontSize: 18, // Standardized title size
      fontFamily: 'Poppins-SemiBold',
      color: ShopColors.textPrimary,
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewAllText: {
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      color: ShopColors.accent,
      marginRight: 4,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 8, // Standardized bottom padding for drop shadow
      gap: 12, // Standardized gap between cards
    },
    verticalContainer: {
      paddingHorizontal: 20,
    },
    verticalCard: {
      marginBottom: 16,
      width: '100%',
    },
    emptyContainer: {
      padding: 20,
      borderRadius: 12,
      marginHorizontal: 20,
      alignItems: 'center',
      backgroundColor: ShopColors.cardBackground,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: ShopColors.textSecondary,
      textAlign: 'center',
    },
    gridContainer: {
      paddingHorizontal: 14, // Reduced to account for item padding
      paddingTop: 0,
    },
    gridItemContainer: {
      flex: 1,
      marginBottom: 16,
      paddingHorizontal: 6,
    },
  });

  // Handle empty state with beautiful design
  if (shops.length === 0) {
    return (
      <View style={styles.container}>
        {title && (
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>
        )}
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Beautiful standardized header */}
      {title && (
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{title}</Text>
          {showViewAll && onViewAllPress && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={onViewAllPress}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={ShopColors.accent}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Horizontal, vertical, or grid list with beautiful styling */}
      {gridLayout ? (
        <FlatList
          data={shops}
          renderItem={({ item }) => (
            <View style={styles.gridItemContainer}>
              <ShopCard
                shop={item}
                onPress={onShopPress}
                showRating={showRating}
                showCategory={showCategory}
                width={undefined}
              />
            </View>
          )}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          numColumns={numColumns}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      ) : horizontal ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {shops.map((shop) => (
            <ShopCard
              key={shop.id?.toString() || Math.random().toString()}
              shop={shop}
              onPress={onShopPress}
              showRating={showRating}
              showCategory={showCategory}
              width={horizontal ? width : undefined}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.verticalContainer}>
          {shops.map((shop) => (
            <View
              key={shop.id?.toString() || Math.random().toString()}
              style={styles.verticalCard}
            >
              <ShopCard
                shop={shop}
                onPress={onShopPress}
                showRating={showRating}
                showCategory={showCategory}
                width={width} // Full width for vertical
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default ShopList;
