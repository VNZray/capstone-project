import PageContainer from '@/components/PageContainer';
import React, {
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { getAverageRating, getTotalReviews } from '@/services/FeedbackService';
import {
  getFavoritesByTouristId,
  addFavorite,
  deleteFavorite,
} from '@/services/FavoriteService';
import { useAuth } from '@/context/AuthContext';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

import Button from '@/components/Button';
import Container from '@/components/Container';
import DateInput from '@/components/DateInput';
import Dropdown, { DropdownItem } from '@/components/Dropdown';
import RoomCard from '@/components/accommodation/RoomCard';
import { useRoom } from '@/context/RoomContext';
import { navigateToRoomProfile } from '@/routes/accommodationRoutes';
import placeholder from '@/assets/images/room-placeholder.png';
import { useAccommodation } from '@/context/AccommodationContext';
import {
  fetchBookingsByBusinessId,
  filterAvailableRooms,
} from '@/services/BookingService';
import type { Booking } from '@/types/Booking';
import * as PromotionService from '@/services/PromotionService';
import type { Promotion } from '@/types/Promotion';

// NOTE: We derive floor options dynamically from the room list.
// Fallback options will only be used if no rooms are loaded yet.
const fallbackFloors: DropdownItem[] = [
  { id: '1', label: '1' },
  { id: '2', label: '2' },
  { id: '3', label: '3' },
];

const Rooms = () => {
  const { rooms, loading, setRoomId, refreshRooms, setDateRange } = useRoom();
  const { selectedAccommodationId } = useAccommodation();
  const { user } = useAuth();
  const [cardView, setCardView] = useState('card');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteRecords, setFavoriteRecords] = useState<Map<string, string>>(
    new Map()
  );
  // Selected floor (null = all)
  const [selectedFloor, setSelectedFloor] = React.useState<number | null>(null);
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const lastOffset = useRef(0);
  const atTopRef = useRef(true);
  const wasScrollingUpRef = useRef(false);
  const [roomRatings, setRoomRatings] = useState<
    Record<string, { avg: number; total: number }>
  >({});
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [roomDiscount, setRoomDiscount] = useState<Promotion | null>(null);

  // Fetch favorites when user changes
  const fetchFavorites = useCallback(async () => {
    if (!user?.id) return;

    try {
      const favorites = await getFavoritesByTouristId(user.id);
      const roomFavorites = favorites.filter(
        (fav) => fav.favorite_type === 'room'
      );

      const ids = new Set(roomFavorites.map((fav) => fav.my_favorite_id));
      const records = new Map(
        roomFavorites.map((fav) => [fav.my_favorite_id, fav.id])
      );

      setFavoriteIds(ids);
      setFavoriteRecords(records);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  }, [user?.id]);

  // Fetch promotions to check for room discounts
  const fetchPromotions = useCallback(async () => {
    if (!selectedAccommodationId) {
      console.log('[Rooms Listing] No selectedAccommodationId');
      return;
    }

    console.log(
      '[Rooms Listing] Fetching promotions for business:',
      selectedAccommodationId
    );

    try {
      const promos = await PromotionService.fetchPromotionsByBusinessId(
        selectedAccommodationId
      );
      console.log('[Rooms Listing] Fetched promotions:', promos);
      setPromotions(promos);

      // Find best room discount (type 2)
      const roomDiscounts = promos.filter(
        (p) => p.promo_type === 2 && p.discount_percentage
      );
      console.log('[Rooms Listing] Room discounts (type 2):', roomDiscounts);

      if (roomDiscounts.length > 0) {
        const bestDiscount = roomDiscounts.reduce((prev, current) =>
          (current.discount_percentage || 0) > (prev.discount_percentage || 0)
            ? current
            : prev
        );
        console.log('[Rooms Listing] Best room discount:', bestDiscount);
        setRoomDiscount(bestDiscount);
      } else {
        console.log('[Rooms Listing] No room discounts found');
        setRoomDiscount(null);
      }
    } catch (error) {
      console.error('[Rooms Listing] Failed to fetch promotions:', error);
    }
  }, [selectedAccommodationId]);

  // Fetch bookings when accommodation changes
  useEffect(() => {
    const loadBookings = async () => {
      if (!selectedAccommodationId) {
        setBookings([]);
        return;
      }
      setLoadingBookings(true);
      try {
        const data = await fetchBookingsByBusinessId(selectedAccommodationId);
        setBookings(data);
      } catch (error) {
        console.error('Failed to load bookings:', error);
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };
    loadBookings();
    fetchFavorites();
    fetchPromotions();
  }, [selectedAccommodationId, fetchFavorites, fetchPromotions]);

  const handleToggleFavorite = useCallback(
    async (roomId: string, isFavorite: boolean) => {
      if (!user?.id) {
        alert('Please log in to add favorites');
        return;
      }

      // Optimistic UI update
      const newFavoriteIds = new Set(favoriteIds);
      const newFavoriteRecords = new Map(favoriteRecords);

      if (isFavorite) {
        newFavoriteIds.add(roomId);
      } else {
        newFavoriteIds.delete(roomId);
      }

      setFavoriteIds(newFavoriteIds);

      try {
        if (isFavorite) {
          // Add favorite
          const result = await addFavorite(user.id, 'room', roomId);
          newFavoriteRecords.set(roomId, result.id);
          setFavoriteRecords(newFavoriteRecords);
        } else {
          // Remove favorite
          const favoriteId = favoriteRecords.get(roomId);
          if (favoriteId) {
            await deleteFavorite(favoriteId);
            newFavoriteRecords.delete(roomId);
            setFavoriteRecords(newFavoriteRecords);
          }
        }
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
        // Revert optimistic update on error
        setFavoriteIds(favoriteIds);
        setFavoriteRecords(favoriteRecords);
        alert('Failed to update favorite. Please try again.');
      }
    },
    [user?.id, favoriteIds, favoriteRecords]
  );

  const onRefresh = useCallback(
    async (force?: boolean) => {
      setRefreshing(true);
      try {
        await refreshRooms({ force });
        await fetchFavorites();
      } finally {
        setRefreshing(false);
      }
    },
    [refreshRooms, fetchFavorites]
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const prev = lastOffset.current;
      wasScrollingUpRef.current = y < prev;
      atTopRef.current = y <= 0;
      lastOffset.current = y;
    },
    []
  );

  const handleScrollEndDrag = useCallback(() => {
    if (atTopRef.current && !refreshing && !loading) {
      onRefresh(true); // force no-cache reload
    }
  }, [loading, onRefresh, refreshing]);

  // Derive floors: priority to explicit room.floor / room.floor_number; fallback to first digit of room_number.
  const floorItems: DropdownItem[] = useMemo(() => {
    if (!rooms || rooms.length === 0) return fallbackFloors;
    const floorSet = new Set<number>();
    rooms.forEach((r) => {
      // Try known properties
      // @ts-ignore (allow flexible access if backend naming differs)
      const direct = r.floor ?? r.floor_number ?? r.level;
      let floor: number | null = null;
      if (typeof direct === 'number') floor = direct;
      else if (typeof direct === 'string' && /^\d+$/.test(direct))
        floor = parseInt(direct, 10);
      else if (!direct && r.room_number) {
        // Derive from room_number (e.g., 302 -> 3)
        const match = String(r.room_number).match(/^(\d)/);
        if (match) floor = parseInt(match[1], 10);
      }
      if (floor != null && !Number.isNaN(floor)) floorSet.add(floor);
    });
    const sorted = Array.from(floorSet).sort((a, b) => a - b);
    return sorted.map((f) => ({ id: f, label: String(f) }));
  }, [rooms]);

  // Filter rooms by selected floor
  const filteredRooms = useMemo(() => {
    if (!rooms) return [];

    // First filter by floor
    let filtered =
      selectedFloor == null
        ? rooms
        : rooms.filter((r) => {
            // @ts-ignore allow flexible field names
            const direct = r.floor ?? r.floor_number ?? r.level;
            let floor: number | null = null;
            if (typeof direct === 'number') floor = direct;
            else if (typeof direct === 'string' && /^\d+$/.test(direct))
              floor = parseInt(direct, 10);
            else if (!direct && r.room_number) {
              const match = String(r.room_number).match(/^(\d)/);
              if (match) floor = parseInt(match[1], 10);
            }
            return floor === selectedFloor;
          });

    // Then filter by date availability if both dates are selected
    if (range.start && range.end && bookings.length > 0) {
      filtered = filterAvailableRooms(
        filtered,
        bookings,
        range.start,
        range.end
      );
    }

    return filtered;
  }, [rooms, selectedFloor, range, bookings]);

  // Fetch ratings and total reviews for visible rooms
  useEffect(() => {
    const fetchRatings = async () => {
      const ids = filteredRooms
        .map((r) => r.id)
        .filter((id): id is string => typeof id === 'string' && !!id);
      const newMap: Record<string, { avg: number; total: number }> = {};
      await Promise.all(
        ids.map(async (id) => {
          try {
            const [avg, total] = await Promise.all([
              getAverageRating('room', id),
              getTotalReviews('room', id),
            ]);
            newMap[String(id)] = { avg, total };
          } catch {
            newMap[String(id)] = { avg: 0, total: 0 };
          }
        })
      );
      setRoomRatings(newMap);
    };
    if (filteredRooms.length > 0) fetchRatings();
    else setRoomRatings({});
  }, [filteredRooms]);

  return (
    <PageContainer style={{ paddingTop: 0, paddingBottom: 100 }}>
      <Container
        style={{ overflow: 'visible' }}
        backgroundColor="transparent"
        gap={16}
        paddingBottom={0}
        padding={0}
        direction="row"
      >
        <Dropdown
          withSearch={false}
          style={{ width: 120 }}
          placeholder="Floor"
          items={[{ id: 'all', label: 'All' }, ...floorItems]}
          value={selectedFloor === null ? 'all' : selectedFloor}
          onSelect={(item) => {
            if (item.id === 'all') {
              setSelectedFloor(null);
            } else {
              const v =
                typeof item.id === 'string'
                  ? parseInt(item.id, 10)
                  : (item.id as number);
              setSelectedFloor(Number.isNaN(v) ? null : v);
            }
          }}
          variant="solid"
          color="primary"
          clearable={false}
        />

        <DateInput
          style={{ flex: 1 }}
          size="medium"
          mode="range"
          selectionVariant="filled"
          variant="solid"
          disablePast
          disablePastNavigation
          requireConfirmation
          showStatusLegend={false}
          rangeValue={range}
          onRangeChange={(newRange) => {
            setRange(newRange);
            setDateRange(newRange); // Save to context
          }}
        />
        <Button
          elevation={2}
          color="white"
          startIcon={cardView === 'card' ? 'list' : 'th-large'}
          icon
          onPress={() => setCardView(cardView === 'card' ? 'list' : 'card')}
        />
      </Container>
      <View>
        {loading || loadingBookings ? (
          <View style={styles.center}>
            <Text>Loading rooms…</Text>
          </View>
        ) : filteredRooms && filteredRooms.length > 0 ? (
          <>
            {range.start && range.end && (
              <View style={styles.dateInfo}>
                <Text style={styles.dateInfoText}>
                  Showing available rooms from{' '}
                  {range.start.toLocaleDateString()} to{' '}
                  {range.end.toLocaleDateString()}
                </Text>
              </View>
            )}
            <View style={styles.list}>
              {filteredRooms.map((room) => {
                const ratingInfo = roomRatings[String(room.id)] || {
                  avg: 0,
                  total: 0,
                };

                // Calculate discounted price if room discount exists
                let displayPrice: string | number | undefined = room.room_price;
                let originalPriceValue: number | undefined = undefined;
                let discountPercent: number | undefined = undefined;

                if (
                  roomDiscount &&
                  roomDiscount.discount_percentage &&
                  room.room_price
                ) {
                  const originalPrice =
                    typeof room.room_price === 'number'
                      ? room.room_price
                      : parseFloat(
                          String(room.room_price).replace(/[^0-9.]/g, '')
                        );

                  if (!isNaN(originalPrice)) {
                    originalPriceValue = originalPrice;
                    discountPercent = roomDiscount.discount_percentage;
                    const discountAmount = Math.floor(
                      originalPrice * (roomDiscount.discount_percentage / 100)
                    );
                    displayPrice = originalPrice - discountAmount;
                  }
                }

                return (
                  <RoomCard
                    elevation={6}
                    key={room.id}
                    image={room.room_image ? room.room_image : placeholder}
                    title={room.room_number || 'Room'}
                    subtitle={room.description || room.room_type || ''}
                    capacity={room.capacity || undefined}
                    price={displayPrice || undefined}
                    originalPrice={originalPriceValue}
                    discountPercentage={discountPercent}
                    rating={ratingInfo.avg}
                    comments={ratingInfo.total}
                    status={
                      room.status === 'available'
                        ? 'Available'
                        : room.status === 'maintenance'
                        ? 'Maintenance'
                        : room.status === 'booked'
                        ? 'Booked'
                        : undefined
                    }
                    favorite={favoriteIds.has(room.id!)}
                    addToFavorite={(isFav) =>
                      handleToggleFavorite(room.id!, isFav)
                    }
                    view={cardView}
                    variant="solid"
                    size="large"
                    onClick={() => {
                      if (room.id) {
                        setRoomId(room.id);
                        navigateToRoomProfile();
                      }
                    }}
                  />
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.center}>
            <Text>
              {range.start && range.end
                ? 'No rooms available for the selected dates'
                : 'No rooms available'}
            </Text>
          </View>
        )}
      </View>
    </PageContainer>
  );
};

export default Rooms;

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  center: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  dateInfo: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 12,
  },
  dateInfoText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '500',
  },
});
