import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { NewsArticle } from '@/services/HomeContentService';

type Props = {
  article: NewsArticle;
  onPress?: (article: NewsArticle) => void;
};

const NewsCard: React.FC<Props> = ({ article, onPress }) => (
  <Pressable style={styles.card} onPress={() => onPress?.(article)}>
    <Image source={{ uri: article.image }} style={styles.image} />
    <View style={styles.content}>
      <View style={styles.tag}>
        <ThemedText type="label-small" lightColor="#FFEEE6">
          {article.category}
        </ThemedText>
      </View>
      <ThemedText
        type="body-medium"
        weight="bold"
        numberOfLines={2}
        lightColor="#fff"
      >
        {article.title}
      </ThemedText>
      <ThemedText
        type="body-small"
        numberOfLines={2}
        lightColor="rgba(255,255,255,0.75)"
      >
        {article.excerpt}
      </ThemedText>
      <ThemedText type="label-small" lightColor="rgba(255,255,255,0.6)">
        {article.publishedAt}
      </ThemedText>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#19182A',
    marginBottom: 14,
  },
  image: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: 14,
    gap: 6,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginBottom: 4,
  },
});

export default NewsCard;
