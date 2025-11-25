import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NewsArticle } from '@/services/HomeContentService';

type Props = {
  article: NewsArticle;
  onPress?: (article: NewsArticle) => void;
};

const NewsCard: React.FC<Props> = ({ article, onPress }) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          transform: [{ scale: pressed ? 0.99 : 1 }],
          shadowColor: colors.shadow,
        },
      ]}
      onPress={() => onPress?.(article)}
    >
      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: article.image }} style={styles.image} />
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
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <ThemedText
            type="label-small"
            lightColor={colors.textSecondary}
            darkColor={colors.textSecondary}
          >
            {article.publishedAt}
          </ThemedText>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <ThemedText
            type="label-small"
            lightColor={colors.textSecondary}
            darkColor={colors.textSecondary}
          >
            5 min read
          </ThemedText>
        </View>

        <ThemedText type="sub-title-small" weight="bold" numberOfLines={2}>
          {article.title}
        </ThemedText>

        <ThemedText
          type="body-small"
          lightColor={colors.textSecondary}
          darkColor={colors.textSecondary}
          numberOfLines={2}
          style={styles.excerpt}
        >
          {article.excerpt}
        </ThemedText>

        <View style={styles.footer}>
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
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backdropFilter: 'blur(4px)',
  },
  categoryText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  excerpt: {
    opacity: 0.8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
});

export default NewsCard;
