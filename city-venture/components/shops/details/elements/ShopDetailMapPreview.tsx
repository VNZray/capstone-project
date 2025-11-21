import type { BusinessProfileView } from '@/components/shops/details/types';
import { MapView, Marker } from '@/components/map/MapWrapper';
import { ShopColors } from '@/constants/ShopColors';
import { Ionicons } from '@expo/vector-icons';
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
  <View style={styles.container}>
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Ionicons name="location" size={20} color={ShopColors.accent} />
          <Text style={styles.cardTitle}>Location</Text>
        </View>
        {shop.mapLocation && (
          <TouchableOpacity style={styles.directionsButton} onPress={onDirectionsPress}>
            <Ionicons name="navigate" size={16} color="#FFFFFF" />
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>
        )}
      </View>

      {shop.location && (
        <Text style={styles.addressText}>{shop.location}</Text>
      )}

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
          <Ionicons name="map-outline" size={32} color={ShopColors.textSecondary} />
          <Text style={styles.mapPlaceholderText}>Map view unavailable</Text>
        </View>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: ShopColors.accent,
    gap: 6,
  },
  directionsText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  mapContainer: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    height: 180,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    gap: 8,
  },
  mapPlaceholderText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
  },
});

export default ShopDetailMapPreview;
