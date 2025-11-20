import { 
  ShopDetailPhotoGallery, 
  PhotoGalleryModal, 
} from '@/components/shops/details/elements';
import type { BusinessProfileView } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/ShopColors';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ShopDetailPhotosSectionProps {
  shop: BusinessProfileView;
  onImagePress?: (imageUrl: string) => void;
}

const ShopDetailPhotosSection: React.FC<ShopDetailPhotosSectionProps> = ({ shop, onImagePress }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [initialModalIndex, setInitialModalIndex] = useState(0);

  // Use all gallery items without filtering
  const gallery = useMemo(() => shop.gallery ?? [], [shop.gallery]);

  // Derive just the URLs for the modal
  const modalImages = useMemo(() => {
    return gallery.map(item => item.url);
  }, [gallery]);

  const handleImagePress = (imageUrl: string, index: number) => {
    setInitialModalIndex(index);
    setIsModalVisible(true);
    // We deliberately do NOT call onImagePress(imageUrl) here to avoid 
    // opening the parent's duplicate modal (ShopDetail.tsx also has a modal).
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Text style={styles.sectionSubtitle}>Explore our space and offerings</Text>
        </View>
        <Text style={styles.photoCount}>{gallery.length} photos</Text>
      </View>

      {/* Removed ShopDetailPhotoFilterChips per request */}

      <ShopDetailPhotoGallery 
        gallery={gallery} 
        onImagePress={handleImagePress} 
      />

      <PhotoGalleryModal
        visible={isModalVisible}
        images={modalImages}
        initialIndex={initialModalIndex}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  photoCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default ShopDetailPhotosSection;
