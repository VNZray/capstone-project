import React from 'react';
import { View, Image, StyleSheet, Platform, Dimensions } from 'react-native';
import { Marker } from 'react-native-maps';
import { colors } from '@/constants/color';
import type { Business } from '@/types/Business';
import type { TouristSpot } from '@/types/TouristSpot';
import type { Event, EventImage } from '@/types/Event';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const MARKER_SIZE = width * 0.12; // 12% of screen width
const BORDER_WIDTH = MARKER_SIZE * 0.06;
const IMAGE_BORDER_RADIUS = (MARKER_SIZE - BORDER_WIDTH * 2) / 2;
const ICON_SIZE = MARKER_SIZE * 0.48;
const ARROW_SIZE = MARKER_SIZE * 0.24;

type LocationData = Business | TouristSpot | Event;
type LocationType = 'accommodation' | 'shop' | 'tourist-spot' | 'event';

interface CustomMarkerProps {
  location: LocationData;
  locationType: LocationType;
  displayCoords?: { latitude: number; longitude: number };
  onPress: () => void;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({
  location,
  locationType,
  displayCoords,
  onPress,
}) => {
  const isBusiness = (loc: LocationData): loc is Business => {
    return 'business_name' in loc;
  };

  const isEvent = (loc: LocationData): loc is Event => {
    return 'start_date' in loc && 'is_free' in loc;
  };

  // Use displayCoords if provided, otherwise fall back to location coords
  const latitude = displayCoords?.latitude ?? (Number(location.latitude) || 0);
  const longitude =
    displayCoords?.longitude ?? (Number(location.longitude) || 0);

  const getImage = () => {
    if (isBusiness(location)) {
      return location.business_image;
    } else if (isEvent(location)) {
      // Event images are in location.images array
      const eventImages = (location as Event & { images?: EventImage[] }).images;
      return eventImages?.[0]?.file_url;
    } else {
      return (location as TouristSpot).images?.[0]?.file_url;
    }
  };

  const image = getImage();

  const getMarkerColor = () => {
    switch (locationType) {
      case 'accommodation':
        return colors.primary;
      case 'shop':
        return '#FF6B35';
      case 'tourist-spot':
        return '#00B4D8';
      case 'event':
        return '#9B59B6'; // Purple for events
      default:
        return colors.primary;
    }
  };

  const getMarkerIcon = () => {
    switch (locationType) {
      case 'accommodation':
        return 'hotel';
      case 'shop':
        return 'shopping';
      case 'tourist-spot':
        return 'map-marker';
      case 'event':
        return 'calendar-star';
      default:
        return 'map-marker';
    }
  };

  return (
    <Marker
      coordinate={{
        latitude,
        longitude,
      }}
      onPress={onPress}
      style={{ alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={styles.markerContainer}>
        {/* Image Circle */}
        <View
          style={[styles.markerImageWrapper, { borderColor: getMarkerColor() }]}
        >
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.markerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.markerImage, styles.placeholderContainer]}>
              <MaterialCommunityIcons
                name={getMarkerIcon() as any}
                size={ICON_SIZE}
                color={getMarkerColor()}
              />
            </View>
          )}
        </View>

        {/* Arrow Pointer */}
        <View
          style={[styles.markerArrow, { borderTopColor: getMarkerColor() }]}
        />
      </View>
    </Marker>
  );
};

export default CustomMarker;

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerImageWrapper: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: '#fff',
    padding: 2,
    borderWidth: BORDER_WIDTH,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  markerImage: {
    width: '100%',
    height: '100%',
    borderRadius: IMAGE_BORDER_RADIUS,
  },
  placeholderContainer: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: ARROW_SIZE / 2,
    borderRightWidth: ARROW_SIZE / 2,
    borderTopWidth: ARROW_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
