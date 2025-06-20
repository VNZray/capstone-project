import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShopColors } from '@/constants/ShopColors';
import type { MenuItem } from '@/types/shop'; // Import the original MenuItem type

interface ShopDetailMenuItemCardProps {
  item: MenuItem; // Use the original MenuItem type
  onPress: (item: MenuItem) => void; // Use the original MenuItem type
}

const ShopDetailMenuItemCard: React.FC<ShopDetailMenuItemCardProps> = ({
  item,
  onPress,
}) => {
  // Simple null check
  if (!item) {
    return null;
  }

  // Simple property access - only the 4 properties we care about
  const itemName = item.item || 'Unknown Item';
  const itemPrice = item.price || 'Price not available';
  const itemDescription = item.description || '';
  const itemImage = item.image;

  const handlePress = () => {
    if (item && onPress) {
      onPress(item);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {/* Left Side - Image or placeholder */}
        <View style={styles.imageContainer}>
          {itemImage ? (
            <Image 
              source={{ uri: itemImage }} 
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons 
                name="restaurant-outline" 
                size={24} 
                color={ShopColors.textSecondary} 
              />
            </View>
          )}
        </View>

        {/* Right Side - Content */}
        <View style={styles.itemContent}>
          {/* Header with name and price */}
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={1}>
              {itemName}
            </Text>
            
            <Text style={styles.itemPrice}>
              {itemPrice}
            </Text>
          </View>

          {/* Description - Only show if exists */}
          {itemDescription ? (
            <Text style={styles.itemDescription} numberOfLines={2}>
              {itemDescription}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Card
  card: {
    backgroundColor: ShopColors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ShopColors.border,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },

  // Card Content
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },

  // Left Side - Image
  imageContainer: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: ShopColors.background,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: ShopColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ShopColors.border,
  },

  // Right Side - Content
  itemContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },

  // Header - Name and Price
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.accent,
    textAlign: 'right',
  },

  // Description
  itemDescription: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    lineHeight: 18,
  },
});

export default React.memo(ShopDetailMenuItemCard);