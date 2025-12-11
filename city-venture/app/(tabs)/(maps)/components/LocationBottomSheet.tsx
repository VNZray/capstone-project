import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import BottomSheet from '@/components/ui/BottomSheetModal';
import Button from '@/components/Button';
import { colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import placeholder from '@/assets/images/placeholder.png';
import type { Business } from '@/types/Business';
import type { TouristSpot } from '@/types/TouristSpot';

type LocationData = Business | TouristSpot;
type LocationType = 'accommodation' | 'shop' | 'tourist-spot';

interface LocationBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData | null;
  locationType: LocationType | null;
  onViewMore: () => void;
}

const LocationBottomSheet: React.FC<LocationBottomSheetProps> = ({
  isOpen,
  onClose,
  location,
  locationType,
  onViewMore,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!location) return null;

  // Type guards and data extraction
  const isBusiness = (loc: LocationData): loc is Business => {
    return 'business_name' in loc;
  };

  const isTouristSpot = (loc: LocationData): loc is TouristSpot => {
    return 'name' in loc && !('business_name' in loc);
  };

  const name = isBusiness(location) ? location.business_name : location.name;
  const description = location.description || 'No description available';
  const image = isBusiness(location)
    ? location.business_image
    : location.images?.[0]?.file_url;

  const address = isBusiness(location)
    ? location.address
    : `${location.barangay || ''}, ${location.municipality || ''}, ${
        location.province || ''
      }`.trim();

  const ratings = isBusiness(location) ? (location as any).ratings || 0 : 0;
  const reviews = isBusiness(location) ? (location as any).reviews || 0 : 0;

  const getLocationTypeLabel = () => {
    switch (locationType) {
      case 'accommodation':
        return 'Accommodation';
      case 'shop':
        return 'Shop';
      case 'tourist-spot':
        return 'Tourist Spot';
      default:
        return 'Location';
    }
  };

  const getLocationIcon = () => {
    switch (locationType) {
      case 'accommodation':
        return 'hotel';
      case 'shop':
        return 'shopping-bag';
      case 'tourist-spot':
        return 'map-marker-alt';
      default:
        return 'map-marker';
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={['85%']}
      enablePanDownToClose
      closeButton={false}
      content={
        <View style={styles.container}>
          {/* Image */}
          <View style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <Image source={placeholder} style={styles.image} />
            )}
            <View style={styles.typeBadge}>
              <MaterialCommunityIcons
                name={getLocationIcon() as any}
                size={14}
                color="#fff"
              />
              <ThemedText
                type="body-small"
                weight="semi-bold"
                style={styles.typeText}
              >
                {getLocationTypeLabel()}
              </ThemedText>
            </View>
          </View>

          {/* Name */}
          <View style={styles.contentSection}>
            <ThemedText type="card-title-large" weight="bold">
              {name}
            </ThemedText>
          </View>

          {/* Address */}
          {address && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color={colors.primary}
              />
              <ThemedText
                type="body-medium"
                style={[styles.infoText, { flex: 1 }]}
              >
                {address}
              </ThemedText>
            </View>
          )}

          {/* Rating & Reviews */}
          {locationType !== 'tourist-spot' && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="star" size={20} color="#FFB007" />
              <ThemedText type="body-medium" weight="semi-bold">
                {ratings.toFixed(1)}
              </ThemedText>
              <ThemedText
                type="body-small"
                style={{ color: isDark ? '#9BA1A6' : '#6B7280', marginLeft: 4 }}
              >
                ({reviews} reviews)
              </ThemedText>
            </View>
          )}

          {/* Price Range (for businesses) */}
          {isBusiness(location) &&
            (location.min_price || location.max_price) && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="cash"
                  size={20}
                  color={colors.primary}
                />
                <ThemedText type="body-medium" weight="semi-bold">
                  ₱{location.min_price || 0} - ₱{location.max_price || 0}
                </ThemedText>
              </View>
            )}

          {/* Entry Fee (for tourist spots) */}
          {isTouristSpot(location) && location.entry_fee && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="ticket"
                size={20}
                color={colors.primary}
              />
              <ThemedText type="body-medium" weight="semi-bold">
                ₱{location.entry_fee}
              </ThemedText>
              <ThemedText
                type="body-small"
                style={{ color: isDark ? '#9BA1A6' : '#6B7280', marginLeft: 4 }}
              >
                Entry Fee
              </ThemedText>
            </View>
          )}

          {/* Contact Info */}
          {isTouristSpot(location) && location.contact_phone && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="phone"
                size={20}
                color={colors.primary}
              />
              <ThemedText type="body-medium" style={styles.infoText}>
                {location.contact_phone}
              </ThemedText>
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionSection}>
            <ThemedText type="card-title-medium" weight="semi-bold">
              Description
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={{
                color: isDark ? '#9BA1A6' : '#6B7280',
                lineHeight: 22,
                marginTop: 8,
              }}
              numberOfLines={4}
            >
              {description}
            </ThemedText>
          </View>

          {/* Categories */}
          {location.categories && location.categories.length > 0 && (
            <View style={styles.categoriesSection}>
              <ThemedText
                type="card-title-small"
                weight="semi-bold"
                style={{ marginBottom: 8 }}
              >
                Categories
              </ThemedText>
              <View style={styles.categoriesContainer}>
                {location.categories.slice(0, 3).map((cat, index) => (
                  <View key={index} style={styles.categoryChip}>
                    <ThemedText
                      type="body-small"
                      style={{ color: colors.primary }}
                    >
                      {(cat as any).category_name ||
                        (cat as any).name ||
                        'Category'}
                    </ThemedText>
                  </View>
                ))}
                {location.categories.length > 3 && (
                  <View style={styles.categoryChip}>
                    <ThemedText
                      type="body-small"
                      style={{ color: colors.primary }}
                    >
                      +{location.categories.length - 3} more
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      }
      bottomActionButton={
        <Button label="View More" onPress={onViewMore} endIcon="arrow-right" />
      }
    />
  );
};

export default LocationBottomSheet;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: {
    color: '#fff',
  },
  contentSection: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
  },
  descriptionSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  categoriesSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});
