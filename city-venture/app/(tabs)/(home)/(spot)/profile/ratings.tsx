import React, { useEffect, useMemo, useState } from 'react';
import PageContainer from '@/components/PageContainer';
import RatingSummary from '@/components/RatingSummary';
import ReviewCard from '@/components/ReviewCard';
import { ThemedText } from '@/components/themed-text';
import Container from '@/components/Container';
import { card, colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useTouristSpot } from '@/context/TouristSpotContext';
import FeedbackService from '@/services/FeedbackService';
import type { ReviewAndRating, Replies } from '@/types/Feedback';

type Review = {
  id: string;
  user: {
    name: string;
    avatar?: string;
    isVerified?: boolean;
    role?: 'tourist' | 'owner';
    isCurrentUser?: boolean;
  };
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  replies?: Array<{
    id: string;
    user: { name: string; role?: 'tourist' | 'owner' };
    comment: string;
    createdAt: string;
  }>;
};

const SAMPLE_REVIEWS: Review[] = [
  {
    id: '1',
    user: {
      name: 'Traveler A.',
      isVerified: true,
      role: 'tourist',
      isCurrentUser: true,
    },
    rating: 5,
    comment:
      'Beautiful place with stunning views and well maintained facilities. Highly recommend visiting during sunrise for the best experience.',
    images: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400',
    ],
    createdAt: '2025-09-15T10:00:00Z',
    replies: [
      {
        id: 'r1',
        user: { name: 'Local Guide', role: 'owner' },
        comment: 'Thank you for visiting! Come again.',
        createdAt: '2025-09-16T08:00:00Z',
      },
    ],
  },
  {
    id: '2',
    user: { name: 'Visitor B.', role: 'tourist' },
    rating: 4,
    comment:
      'Great experience overall though it was a bit crowded in the afternoon.',
    createdAt: '2025-09-14T12:20:00Z',
  },
];

const ratingTabs = ['All', '5', '4', '3', '2', '1'] as const;

const Ratings = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [activeFilter, setActiveFilter] =
    useState<(typeof ratingTabs)[number]>('All');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [reviewState, setReviewState] = useState<Review[]>(SAMPLE_REVIEWS);
  const { selectedSpotId } = useTouristSpot();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!selectedSpotId) {
        setReviewState([]);
        return;
      }
      try {
        const rows = await FeedbackService.getReviewsByTypeAndEntityId(
          'Tourist Spot',
          selectedSpotId
        );
        if (cancelled) return;
        const mapped: Review[] = rows.map((r: ReviewAndRating) => ({
          id: r.id,
          user: { name: 'Tourist', role: 'tourist' as const },
          rating: r.rating,
          comment: r.message,
          createdAt: r.created_at,
        }));
        setReviewState(mapped);
      } catch (e) {
        console.warn('Failed to load tourist spot reviews', e);
        if (!cancelled) setReviewState([]);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedSpotId]);

  const avgRating = useMemo(() => {
    if (!reviewState.length) return 0;
    return reviewState.reduce((s, r) => s + r.rating, 0) / reviewState.length;
  }, [reviewState]);

  const distribution = useMemo(() => {
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviewState.forEach((r) => {
      dist[r.rating] = (dist[r.rating] || 0) + 1;
    });
    const total = reviewState.length || 1;
    const order = [5, 4, 3, 2, 1];
    return order.map((k) => ({
      stars: k,
      count: dist[k],
      pct: (dist[k] / total) * 100,
    }));
  }, [reviewState]);

  const filteredReviews = useMemo(() => {
    if (activeFilter === 'All') return reviewState;
    const star = Number(activeFilter);
    return reviewState.filter((r) => r.rating === star);
  }, [activeFilter, reviewState]);

  // Likes/Dislikes/Share removed by request; only Reply is kept.

  const toggleExpand = (id: string) => {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
    const nowExpanded = !expanded[id];
    if (nowExpanded) {
      const target = reviewState.find((r) => r.id === id);
      if (target && !target.replies) {
        (async () => {
          try {
            const rep: Replies = await FeedbackService.getRepliesByReviewId(id);
            const mappedReplies: NonNullable<Review['replies']> = rep.map(
              (rp) => ({
                id: rp.id,
                user: { name: 'Owner/Staff', role: 'owner' as const },
                comment: rp.message,
                createdAt: rp.created_at,
              })
            );
            setReviewState((prev) =>
              prev.map((r) => (r.id === id ? { ...r, replies: mappedReplies } : r))
            );
          } catch (e) {
            console.warn('Failed to load replies for review', id, e);
          }
        })();
      }
    }
  };
  const canReply = (
    from: Review['user']['role'],
    to?: Review['user']['role']
  ) => {
    if (!from || !to) return false;
    if (from === to) return false;
    return true;
  };

  return (
    <PageContainer style={{ paddingTop: 0 }}>
      <RatingSummary
        avgRating={avgRating}
        totalReviews={reviewState.length}
        distribution={distribution}
      />
      <View style={styles.filterTabs}>
        {ratingTabs.map((tab) => {
          const active = tab === activeFilter;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveFilter(tab)}
              style={[
                styles.filterTab,
                active &&
                  (isDark
                    ? styles.filterTabActiveDark
                    : styles.filterTabActiveLight),
              ]}
            >
              <ThemedText
                type="label-small"
                weight={active ? 'bold' : 'medium'}
                style={{
                  color: active ? '#fff' : isDark ? '#CBD5E1' : colors.primary,
                }}
              >
                {tab}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      <FlatList
        data={filteredReviews}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        renderItem={({ item }) => (
          <ReviewCard
            item={item}
            expanded={expanded[item.id] || false}
            onToggleExpand={() => toggleExpand(item.id)}
            canReply={canReply('owner', item.user.role)}
            onReply={() => {}}
          />
        )}
        contentContainerStyle={{ paddingVertical: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <Container
            padding={20}
            backgroundColor={isDark ? card.dark : card.light}
          >
            <ThemedText type="body-small">No reviews yet.</ThemedText>
          </Container>
        }
      />
    </PageContainer>
  );
};

export default Ratings;

const styles = StyleSheet.create({
  filterTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  filterTabActiveLight: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabActiveDark: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
