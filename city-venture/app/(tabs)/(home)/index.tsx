import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  RefreshControl,
  useColorScheme,
  Platform,
  UIManager,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// --- YOUR IMPORTS ---
import HeroSection from '@/components/home/HeroSection';
import NewsAndEventsSection from '@/components/home/NewsAndEventsSection';
import { ThemedText } from '@/components/themed-text';
import CityListSection from '@/components/home/CityListSection';
import PersonalRecommendationSection from '@/components/home/PersonalRecommendationSection';
import VisitorsHandbookSection from '@/components/home/VisitorsHandbookSection';
import SpecialOffersSection from '@/components/home/SpecialOffersSection';
import FeaturedPartnersSection from '@/components/home/FeaturedPartnersSection';
import FeaturedTouristSpotsSection from '@/components/home/FeaturedTouristSpotsSection';
import ReportIssueSection from '@/components/home/ReportIssueSection';
import SearchBar from '@/components/SearchBar';

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
import {
  ACTIONS,
  PLACEHOLDER_EVENTS,
  PLACEHOLDER_NEWS,
  type ActionItem,
} from '@/components/home/data';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HERO_HEIGHT = 280;
const SCREEN_WIDTH = Dimensions.get('window').width;
const HEADER_SCROLL_THRESHOLD = 80;

const AnimatedScrollView = Animated.ScrollView;

const HomeScreen = () => {
  const { user } = useAuth();
  const { top: insetsTop, bottom } = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const didRedirect = useRef(false);

  // --- Animation Values ---
  const scrollY = useSharedValue(0);
  const prevScrollY = useSharedValue(0);
  const headerVisible = useSharedValue(1); // 1 = Visible, 0 = Hidden

  // --- State ---
  const [searchValue, setSearchValue] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('Hello');

  const [eventState, setEventState] = useState<{
    data: HomeEvent[];
    loading: boolean;
    error?: string;
  }>({
    data: [],
    loading: true,
  });
  const [newsState, setNewsState] = useState<{
    data: NewsArticle[];
    loading: boolean;
    error?: string;
  }>({
    data: [],
    loading: true,
  });

  // --- Effects ---
  useEffect(() => {
    const greetings = [
      'Hello',
      'Bonjour',
      'Hola',
      'Ciao',
      'Konnichiwa',
      'Guten Tag',
      'Namaste',
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % greetings.length;
      setGreeting(greetings[index]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user && !didRedirect.current) {
      didRedirect.current = true;
      router.replace('/(screens)');
    }
  }, [user]);

  const loadHomeContent = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else {
      setEventState((prev) => ({ ...prev, loading: true }));
      setNewsState((prev) => ({ ...prev, loading: true }));
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    setEventState({ data: PLACEHOLDER_EVENTS, loading: false });
    setNewsState({ data: PLACEHOLDER_NEWS, loading: false });
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadHomeContent();
  }, [loadHomeContent]);

  // --- UPDATED SCROLL HANDLER (Fixes Slow Scroll Issue) ---
  const handleScroll = useAnimatedScrollHandler((event) => {
    const currentY = event.contentOffset.y;
    const diff = currentY - prevScrollY.value;

    // 1. Top of screen logic (always show fully)
    if (currentY < HEADER_SCROLL_THRESHOLD) {
      if (headerVisible.value !== 1) {
        headerVisible.value = withTiming(1, { duration: 200 });
      }
    } else {
      // 2. Scrolled down logic
      // We use '0' instead of '5' to catch even the slowest downward scroll
      if (diff > 0 && headerVisible.value !== 0) {
        // Scrolling Down -> Hide Row 1
        headerVisible.value = withTiming(0, {
          duration: 250,
          easing: Easing.out(Easing.ease),
        });
      }
      // We keep a small buffer (-3) for scrolling up to prevent flickering
      else if (diff < -3 && headerVisible.value !== 1) {
        // Scrolling Up -> Show Row 1
        headerVisible.value = withTiming(1, {
          duration: 250,
          easing: Easing.out(Easing.ease),
        });
      }
    }

    prevScrollY.value = currentY;
    scrollY.value = currentY;
  });

  // --- Animated Styles ---
  const headerBackgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      backgroundColor: palette.primary,
    };
  });

  const topRowAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(headerVisible.value, [0, 1], [-60, 0]);
    const opacity = interpolate(headerVisible.value, [0, 1], [0, 1]);
    const height = interpolate(
      headerVisible.value,
      [0, 1],
      [0, 60],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
      height,
      marginBottom: interpolate(headerVisible.value, [0, 1], [0, 12]),
      overflow: 'hidden',
    };
  });

  const handleActionPress = (id: ActionItem['id']) => {
    switch (id) {
      case 'accommodation':
        navigateToAccommodationHome();
        break;
      case 'food':
        navigateToShopHome();
        break;
      case 'tours':
        navigateToTouristSpotHome();
        break;
      case 'tickets':
        navigateToEventHome();
        break;
      default:
        break;
    }
  };

  const handleEventPress = useCallback((event: HomeEvent) => {
    router.push({
      pathname: './(tabs)/(home)/(event)',
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

      {/* --- Sticky Header --- */}
      <View style={[styles.stickyHeader, { paddingTop: insetsTop + 10 }]}>
        {/* Animated Background Layer */}
        <Animated.View
          style={[StyleSheet.absoluteFill, headerBackgroundStyle]}
        />

        {/* Row 1: Profile + Icons */}
        <Animated.View style={[styles.topRow, topRowAnimatedStyle]}>
          <View style={styles.profileSection}>
            <View style={styles.profileIcon}>
              <Ionicons name="person" size={20} color="#FFF" />
            </View>
            <View>
              <ThemedText
                type="label-medium"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                {greeting}
              </ThemedText>
              <ThemedText
                type="body-large"
                weight="bold"
                style={{ color: '#FFF' }}
              >
                Tourist!
              </ThemedText>
            </View>
          </View>

          <View style={styles.iconRow}>
            <Pressable onPress={() => {}} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
            </Pressable>
            <Pressable
              onPress={() => navigateToCart()}
              style={styles.iconButton}
            >
              <Ionicons name="cart-outline" size={24} color="#FFF" />
            </Pressable>
          </View>
        </Animated.View>

        {/* Row 2: Search Bar */}
        <View style={styles.searchBarWrapper}>
          <SearchBar
            value={searchValue}
            onChangeText={setSearchValue}
            onSearch={() => {}}
            placeholder="Where do you want to go?"
            variant="plain"
            containerStyle={styles.searchBarContainer}
          />
        </View>
      </View>

      {/* --- Main Content --- */}
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
        <View style={{ height: HERO_HEIGHT - 30 }} />

        <View
          style={[styles.contentSheet, { backgroundColor: palette.background }]}
        >
          <ActionGrid items={ACTIONS} onPressItem={handleActionPress} />

          <View style={styles.sectionContainer}>
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
              onPressArticle={(article) =>
                router.push({
                  pathname: '/(tabs)/(home)',
                  params: { newsId: article.id },
                })
              }
              onPressEvent={(event) =>
                router.push({
                  pathname: '/(tabs)/(home)/(event)',
                  params: { eventId: event.id },
                })
              }
              onPressViewAllEvents={navigateToEventHome}
            />
          </View>
        </View>
      </AnimatedScrollView>
    </View>
  );
};

// --- Sub-Components ---

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

  return (
    <View style={styles.actionGridContainer}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
      >
        {pages.map((page, pageIndex) => (
          <View
            key={pageIndex}
            style={{ width: SCREEN_WIDTH, paddingHorizontal: 20 }}
          >
            <View style={styles.actionGridPage}>
              {page.map((item, index) => {
                const globalIndex = pageIndex * ITEMS_PER_PAGE + index;
                const palettes = [
                  { bg: 'rgba(52, 152, 219, 0.1)', icon: '#3498db' },
                  { bg: 'rgba(46, 204, 113, 0.1)', icon: '#2ecc71' },
                  { bg: 'rgba(155, 89, 182, 0.1)', icon: '#9b59b6' },
                  { bg: 'rgba(230, 126, 34, 0.1)', icon: '#e67e22' },
                  { bg: 'rgba(231, 76, 60, 0.1)', icon: '#e74c3c' },
                  { bg: 'rgba(26, 188, 156, 0.1)', icon: '#1abc9c' },
                  { bg: 'rgba(241, 196, 15, 0.1)', icon: '#f1c40f' },
                  { bg: 'rgba(52, 73, 94, 0.1)', icon: '#34495e' },
                ];
                const { bg, icon } = palettes[globalIndex % palettes.length];

                return (
                  <Pressable
                    key={item.id}
                    style={styles.actionItem}
                    onPress={() => onPressItem(item.id)}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: bg }]}>
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={26}
                        color={icon}
                      />
                    </View>
                    <ThemedText
                      type="label-small"
                      align="center"
                      style={styles.actionLabel}
                      lightColor={colors.textSecondary}
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

      {pages.length > 1 && (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchBarWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBarContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  contentSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    minHeight: 1000,
    overflow: 'hidden',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    gap: 30,
    marginTop: 10,
  },
  actionGridContainer: {
    paddingTop: 0,
    marginBottom: 20,
  },
  actionGridPage: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  actionItem: {
    width: '25%',
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -8,
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
