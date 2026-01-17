import PageContainer from '@/components/PageContainer';
import PhotoGallery from '@/components/PhotoGallery';
import { useRoom } from '@/context/RoomContext';
import { fetchRoomPhotosByRoomId } from '@/services/RoomPhotoService';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const RoomPhotos = () => {
  const { roomDetails } = useRoom();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhotos = async () => {
      if (!roomDetails?.id) {
        setPhotos([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const roomPhotos = await fetchRoomPhotosByRoomId(roomDetails.id);
        const photoUrls = roomPhotos.map(p => p.file_url);
        setPhotos(photoUrls);
      } catch (error) {
        console.error('Failed to load room photos:', error);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, [roomDetails?.id]);

  if (loading) {
    return (
      <PageContainer style={{ paddingTop: 0 }}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      </PageContainer>
    );
  }

  if (photos.length === 0) {
    return (
      <PageContainer style={{ paddingTop: 0 }}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No photos available for this room</Text>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer style={{ paddingTop: 0 }}>
      <PhotoGallery 
        photos={photos}
        title="Room Photos"
        columns={2}
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default RoomPhotos;