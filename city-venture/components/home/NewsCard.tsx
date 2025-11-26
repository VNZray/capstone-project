import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NewsArticle } from '@/services/HomeContentService';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  article: NewsArticle;
  onPress?: (article: NewsArticle) => void;
  index?: number;
  variant?: 'featured' | 'compact';
};

const NewsCard: React.FC<Props> = ({
  article,
  onPress,
  index = 0,
  variant = 'featured',
}) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';
  const isCompact = variant === 'compact';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isCompact && styles.compactContainer,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? colors.border : 'transparent',
          transform: [{ scale: pressed ? 0.98 : 1 }],
          shadowColor: isDark ? '#000' : colors.shadow,
        },
        isDark && styles.darkContainer,
      ]}
      onPress={() => onPress?.(article)}
    >
      {/* Image */}
      <View
        style={[
          styles.imageContainer,
          isCompact && styles.compactImageContainer,
        ]}
      >
        <Image source={{ uri: article.image }} style={styles.image} />
        {!isCompact && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.imageOverlay}
          />
        )}
        {!isCompact && (
          <View style={styles.categoryBadge}>
            <ThemedText
              type="label-small"
              weight="bold"
              lightColor="#FFFFFF"
              darkColor="#FFFFFF"
              style={styles.categoryText}
            >
              {article.category}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={[styles.content, isCompact && styles.compactContent]}>
        <View style={styles.metaRow}>
          <ThemedText
            type="label-small"
            lightColor={colors.textSecondary}
            darkColor={colors.textSecondary}
            style={{ fontSize: isCompact ? 10 : 12 }}
          >
            {article.publishedAt}
          </ThemedText>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <ThemedText
            type="label-small"
            lightColor={colors.textSecondary}
            darkColor={colors.textSecondary}
            style={{ fontSize: isCompact ? 10 : 12 }}
          >
            5 min read
          </ThemedText>
        </View>

        <ThemedText
          type={isCompact ? 'card-title-small' : 'sub-title-small'}
          weight="bold"
          numberOfLines={2}
          style={[styles.title, isCompact && styles.compactTitle]}
        >
          {article.title}
        </ThemedText>

        {!isCompact && (
          <ThemedText
            type="body-small"
            lightColor={colors.textSecondary}
            darkColor={colors.textSecondary}
            numberOfLines={2}
            style={styles.excerpt}
          >
            {article.excerpt}
          </ThemedText>
        )}

        <View style={[styles.footer, isCompact && styles.compactFooter]}>
          <ThemedText
            type="label-small"
            weight="bold"
            lightColor={colors.tint}
            darkColor={colors.tint}
          >
            Read more
          </ThemedText>
          <MaterialCommunityIcons
            name="arrow-right"
            size={16}
            color={colors.tint}
          />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: Platform.select({ ios: 0, android: 1 }),
    elevation: 4,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  compactContainer: {
    flexDirection: 'row',
    height: 110,
    marginBottom: 16,
    borderRadius: 16,
  },
  darkContainer: {
    borderWidth: 1,
    shadowOpacity: 0.3,
    shadowColor: '#000',
  },
  imageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  compactImageContainer: {
    height: '100%',
    width: 110,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  categoryText: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    padding: 20,
    gap: 10,
  },
  compactContent: {
    flex: 1,
    padding: 12,
    gap: 4,
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 18,
    lineHeight: 26,
  },
  compactTitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  excerpt: {
    opacity: 0.8,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  compactFooter: {
    marginTop: 4,
  },
});

export default NewsCard;
