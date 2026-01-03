import AccommodationCard from '@/components/accommodation/AccommodationCard';
import PageContainer from '@/components/PageContainer';
import AccommodationSkeleton from '@/components/skeleton/AccommodationSkeleton';
import SearchBar from '@/components/SearchBar';
import Chip from '@/components/Chip';
import { ThemedText } from '@/components/themed-text';
import { useAccommodation } from '@/context/AccommodationContext';
import { useAuth } from '@/context/AuthContext';
import { navigateToAccommodationProfile } from '@/routes/accommodationRoutes';
import {
  clearStoredBusinessId,
  fetchAddress,
} from '@/services/AccommodationService';
import { getAverageRating, getTotalReviews } from '@/services/FeedbackService';
import {
  getFavoritesByTouristId,
  addFavorite,
  deleteFavorite,
} from '@/services/FavoriteService';
import type { Business } from '@/types/Business';
import BottomSheetFilter, {
  type FilterState,
} from './components/BottomSheetFilter';
import LoginPromptModal from '@/components/LoginPromptModal';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import placeholder from '@/assets/images/placeholder.png';
import { Colors } from '@/constants/color';
import { clearStoredRoomId } from '@/services/RoomService';

// ---- Category constants and helpers (module scope) ----
const CATEGORY_ID_TO_KEY: Record<number, string> = {
  1: 'hotel',
  2: 'resort',
  10: 'hostel',
  11: 'inn',
  12: 'bed_and_breakfast',
  16: 'guesthouse',
  17: 'motel',
  18: 'serviced_apartment',
  19: 'villa',
  20: 'lodge',
  21: 'homestay',
  22: 'cottage',
  23: 'capsule_hotel',
  24: 'boutique_hotel',
  25: 'eco_resort',
};

const CATEGORY_KEY_TO_LABEL: Record<string, string> = {
  hotel: 'Hotel',
  resort: 'Resort',
  hostel: 'Hostel',
  inn: 'Inn',
  bed_and_breakfast: 'B&B',
  guesthouse: 'Guesthouse',
  motel: 'Motel',
  serviced_apartment: 'Serviced Apt.',
  villa: 'Villa',
  lodge: 'Lodge',
  homestay: 'Homestay',
  cottage: 'Cottage',
  capsule_hotel: 'Capsule Hotel',
  boutique_hotel: 'Boutique Hotel',
  eco_resort: 'Eco Resort',
};

const toLowerSafe = (v?: string | null) =>
  typeof v === 'string' ? v.toLowerCase() : '';

const AccommodationDirectory = () => {
  const bg = Colors.light.background;
  const primaryColor = Colors.light.primary;

  const {
    loading,
    allAccommodationDetails,
    setAccommodationId,
    refreshAllAccommodations,
  } = useAccommodation();
  const { user, isAuthenticated } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteRecords, setFavoriteRecords] = useState<Map<string, string>>(
    new Map()
  ); // accommodationId -> favoriteId
  const lastScrollOffset = useRef(0);
  const atTopRef = useRef(true);
  const wasScrollingUpRef = useRef(false);
  const [openFilterModal, setOpenFilterModal] = useState(false);

  // Filter state
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    categories: [],
    minRating: null,
    priceRange: { min: 0, max: 10000 },
    amenities: [],
  });

  // Fetch user's favorites
  const fetchFavorites = useCallback(async () => {
    if (!user?.id) return;
    try {
      const favorites = await getFavoritesByTouristId(user.id);
      const accommodationFavorites = favorites.filter(
        (fav) => fav.favorite_type === 'accommodation'
      );
      const ids = new Set(
        accommodationFavorites.map((fav) => fav.my_favorite_id)
      );
      const records = new Map(
        accommodationFavorites.map((fav) => [fav.my_favorite_id, fav.id])
      );
      setFavoriteIds(ids);
      setFavoriteRecords(records);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshAllAccommodations(), fetchFavorites()]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshAllAccommodations, fetchFavorites]);

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

  const [search, setSearch] = useState('');
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);

  const toggleQuickFilter = (id: string) => {
    setActiveQuickFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const quickFilters = [
    { id: 'open_now', label: 'Open Now' },
    { id: 'free_cancellation', label: 'Free Cancellation' },
    { id: 'top_rated', label: 'Top Rated' },
  ];

  const handleAccommodationSelect = (id: string) => {
    setAccommodationId(id);
    navigateToAccommodationProfile();
  };

  const handleToggleFavorite = useCallback(
    async (accommodationId: string, isFavorite: boolean) => {
      if (!isAuthenticated || !user?.id) {
        setShowLoginPrompt(true);
        return;
      }

      // Optimistic UI update
      if (isFavorite) {
        setFavoriteIds((prev) => new Set(prev).add(accommodationId));
      } else {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(accommodationId);
          return next;
        });
      }

      try {
        if (isFavorite) {
          // Add to favorites
          const result = await addFavorite(
            user.id,
            'accommodation',
            accommodationId
          );
          setFavoriteRecords((prev) =>
            new Map(prev).set(accommodationId, result.id)
          );
        } else {
          // Remove from favorites
          const favoriteId = favoriteRecords.get(accommodationId);
          if (favoriteId) {
            await deleteFavorite(favoriteId);
            setFavoriteRecords((prev) => {
              const next = new Map(prev);
              next.delete(accommodationId);
              return next;
            });
          }
        }
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
        Alert.alert('Error', 'Failed to update favorite. Please try again.');
        // Revert optimistic update on error
        if (isFavorite) {
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(accommodationId);
            return next;
          });
        } else {
          setFavoriteIds((prev) => new Set(prev).add(accommodationId));
        }
        fetchFavorites();
      }
    },
    [user?.id, favoriteRecords, fetchFavorites]
  );

  // Address caching
  const [addressPartsByBarangay, setAddressPartsByBarangay] = useState<
    Record<number, string[]>
  >({});

  const getBarangayName = useCallback(
    (barangay_id?: number) => {
      if (barangay_id == null) return '';
      const arr = addressPartsByBarangay[barangay_id];
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : '';
    },
    [addressPartsByBarangay]
  );

  const formatSubtitle = (b: Business) => {
    const barangay = getBarangayName(b.barangay_id);
    // Use category from entity_categories or fallback to "Accommodation"
    const categoryName =
      b.categories && b.categories.length > 0
        ? b.categories[0].category_title
        : 'Accommodation';
    const location = barangay || b.address || 'City Center';
    return `${categoryName} • ${location}`;
  };

  // Ratings state - declared before filteredAccommodations
  const [accommodationRatings, setAccommodationRatings] = useState<
    Record<string, { avg: number; total: number }>
  >({});

  const filteredAccommodations = useMemo(() => {
    if (!Array.isArray(allAccommodationDetails)) return [];
    const term = toLowerSafe(search.trim());
    let results = allAccommodationDetails.filter((b: Business) => {
      // Check hasBooking - handle both boolean and number (MySQL returns 1/0)
      const hasBooking = b.hasBooking === true || b.hasBooking === 1;
      if (!hasBooking) return false;

      const name = toLowerSafe(b.business_name);
      const addr = toLowerSafe(b.address);
      const brgy = toLowerSafe(getBarangayName(b.barangay_id));
      const matchesSearch =
        !term ||
        name.includes(term) ||
        addr.includes(term) ||
        brgy.includes(term);

      const status = toLowerSafe(b.status);
      const isVisibleStatus = status === 'active' || status === 'pending';

      // Apply category filter
      const matchesCategory =
        appliedFilters.categories.length === 0 ||
        (b.categories &&
          b.categories.some((cat) =>
            appliedFilters.categories.includes(cat.category_id)
          ));

      // Apply rating filter
      const businessRating = accommodationRatings[String(b.id)]?.avg || 0;
      const matchesRating =
        appliedFilters.minRating === null ||
        businessRating >= appliedFilters.minRating;

      // Apply price range filter
      const minPrice = parseFloat(String(b.min_price)) || 0;
      const maxPrice = parseFloat(String(b.max_price)) || 10000;
      const matchesPriceRange =
        minPrice >= appliedFilters.priceRange.min &&
        maxPrice <= appliedFilters.priceRange.max;

      return (
        matchesSearch &&
        isVisibleStatus &&
        matchesCategory &&
        matchesRating &&
        matchesPriceRange
      );
    });

    return results;
  }, [
    allAccommodationDetails,
    search,
    getBarangayName,
    appliedFilters,
    accommodationRatings,
  ]);

  const fetchBusinessAddress = async (
    barangay_id: number
  ): Promise<string[]> => {
    try {
      const address = await fetchAddress(barangay_id);
      if (!address) return [];
      const parts: string[] = [];
      if (address.barangay_name) parts.push(address.barangay_name);
      if (address.municipality_name) parts.push(address.municipality_name);
      if (address.province_name) parts.push(address.province_name);
      return parts;
    } catch (error) {
      console.error('Error fetching address:', error);
      return [];
    }
  };

  useEffect(() => {
    const load = async () => {
      const ids = Array.from(
        new Set(
          filteredAccommodations
            .map((b: Business) => b.barangay_id)
            .filter((id): id is number => typeof id === 'number' && id > 0)
        )
      );
      const missing = ids.filter((id) => !(id in addressPartsByBarangay));
      if (missing.length === 0) return;
      const entries = await Promise.all(
        missing.map(
          async (id) =>
            [id, await fetchBusinessAddress(id)] as [number, string[]]
        )
      );
      setAddressPartsByBarangay((prev) => {
        const next = { ...prev } as Record<number, string[]>;
        entries.forEach(([id, parts]) => (next[id] = parts));
        return next;
      });
    };
    load();
    clearStoredBusinessId();
    clearStoredRoomId();
  }, [filteredAccommodations, addressPartsByBarangay]);

  // Fetch ratings and total reviews for all accommodations (once)
  useEffect(() => {
    const fetchRatings = async () => {
      if (
        !Array.isArray(allAccommodationDetails) ||
        allAccommodationDetails.length === 0
      ) {
        setAccommodationRatings({});
        return;
      }

      const ids = allAccommodationDetails
        .map((r) => r.id)
        .filter((id): id is string => typeof id === 'string' && !!id);
      const newMap: Record<string, { avg: number; total: number }> = {};
      await Promise.all(
        ids.map(async (id) => {
          try {
            const [avg, total] = await Promise.all([
              getAverageRating('accommodation', id),
              getTotalReviews('accommodation', id),
            ]);
            newMap[String(id)] = { avg, total };
          } catch {
            newMap[String(id)] = { avg: 0, total: 0 };
          }
        })
      );
      setAccommodationRatings(newMap);
    };
    fetchRatings();
  }, [allAccommodationDetails]);

  // Show skeleton during initial load (after all hooks are called)
  if (loading && allAccommodationDetails.length === 0) {
    return <AccommodationSkeleton />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={32}
        stickyHeaderIndices={[1]} // Make SearchSection (index 1) sticky
      >
        {/* Header Section (Scrolls away) */}
        <View style={{ marginTop: 8, paddingHorizontal: 16 }}>
          <ThemedText type="header-small" weight="medium">
            Accommodation
          </ThemedText>
        </View>

        {/* Search and Filter Section (Sticky) */}
        <View style={styles.searchSection}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onSearch={() => {}}
            placeholder="Where to? (e.g. Sushi, Hotel)"
            variant="plain"
            size="md"
            containerStyle={{
              flex: 1,
            }}
            inputStyle={{ fontSize: 15 }}
            rightIcon={
              <TouchableOpacity onPress={() => setOpenFilterModal(true)}>
                <Ionicons
                  name="options-outline"
                  size={20}
                  color={primaryColor}
                />
              </TouchableOpacity>
            }
          />
        </View>

        {/* Quick Filters (Scrolls away) */}
        <View style={styles.quickFiltersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickFiltersContent}
          >
            {quickFilters.map((filter) => (
              <Chip
                key={filter.id}
                label={filter.label}
                variant={
                  activeQuickFilters.includes(filter.id) ? 'solid' : 'soft'
                }
                color={
                  activeQuickFilters.includes(filter.id) ? 'primary' : 'neutral'
                }
                size="small"
                onPress={() => toggleQuickFilter(filter.id)}
                style={{ marginRight: 8 }}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.cardWrapper}>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : filteredAccommodations.length > 0 ? (
            filteredAccommodations.map((business, index) => {
              const ratingInfo = accommodationRatings[String(business.id)] || {
                avg: 0,
                total: 0,
              };

              return (
                <AccommodationCard
                  key={business.id}
                  title={business.business_name}
                  subTitle={formatSubtitle(business)}
                  pricing={
                    business.min_price && business.max_price
                      ? `${business.min_price} - ${business.max_price}`
                      : '$$$$'
                  }
                  image={
                    business.business_image
                      ? { uri: business.business_image }
                      : placeholder
                  }
                  ratings={ratingInfo.avg}
                  noOfComments={ratingInfo.total}
                  badge={index === 0 ? 'GUEST FAVORITE' : undefined}
                  tags={['Luxury', 'Spa']}
                  isOpen={true}
                  view="card"
                  favorite={favoriteIds.has(business.id!)}
                  addToFavorite={(isFavorite) =>
                    handleToggleFavorite(business.id!, isFavorite)
                  }
                  onClick={() => handleAccommodationSelect(business.id!)}
                />
              );
            })
          ) : (
            <PageContainer
              padding={16}
              align="center"
              justify="center"
              height={450}
            >
              <View style={styles.illustrationInner}>
                <MaterialCommunityIcons
                  name="map-marker-off"
                  size={48}
                  color="#FFB007"
                />
              </View>
              <Text style={[styles.notFoundTitle, { color: primaryColor }]}>
                No accommodations found
              </Text>
              <Text style={styles.notFoundText}>
                Try adjusting your search or clearing filters.
              </Text>
            </PageContainer>
          )}
        </View>
      </ScrollView>

      {/* Floating Map Button */}
      <View style={styles.floatingButtonContainer}>
        <Pressable
          style={[styles.mapButton, { backgroundColor: primaryColor }]}
        >
          <Text style={styles.mapButtonText}>Map View</Text>
          <Ionicons
            name="map-outline"
            size={18}
            color="#FFFFFF"
            style={{ marginLeft: 8 }}
          />
        </Pressable>
      </View>

      {/* Filter Modal */}
      <BottomSheetFilter
        isOpen={openFilterModal}
        onClose={() => setOpenFilterModal(false)}
        onApplyFilters={setAppliedFilters}
        initialFilters={appliedFilters}
      />

      {/* Login Prompt Modal */}
      <LoginPromptModal
        visible={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        actionName="add to favorites"
        title="Login to Save Favorites"
        message="Sign in to save your favorite accommodations and access them anytime."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12, // Add vertical padding
    gap: 12,
    backgroundColor: Colors.light.background, // Ensure background covers scrolling content
    zIndex: 100, // Keep above other content
  },
  quickFiltersContainer: {
    paddingBottom: 16,
  },
  quickFiltersContent: {
    paddingHorizontal: 16,
  },

  scrollContent: {
    paddingTop: 0,
    paddingBottom: 100,
  },
  cardWrapper: {
    gap: 24,
    paddingHorizontal: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  illustrationInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  notFoundText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AccommodationDirectory;
