import { ShopColors } from '@/constants/ShopColors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FeaturedShopCard from './FeaturedShopCard';
import type { ShopCarouselProps } from './types';

const ShopCarousel: React.FC<ShopCarouselProps> = ({
  shops,
  onShopPress,
  onViewAllPress,
  title = 'Featured Shops',
  showViewAll = true,
}) => {
  const styles = StyleSheet.create({
    container: {
      marginBottom: 0, // Remove bottom margin - handled by parent
      backgroundColor: ShopColors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16, // Reduced from 20
      marginBottom: 8, // Reduced from 16
    },
    title: {
      fontSize: 18, // Reduced from 20
      fontFamily: 'Poppins-SemiBold',
      color: ShopColors.textPrimary,
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    viewAllText: {
      fontSize: 14, // Reduced from 16
      fontFamily: 'Poppins-Medium',
      color: ShopColors.accent,
      marginRight: 4,
    },
    listContentContainer: {
      paddingHorizontal: 16, // Reduced from 20
      paddingVertical: 0, // Removed vertical padding
    },
    separator: {
      width: 12, // Reduced from 16
    },
  });

  const renderFeaturedCard = ({
    item,
  }: {
    item: ShopCarouselProps['shops'][0];
  }) => <FeaturedShopCard shop={item} onPress={onShopPress} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>

        {showViewAll && onViewAllPress && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={onViewAllPress}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons
              name="chevron-forward"
              size={14} // Reduced from 16
              color={ShopColors.accent}
            />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={shops}
        renderItem={renderFeaturedCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        getItemLayout={(data, index) => ({
          length: 268,
          offset: 268 * index,
          index,
        }) // Adjusted for smaller cards
        }
      />
    </View>
  );
};

export default ShopCarousel;
