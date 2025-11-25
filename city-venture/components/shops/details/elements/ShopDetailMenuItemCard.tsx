import type { BusinessProfileMenuItem } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShopDetailMenuItemCardProps {
  item: BusinessProfileMenuItem;
  onPress?: () => void;
}

const ShopDetailMenuItemCard: React.FC<ShopDetailMenuItemCardProps> = ({ item, onPress }) => (
  <TouchableOpacity 
    style={[
      styles.card,
      !item.isAvailable && styles.cardUnavailable
    ]} 
    activeOpacity={0.9} 
    onPress={onPress}
  >
    <View style={styles.imageContainer}>
      {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
      
      {/* Temporarily Unavailable Badge */}
      {item.productData?.is_unavailable && (
        <View style={styles.unavailableOverlay}>
          <View style={styles.unavailableBadge}>
            <Ionicons name="alert-circle" size={16} color="#FFFFFF" />
            <Text style={styles.unavailableText}>Temporarily Unavailable</Text>
          </View>
        </View>
      )}
      
      {/* Out of Stock Badge */}
      {!item.productData?.is_unavailable && !item.isAvailable && (
        <View style={styles.unavailableOverlay}>
          <View style={styles.unavailableBadge}>
            <Ionicons name="close-circle" size={16} color="#FFFFFF" />
            <Text style={styles.unavailableText}>Out of Stock</Text>
          </View>
        </View>
      )}
      
      {item.isPopular && item.isAvailable && !item.productData?.is_unavailable && (
        <View style={styles.popularBadge}>
          <Ionicons name="flame" size={14} color="#FFFFFF" />
          <Text style={styles.popularText}>Popular</Text>
        </View>
      )}
    </View>

    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={2}>{item.item}</Text>
      </View>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      )}

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{item.price}</Text>
          {item.productData && (
            <Text style={styles.stockText}>
              {item.productData.current_stock} left
            </Text>
          )}
        </View>
        
        {item.tags?.length ? (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardUnavailable: {
    opacity: 0.7,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: ShopColors.background,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ShopColors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  unavailableText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ShopColors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: ShopColors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  popularText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  name: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
    lineHeight: 24,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  price: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.accent,
  },
  stockText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: ShopColors.highlight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: ShopColors.accent + '30',
  },
  tagText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.accent,
  },
});

export default ShopDetailMenuItemCard;
