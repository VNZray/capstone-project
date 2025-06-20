import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShopColors } from '@/constants/ShopColors';
import type { ShopData } from '@/types/shop';
import { MapView, Marker } from '@/components/map/MapWrapper';

const { width: screenWidth } = Dimensions.get('window');
const MAP_HEIGHT = 200;

interface ShopDetailMapPreviewProps {
  shop: ShopData;
  onPress: () => void;
}

const ShopDetailMapPreview: React.FC<ShopDetailMapPreviewProps> = ({
  shop,
  onPress
}) => {
  if (!shop.mapLocation) {
    return (
      <View style={styles.noMapContainer}>
        <Ionicons name="map-outline" size={32} color={ShopColors.textSecondary} />
        <Text style={styles.noMapText}>Location not available</Text>
      </View>
    );
  }

  // Custom marker with shop photo
  const CustomMarker = () => (
    <View style={styles.customMarker}>
      <View style={styles.markerPin}>
        <View style={styles.photoContainer}>
          <Image 
            source={{ uri: shop.logo || shop.image }} 
            style={styles.markerPhoto}
            resizeMode="cover"
          />
        </View>
        <View style={styles.markerPoint} />
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    // Fallback for web - static map style view
    return (
      <TouchableOpacity style={styles.webMapContainer} onPress={onPress}>
        <View style={styles.webMapPlaceholder}>
          <Ionicons name="map" size={48} color={ShopColors.accent} />
          <Text style={styles.webMapText}>View on Map</Text>
          <Text style={styles.webMapSubtext}>Tap to open interactive map</Text>
        </View>
        <View style={styles.tapIndicator}>
          <Ionicons name="open-outline" size={16} color={ShopColors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.mapContainer} onPress={onPress} activeOpacity={0.9}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: shop.mapLocation.latitude,
          longitude: shop.mapLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        pointerEvents="none"
      >
        <Marker
          coordinate={{
            latitude: shop.mapLocation.latitude,
            longitude: shop.mapLocation.longitude,
          }}
        >
          <CustomMarker />
        </Marker>
      </MapView>
      
      {/* Overlay with tap indicator */}
      <View style={styles.mapOverlay}>
        <View style={styles.tapIndicator}>
          <Ionicons name="open-outline" size={16} color="#FFFFFF" />
          <Text style={styles.tapText}>Tap to view full map</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Map container
  mapContainer: {
    height: MAP_HEIGHT,
    position: 'relative',
    backgroundColor: ShopColors.background,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  
  // Custom marker with photo
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPin: {
    alignItems: 'center',
  },
  photoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerPhoto: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  markerPoint: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 0,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    marginTop: -2,
  },
  
  // Map overlay
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  tapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  tapText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  
  // Web fallback
  webMapContainer: {
    height: MAP_HEIGHT,
    backgroundColor: ShopColors.background,
    borderWidth: 2,
    borderColor: ShopColors.border,
    borderStyle: 'dashed',
    position: 'relative',
  },
  webMapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  webMapText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.accent,
  },
  webMapSubtext: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  
  // No map available
  noMapContainer: {
    height: MAP_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ShopColors.background,
    gap: 8,
  },
  noMapText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
});

export default React.memo(ShopDetailMapPreview);