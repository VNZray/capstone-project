import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Room } from '@/types/Business';

type PhotosProps = {
  room: Room;
};

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const imageSize = screenWidth / numColumns - 16;

const Photos = ({ room }: PhotosProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const photos = room.room_photos;

  const openImage = (uri: string) => setSelectedImage(uri);
  const closeImage = () => setSelectedImage(null);

  if (!photos || photos.length === 0) {
    return (
      <View style={styles.centered}>
        <ThemedText type="subtitle">No photos available for this room.</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        keyExtractor={(item, index) => index.toString()}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <Pressable onPress={() => openImage(item)} style={styles.imageWrapper}>
            <Image source={{ uri: item }} style={styles.image} />
          </Pressable>
        )}
      />

      <Modal visible={!!selectedImage} transparent onRequestClose={closeImage}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.fullImageWrapper} onPress={closeImage}>
            <Image
              source={{ uri: selectedImage! }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageWrapper: {
    padding: 8,
    paddingLeft: 0,
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageWrapper: {
    width: '100%',
    height: '100%',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default Photos;
