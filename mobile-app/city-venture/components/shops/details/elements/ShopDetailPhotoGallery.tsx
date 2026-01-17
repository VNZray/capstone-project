import type { BusinessProfileGalleryItem } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/color';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface ShopDetailPhotoGalleryProps {
  gallery: BusinessProfileGalleryItem[];
  onImagePress?: (imageUrl: string, index: number) => void;
}

const ShopDetailPhotoGallery: React.FC<ShopDetailPhotoGalleryProps> = ({ gallery, onImagePress }) => (
  <View style={styles.container}>
    {gallery.length ? (
      <View style={styles.grid}>
        {gallery.map((item, index) => (
          <Pressable 
            key={item.id} 
            style={styles.imageContainer}
            onPress={() => onImagePress?.(item.url, index)}
          >
            <Image source={{ uri: item.url }} style={styles.image} />
          </Pressable>
        ))}
      </View>
    ) : (
      <View style={styles.emptyContainer}>
         <Text style={styles.emptyText}>No photos available in this category</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
});

export default ShopDetailPhotoGallery;
