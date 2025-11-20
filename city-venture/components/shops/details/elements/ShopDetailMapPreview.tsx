import type { BusinessProfileView } from '@/components/shops/details/types';
import { MapView, Marker } from '@/components/map/MapWrapper';
import { ShopColors } from '@/constants/ShopColors';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShopDetailMapPreviewProps {
  shop: BusinessProfileView;
  onDirectionsPress?: () => void;
}

const ShopDetailMapPreview: React.FC<ShopDetailMapPreviewProps> = ({
  shop,
  onDirectionsPress,
}) => (
  <View style={styles.card}>
    <View style={styles.headerRow}>
      <Text style={styles.cardTitle}>Location</Text>
      {shop.mapLocation && (
        <TouchableOpacity style={styles.directionsButton} onPress={onDirectionsPress}>
          <Text style={styles.directionsText}>Get Directions</Text>
        </TouchableOpacity>
      )}
    </View>

    {shop.mapLocation ? (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: shop.mapLocation.latitude,
            longitude: shop.mapLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          pointerEvents="none"
        >
          <Marker coordinate={shop.mapLocation} />
        </MapView>
      </View>
    ) : (
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderText}>Map unavailable</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  directionsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: ShopColors.accent,
  },
  directionsText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  mapContainer: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: 20,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
  },
  mapPlaceholderText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
  },
});

export default ShopDetailMapPreview;
