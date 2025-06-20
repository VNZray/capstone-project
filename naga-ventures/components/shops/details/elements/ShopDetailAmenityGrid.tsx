import { ShopColors } from '@/constants/ShopColors';
import type { ShopAmenity } from '@/types/shop';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ShopDetailAmenityGridProps {
  amenities: ShopAmenity[];
}

const ShopDetailAmenityGrid: React.FC<ShopDetailAmenityGridProps> = ({ amenities }) => {
  if (!amenities || amenities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No amenities information available</Text>
      </View>
    );
  }

  return (
    <View style={styles.amenityGrid}>
      {amenities.map((amenity) => (
        <View 
          key={amenity.id} 
          style={[
            styles.amenityItem,
            { opacity: amenity.available ? 1 : 0.5 }
          ]}
        >
          <View style={[
            styles.amenityIcon,
            { 
              backgroundColor: amenity.available 
                ? ShopColors.accent + '15' 
                : ShopColors.disabled + '15' 
            }
          ]}>
            <Ionicons
              name={amenity.icon as any}
              size={20}
              color={amenity.available ? ShopColors.accent : ShopColors.disabled}
            />
          </View>
          <Text style={[
            styles.amenityText,
            { 
              color: amenity.available 
                ? ShopColors.textPrimary 
                : ShopColors.disabled 
            }
          ]}>
            {amenity.name}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 0,
    gap: 16, // Simple gap for clean spacing
  },
  
  amenityItem: {
    alignItems: 'center',
    width: (screenWidth - 72) / 3, // Simple 3-column calculation
    marginBottom: 16,
  },
  
  amenityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  
  amenityText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    lineHeight: 14,
  },
  
  emptyContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'center',
  },
});

export default React.memo(ShopDetailAmenityGrid);