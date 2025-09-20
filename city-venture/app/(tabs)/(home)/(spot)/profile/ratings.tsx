import React, { useMemo, useState } from 'react';
import PageContainer from '@/components/PageContainer';
import RatingSummary from '@/components/RatingSummary';
import ReviewCard from '@/components/ReviewCard';
import { ThemedText } from '@/components/themed-text';
import Container from '@/components/Container';
import { card, colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

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

const SAMPLE_REVIEWS: Review[] = [
  {
    id: '1',
    user: { name: 'Traveler A.', isVerified: true, role: 'tourist', isCurrentUser: true },
    rating: 5,
    comment: 'Beautiful place with stunning views and well maintained facilities. Highly recommend visiting during sunrise for the best experience.',
    images: [ 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400' ],
    createdAt: '2025-09-15T10:00:00Z',
    likes: 9,
    dislikes: 0,
    replies: [ { id: 'r1', user: { name: 'Local Guide', role: 'owner' }, comment: 'Thank you for visiting! Come again.', createdAt: '2025-09-16T08:00:00Z' } ]
  },
  {
    id: '2',
    user: { name: 'Visitor B.', role: 'tourist' },
    rating: 4,
    comment: 'Great experience overall though it was a bit crowded in the afternoon.',
    createdAt: '2025-09-14T12:20:00Z',
    likes: 3,
    dislikes: 0,
  },
];

const ratingTabs = ['All','5','4','3','2','1'] as const;

const Ratings = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [activeFilter, setActiveFilter] = useState<(typeof ratingTabs)[number]>('All');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [reviewState, setReviewState] = useState(SAMPLE_REVIEWS);

  const avgRating = useMemo(() => {
    if (!reviewState.length) return 0;
    return reviewState.reduce((s,r)=> s + r.rating,0) / reviewState.length;
  }, [reviewState]);

  const distribution = useMemo(() => {
    const dist: Record<number, number> = {1:0,2:0,3:0,4:0,5:0};
    reviewState.forEach(r => { dist[r.rating] = (dist[r.rating]||0) + 1; });
    const total = reviewState.length || 1; const order=[5,4,3,2,1];
    return order.map(k => ({ stars: k, count: dist[k], pct: (dist[k]/total)*100 }));
  }, [reviewState]);

  const filteredReviews = useMemo(() => {
    if (activeFilter === 'All') return reviewState;
    const star = Number(activeFilter); return reviewState.filter(r => r.rating === star);
  }, [activeFilter, reviewState]);

  const toggleLike = (id: string, type: 'like' | 'dislike') => {
    setReviewState(prev => prev.map(r => {
      if (r.id !== id) return r;
      let { likes, dislikes, youLiked, youDisliked } = r;
      if (type === 'like') {
        if (youLiked) { likes -= 1; youLiked = false; }
        else { likes += 1; youLiked = true; if (youDisliked) { dislikes -=1; youDisliked = false; } }
      } else {
        if (youDisliked) { dislikes -= 1; youDisliked = false; }
        else { dislikes += 1; youDisliked = true; if (youLiked) { likes -=1; youLiked = false; } }
      }
      return { ...r, likes, dislikes, youLiked, youDisliked };
    }));
  };

  const toggleExpand = (id: string) => setExpanded(e => ({ ...e, [id]: !e[id] }));
  const canReply = (from: Review['user']['role'], to?: Review['user']['role']) => {
    if (!from || !to) return false; if (from === to) return false; return true; };

  return (
    <PageContainer style={{ paddingTop: 0 }}>
      <RatingSummary avgRating={avgRating} totalReviews={reviewState.length} distribution={distribution} />
      <View style={styles.filterTabs}>
        {ratingTabs.map(tab => {
          const active = tab === activeFilter;
          return (
            <Pressable key={tab} onPress={() => setActiveFilter(tab)} style={[styles.filterTab, active && (isDark ? styles.filterTabActiveDark : styles.filterTabActiveLight)]}>
              <ThemedText type="label-small" weight={active ? 'bold':'medium'} style={{ color: active ? '#fff' : isDark ? '#CBD5E1' : colors.primary }}>{tab}</ThemedText>
            </Pressable>
          );
        })}
      </View>
      <FlatList
        data={filteredReviews}
        keyExtractor={i => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        renderItem={({ item }) => (
          <ReviewCard
            item={item}
            expanded={expanded[item.id] || false}
            onToggleExpand={() => toggleExpand(item.id)}
            onToggleLike={(type) => toggleLike(item.id, type)}
            canReply={canReply('owner', item.user.role)}
            onReply={() => {}}
            onShare={() => {}}
          />
        )}
        contentContainerStyle={{ paddingVertical: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <Container padding={20} backgroundColor={ isDark ? card.dark : card.light }>
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
  filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.primary, backgroundColor: 'transparent' },
  filterTabActiveLight: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabActiveDark: { backgroundColor: colors.primary, borderColor: colors.primary },
});
