import {
  ShopDetailAmenityGrid,
  ShopDetailBusinessHours,
  ShopDetailContactInfo,
  ShopDetailMapPreview,
  ShopDetailAbout,
} from '@/components/shops/details/elements';
import type { BusinessProfileView } from '@/components/shops/details/types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ShopDetailInfoSectionProps {
  shop: BusinessProfileView;
  onDirectionsPress?: () => void;
}

const ShopDetailInfoSection: React.FC<ShopDetailInfoSectionProps> = ({
  shop,
  onDirectionsPress,
}) => (
  <View style={styles.container}>
    <View style={styles.topSpacer} />
    
    <ShopDetailAbout shop={shop} />
    
    <View style={styles.spacer} />

    <ShopDetailMapPreview shop={shop} onDirectionsPress={onDirectionsPress} />

    <View style={styles.spacer} />
    
    <ShopDetailContactInfo shop={shop} onDirectionsPress={onDirectionsPress} />

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
  topSpacer: {
    height: 24,
  },
  spacer: {
    height: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ShopDetailInfoSection;
