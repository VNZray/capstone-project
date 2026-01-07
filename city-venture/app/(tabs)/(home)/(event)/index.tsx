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
import { PLACEHOLDER_EVENTS } from '@/components/home/data';
import HorizontalDateScroll from '@/components/HorizontalDateScroll';
import EventFilterModal from '@/app/(tabs)/(home)/(event)/components/EventFilterModal';
import Container from '@/components/Container';
import Divider from '@/components/Divider';
import { AppHeader } from '@/components/header/AppHeader';
import PageContainer from '@/components/PageContainer';

const toLowerSafe = (v?: string | null) =>
  typeof v === 'string' ? v.toLowerCase() : '';

const EventScreen = () => {
  const router = useRouter();
  const colors = Colors.light;

  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'all',
  ]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const lastScrollOffset = useRef(0);
  const atTopRef = useRef(true);
  const wasScrollingUpRef = useRef(false);

  // Use placeholder data - replace with actual event data from context/service
  const events = PLACEHOLDER_EVENTS.map((event, index) => ({
    ...event,
    category: index === 0 ? 'music' : index === 1 ? 'sports' : 'food',
    distance: Math.random() * 10,
    isNearby: Math.random() > 0.5,
  }));

  // Filter events
  const filteredEvents = useMemo(() => {
    let result = events;

    if (!selectedCategories.includes('all')) {
      result = result.filter((event) =>
        selectedCategories.includes(event.category)
      );
    }

    if (query.trim()) {
      const term = toLowerSafe(query.trim());
      result = result.filter(
        (event) =>
          toLowerSafe(event.name).includes(term) ||
          toLowerSafe(event.location).includes(term)
      );
    }

    return result;
  }, [events, selectedCategories, query]);

  // Pull-to-refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // TODO: Replace with actual API call to refresh events
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  }, []);

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
    () => filteredEvents.filter((event) => event.isNearby).slice(0, 5),
    [filteredEvents]
  );

  const comingSoonEvents = useMemo(
    () => filteredEvents.slice(0, 5),
    [filteredEvents]
  );

  const popularEvents = useMemo(
    () => [...filteredEvents].sort(() => Math.random() - 0.5).slice(0, 5),
    [filteredEvents]
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
                      source={{ uri: event.image }}
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
                          {event.date}
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
                          {event.location}
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
                      source={{ uri: event.image }}
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
                          {event.date}
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
                          {event.location}
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
                      source={{ uri: event.image }}
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
                          {event.date}
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
                          {event.location}
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
