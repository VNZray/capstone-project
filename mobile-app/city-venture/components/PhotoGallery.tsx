import { ThemedText } from '@/components/themed-text';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type PhotoGalleryProps = {
  photos: string[];
  title?: string;
  columns?: number;
};

const PhotoGallery = ({ photos, title = "Photos", columns = 2 }: PhotoGalleryProps) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const photoSize = (screenWidth - 48 - (columns - 1) * 0) / columns;

  const openPhoto = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closePhoto = () => {
    setSelectedPhotoIndex(null);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (selectedPhotoIndex === null) return;
    
    if (direction === 'prev') {
      setSelectedPhotoIndex(selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : photos.length - 1);
    } else {
      setSelectedPhotoIndex(selectedPhotoIndex < photos.length - 1 ? selectedPhotoIndex + 1 : 0);
    }
  };

  const renderPhoto = ({ item, index }: { item: string; index: number }) => (
    <Pressable 
      style={[styles.photoItem, { width: photoSize, height: photoSize }]}
      onPress={() => openPhoto(index)}
    >
      <Image 
        source={{ uri: item }} 
        style={styles.photo}
        resizeMode="cover"
      />
      {index === 0 && photos.length > 1 && (
        <View style={styles.photoCountBadge}>
          <FontAwesome5 name="images" size={12} color="#fff" />
          <ThemedText 
            type="label-extra-small" 
            lightColor="#fff" 
            darkColor="#fff"
            style={{ marginLeft: 4 }}
          >
            {photos.length}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="card-title-small" weight="medium">
          {title}
        </ThemedText>
        <ThemedText type="body-small" style={{ opacity: 0.7 }}>
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </ThemedText>
      </View>

      {/* Photo Grid */}
      <FlatList
        data={photos}
        renderItem={renderPhoto}
        numColumns={columns}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        columnWrapperStyle={columns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />

      {/* Full Screen Modal */}
      <Modal
        visible={selectedPhotoIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={closePhoto}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={closePhoto} style={styles.closeButton}>
              <FontAwesome5 name="times" size={24} color="#fff" />
            </Pressable>
            <ThemedText 
              type="body-medium" 
              lightColor="#fff" 
              darkColor="#fff"
              style={styles.photoCounter}
            >
              {selectedPhotoIndex !== null ? selectedPhotoIndex + 1 : 0} of {photos.length}
            </ThemedText>
          </View>

          {selectedPhotoIndex !== null && (
            <View style={styles.fullScreenImageContainer}>
              <Image
                source={{ uri: photos[selectedPhotoIndex] }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
              
              {/* Navigation Buttons */}
              {photos.length > 1 && (
                <>
                  <Pressable 
                    style={[styles.navButton, styles.prevButton]}
                    onPress={() => navigatePhoto('prev')}
                  >
                    <FontAwesome5 name="chevron-left" size={20} color="#fff" />
                  </Pressable>
                  
                  <Pressable 
                    style={[styles.navButton, styles.nextButton]}
                    onPress={() => navigatePhoto('next')}
                  >
                    <FontAwesome5 name="chevron-right" size={20} color="#fff" />
                  </Pressable>
                </>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default PhotoGallery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  grid: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    gap: 16,
  },
  photoItem: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  closeButton: {
    padding: 8,
  },
  photoCounter: {
    textAlign: 'center',
  },
  fullScreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 25,
    marginTop: -25,
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
});