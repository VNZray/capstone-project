import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Image,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import SearchBar from '@/components/SearchBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Routes } from '@/routes/mainRoutes';
import EventSkeleton from '@/components/skeleton/EventSkeleton';
import HorizontalDateScroll from '@/components/HorizontalDateScroll';
import EventFilterModal from '@/app/(tabs)/(home)/(event)/components/EventFilterModal';
import Container from '@/components/Container';
import Divider from '@/components/Divider';
import { AppHeader } from '@/components/header/AppHeader';
import PageContainer from '@/components/PageContainer';
import { usePublishedEvents, useFeaturedEvents } from '@/query/eventQuery';
import type { Event } from '@/types/Event';

const toLowerSafe = (v?: string | null) =>
  typeof v === 'string' ? v.toLowerCase() : '';

// Helper to format date as YYYY-MM-DD for comparison
const formatDateForComparison = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper to check if an event matches a selected date
const eventMatchesDate = (event: Event, selectedDate: Date): boolean => {
  const selectedDateStr = formatDateForComparison(selectedDate);
  const startDate = event.start_date?.split('T')[0];
  const endDate = event.end_date?.split('T')[0] || startDate;
  
  if (!startDate) return false;
  
  // Event matches if selected date is between start and end date
  return selectedDateStr >= startDate && selectedDateStr <= endDate;
};

// Helper to format event date for display
const formatEventDate = (event: Event): string => {
  if (!event.start_date) return 'Date TBD';
  
  const startDate = new Date(event.start_date);
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  };
  
  if (event.end_date && event.end_date !== event.start_date) {
    const endDate = new Date(event.end_date);
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  }
  
  return startDate.toLocaleDateString('en-US', options);
};

// Helper to get event location display
const getEventLocation = (event: Event): string => {
  const parts = [];
  if (event.venue_name) parts.push(event.venue_name);
  if (event.municipality_name) parts.push(event.municipality_name);
  if (parts.length === 0 && event.venue_address) parts.push(event.venue_address);
  return parts.join(', ') || 'Location TBD';
};

// Helper to get event image URL
const getEventImageUrl = (event: Event): string => {
  if (event.cover_image_url) return event.cover_image_url;
  if (event.images && event.images.length > 0) {
    const primaryImage = event.images.find(img => img.is_primary);
    return primaryImage?.file_url || event.images[0].file_url;
  }
  return 'https://via.placeholder.com/400x200?text=Event';
};

const EventScreen = () => {
  const router = useRouter();
  const colors = Colors.light;

  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'all',
  ]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Fetch events from API
  const { 
    data: publishedEvents = [], 
    isLoading: loading, 
    refetch,
    isRefetching: refreshing 
  } = usePublishedEvents();

  const { data: featuredEvents = [] } = useFeaturedEvents();

  const lastScrollOffset = useRef(0);
  const atTopRef = useRef(true);
  const wasScrollingUpRef = useRef(false);

  // Filter events by date, category and search query
  const filteredEvents = useMemo(() => {
    let result = [...publishedEvents];

    // Filter by selected date
    result = result.filter((event) => eventMatchesDate(event, selectedDate));

    // Filter by category
    if (!selectedCategories.includes('all')) {
      result = result.filter((event) => {
        const eventCategoryId = event.category_id || '';
        const eventCategoryName = (event.category_name || '').toLowerCase();
        return selectedCategories.some(
          (cat) => cat === eventCategoryId || cat === eventCategoryName
        );
      });
    }

    // Filter by search query
    if (query.trim()) {
      const term = toLowerSafe(query.trim());
      result = result.filter(
        (event) =>
          toLowerSafe(event.name).includes(term) ||
          toLowerSafe(event.description).includes(term) ||
          toLowerSafe(event.venue_name).includes(term) ||
          toLowerSafe(event.municipality_name).includes(term)
      );
    }

    return result;
  }, [publishedEvents, selectedCategories, query, selectedDate]);

  // Pull-to-refresh functionality
  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      const prev = lastScrollOffset.current;
      wasScrollingUpRef.current = offsetY < prev;
      atTopRef.current = offsetY <= 0;
      lastScrollOffset.current = offsetY;
    },
    []
  );

  const handleScrollEndDrag = useCallback(() => {
    if (
      atTopRef.current &&
      wasScrollingUpRef.current &&
      !refreshing &&
      !loading
    ) {
      onRefresh();
    }
  }, [loading, onRefresh, refreshing]);

  // Categorize events into sections
  const nearbyEvents = useMemo(
    () => filteredEvents.slice(0, 5),
    [filteredEvents]
  );

  // Events coming up in the next 7 days from selected date
  const comingSoonEvents = useMemo(() => {
    const now = selectedDate;
    const weekLater = new Date(selectedDate);
    weekLater.setDate(weekLater.getDate() + 7);
    
    return publishedEvents
      .filter((event) => {
        const startDate = new Date(event.start_date);
        return startDate >= now && startDate <= weekLater;
      })
      .slice(0, 5);
  }, [publishedEvents, selectedDate]);

  // Featured/popular events
  const popularEvents = useMemo(
    () => featuredEvents.slice(0, 5),
    [featuredEvents]
  );

  const handleCategoryToggle = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategories(['all']);
    } else {
      const newCategories = selectedCategories.includes(categoryId)
        ? selectedCategories.filter((id) => id !== categoryId)
        : [...selectedCategories.filter((id) => id !== 'all'), categoryId];

      setSelectedCategories(
        newCategories.length === 0 ? ['all'] : newCategories
      );
    }
  };

  const handleClearAll = () => {
    setSelectedCategories(['all']);
  };

  const handleApplyFilters = () => {
    setFilterModalVisible(false);
  };

  const handleEventPress = (eventId: string) => {
    router.push(Routes.event.detail(eventId) as any);
  };

  if (loading) {
    return <EventSkeleton />;
  }

  return (
    <>
      <AppHeader
        backButton
        title="Events"
        background="light"
        bottomComponent={
          <>
            <Container padding={0} backgroundColor="transparent">
              <Container
                direction="row"
                padding={0}
                backgroundColor="transparent"
              >
                <View style={{ width: '100%' }}>
                  <SearchBar
                    value={query}
                    variant="plain"
                    rightIcon={
                      <Pressable onPress={() => setFilterModalVisible(true)}>
                        <MaterialCommunityIcons
                          name="filter-variant"
                          size={24}
                        />
                        {selectedCategories.length > 1 ||
                        !selectedCategories.includes('all') ? (
                          <View style={styles.filterBadge}>
                            <ThemedText
                              type="label-small"
                              style={styles.filterBadgeText}
                            >
                              {
                                selectedCategories.filter((c) => c !== 'all')
                                  .length
                              }
                            </ThemedText>
                          </View>
                        ) : null}
                      </Pressable>
                    }
                    onChangeText={setQuery}
                    placeholder="Search events..."
                  />
                </View>
              </Container>

              {/* Date Scroll */}
              <View style={styles.dateScrollSection}>
                <HorizontalDateScroll
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  daysToShow={21}
                />
              </View>
            </Container>
          </>
        }
      />
      <PageContainer padding={0} style={{ backgroundColor: colors.background }}>
        {/* Search Bar with Filter Button */}

        {/* Events Sections */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          onScrollEndDrag={handleScrollEndDrag}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        >
          {/* Nearby Events */}
          {nearbyEvents.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <MaterialCommunityIcons
                    name="map-marker-radius"
                    size={20}
                    color={colors.accent}
                  />
                  <ThemedText
                    type="title-small"
                    weight="bold"
                    style={{ color: colors.text }}
                  >
                    Nearby Events
                  </ThemedText>
                </View>
                <Pressable>
                  <ThemedText
                    type="label-small"
                    style={{ color: colors.accent }}
                  >
                    See All
                  </ThemedText>
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {nearbyEvents.map((event) => (
                  <Pressable
                    key={event.id}
                    style={[
                      styles.eventCard,
                      { backgroundColor: colors.surface },
                    ]}
                    onPress={() => handleEventPress(event.id)}
                  >
                    <Image
                      source={{ uri: getEventImageUrl(event) }}
                      style={styles.eventImage}
                      resizeMode="cover"
                    />
                    <View style={styles.eventContent}>
                      <ThemedText
                        type="card-title-small"
                        weight="bold"
                        numberOfLines={2}
                        style={{ color: colors.text }}
                      >
                        {event.name}
                      </ThemedText>
                      <View style={styles.eventMeta}>
                        <MaterialCommunityIcons
                          name="calendar"
                          size={12}
                          color={colors.tint}
                        />
                        <ThemedText
                          type="label-small"
                          style={{ color: colors.textSecondary }}
                        >
                          {formatEventDate(event)}
                        </ThemedText>
                      </View>
                      <View style={styles.eventMeta}>
                        <MaterialCommunityIcons
                          name="map-marker"
                          size={12}
                          color={colors.tint}
                        />
                        <ThemedText
                          type="label-small"
                          numberOfLines={1}
                          style={{ color: colors.textSecondary }}
                        >
                          {getEventLocation(event)}
                        </ThemedText>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Coming Soon Events */}
          {comingSoonEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <MaterialCommunityIcons
                    name="calendar-clock"
                    size={20}
                    color={colors.accent}
                  />
                  <ThemedText
                    type="title-small"
                    weight="bold"
                    style={{ color: colors.text }}
                  >
                    Coming Soon
                  </ThemedText>
                </View>
                <Pressable>
                  <ThemedText
                    type="label-small"
                    style={{ color: colors.accent }}
                  >
                    See All
                  </ThemedText>
                </Pressable>
              </View>

              <View style={styles.verticalList}>
                {comingSoonEvents.map((event) => (
                  <Pressable
                    key={event.id}
                    style={[
                      styles.listEventCard,
                      { backgroundColor: colors.surface },
                    ]}
                    onPress={() => handleEventPress(event.id)}
                  >
                    <Image
                      source={{ uri: getEventImageUrl(event) }}
                      style={styles.listEventImage}
                      resizeMode="cover"
                    />
                    <View style={styles.listEventContent}>
                      <ThemedText
                        type="card-title-small"
                        weight="bold"
                        numberOfLines={2}
                        style={{ color: colors.text }}
                      >
                        {event.name}
                      </ThemedText>
                      <View style={styles.eventMeta}>
                        <MaterialCommunityIcons
                          name="calendar"
                          size={14}
                          color={colors.tint}
                        />
                        <ThemedText
                          type="label-small"
                          style={{ color: colors.textSecondary }}
                        >
                          {formatEventDate(event)}
                        </ThemedText>
                      </View>
                      <View style={styles.eventMeta}>
                        <MaterialCommunityIcons
                          name="map-marker"
                          size={14}
                          color={colors.tint}
                        />
                        <ThemedText
                          type="label-small"
                          style={{ color: colors.textSecondary }}
                        >
                          {getEventLocation(event)}
                        </ThemedText>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Popular Events */}
          {popularEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <MaterialCommunityIcons
                    name="fire"
                    size={20}
                    color={colors.accent}
                  />
                  <ThemedText
                    type="title-small"
                    weight="bold"
                    style={{ color: colors.text }}
                  >
                    Popular Events
                  </ThemedText>
                </View>
                <Pressable>
                  <ThemedText
                    type="label-small"
                    style={{ color: colors.accent }}
                  >
                    See All
                  </ThemedText>
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {popularEvents.map((event) => (
                  <Pressable
                    key={event.id}
                    style={[
                      styles.eventCard,
                      { backgroundColor: colors.surface },
                    ]}
                    onPress={() => handleEventPress(event.id)}
                  >
                    <Image
                      source={{ uri: getEventImageUrl(event) }}
                      style={styles.eventImage}
                      resizeMode="cover"
                    />
                    <View style={styles.eventContent}>
                      <ThemedText
                        type="card-title-small"
                        weight="bold"
                        numberOfLines={2}
                        style={{ color: colors.text }}
                      >
                        {event.name}
                      </ThemedText>
                      <View style={styles.eventMeta}>
                        <MaterialCommunityIcons
                          name="calendar"
                          size={12}
                          color={colors.tint}
                        />
                        <ThemedText
                          type="label-small"
                          style={{ color: colors.textSecondary }}
                        >
                          {formatEventDate(event)}
                        </ThemedText>
                      </View>
                      <View style={styles.eventMeta}>
                        <MaterialCommunityIcons
                          name="map-marker"
                          size={12}
                          color={colors.tint}
                        />
                        <ThemedText
                          type="label-small"
                          numberOfLines={1}
                          style={{ color: colors.textSecondary }}
                        >
                          {getEventLocation(event)}
                        </ThemedText>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="calendar-remove"
                size={64}
                color={colors.textSecondary}
              />
              <ThemedText
                style={{ color: colors.textSecondary, textAlign: 'center' }}
              >
                {query
                  ? 'No events found matching your search'
                  : 'No events available at the moment'}
              </ThemedText>
            </View>
          )}
        </ScrollView>

        {/* Filter Modal */}
        <EventFilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          onClearAll={handleClearAll}
          onApply={handleApplyFilters}
        />
      </PageContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    display: 'flex',
  },
  searchBar: {
    flex: 1,
    marginBottom: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateScrollSection: {
    paddingBottom: 12,
  },
  scrollContent: {
    paddingBottom: 400,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  eventCard: {
    width: 280,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventImage: {
    width: '100%',
    height: 160,
  },
  eventContent: {
    padding: 12,
    gap: 6,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verticalList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  listEventCard: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listEventImage: {
    width: 120,
    height: 120,
  },
  listEventContent: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 16,
  },
});

export default EventScreen;
