import React from 'react';
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  View,
  Pressable,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LinearGradient } from 'expo-linear-gradient';

type City = {
  id: string;
  name: string;
  image: string;
};

const PLACEHOLDER_CITIES: City[] = [
  {
    id: 'tokyo',
    name: 'Tokyo',
    image:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'paris',
    name: 'Paris',
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'new-york',
    name: 'New York',
    image:
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'london',
    name: 'London',
    image:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dubai',
    name: 'Dubai',
    image:
      'https://images.unsplash.com/photo-1512453979798-5ea90b2009f4?auto=format&fit=crop&w=600&q=80',
  },
];

type CityListSectionProps = {
  onPressCity?: (city: City) => void;
};

const CityListSection: React.FC<CityListSectionProps> = ({ onPressCity }) => {
  return (
    <View style={styles.container}>
      <ThemedText type="sub-title-small" weight="bold" style={styles.heading}>
        Sort by City
      </ThemedText>
      <FlatList
        horizontal
        data={PLACEHOLDER_CITIES}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.cardContainer}
            onPress={() => onPressCity?.(item)}
          >
            <ImageBackground
              source={{ uri: item.image }}
              style={styles.imageBackground}
              imageStyle={styles.image}
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
              >
                <ThemedText
                  type="sub-title-small"
                  lightColor="#FFFFFF"
                  darkColor="#FFFFFF"
                  style={styles.cityName}
                >
                  {item.name}
                </ThemedText>
              </LinearGradient>
            </ImageBackground>
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 24,
  },
  heading: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  listContent: {
    paddingRight: 20,
  },
  cardContainer: {
    width: 140,
    height: 180,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  image: {
    borderRadius: 20,
  },
  gradient: {
    height: '50%',
    justifyContent: 'flex-end',
    padding: 12,
    borderRadius: 20,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CityListSection;
