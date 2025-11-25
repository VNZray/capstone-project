import Header, { HEADER_BASE_HEIGHT } from '@/components/home/Header';
import HeroSection from '@/components/home/HeroSection';
import MainContentCard from '@/components/home/MainContentCard';
import WelcomeSection from '@/components/home/WelcomeSection';
import SectionContainer from '@/components/home/SectionContainer';

import EventListCard from '@/components/home/EventListCard';
import NewsCard from '@/components/home/NewsCard';
import { ThemedText } from '@/components/themed-text';
import CityListSection from '@/components/home/CityListSection';
import PersonalRecommendationSection from '@/components/home/PersonalRecommendationSection';
import SpecialOffersSection from '@/components/home/SpecialOffersSection';
import FeaturedPartnersSection from '@/components/home/FeaturedPartnersSection';
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';
import { WebLayout } from '@/components/layout/WebLayout';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/color';
import { navigateToAccommodationHome } from '@/routes/accommodationRoutes';
import { navigateToEventHome } from '@/routes/eventRoutes';
import { navigateToShopHome, navigateToCart } from '@/routes/shopRoutes';
import { navigateToTouristSpotHome } from '@/routes/touristSpotRoutes';
import {
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
  RefreshControl,
  useColorScheme,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ACTIONS,
  PROMO_CARD,
  PLACEHOLDER_EVENTS,
  PLACEHOLDER_NEWS,
  type ActionItem,
  type PromoCardContent,
} from '@/components/home/data';

const HERO_HEIGHT = 260;
const SCREEN_WIDTH = Dimensions.get('window').width;

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
      router.replace('/(screens)');
    }
  }, [user]);

  const displayName = user?.first_name ?? user?.last_name ?? 'Friend';

  const loadHomeContent = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setEventState((prev) => ({ ...prev, loading: true }));
      setNewsState((prev) => ({ ...prev, loading: true }));
    }

    // Simulate network delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    setEventState({
      data: PLACEHOLDER_EVENTS,
      loading: false,
    });
    setNewsState({
      data: PLACEHOLDER_NEWS,
      loading: false,
    });
    setRefreshing(false);
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
              tintColor={palette.primary}
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

              <CityListSection
                onPressCity={(city) => console.log(city.name)}
                onPressViewMore={() => console.log('View more cities')}
              />

              <PersonalRecommendationSection
                onPressItem={(item) => console.log(item.title)}
              />

              <SpecialOffersSection
                onPressOffer={(offer) => console.log(offer.title)}
              />

              <FeaturedPartnersSection
                onPressPartner={(partner) => console.log(partner.name)}
              />

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
                    color={colors.accent}
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

const EventSkeleton = () => {
  const scheme = useColorScheme() ?? 'light';
  const placeholderColor = Colors[scheme].accent;
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
    gap: 20,
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
    overflow: 'hidden', // Ensure rounded corners are respected
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
