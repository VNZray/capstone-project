import {
  ShopDetailAmenityGrid,
  ShopDetailBusinessHours,
  ShopDetailContactInfo,
  ShopDetailMapPreview,
} from '@/components/shops/details/elements';
import type { BusinessProfileView } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/ShopColors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ShopDetailInfoSectionProps {
  shop: BusinessProfileView;
  onDirectionsPress?: () => void;
}

const ShopDetailInfoSection: React.FC<ShopDetailInfoSectionProps> = ({
  shop,
  onDirectionsPress,
}) => (
  <View style={styles.container}>
    <ShopDetailContactInfo shop={shop} onDirectionsPress={onDirectionsPress} />

    <View style={styles.spacer} />

    <ShopDetailMapPreview shop={shop} onDirectionsPress={onDirectionsPress} />

    <View style={styles.spacer} />

    <ShopDetailBusinessHours hours={shop.businessHours} status={shop.operatingStatus} />

    <View style={styles.spacer} />

    <ShopDetailAmenityGrid amenities={shop.amenities} />

    <View style={styles.bottomSpacer} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  spacer: {
    height: 12,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default ShopDetailInfoSection;
