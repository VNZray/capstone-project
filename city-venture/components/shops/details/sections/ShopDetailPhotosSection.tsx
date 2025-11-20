import { ShopDetailPhotoGallery } from '@/components/shops/details/elements';
import type { BusinessProfileView } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/ShopColors';
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShopDetailPhotosSectionProps {
  shop: BusinessProfileView;
  onImagePress?: (imageUrl: string) => void;
}

const ShopDetailPhotosSection: React.FC<ShopDetailPhotosSectionProps> = ({ shop, onImagePress }) => {
  const gallery = shop.gallery ?? [];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    onImagePress?.(imageUrl);
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Text style={styles.sectionSubtitle}>Ambiance, dishes, and highlights</Text>
        </View>
        <Text style={styles.photoCount}>{gallery.length} photos</Text>
      </View>

      <ShopDetailPhotoGallery gallery={gallery} onImagePress={handleImagePress} />

      <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedImage(null)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.modalImage} />}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: ShopColors.cardBackground,
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
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
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 8,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  modalImage: {
    width: '90%',
    aspectRatio: 1,
    borderRadius: 20,
  },
});

export default ShopDetailPhotosSection;
