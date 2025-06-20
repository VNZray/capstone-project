import { ShopColors } from '@/constants/ShopColors';
import type { ShopGallery } from '@/types/shop';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PhotoGalleryModal from './PhotoGalleryModal';

const { width: screenWidth } = Dimensions.get('window');

interface ShopDetailPhotoGalleryProps {
  gallery?: ShopGallery[];
  additionalImages?: string[];
  onImagePress?: (imageUrl: string) => void; // Keep for compatibility but don't use
}

const ShopDetailPhotoGallery: React.FC<ShopDetailPhotoGalleryProps> = ({
  gallery = [],
  additionalImages = [],
  onImagePress, // Don't use this to prevent double modal
}) => {
  const [photoGalleryVisible, setPhotoGalleryVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Combine gallery and additional images
  const allImages: (
    | ShopGallery
    | { id: string; url: string; caption?: string; type: 'additional' }
  )[] = [
    ...gallery,
    ...additionalImages.map((url, index) => ({
      id: `additional-${index}`,
      url,
      type: 'additional' as const,
      caption: '',
    })),
  ];

  // Extract URLs for PhotoGalleryModal
  const imageUrls = allImages.map((item) => item.url);

  const handleImagePress = (imageUrl: string, index: number) => {
    setSelectedImageIndex(index);
    setPhotoGalleryVisible(true);
    // DON'T call onImagePress to prevent double modal
    // onImagePress?.(imageUrl);
  };

  if (allImages.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="images-outline"
          size={48}
          color={ShopColors.textSecondary}
        />
        <Text style={styles.emptyStateTitle}>No Photos Available</Text>
        <Text style={styles.emptyStateText}>
          This business hasn&apos;t uploaded photos yet.
        </Text>
      </View>
    );
  }

  const renderPhotoItem = ({
    item,
    index,
  }: {
    item: (typeof allImages)[0];
    index: number;
  }) => (
    <View style={styles.gridItemWrapper}>
      <TouchableOpacity
        style={styles.photoItem}
        onPress={() => handleImagePress(item.url, index)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.url }} style={styles.photoImage} />

        {/* Only keep the expand icon overlay - removed all badges */}
        <View style={styles.galleryIconOverlay}>
          <Ionicons name="expand-outline" size={12} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={allImages}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.photosGridContent}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={undefined}
      />

      {/* PhotoGalleryModal for full-screen viewing */}
      <PhotoGalleryModal
        visible={photoGalleryVisible}
        onClose={() => setPhotoGalleryVisible(false)}
        images={imageUrls}
        initialIndex={selectedImageIndex}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  photosGridContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },

  // Grid wrapper - 2 columns only
  gridItemWrapper: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },

  // Photo item - Grid only, clean design
  photoItem: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: ShopColors.cardBackground,
    elevation: 2,
    shadowColor: ShopColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },

  // Only keep the gallery icon overlay
  galleryIconOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    padding: 3,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default React.memo(ShopDetailPhotoGallery);
