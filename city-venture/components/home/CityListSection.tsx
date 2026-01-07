import React from 'react';
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  View,
  Pressable,
  useColorScheme,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/color';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
  },
];

type CityListSectionProps = {
  onPressCity?: (city: City) => void;
  onPressViewMore?: () => void;
};

const CityListSection: React.FC<CityListSectionProps> = ({
  onPressCity,
  onPressViewMore,
}) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="sub-title-small" weight="bold">
          Explore by Cities
        </ThemedText>
        <Pressable
          onPress={onPressViewMore}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          })}
        >
          <ThemedText
            type="label-small"
            lightColor={colors.primary}
            darkColor={colors.accent}
          >
            View All
          </ThemedText>
          <MaterialCommunityIcons
            name="arrow-right"
            size={16}
            color={colors.accent}
          />
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={PLACEHOLDER_CITIES}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
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
    marginRight: -24,
    marginLeft: -24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingRight: 24,
    paddingLeft: 24,
  },
  cardContainer: {
    width: 140,
    height: 180,
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
