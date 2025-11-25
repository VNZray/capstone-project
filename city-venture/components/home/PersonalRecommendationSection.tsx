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
          <ThemedText
            type="label-small"
            lightColor={colors.textSecondary}
            darkColor={colors.textSecondary}
            style={styles.subtitle}
          >
            Curated places based on your interests
          </ThemedText>
        </View>
        <Pressable>
          <ThemedText
            type="label-small"
            lightColor={colors.accent}
            darkColor={colors.accent}
          >
            See All
          </ThemedText>
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
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
            onPress={() => onPressItem?.(item)}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.ratingBadge}>
                <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
                <ThemedText
                  type="label-small"
                  weight="bold"
                  style={styles.ratingText}
                  lightColor="#000"
                  darkColor="#000"
                >
                  {item.rating}
                </ThemedText>
              </View>
            </View>

            <View style={styles.content}>
              <ThemedText
                type="label-small"
                lightColor={colors.primary}
                darkColor={colors.primary}
                weight="bold"
                style={styles.category}
              >
                {item.tags[0]}
              </ThemedText>
              <ThemedText type="body-small" weight="bold" numberOfLines={1}>
                {item.title}
              </ThemedText>
              <ThemedText
                type="label-small"
                lightColor={colors.textSecondary}
                darkColor={colors.textSecondary}
                numberOfLines={1}
                style={styles.description}
              >
                {item.location}
              </ThemedText>
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
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  imageContainer: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
  },
  content: {
    padding: 12,
    gap: 4,
  },
  category: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 11,
    marginTop: 2,
  },
});

export default PersonalRecommendationSection;
