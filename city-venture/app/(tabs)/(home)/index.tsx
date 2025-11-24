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
import CityListSection from '@/components/home/CityListSection';
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';
import { WebLayout } from '@/components/layout/WebLayout';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/color';
import { navigateToAccommodationHome } from '@/routes/accommodationRoutes';
import { navigateToEventHome } from '@/routes/eventRoutes';
import { navigateToShopHome, navigateToCart } from '@/routes/shopRoutes';
import { navigateToTouristSpotHome } from '@/routes/touristSpotRoutes';
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
  useColorScheme,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HERO_HEIGHT = 260;
const SCREEN_WIDTH = Dimensions.get('window').width;

type ActionItem = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

type PromoCardContent = {
  id: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
};

const ACTIONS: ActionItem[] = [
  {
    id: 'accommodation',
    label: 'Hotels',
    icon: 'bed',
  },
  {
    id: 'food',
    label: 'Food',
    icon: 'silverware-fork-knife',
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: 'bus',
  },
  {
    id: 'map',
    label: 'Map',
    icon: 'map-outline',
  },
  {
    id: 'tours',
    label: 'Tours',
    icon: 'island',
  },
  {
    id: 'tickets',
    label: 'Tickets',
    icon: 'ticket-confirmation-outline',
  },
  {
    id: 'guides',
    label: 'Guides',
    icon: 'account-tie',
  },
  {
    id: 'saved',
    label: 'Saved',
    icon: 'bookmark',
  },
  {
    id: 'cleaning',
    label: 'Cleaning',
    icon: 'broom',
  },
  {
    id: 'repair',
    label: 'Repair',
    icon: 'hammer-wrench',
  },
  {
    id: 'delivery',
    label: 'Delivery',
    icon: 'truck-delivery',
  },
  {
    id: 'laundry',
    label: 'Laundry',
    icon: 'washing-machine',
  },
  {
    id: 'massage',
    label: 'Massage',
    icon: 'spa',
  },
  {
    id: 'salon',
    label: 'Salon',
    icon: 'hair-dryer',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    icon: 'dumbbell',
  },
  {
    id: 'more',
    label: 'More',
    icon: 'dots-horizontal',
  },
];

const PROMO_CARD: PromoCardContent = {
  id: 'report',
  title: 'See something that needs attention?',
  description:
    'Report issues around the city and track ongoing fixes in one place.',
  primaryCta: 'View reports',
  secondaryCta: 'Report an issue',
};

const PLACEHOLDER_SPOTS: HighlightedTouristSpot[] = [
  {
    id: 'spot-aurora',
    name: 'Aurora Park Skyline',
    image:
      'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=900&q=80',
    barangay: 'Centro',
    rating: 4.8,
    reviews: 412,
  },
  {
    id: 'spot-river',
    name: 'Naga River Walk',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    barangay: 'Penafrancia',
    rating: 4.6,
    reviews: 289,
  },
  {
    id: 'spot-hill',
    name: 'Panoramic Hill Deck',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    barangay: 'Cararayan',
    rating: 4.9,
    reviews: 512,
  },
];

const PLACEHOLDER_BUSINESSES: PartnerBusiness[] = [
  {
    id: 'biz-cafe',
    name: 'Habitat Coffee & Co.',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80',
    category: 'Cafe',
    isVerified: true,
  },
  {
    id: 'biz-bistro',
    name: 'Riverstone Bistro',
    image:
      'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=700&q=80',
    category: 'Dining',
  },
  {
    id: 'biz-gear',
    name: 'Trail & Tide Outfitters',
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=700&q=80',
    category: 'Outdoor',
    isVerified: true,
  },
];

const PLACEHOLDER_EVENTS: HomeEvent[] = [
  {
    id: 'event-festival',
    name: 'City Lights Music Fest',
    date: 'Nov 24, 7:00 PM',
    location: 'Plaza Quezon',
    image:
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'event-ride',
    name: 'Sunrise Fun Ride',
    date: 'Nov 27, 5:30 AM',
    location: 'Naga River Park',
    image:
      'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'event-market',
    name: 'Magsaysay Night Market',
    date: 'Dec 02, 6:00 PM',
    location: 'Magsaysay Ave.',
    image:
      'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=700&q=80',
  },
];

const PLACEHOLDER_NEWS: NewsArticle[] = [
  {
    id: 'news-hub',
    title: 'New transport hub streamlines downtown commute',
    excerpt:
      'The integrated terminal opens this week, promising smoother rides and safer waiting areas for daily commuters.',
    category: 'Updates',
    image:
      'https://images.unsplash.com/photo-1505663912202-ac22d4cb370b?auto=format&fit=crop&w=900&q=80',
    publishedAt: 'Today',
  },
  {
    id: 'news-green',
    title: 'Green corridors add 200 new trees across barangays',
    excerpt:
      'Local volunteers and partners joined forces to expand shaded walkways that connect parks and bike lanes.',
    category: 'Community',
    image:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
    publishedAt: 'Yesterday',
  },
];

const AnimatedScrollView = Animated.ScrollView;

const HomeScreen = () => {
  const { user } = useAuth();
  const scrollY = useSharedValue(0);
  const { bottom } = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const isDarkMode = colorScheme === 'dark';
  const palette = Colors[colorScheme];
  const didRedirect = useRef(false);
  const [searchValue, setSearchValue] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  type SectionState<T> = {
    data: T[];
    loading: boolean;
    error?: string;
  };

  const [spotState, setSpotState] = useState<
    SectionState<HighlightedTouristSpot>
  >({
    data: [],
    loading: true,
  });
  const [businessState, setBusinessState] = useState<
    SectionState<PartnerBusiness>
  >({
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

  const resolveSectionData = useCallback(<T,>(data: T[], fallback: T[]) => {
    if (data && data.length > 0) return data;
    return fallback;
  }, []);

  useEffect(() => {
    if (!user && !didRedirect.current) {
      didRedirect.current = true;
      router.replace('/(screens)');
    }
  }, [user]);

  const displayName = user?.first_name ?? user?.last_name ?? 'Friend';

  const loadHomeContent = useCallback(
    async (isRefresh = false) => {
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
        setSpotState({
          data: resolveSectionData(spots ?? [], PLACEHOLDER_SPOTS),
          loading: false,
        });
        setBusinessState({
          data: resolveSectionData(businesses ?? [], PLACEHOLDER_BUSINESSES),
          loading: false,
        });
        setEventState({
          data: resolveSectionData(events ?? [], PLACEHOLDER_EVENTS),
          loading: false,
        });
        setNewsState({
          data: resolveSectionData(news ?? [], PLACEHOLDER_NEWS),
          loading: false,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to load content';
        setSpotState({
          data: PLACEHOLDER_SPOTS,
          loading: false,
          error: message,
        });
        setBusinessState({
          data: PLACEHOLDER_BUSINESSES,
          loading: false,
          error: message,
        });
        setEventState({
          data: PLACEHOLDER_EVENTS,
          loading: false,
          error: message,
        });
        setNewsState({
          data: PLACEHOLDER_NEWS,
          loading: false,
          error: message,
        });
      } finally {
        setRefreshing(false);
      }
    },
    [resolveSectionData]
  );

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
      case 'food':
        navigateToShopHome(); // Assuming food is under shops for now
        break;
      case 'transport':
        // TODO: Navigate to transport
        break;
      case 'map':
        // TODO: Navigate to map
        break;
      case 'tours':
        navigateToTouristSpotHome();
        break;
      case 'tickets':
        navigateToEventHome();
        break;
      case 'guides':
        // TODO: Navigate to guides
        break;
      case 'saved':
        // TODO: Navigate to saved
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
      pathname: '/(tabs)/(home)/(shop)/business-profile',
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
      return (
        <EmptyState icon="map-marker-off" message="No highlighted spots yet." />
      );
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
          style={{ marginRight: -24 }}
          ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
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
      return (
        <EmptyState icon="store-off" message="No partnered businesses yet." />
      );
    }

    return (
      <>
        {businessState.error ? (
          <SectionError message={businessState.error} />
        ) : null}
        <FlatList
          horizontal
          data={businessState.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BusinessCard business={item} onPress={handleBusinessPress} />
          )}
          style={{ marginRight: -24 }}
          ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
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
      return (
        <EmptyState
          icon="calendar-blank"
          message="No upcoming events available."
        />
      );
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
      return (
        <EmptyState icon="newspaper-remove" message="No news articles yet." />
      );
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
    <WebLayout>
      <View style={[styles.root, { backgroundColor: palette.background }]}>
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
              tintColor={isDarkMode ? '#fff' : '#0A1B47'}
            />
          }
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <ResponsiveContainer>
            <View style={styles.heroSpacer}>
              <WelcomeSection
                scrollY={scrollY}
                name={displayName}
                subtitle="Stay connected with city life, follow events, and access the services you need every day."
              />
            </View>

            <MainContentCard
              style={[
                styles.mainCard,
                {
                  backgroundColor: palette.surface,
                  shadowColor: palette.shadow,
                  shadowOpacity: isDarkMode ? 0.3 : 0.1,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 8,
                  borderWidth: isDarkMode ? 1 : StyleSheet.hairlineWidth,
                  borderColor: palette.border,
                },
              ]}
            >
              <ActionGrid items={ACTIONS} onPressItem={handleActionPress} />

              <CityListSection onPressCity={(city) => console.log(city.name)} />

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
            </MainContentCard>
          </ResponsiveContainer>
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
    </WebLayout>
  );
};

type ActionGridProps = {
  items: ActionItem[];
  onPressItem: (id: string) => void;
};

const ActionGrid: React.FC<ActionGridProps> = ({ items, onPressItem }) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useSharedValue(0);

  const ITEMS_PER_PAGE = 8;
  const pages = [];
  for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
    pages.push(items.slice(i, i + ITEMS_PER_PAGE));
  }

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const onMomentumScrollEnd = (event: any) => {
    const pageIndex = Math.round(
      event.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 40)
    );
    setCurrentPage(pageIndex);
  };

  // Calculate width based on screen width minus padding (20px each side)
  const PAGE_WIDTH = SCREEN_WIDTH - 40;

  return (
    <View>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        style={{ marginHorizontal: -4 }} // Negative margin to offset padding in items if needed
      >
        {pages.map((page, pageIndex) => (
          <View
            key={pageIndex}
            style={[styles.actionGridPage, { width: PAGE_WIDTH }]}
          >
            {page.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.actionItem, { width: '25%' }]}
                onPress={() => onPressItem(item.id)}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: colors.highlight },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={28}
                    color={colors.complementary}
                  />
                </View>
                <ThemedText
                  type="label-small"
                  align="center"
                  style={styles.actionLabel}
                  lightColor={colors.textSecondary}
                  darkColor={colors.textSecondary}
                >
                  {item.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        ))}
      </Animated.ScrollView>

      {/* Pagination Indicator */}
      <View style={styles.paginationContainer}>
        {pages.map((_, index) => {
          const isActive = currentPage === index;
          return (
            <View
              key={index}
              style={[
                styles.paginationDot,
                isActive ? styles.paginationDotActive : null,
                {
                  backgroundColor: isActive
                    ? colors.complementary
                    : colors.borderStrong,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

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
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <LinearGradient
      colors={[colors.primary, colors.accent]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.promoBase, style]}
    >
      <ThemedText
        type="sub-title-small"
        weight="bold"
        lightColor={colors.textInverse}
        darkColor={colors.textInverse}
      >
        {content.title}
      </ThemedText>
      <ThemedText
        type="body-small"
        lightColor={colors.textInverse}
        darkColor={colors.textInverse}
        style={[styles.promoDescription, { opacity: 0.9 }]}
      >
        {content.description}
      </ThemedText>
      <View style={styles.promoActions}>
        <Pressable
          style={[
            styles.ctaButton,
            styles.ctaSecondary,
            { backgroundColor: colors.surface },
          ]}
          onPress={onPrimaryPress}
        >
          <ThemedText
            type="label-small"
            weight="semi-bold"
            lightColor={colors.primary}
            darkColor={colors.primary}
          >
            {content.primaryCta}
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.ctaButton,
            styles.ctaPrimary,
            { backgroundColor: 'rgba(255,255,255,0.2)' },
          ]}
          onPress={onSecondaryPress}
        >
          <ThemedText
            type="label-small"
            weight="semi-bold"
            lightColor={colors.textInverse}
            darkColor={colors.textInverse}
          >
            {content.secondaryCta}
          </ThemedText>
        </Pressable>
      </View>
    </LinearGradient>
  );
};

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
}) => {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
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

const SpotsSkeleton = () => {
  const scheme = useColorScheme() ?? 'light';
  const placeholderColor = Colors[scheme].highlight;
  return (
    <View style={[styles.horizontalList, { flexDirection: 'row' }]}>
      {Array.from({ length: 3 }).map((_, index) => (
        <View
          key={`spot-skeleton-${index}`}
          style={[styles.spotSkeleton, { backgroundColor: placeholderColor }]}
        />
      ))}
    </View>
  );
};

const BusinessSkeleton = () => {
  const scheme = useColorScheme() ?? 'light';
  const placeholderColor = Colors[scheme].highlight;
  return (
    <View style={[styles.horizontalList, { flexDirection: 'row' }]}>
      {Array.from({ length: 3 }).map((_, index) => (
        <View
          key={`business-skeleton-${index}`}
          style={[
            styles.businessSkeleton,
            { backgroundColor: placeholderColor },
          ]}
        />
      ))}
    </View>
  );
};

const EventSkeleton = () => {
  const scheme = useColorScheme() ?? 'light';
  const placeholderColor = Colors[scheme].highlight;
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <View
          key={`event-skeleton-${index}`}
          style={[styles.eventSkeleton, { backgroundColor: placeholderColor }]}
        />
      ))}
    </>
  );
};

const NewsSkeleton = () => {
  const scheme = useColorScheme() ?? 'light';
  const placeholderColor = Colors[scheme].highlight;
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
  root: {
    flex: 1,
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
  actionGridPage: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  actionItem: {
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
    marginTop: 8,
  },
  ctaButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  ctaSecondary: {},
  ctaPrimary: {},
  horizontalList: {
    paddingRight: 0,
    paddingLeft: 0,
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 8,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  paginationDotActive: {
    width: 24,
  },
});

export default HomeScreen;
