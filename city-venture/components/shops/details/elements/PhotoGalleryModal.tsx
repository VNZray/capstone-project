import React, { useMemo, useState } from 'react';
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PhotoGalleryModalProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const clampedIndex = Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0));
  const [activeIndex, setActiveIndex] = useState(clampedIndex);

  const activeImage = useMemo(() => images[activeIndex], [activeIndex, images]);

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const goPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images.length) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>

        <View style={styles.imageWrapper}>
          <Image source={{ uri: activeImage }} style={styles.image} resizeMode="contain" />
        </View>

        {images.length > 1 && (
          <View style={styles.controls}>
            <TouchableOpacity style={styles.navButton} onPress={goPrevious}>
              <Text style={styles.navText}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.counter}>
              {activeIndex + 1}/{images.length}
            </Text>
            <TouchableOpacity style={styles.navButton} onPress={goNext}>
              <Text style={styles.navText}>{'>'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 8,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  imageWrapper: {
    width: screenWidth - 40,
    height: screenWidth - 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginHorizontal: 12,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  counter: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
});

export default PhotoGalleryModal;
