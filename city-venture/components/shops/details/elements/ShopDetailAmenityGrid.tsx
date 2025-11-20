import type { BusinessProfileAmenity } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/ShopColors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ShopDetailAmenityGridProps {
  amenities: BusinessProfileAmenity[];
}

const ShopDetailAmenityGrid: React.FC<ShopDetailAmenityGridProps> = ({ amenities }) => (
  <View style={styles.container}>
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="grid" size={20} color={ShopColors.accent} />
        <Text style={styles.cardTitle}>Amenities & Features</Text>
      </View>

      {amenities.length ? (
        <View style={styles.grid}>
          {amenities.map((amenity) => (
            <View
              key={amenity.id}
              style={[styles.amenityChip, !amenity.available && styles.amenityUnavailable]}
            >
              {amenity.icon && (
                 // Assuming icon is an Ionicons name, or we could map it. 
                 // For safety if icon string is not a valid Ionicon, we might just skip rendering it or use a generic one.
                 // Since we don't have a strict type for icon names here, we'll assume it's handled or just show text.
                 // Let's try to show a checkmark for available items if no specific icon logic exists, 
                 // but the type says 'icon: string'.
                 <Ionicons 
                   name="checkmark-circle" 
                   size={16} 
                   color={amenity.available ? ShopColors.accent : ShopColors.disabled} 
                   style={styles.amenityIcon}
                 />
              )}
              <Text style={[
                styles.amenityText,
                !amenity.available && styles.amenityTextUnavailable
              ]}>{amenity.name}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Amenities information unavailable</Text>
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
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  amenityUnavailable: {
    backgroundColor: '#F3F4F6',
    borderColor: '#F3F4F6',
    opacity: 0.6,
  },
  amenityIcon: {
    marginRight: 2,
  },
  amenityText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textPrimary,
  },
  amenityTextUnavailable: {
    color: ShopColors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
});

export default ShopDetailAmenityGrid;
