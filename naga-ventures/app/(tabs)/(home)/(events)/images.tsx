import { events } from '@/Controller/EventData';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageStyle,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GAP = 8;
const IMAGE_WIDTH = (width - 32 - GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

type EventImageProps = {
  source: any;
  style?: StyleProp<ImageStyle>;
};

const EventImage: React.FC<EventImageProps> = ({ source, style }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <View
      style={[
        style,
        {
          backgroundColor: '#f0f0f0',
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
    >
      {isLoading && <ActivityIndicator size="small" color="#0A2342" />}
      {hasError ? (
        <FontAwesome5 name="image" size={24} color="#666" />
      ) : (
        <Image
          source={source}
          style={[style, { position: 'absolute' }]}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          resizeMode="cover"
          fadeDuration={300}
        />
      )}
    </View>
  );
};

const EventImages = () => {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#1c1c1c' : '#fff';
  const color = colorScheme === 'dark' ? '#fff' : '#000';

  const event = events.find((e) => e.id.toString() === id);

  if (!event) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
          <ThemedText>Event not found</ThemedText>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // For demo purposes, we'll duplicate the image multiple times
  const images = Array(5).fill(event.image.src);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome5 name="arrow-left" size={20} color={color} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Images</ThemedText>
          <View style={{ width: 20 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.imageGrid}>
            {images.map((imageUrl, index) => (
              <View key={index} style={styles.imageContainer}>
                <EventImage
                  source={{
                    uri: imageUrl,
                    width: IMAGE_WIDTH * 2, // Request 2x size for better quality
                    height: IMAGE_WIDTH * 2,
                    cache: 'force-cache',
                  }}
                  style={styles.image}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  imageContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});

export default EventImages;
