import { ShopColors } from '@/constants/ShopColors';
import type { ShopData } from '@/types/shop';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import DiscoverMoreShopCard from './DiscoverMoreShopCard';

interface DiscoverMoreShopListProps {
  shops: ShopData[];
  onShopPress: (shopId: string) => void;
  title?: string;
  emptyMessage?: string;
}

const DiscoverMoreShopList: React.FC<DiscoverMoreShopListProps> = ({
  shops,
  onShopPress,
  title = 'Discover More',
  emptyMessage = 'No more shops to discover.',
}) => {
  const styles = StyleSheet.create({
    componentContainer: {
      // No margin - handled by parent
    },
    titleText: {
      fontSize: 18, // Reduced from 20 to match other sections
      fontFamily: 'Poppins-SemiBold',
      color: ShopColors.textPrimary,
      paddingHorizontal: 16, // Reduced from 20
      marginBottom: 8, // Reduced from 16
    },
    listContentContainer: {
      paddingHorizontal: 16, // Reduced from 20
      paddingBottom: 0, // Removed bottom padding
    },
    cardItemWrapper: {
      marginBottom: 12, // Reduced from 16
    },
    emptyListContainer: {
      paddingVertical: 12, // Reduced from 20
      alignItems: 'center',
    },
    emptyListText: {
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: ShopColors.textSecondary,
      textAlign: 'center',
    },
  });
  const renderShopItem = ({ item }: { item: ShopData }) => (
    <View style={styles.cardItemWrapper}>
      <DiscoverMoreShopCard shop={item} onPress={onShopPress} />
    </View>
  );

  if (shops.length === 0 && !title) {
    return null;
  }

  if (shops.length === 0) {
    return (
      <View style={styles.componentContainer}>
        {title && <Text style={styles.titleText}>{title}</Text>}
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>{emptyMessage}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.componentContainer}>
      {title && <Text style={styles.titleText}>{title}</Text>}
      <FlatList
        data={shops}
        renderItem={renderShopItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
        scrollEnabled={false}
      />
    </View>
  );
};

export default DiscoverMoreShopList;
