import Container from '@/components/Container';
import PageContainer from '@/components/PageContainer';
import RatingSummary from '@/components/RatingSummary';
import ReviewCard from '@/components/ReviewCard';
import { ThemedText } from '@/components/themed-text';
import { card, colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRoom } from '@/context/RoomContext';
import {
  getRepliesByReviewId,
  getBusinessReviews,
} from '@/services/FeedbackService';
import type { ReviewWithAuthor } from '@/types/Feedback';
import { useAuth } from '@/context/AuthContext';

type Review = {
  id: string;
  user: {
    name: string;
    avatar?: string;
    isVerified?: boolean; // guest who actually stayed
    role?: 'tourist' | 'owner';
    isCurrentUser?: boolean; // if this review is by the current user
  };
  rating: number; // 1-5
  comment: string;
  images?: string[]; // array of image URLs uploaded by user
  createdAt: string; // ISO date
  likes: number;
  dislikes: number;
  youLiked?: boolean;
  youDisliked?: boolean;
  replies?: Array<{
    id: string;
    user: { name: string; role?: 'tourist' | 'owner' };
    comment: string;
    createdAt: string;
  }>;
};

// Map API review row to UI review card shape
function mapReviewFactory(currentUserId?: string) {
  return function mapReview(r: ReviewWithAuthor): Review {
  const fullName = [
    (r.tourist as any)?.first_name,
    (r.tourist as any)?.middle_name,
    (r.tourist as any)?.last_name,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
  const displayName = fullName || (r.user as any)?.email || 'Tourist';
  const isCurrentUser = currentUserId
    ? String(r.tourist_id) === String(currentUserId)
    : false;
  return {
    id: r.id,
    user: {
      name: displayName,
      avatar: (r.user as any)?.user_profile || undefined,
      role: 'tourist',
      isVerified: true,
      isCurrentUser,
    },
    rating: Number(r.rating || 0),
    comment: r.message || '',
    images: Array.isArray(r.photos)
      ? r.photos.map((p) => p.photo_url).filter(Boolean)
      : [],
    createdAt: r.created_at,
    likes: 0,
    dislikes: 0,
    replies: [],
  };
  };
}

const ratingTabs = ['All', '5', '4', '3', '2', '1'] as const;

const Ratings = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [activeFilter, setActiveFilter] =
    useState<(typeof ratingTabs)[number]>('All');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { selectedRoomId } = useRoom();
  const [reviewState, setReviewState] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      if (!selectedRoomId) {
        setReviewState([]);
        return;
      }
      setLoading(true);
      try {
  const rows = await getBusinessReviews(selectedRoomId, 'Room');
        if (!isActive) return;
  const mapReview = mapReviewFactory(String(user?.id || ''));
  const mapped = rows.map(mapReview);
        setReviewState(mapped);
      } catch (e) {
        setReviewState([]);
      } finally {
        if (isActive) setLoading(false);
      }
    };
    load();
    return () => {
      isActive = false;
    };
  }, [selectedRoomId]);

  const avgRating = useMemo(() => {
    if (!reviewState.length) return 0;
    return (
      reviewState.reduce((sum, r) => sum + r.rating, 0) / reviewState.length
    );
  }, [reviewState]);

  const distribution = useMemo(() => {
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviewState.forEach((r) => (dist[r.rating] = (dist[r.rating] || 0) + 1));
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

  // Lazy-load replies when expanding a review
  const loadReplies = async (id: string) => {
    try {
      const reps = await getRepliesByReviewId(id);
      setReviewState((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                replies: reps.map((rep) => ({
                  id: rep.id,
                  user: { name: 'Owner', role: 'owner' },
                  comment: rep.message,
                  createdAt: rep.created_at,
                })),
              }
            : r
        )
      );
    } catch {}
  };

  const toggleExpand = (id: string) => {
    setExpanded((e) => {
      const next = !e[id];
      if (next) {
        const target = reviewState.find((r) => r.id === id);
        if (target && (!target.replies || target.replies.length === 0)) {
          loadReplies(id);
        }
      }
      return { ...e, [id]: next };
    });
  };

  const canReply = (
    from: Review['user']['role'],
    to?: Review['user']['role']
  ) => {
    if (!from || !to) return false;
    if (from === to) return false; // tourist->tourist disabled, owner->owner disabled
    return true; // tourist <-> owner only
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Delete review',
      'Are you sure you want to delete this review? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const { deleteReview } = await import('@/services/FeedbackService');
              await deleteReview(id);
              setReviewState((prev) => prev.filter((r) => r.id !== id));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <PageContainer style={{ paddingTop: 0 }}>
      {/* Summary */}
      <RatingSummary
        avgRating={avgRating}
        totalReviews={reviewState.length}
        distribution={distribution}
      />

      {/* Filter Tabs */}
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

      {/* Reviews List */}
      <FlatList
        data={filteredReviews}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        renderItem={({ item }) => (
          <ReviewCard
            item={item}
            expanded={expanded[item.id] || false}
            onToggleExpand={() => toggleExpand(item.id)}
            canReply={canReply('owner', item.user.role) && !item.user.isCurrentUser}
            canDelete={!!item.user.isCurrentUser}
            onDelete={() => confirmDelete(item.id)}
            onReply={() => console.log('Reply to', item.id)}
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
        refreshing={loading}
        onRefresh={() => {
          if (!selectedRoomId) return;
          (async () => {
            setLoading(true);
            try {
              const rows = await getBusinessReviews(selectedRoomId, 'Room');
              const mapReview = mapReviewFactory(String(user?.id || ''));
              const mapped = rows.map(mapReview);
              setReviewState(mapped);
            } finally {
              setLoading(false);
            }
          })();
        }}
      />
    </PageContainer>
  );
};

export default Ratings;

const styles = StyleSheet.create({
  filterTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
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
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
});
