import { ErrorState } from '@/components/shops/ErrorState';
import SpecialOfferDetailSkeleton from '@/components/shops/skeletons/SpecialOfferDetailSkeleton';
import { ShopColors } from '@/constants/ShopColors';
import { useSpecialOffer } from '@/hooks/useShops';
import { ShopNavigator } from '@/navigation/ShopNavigator';
import { SpecialOffer } from '@/types/shop';
import { formatDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Sub-component to cleanly handle the shop link logic
const ShopLinkSection = ({ offer }: { offer: SpecialOffer }) => {
  if (offer.applicableToAllShops) {
    return (
      <View style={styles.infoSection}>
        <Ionicons
          name="storefront-outline"
          size={20}
          color={ShopColors.textSecondary}
        />
        <Text style={styles.shopLink}>
          Applicable to all participating shops.
        </Text>
      </View>
    );
  }

  if (
    offer.shopId &&
    (!offer.applicableShopIds || offer.applicableShopIds.length === 0)
  ) {
    return (
      <TouchableOpacity
        onPress={() => ShopNavigator.goToShopDetails(offer.shopId!)}
        style={styles.shopLinkContainer}
      >
        <Ionicons name="storefront" size={20} color={ShopColors.accent} />
        <Text style={styles.shopLinkText}>View Participating Shop</Text>
        <Ionicons name="arrow-forward" size={16} color={ShopColors.accent} />
      </TouchableOpacity>
    );
  }

  if (offer.applicableShopIds && offer.applicableShopIds.length > 0) {
    return (
      <View style={styles.infoSectionMultiShops}>
        <Ionicons
          name="storefront-outline"
          size={20}
          color={ShopColors.textSecondary}
        />
        <Text style={styles.shopLink}>
          Applicable at shops: {offer.applicableShopIds.join(', ')}
        </Text>
      </View>
    );
  }

  return null; // No shop information provided
};

const SpecialOfferDetailsPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    data: offer,
    isLoading,
    isError,
    refetch,
  } = useSpecialOffer(id || '');

  if (isLoading) {
    return <SpecialOfferDetailSkeleton />;
  }

  if (isError || !offer) {
    return (
      <ErrorState
        message={isError ? 'Could not load offer.' : 'Special offer not found.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: offer.title }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {offer.image && (
          <Image source={{ uri: offer.image }} style={styles.offerImage} />
        )}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{offer.title}</Text>
          <View style={styles.infoSection}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={ShopColors.textSecondary}
            />
            <Text style={styles.validityText}>
              Valid from {formatDate(offer.validFrom)} to
              {formatDate(offer.validUntil)}
            </Text>
          </View>
          {offer.discountPercent != null && (
            <View style={styles.infoSection}>
              <Ionicons
                name="pricetag-outline"
                size={20}
                color={ShopColors.accent}
              />
              <Text style={styles.discountText}>
                {offer.discountPercent}% OFF
              </Text>
            </View>
          )}
          {offer.discountFixedAmount != null && (
            <View style={styles.infoSection}>
              <Ionicons
                name="cash-outline"
                size={20}
                color={ShopColors.accent}
              />
              <Text style={styles.discountText}>
                ₱{offer.discountFixedAmount} OFF
              </Text>
            </View>
          )}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{offer.description}</Text>
          <Text style={styles.sectionTitle}>Terms and Conditions</Text>
          <Text style={styles.terms}>{offer.termsAndConditions}</Text>
          <View style={styles.separator} />
          <ShopLinkSection offer={offer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ShopColors.background },
  scrollContent: { paddingBottom: 24 },
  offerImage: { width: '100%', height: 250 },
  contentContainer: { padding: 20 },
  title: {
    fontSize: 26,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
    marginBottom: 16,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  validityText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  discountText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.accent,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    marginTop: 24,
    marginBottom: 8,
    borderTopWidth: 1,
    borderTopColor: ShopColors.border,
    paddingTop: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    lineHeight: 24,
  },
  terms: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    backgroundColor: ShopColors.border,
    marginVertical: 24,
  },
  shopLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  shopLinkText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.accent,
  },
  shopLink: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textPrimary,
    flexShrink: 1,
  },
  infoSectionMultiShops: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
});

export default SpecialOfferDetailsPage;
