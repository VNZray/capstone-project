import React, { useState } from 'react';
import { View, Pressable, Image, Modal, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import Container from '@/components/Container';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GallerySectionProps {
  images: string[];
}

export default function GallerySection({ images }: GallerySectionProps) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#0A1B47';
  
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const uniqueImages = Array.from(new Set(images.filter(Boolean)));

  const openLightbox = (imageUrl: string) => {
    setLightboxImage(imageUrl);
    setLightboxVisible(true);
  };

  const closeLightbox = () => {
    setLightboxVisible(false);
    setLightboxImage(null);
  };

  return (
    <>
      <Container
        style={[
          { padding: 16, marginVertical: 8 },
          Platform.OS === 'android' && {
            elevation: 2,
            shadowColor: '#000',
          },
          Platform.OS === 'ios' && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <FontAwesome5 name="images" size={16} color={iconColor} />
          <ThemedText type="card-title-small" weight="medium">
            Gallery
          </ThemedText>
          {uniqueImages.length > 0 && (
            <View
              style={{
                backgroundColor: colorScheme === 'dark' ? '#374151' : '#E5E7EB',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginLeft: 4,
              }}
            >
              <ThemedText type="body-small" style={{ fontSize: 12 }}>
                {uniqueImages.length}
              </ThemedText>
            </View>
          )}
        </View>

        {uniqueImages.length === 0 ? (
          <View
            style={{
              marginTop: 12,
              padding: 24,
              backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#F9FAFB',
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <FontAwesome5 name="image" size={32} color="#9CA3AF" style={{ marginBottom: 8 }} />
            <ThemedText type="body-small" style={{ color: '#6B7280' }}>
              No images available.
            </ThemedText>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
              marginTop: 12,
            }}
          >
            {uniqueImages.map((src, idx) => (
              <Pressable
                key={`${src}-${idx}`}
                onPress={() => openLightbox(src)}
                style={({ pressed }) => [
                  {
                    width: '31.5%',
                    aspectRatio: 1,
                    borderRadius: 10,
                    overflow: 'hidden',
                    backgroundColor: colorScheme === 'dark' ? '#374151' : '#E5E7EB',
                  },
                  Platform.OS === 'android' && pressed && { opacity: 0.8 },
                ]}
                android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
              >
                <Image
                  source={{ uri: src }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </View>
        )}
      </Container>

      {/* Lightbox Modal */}
      <Modal
        transparent
        visible={lightboxVisible}
        animationType="fade"
        onRequestClose={closeLightbox}
      >
        <Pressable
          onPress={closeLightbox}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: '90%',
              height: '70%',
            }}
          >
            {lightboxImage && (
              <Image
                source={{ uri: lightboxImage }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 12,
                }}
                resizeMode="contain"
              />
            )}
          </Pressable>

          <Pressable
            onPress={closeLightbox}
            style={({ pressed }) => [
              {
                position: 'absolute',
                top: 40,
                right: 20,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              },
              pressed && { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
            ]}
          >
            <FontAwesome5 name="times" size={20} color="#fff" />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
