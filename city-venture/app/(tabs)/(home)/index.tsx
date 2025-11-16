import Header, { HEADER_BASE_HEIGHT } from '@/components/home/Header';
import HeroSection from '@/components/home/HeroSection';
import MainContentCard from '@/components/home/MainContentCard';
import WelcomeSection from '@/components/home/WelcomeSection';
import SectionContainer from '@/components/home/SectionContainer';
import TouristSpotCard from '@/components/home/TouristSpotCard';
import BusinessCard from '@/components/home/BusinessCard';
import EventListCard from '@/components/home/EventListCard';
import NewsCard from '@/components/home/NewsCard';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import { navigateToAccommodationHome } from '@/routes/accommodationRoutes';
import { navigateToEventHome } from '@/routes/eventRoutes';
import { navigateToShopHome, navigateToCart } from '@/routes/shopRoutes';
import {
  navigateToTouristSpotHome,
} from '@/routes/touristSpotRoutes';
import {
  fetchHighlightedSpots,
  fetchPartnerBusinesses,
  fetchUpcomingEvents,
  fetchNewsArticles,
  type HighlightedTouristSpot,
  type PartnerBusiness,
  type HomeEvent,
  type NewsArticle,
} from '@/services/HomeContentService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  FlatList,
  RefreshControl,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HERO_HEIGHT = 260;
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_ITEM_WIDTH = (SCREEN_WIDTH - 64) / 4;

type ActionItem = {
  id: 'accommodation' | 'shops' | 'spots' | 'events';
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  colors: [string, string];
};

type PromoCardContent = {
  id: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
};

type QuickLink = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

const ACTIONS: ActionItem[] = [
  {
    id: 'accommodation',
    label: 'Accommodation',
    icon: 'bed-queen-outline',
    colors: ['#FF9D6C', '#FF6B4F'],
  },
  {
    id: 'shops',
    label: 'Shops',
    icon: 'storefront-outline',
    colors: ['#FDBA74', '#FF8F5E'],
  },
  {
    id: 'spots',
    label: 'Tourist Spots',
    icon: 'map-marker-radius-outline',
    colors: ['#FFB5C3', '#F16CA4'],
  },
  {
    id: 'events',
    label: 'Events',
    icon: 'calendar-star',
    colors: ['#B7A2FF', '#8B6CFF'],
  },
];

const PROMO_CARD: PromoCardContent = {
  id: 'report',
  title: 'Help us improve our city',
  description:
    'Create an account to report local issues and keep Naga thriving.',
  primaryCta: 'View Reports',
  secondaryCta: 'Report an issue',
};

const QUICK_LINKS: QuickLink[] = [
  {
    id: 'updates',
    title: 'City Updates',
    description: 'Latest advisories, announcements, and emergency bulletins.',
    icon: 'newspaper-variant-outline',
  },
  {
    id: 'explore',
    title: 'Explore Naga',
    description: 'Curated guides, upcoming events, and nearby gems.',
    icon: 'map-marker-radius',
  },
];

const AnimatedScrollView = Animated.ScrollView;

const HomeScreen = () => {
  const { user } = useAuth();
  const scrollY = useSharedValue(0);
  const { bottom } = useSafeAreaInsets();
  const didRedirect = useRef(false);
  const [searchValue, setSearchValue] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  type SectionState<T> = {
    data: T[];
    loading: boolean;
    error?: string;
  };

  const [spotState, setSpotState] = useState<SectionState<HighlightedTouristSpot>>({
    data: [],
    loading: true,
  });
  const [businessState, setBusinessState] = useState<SectionState<PartnerBusiness>>({
    data: [],
    loading: true,
  });
  const [eventState, setEventState] = useState<SectionState<HomeEvent>>({
    data: [],
    loading: true,
  });
  const [newsState, setNewsState] = useState<SectionState<NewsArticle>>({
    data: [],
    loading: true,
  });

  useEffect(() => {
    if (!user && !didRedirect.current) {
      didRedirect.current = true;
      router.replace('/(screens)/Login');
    }
  }, [user]);

  const displayName = user?.first_name ?? user?.last_name ?? 'Friend';

  const loadHomeContent = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setSpotState((prev) => ({ ...prev, loading: true }));
      setBusinessState((prev) => ({ ...prev, loading: true }));
      setEventState((prev) => ({ ...prev, loading: true }));
      setNewsState((prev) => ({ ...prev, loading: true }));
    }

    try {
      const [spots, businesses, events, news] = await Promise.all([
        fetchHighlightedSpots(),
        fetchPartnerBusinesses(),
        fetchUpcomingEvents(),
        fetchNewsArticles(),
      ]);
      setSpotState({ data: spots ?? [], loading: false });
      setBusinessState({ data: businesses ?? [], loading: false });
      setEventState({ data: events ?? [], loading: false });
      setNewsState({ data: news ?? [], loading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load content';
      setSpotState((prev) => ({ ...prev, loading: false, error: message }));
      setBusinessState((prev) => ({ ...prev, loading: false, error: message }));
      setEventState((prev) => ({ ...prev, loading: false, error: message }));
      setNewsState((prev) => ({ ...prev, loading: false, error: message }));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHomeContent();
  }, [loadHomeContent]);

  const handleRefresh = useCallback(() => {
    loadHomeContent(true);
  }, [loadHomeContent]);

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const handleActionPress = (id: ActionItem['id']) => {
    switch (id) {
      case 'accommodation':
        navigateToAccommodationHome();
        break;
      case 'shops':
        navigateToShopHome();
        break;
      case 'spots':
        navigateToTouristSpotHome();
        break;
      case 'events':
        navigateToEventHome();
        break;
      default:
        break;
    }
  };

  const handleSpotPress = useCallback((spot: HighlightedTouristSpot) => {
    router.push({
      pathname: '/(tabs)/(home)/(spot)/profile/profile',
      params: { spotId: spot.id },
    });
  }, []);

  const handleBusinessPress = useCallback((business: PartnerBusiness) => {
    router.push({
      pathname: '/(tabs)/(home)/(shop)',
      params: { businessId: business.id },
    });
  }, []);

  const handleEventPress = useCallback((event: HomeEvent) => {
    router.push({
      pathname: '/(tabs)/(home)/(event)',
      params: { eventId: event.id },
    });
  }, []);

  const handleNewsPress = useCallback((article: NewsArticle) => {
    router.push({
      pathname: '/(tabs)/(home)',
      params: { newsId: article.id },
    });
  }, []);

  const renderSpotSection = () => {
    if (spotState.loading && spotState.data.length === 0) {
      return <SpotsSkeleton />;
    }
    if (!spotState.loading && spotState.data.length === 0) {
      return <EmptyState icon="map-marker-off" message="No highlighted spots yet." />;
    }

    return (
      <>
        {spotState.error ? <SectionError message={spotState.error} /> : null}
        <FlatList
          horizontal
          data={spotState.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouristSpotCard spot={item} onPress={handleSpotPress} />
          )}
          contentContainerStyle={styles.horizontalList}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: 316,
            offset: 316 * index,
            index,
          })}
        />
      </>
    );
  };

  const renderBusinessSection = () => {
    if (businessState.loading && businessState.data.length === 0) {
      return <BusinessSkeleton />;
    }
    if (!businessState.loading && businessState.data.length === 0) {
      return <EmptyState icon="store-off" message="No partnered businesses yet." />;
    }

    return (
      <>
        {businessState.error ? <SectionError message={businessState.error} /> : null}
        <FlatList
          horizontal
          data={businessState.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BusinessCard business={item} onPress={handleBusinessPress} />
          )}
          contentContainerStyle={styles.horizontalList}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: 216,
            offset: 216 * index,
            index,
          })}
        />
      </>
    );
  };

  const renderEventSection = () => {
    if (eventState.loading && eventState.data.length === 0) {
      return <EventSkeleton />;
    }
    if (!eventState.loading && eventState.data.length === 0) {
      return <EmptyState icon="calendar-blank" message="No upcoming events available." />;
    }

    return (
      <>
        {eventState.error ? <SectionError message={eventState.error} /> : null}
        {eventState.data.map((event) => (
          <EventListCard
            key={event.id}
            event={event}
            onPress={handleEventPress}
          />
        ))}
      </>
    );
  };

  const renderNewsSection = () => {
    if (newsState.loading && newsState.data.length === 0) {
      return <NewsSkeleton />;
    }
    if (!newsState.loading && newsState.data.length === 0) {
      return <EmptyState icon="newspaper-remove" message="No news articles yet." />;
    }

    return (
      <>
        {newsState.error ? <SectionError message={newsState.error} /> : null}
        {newsState.data.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            onPress={handleNewsPress}
          />
        ))}
      </>
    );
  };

  if (!user) return null;

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <HeroSection scrollY={scrollY} heroHeight={HERO_HEIGHT} />

      <AnimatedScrollView
        style={StyleSheet.absoluteFill}
        contentContainerStyle={{
          paddingBottom: bottom + 32,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
          />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSpacer}>
          <WelcomeSection
            scrollY={scrollY}
            name={displayName}
            subtitle="Stay connected with city life, follow events, and access the services you need every day."
          />
        </View>

        <MainContentCard style={styles.mainCard}>
          <ActionGrid items={ACTIONS} onPressItem={handleActionPress} />

          <SectionContainer
            title="Highlighted Tourist Spots"
            onPressViewAll={navigateToTouristSpotHome}
          >
            {renderSpotSection()}
          </SectionContainer>

          <SectionContainer
            title="Partnered Businesses"
            onPressViewAll={navigateToShopHome}
          >
            {renderBusinessSection()}
          </SectionContainer>

          <SectionContainer
            title="Upcoming Events"
            onPressViewAll={navigateToEventHome}
          >
            {renderEventSection()}
          </SectionContainer>

          <SectionContainer title="News & Updates">
            {renderNewsSection()}
          </SectionContainer>

          <PromoCard content={PROMO_CARD} style={styles.promoCard} />

          <View style={styles.quickLinksCard}>
            <ThemedText
              type="sub-title-small"
              weight="bold"
              lightColor="#F8F8FF"
            >
              Explore Naga
            </ThemedText>
            <View style={styles.quickLinkDivider} />
            {QUICK_LINKS.map((link) => (
              <QuickLinkRow key={link.id} link={link} />
            ))}
          </View>
        </MainContentCard>
      </AnimatedScrollView>

      <Header
        scrollY={scrollY}
        heroHeight={HERO_HEIGHT}
        searchValue={searchValue}
        onChangeSearch={setSearchValue}
        style={styles.header}
        onPressBell={() => {}}
        onPressCart={() => navigateToCart()}
      />
    </View>
  );
};

type ActionGridProps = {
  items: ActionItem[];
  onPressItem: (id: ActionItem['id']) => void;
};

const ActionGrid: React.FC<ActionGridProps> = ({ items, onPressItem }) => (
  <View style={styles.actionGrid}>
    {items.map((item) => (
      <Pressable
        key={item.id}
        style={styles.actionItem}
        onPress={() => onPressItem(item.id)}
      >
        <LinearGradient
          colors={item.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.actionIcon}
        >
          <MaterialCommunityIcons name={item.icon} size={22} color="#fff" />
        </LinearGradient>
        <ThemedText
          type="label-small"
          align="center"
          lightColor="#E8E9F4"
          style={styles.actionLabel}
        >
          {item.label}
        </ThemedText>
      </Pressable>
    ))}
  </View>
);

type PromoCardProps = {
  content: PromoCardContent;
  style?: StyleProp<ViewStyle>;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
};

const PromoCard: React.FC<PromoCardProps> = ({
  content,
  style,
  onPrimaryPress,
  onSecondaryPress,
}) => (
  <LinearGradient
    colors={['#6A3DFB', '#9D4EDD']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.promoBase, style]}
  >
    <ThemedText type="sub-title-small" weight="bold" lightColor="#FFFFFF">
      {content.title}
    </ThemedText>
    <ThemedText
      type="body-small"
      lightColor="rgba(255,255,255,0.9)"
      style={styles.promoDescription}
    >
      {content.description}
    </ThemedText>
    <View style={styles.promoActions}>
      <Pressable
        style={[styles.ctaButton, styles.ctaSecondary]}
        onPress={onPrimaryPress}
      >
        <ThemedText type="label-small" weight="semi-bold" lightColor="#20123A">
          {content.primaryCta}
        </ThemedText>
      </Pressable>
      <Pressable
        style={[styles.ctaButton, styles.ctaPrimary]}
        onPress={onSecondaryPress}
      >
        <ThemedText type="label-small" weight="semi-bold" lightColor="#fff">
          {content.secondaryCta}
        </ThemedText>
      </Pressable>
    </View>
  </LinearGradient>
);

type QuickLinkRowProps = {
  link: QuickLink;
  onPress?: (link: QuickLink) => void;
};

const QuickLinkRow: React.FC<QuickLinkRowProps> = ({ link, onPress }) => (
  <Pressable style={styles.quickLinkRow} onPress={() => onPress?.(link)}>
    <View style={styles.quickLinkIconContainer}>
      <MaterialCommunityIcons name={link.icon} size={22} color="#F86B4F" />
    </View>
    <View style={styles.quickLinkContent}>
      <ThemedText type="body-medium" weight="semi-bold" lightColor="#FCFCFC">
        {link.title}
      </ThemedText>
      <ThemedText
        type="body-extra-small"
        lightColor="rgba(255,255,255,0.78)"
      >
        {link.description}
      </ThemedText>
    </View>
    <ThemedText type="body-medium" lightColor="rgba(255,255,255,0.5)">
      {'>'}
    </ThemedText>
  </Pressable>
);

const SectionError = ({ message }: { message?: string }) =>
  message ? (
    <ThemedText type="label-small" lightColor="#FFB4A2">
      {message}
    </ThemedText>
  ) : null;

const EmptyState = ({
  icon,
  message,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  message: string;
}) => (
  <View style={styles.emptyState}>
    <MaterialCommunityIcons
      name={icon}
      size={22}
      color="rgba(255,255,255,0.6)"
      style={styles.emptyIcon}
    />
    <ThemedText type="label-small" lightColor="rgba(255,255,255,0.7)">
      {message}
    </ThemedText>
  </View>
);

const SpotsSkeleton = () => (
  <View style={[styles.horizontalList, { flexDirection: 'row' }]}>
    {Array.from({ length: 3 }).map((_, index) => (
      <View key={`spot-skeleton-${index}`} style={styles.spotSkeleton} />
    ))}
  </View>
);

const BusinessSkeleton = () => (
  <View style={[styles.horizontalList, { flexDirection: 'row' }]}>
    {Array.from({ length: 3 }).map((_, index) => (
      <View key={`business-skeleton-${index}`} style={styles.businessSkeleton} />
    ))}
  </View>
);

const EventSkeleton = () => (
  <>
    {Array.from({ length: 3 }).map((_, index) => (
      <View key={`event-skeleton-${index}`} style={styles.eventSkeleton} />
    ))}
  </>
);

const NewsSkeleton = () => (
  <>
    {Array.from({ length: 2 }).map((_, index) => (
      <View key={`news-skeleton-${index}`} style={styles.newsSkeleton} />
    ))}
  </>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05050A',
  },
  heroSpacer: {
    minHeight: HERO_HEIGHT + HEADER_BASE_HEIGHT * 0.05,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: HEADER_BASE_HEIGHT - 6,
    paddingBottom: 24,
  },
  mainCard: {
    marginTop: -16,
    gap: 28,
  },
  sectionHeading: {
    marginBottom: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: GRID_ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: 24,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    marginTop: 8,
  },
  promoBase: {
    borderRadius: 28,
    padding: 24,
    gap: 10,
  },
  promoCard: {
    marginTop: 4,
  },
  promoDescription: {
    lineHeight: 20,
  },
  promoActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  ctaButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  ctaSecondary: {
    backgroundColor: '#fff',
  },
  ctaPrimary: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  quickLinksCard: {
    backgroundColor: '#151426',
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },
  quickLinkDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 16,
  },
  quickLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  quickLinkIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(248,107,79,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinkContent: {
    flex: 1,
  },
  horizontalList: {
    paddingRight: 8,
  },
  spotSkeleton: {
    width: 300,
    height: 210,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginRight: 16,
  },
  businessSkeleton: {
    width: 200,
    height: 220,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginRight: 16,
  },
  eventSkeleton: {
    height: 96,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
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
    backgroundColor: '#151426',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIcon: {
    marginBottom: 4,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});

export default HomeScreen;
