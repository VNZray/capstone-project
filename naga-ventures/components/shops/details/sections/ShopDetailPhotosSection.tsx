import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShopColors } from '@/constants/ShopColors';
import type { ShopData, ShopGallery } from '@/types/shop';
import { ShopDetailPhotoGallery } from '../elements';

interface ShopDetailPhotosSectionProps {
  shop: ShopData;
  onImagePress: (imageUrl: string) => void;
}

const ShopDetailPhotosSection: React.FC<ShopDetailPhotosSectionProps> = ({
  shop,
  onImagePress
}) => {
  // Process all images - simplified without filtering
  const allImages = useMemo(() => {
    const gallery = shop.gallery || [];
    const additional = (shop.additionalImages || []).map((url, index) => ({
      id: `additional-${index}`,
      url,
      type: 'shop' as const,
      caption: '',
    }));

    return [...gallery, ...additional];
  }, [shop.gallery, shop.additionalImages]);

  // Empty state
  if (allImages.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="images-outline" size={48} color={ShopColors.textSecondary} />
        <Text style={styles.emptyStateTitle}>No Photos Available</Text>
        <Text style={styles.emptyStateText}>This business hasn&apos;t uploaded photos yet.</Text>
        <TouchableOpacity style={styles.uploadButton}>
          <Ionicons name="camera" size={16} color="#FFFFFF" />
          <Text style={styles.uploadButtonText}>Upload Photos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Simple Header - Just title and photo count */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <Text style={styles.sectionTitle}>Photo Gallery</Text>
          <Text style={styles.photoCount}>{allImages.length} Photos</Text>
        </View>
      </View>

      {/* Photo Gallery - Grid only */}
      <ShopDetailPhotoGallery
        gallery={allImages}
        onImagePress={onImagePress}
      />

      {/* Upload Section */}
      <View style={styles.uploadSection}>
        <View style={styles.uploadPrompt}>
          <Ionicons name="camera" size={20} color={ShopColors.accent} />
          <Text style={styles.uploadPromptText}>Have photos of this business?</Text>
        </View>
        <TouchableOpacity style={styles.uploadButton}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.uploadButtonText}>Add Photos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ShopColors.background,
  },

  // Header Section - Simplified
  headerSection: {
    backgroundColor: ShopColors.cardBackground,
    paddingVertical: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: ShopColors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
  },
  photoCount: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
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
    marginBottom: 20,
  },

  // Upload Section
  uploadSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: ShopColors.cardBackground,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ShopColors.border,
  },
  uploadPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  uploadPromptText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textPrimary,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ShopColors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  uploadButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
});

export default React.memo(ShopDetailPhotosSection);