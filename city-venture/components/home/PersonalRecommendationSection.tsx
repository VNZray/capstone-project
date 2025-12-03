import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  View,
  Pressable,
  useColorScheme,
  ViewStyle,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RECOMMENDATIONS, type Recommendation } from '@/components/home/data';

type PersonalRecommendationSectionProps = {
  onPressItem?: (item: Recommendation) => void;
  style?: ViewStyle;
};

const PersonalRecommendationSection: React.FC<
  PersonalRecommendationSectionProps
> = ({ onPressItem, style }) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View>
          <ThemedText type="sub-title-small" weight="bold">
            Recommended for You
          </ThemedText>
        </View>
        <Pressable
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
        data={RECOMMENDATIONS}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.card,
              {
                backgroundColor: 'transparent',
              },
            ]}
            onPress={() => onPressItem?.(item)}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <Pressable style={styles.heartButton}>
                <MaterialCommunityIcons
                  name="heart-outline"
                  size={20}
                  color="#000"
                />
              </Pressable>
            </View>

            <View style={styles.content}>
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={16} color={colors.accent}/>
                <ThemedText type="label-small" style={styles.ratingText}>
                  {item.rating}
                </ThemedText>
                <ThemedText
                  type="label-small"
                  lightColor={colors.textSecondary}
                  darkColor={colors.textSecondary}
                >
                  ({item.reviews})
                </ThemedText>
              </View>

              <ThemedText
                type="card-title-medium"
                weight="semi-bold"
                numberOfLines={2}
                style={styles.title}
                lightColor={colors.textPrimary}
                darkColor={colors.textPrimary}
              >
                {item.title}
              </ThemedText>

              <View style={styles.locationRow}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={14}
                  color={colors.textPrimary}
                />
                <ThemedText
                  type="label-small"
                  lightColor={colors.textPrimary}
                  darkColor={colors.textPrimary}
                  numberOfLines={1}
                >
                  {item.location}
                </ThemedText>
              </View>

              <View style={styles.categoryRow}>
                <MaterialCommunityIcons
                  name="tag-outline"
                  size={14}
                  color={colors.textPrimary}
                />
                <ThemedText
                  type="label-small"
                  lightColor={colors.textPrimary}
                  darkColor={colors.textPrimary}
                >
                  {item.tags[0]}
                </ThemedText>
              </View>

              <View style={styles.priceRow}>
                <ThemedText
                  type="card-title-small"
                  weight="bold"
                  // style= {{ color: '#00BFA5'}}
                  lightColor={colors.textPrimary}
                  darkColor={colors.textPrimary}
                >
                  {item.price}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: -24,
    marginRight: -24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  subtitle: {
    marginTop: 2,
    opacity: 0.7,
  },
  listContent: {
    paddingHorizontal: 24,
  },
  card: {
    width: 320,
    borderRadius: 12,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    backgroundColor: 'transparent',
    paddingTop: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 4,
    gap: 4,
  },
  ratingText: {
    fontWeight: 'bold',
  },
  title: {
    marginBottom: 4,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
});

export default PersonalRecommendationSection;
