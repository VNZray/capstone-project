import type { BusinessProfileAmenity } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/ShopColors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ShopDetailAmenityGridProps {
  amenities: BusinessProfileAmenity[];
}

const ShopDetailAmenityGrid: React.FC<ShopDetailAmenityGridProps> = ({ amenities }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Amenities</Text>

    {amenities.length ? (
      <View style={styles.grid}>
        {amenities.map((amenity) => (
          <View
            key={amenity.id}
            style={[styles.amenityChip, !amenity.available && styles.amenityUnavailable]}
          >
            <Text style={styles.amenityText}>{amenity.name}</Text>
          </View>
        ))}
      </View>
    ) : (
      <Text style={styles.emptyText}>Amenities info coming soon</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  amenityChip: {
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#E0EAFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 5,
    marginVertical: 6,
  },
  amenityUnavailable: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E8E8E8',
  },
  amenityText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default ShopDetailAmenityGrid;
