import type { BusinessProfileGalleryItem } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/ShopColors';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface ShopDetailPhotoGalleryProps {
  gallery: BusinessProfileGalleryItem[];
  onImagePress?: (imageUrl: string) => void;
}

const ShopDetailPhotoGallery: React.FC<ShopDetailPhotoGalleryProps> = ({ gallery, onImagePress }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Photo Gallery</Text>

    {gallery.length ? (
      <View style={styles.grid}>
        {gallery.slice(0, 6).map((item) => (
          <Pressable key={item.id} onPress={() => onImagePress?.(item.url)}>
            <Image source={{ uri: item.url }} style={styles.image} />
          </Pressable>
        ))}
      </View>
    ) : (
      <Text style={styles.emptyText}>Photos coming soon</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ShopColors.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  image: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
});

export default ShopDetailPhotoGallery;
