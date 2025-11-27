import Header, { HEADER_BASE_HEIGHT } from '@/components/home/Header';
import HeroSection from '@/components/home/HeroSection';
import WelcomeSection from '@/components/home/WelcomeSection';

import NewsAndEventsSection from '@/components/home/NewsAndEventsSection';
import { ThemedText } from '@/components/themed-text';
import CityListSection from '@/components/home/CityListSection';
import PersonalRecommendationSection from '@/components/home/PersonalRecommendationSection';
import VisitorsHandbookSection from '@/components/home/VisitorsHandbookSection';
import SpecialOffersSection from '@/components/home/SpecialOffersSection';
import FeaturedPartnersSection from '@/components/home/FeaturedPartnersSection';
import FeaturedTouristSpotsSection from '@/components/home/FeaturedTouristSpotsSection';
import ReportIssueSection from '@/components/home/ReportIssueSection';

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
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
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
  PLACEHOLDER_EVENTS,
  PLACEHOLDER_NEWS,
  type ActionItem,
} from '@/components/home/data';

const HERO_HEIGHT = 260;
const SCREEN_WIDTH = Dimensions.get('window').width;

const AnimatedScrollView = Animated.ScrollView;

const HomeScreen = () => {
  const { user } = useAuth();
  const scrollY = useSharedValue(0);
  const { bottom } = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
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

  if (!user) return null;

  return (
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
        <View style={styles.heroSpacer}>
          <WelcomeSection
            scrollY={scrollY}
            name={displayName}
            subtitle="Stay connected with city life, follow events, and access the services you need every day."
          />
        </View>

        <View
          style={[
            styles.contentContainer,
            { backgroundColor: palette.background },
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

          <VisitorsHandbookSection />

          <SpecialOffersSection
            onPressOffer={(offer) => console.log(offer.title)}
          />

          <FeaturedPartnersSection
            onPressPartner={(partner) => console.log(partner.name)}
          />

          <FeaturedTouristSpotsSection />

          <ReportIssueSection
            onViewReports={() => console.log('View Reports')}
            onReportIssue={() => console.log('Report Issue')}
          />

          <NewsAndEventsSection
            newsData={newsState.data}
            eventsData={eventState.data}
            loading={newsState.loading || eventState.loading}
            error={newsState.error || eventState.error}
            onPressArticle={handleNewsPress}
            onPressEvent={handleEventPress}
            onPressViewAllEvents={navigateToEventHome}
          />
        </View>
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
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    setCurrentPage(pageIndex);
  };

  // Use full screen width for pagination to avoid edge bleeding
  const PAGE_WIDTH = SCREEN_WIDTH;

  return (
    <View style={styles.actionGridContainer}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        style={{ marginHorizontal: -20 }} // Negative margin to allow full width scrolling
      >
        {pages.map((page, pageIndex) => (
          <View
            key={pageIndex}
            style={{ width: PAGE_WIDTH, paddingHorizontal: 20 }}
          >
            <View style={[styles.actionGridPage, { width: '100%' }]}>
              {page.map((item, index) => {
                const globalIndex = pageIndex * ITEMS_PER_PAGE + index;
                // Modern subtle palette
                const palettes = [
                  { bg: 'rgba(52, 152, 219, 0.1)', icon: '#3498db' }, // Blue
                  { bg: 'rgba(46, 204, 113, 0.1)', icon: '#2ecc71' }, // Green
                  { bg: 'rgba(155, 89, 182, 0.1)', icon: '#9b59b6' }, // Purple
                  { bg: 'rgba(230, 126, 34, 0.1)', icon: '#e67e22' }, // Orange
                  { bg: 'rgba(231, 76, 60, 0.1)', icon: '#e74c3c' }, // Red
                  { bg: 'rgba(26, 188, 156, 0.1)', icon: '#1abc9c' }, // Teal
                  { bg: 'rgba(241, 196, 15, 0.1)', icon: '#f1c40f' }, // Yellow
                  { bg: 'rgba(52, 73, 94, 0.1)', icon: '#34495e' }, // Dark Blue
                ];
                const { bg, icon } = palettes[globalIndex % palettes.length];

                return (
                  <Pressable
                    key={item.id}
                    style={[styles.actionItem, { width: '25%' }]}
                    onPress={() => onPressItem(item.id)}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: bg }]}>
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={26}
                        color={icon}
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
                );
              })}
            </View>
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
                    ? colors.primary
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
  contentContainer: {
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 30,
    marginTop: -16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // backgroundColor set dynamically
  },
  actionGridContainer: {
    paddingTop: 16,
  },
  actionGridPage: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  actionItem: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '500',
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
    borderRadius: 4,
  },
  paginationDotActive: {
    width: 24,
  },
});

export default HomeScreen;
