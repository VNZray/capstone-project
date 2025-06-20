import { SkeletonCardList } from '@/components/shops/SkeletonCard';
import SpecialOfferCard from '@/components/shops/SpecialOfferCard';
import { ShopColors } from '@/constants/ShopColors';
import { useAllSpecialOffers } from '@/hooks/useShops';
import { ShopNavigator } from '@/navigation/ShopNavigator';
import { SpecialOffer } from '@/types/shop';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const SpecialOffersSection = () => {
  const { data: specialOffersData, isLoading, error } = useAllSpecialOffers();

  const handleSpecialOfferPress = (offerId: string) => {
    ShopNavigator.goToSpecialOfferDetails(offerId);
  };

  const handleViewAllSpecialOffers = () => {
    // Navigate to a new screen that shows a ShopGridScreen of all special offers.
    // This navigation path needs to be defined in your navigator.
    // Example: router.push('/TouristApp/(tabs)/(home)/(shops)/all-special-offers');
    ShopNavigator.goToAllSpecialOffers(); // Assuming this function is updated or will be created
    // to navigate to a screen listing all offers.
  };
  const renderSpecialOfferCard = ({ item }: { item: SpecialOffer }) => (
    <SpecialOfferCard offer={item} onPress={handleSpecialOfferPress} />
  );

  // Use a skeleton loader for a better UX
  if (isLoading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
        </View>
        <SkeletonCardList count={3} horizontal={true} />
      </View>
    );
  }

  if (error) {
    // In a section, it's often better to just show nothing than a large error block.
    // Or show a smaller, inline error. For now, we'll return null.
    return null;
  }

  if (!specialOffersData || specialOffersData.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Special Offers</Text>
        <TouchableOpacity
          style={styles.viewAllButton} // Re-added View All button
          onPress={handleViewAllSpecialOffers}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={ShopColors.accent}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={specialOffersData}
        renderItem={renderSpecialOfferCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContentContainer}
        ItemSeparatorComponent={() => (
          <View style={styles.horizontalListItemSeparator} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
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
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.accent,
    marginRight: 4,
  },
  horizontalListContentContainer: { paddingHorizontal: 16 },
  horizontalListItemSeparator: { width: 12 },
});
