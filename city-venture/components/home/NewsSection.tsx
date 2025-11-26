import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import NewsCard from './NewsCard';
import type { NewsArticle } from '@/services/HomeContentService';
import SectionContainer from './SectionContainer';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  data: NewsArticle[];
  loading: boolean;
  error?: string;
  onPressArticle: (article: NewsArticle) => void;
};

const NewsSection: React.FC<Props> = ({
  data,
  loading,
  error,
  onPressArticle,
}) => {
  if (loading && data.length === 0) {
    return (
      <SectionContainer title="News & Updates">
        <NewsSkeleton />
      </SectionContainer>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <SectionContainer title="News & Updates">
        <EmptyState icon="newspaper-remove" message="No news articles yet." />
      </SectionContainer>
    );
  }

  return (
    <SectionContainer title="News & Updates">
      {error ? <SectionError message={error} /> : null}
      <View style={styles.list}>
        {data.map((article, index) => (
          <NewsCard
            key={article.id}
            article={article}
            onPress={onPressArticle}
            index={index}
            variant={index === 0 ? 'featured' : 'compact'}
          />
        ))}
      </View>
    </SectionContainer>
  );
};

const SectionError = ({ message }: { message?: string }) =>
  message ? (
    <ThemedText
      type="label-small"
      lightColor="#FFB4A2"
      style={{ marginBottom: 8 }}
    >
      {message}
    </ThemedText>
  ) : null;

const EmptyState = ({
  icon,
  message,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  message: string;
}) => {
  const scheme = useColorScheme() ?? 'light';

  return (
    <View
      style={[
        styles.emptyState,
        {
          backgroundColor: Colors[scheme].surfaceOverlay,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: Colors[scheme].border,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={Colors[scheme].icon}
        style={styles.emptyIcon}
      />
      <ThemedText
        type="label-small"
        lightColor={Colors[scheme].textSecondary}
        darkColor={Colors[scheme].textSecondary}
      >
        {message}
      </ThemedText>
    </View>
  );
};

const NewsSkeleton = () => {
  const scheme = useColorScheme() ?? 'light';
  const placeholderColor = Colors[scheme].accent;
  return (
    <>
      {Array.from({ length: 2 }).map((_, index) => (
        <View
          key={`news-skeleton-${index}`}
          style={[styles.newsSkeleton, { backgroundColor: placeholderColor }]}
        />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 20,
  },
  newsSkeleton: {
    height: 200,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
  },
  emptyState: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIcon: {
    marginBottom: 4,
  },
});

export default NewsSection;
