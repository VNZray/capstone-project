import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import {
  getBookingsByTourist,
  cancelBooking,
} from '@/query/accommodationQuery';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  Alert,
} from 'react-native';
import type { Booking } from '@/types/Booking';
import type { Room } from '@/types/Business';
import { fetchRoomDetails } from '@/services/RoomService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, card } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import { useRoom } from '@/context/RoomContext';
import { useAccommodation } from '@/context/AccommodationContext';
import { navigateToRoomProfile } from '@/routes/accommodationRoutes';
import { Tab, TabContainer } from '@/components/ui/Tabs';
import BookingCard, { type BookingWithDetails } from './components/BookingCard';
import BookingDetailsBottomSheet from './components/BookingDetailsBottomSheet';
import { useBookingsHeader } from './_layout';
import AddReview from '@/components/reviews/AddReview';
import {
  createReview,
  checkIfTouristHasReviewed,
} from '@/services/FeedbackService';

type TabType = 'reserved' | 'completed' | 'canceled';

// Extended booking type with review status
type BookingWithReviewStatus = BookingWithDetails & {
  hasReviewed?: boolean;
};

const Bookings = () => {
  const { user } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { setRoomId } = useRoom();
  const { setAccommodationId } = useAccommodation();
  const { setOnRefresh, setIsRefreshing } = useBookingsHeader();

  const [bookings, setBookings] = useState<BookingWithReviewStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingWithReviewStatus | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('reserved');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [bookingToReview, setBookingToReview] =
    useState<BookingWithReviewStatus | null>(null);

  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';

  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;

    setIsRefreshing(true);
    try {
      setError(null);
      const data = await getBookingsByTourist(user.id);

      // Fetch room details and check review status for each booking
      const bookingsWithDetails = await Promise.all(
        data.map(async (booking: Booking) => {
          let roomDetails: Partial<Room> = {};
          let hasReviewed = false;

          // Fetch room details
          try {
            const room: Room = await fetchRoomDetails(booking.room_id || '');
            roomDetails = {
              room_number: room.room_number,
              room_image: room.room_image,
            };
          } catch {
            // Keep empty room details if fetch fails
          }

          // Check review status for completed bookings
          if (
            booking.booking_status === 'Checked-Out' &&
            booking.room_id &&
            user.id
          ) {
            try {
              hasReviewed = await checkIfTouristHasReviewed(
                user.id,
                'room',
                booking.room_id
              );
            } catch {
              // Default to false if check fails
            }
          }

          return {
            ...booking,
            ...roomDetails,
            hasReviewed,
          };
        })
      );

      setBookings(bookingsWithDetails);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsRefreshing(false);
    }
  }, [user?.id, setIsRefreshing]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Register refresh function with header
  useEffect(() => {
    setOnRefresh(() => {
      setRefreshing(true);
      fetchBookings();
    });
  }, [setOnRefresh, fetchBookings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, [fetchBookings]);

  // Filter bookings based on active tab
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const status = booking.booking_status;
      switch (activeTab) {
        case 'reserved':
          return (
            status === 'Reserved' ||
            status === 'Pending' ||
            status === 'Checked-In'
          );
        case 'completed':
          return status === 'Checked-Out';
        case 'canceled':
          return status === 'Canceled';
        default:
          return true;
      }
    });
  }, [bookings, activeTab]);

  // Sort bookings by check-in date (most recent first)
  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      const dateA = new Date(String(a.check_in_date) || 0).getTime();
      const dateB = new Date(String(b.check_in_date) || 0).getTime();
      return dateB - dateA;
    });
  }, [filteredBookings]);

  // Get booking counts for tabs
  const bookingCounts = useMemo(() => {
    return {
      reserved: bookings.filter(
        (b) =>
          b.booking_status === 'Reserved' ||
          b.booking_status === 'Pending' ||
          b.booking_status === 'Checked-In'
      ).length,
      completed: bookings.filter((b) => b.booking_status === 'Checked-Out')
        .length,
      canceled: bookings.filter((b) => b.booking_status === 'Canceled').length,
    };
  }, [bookings]);

  const handleCardPress = (booking: BookingWithDetails) => {
    // Find the full booking with review status
    const fullBooking = bookings.find((b) => b.id === booking.id);
    setSelectedBooking(fullBooking || (booking as BookingWithReviewStatus));
    setShowDetails(true);
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
      Alert.alert('Success', 'Your booking has been cancelled successfully.');
      fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      throw error;
    }
  };

  const handleBookAgain = (booking: Booking) => {
    if (booking.room_id && booking.business_id) {
      setRoomId(booking.room_id);
      setAccommodationId(booking.business_id);
      navigateToRoomProfile();
    } else {
      Alert.alert('Error', 'Unable to find room details for rebooking.');
    }
  };

  const handleRateBooking = (booking: Booking) => {
    setBookingToReview(booking as BookingWithDetails);
    setReviewModalVisible(true);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  const getEmptyStateContent = () => {
    switch (activeTab) {
      case 'reserved':
        return {
          icon: 'calendar-outline' as const,
          title: 'No Active Bookings',
          message:
            'Your active reservations will appear here once you make a booking.',
        };
      case 'completed':
        return {
          icon: 'checkmark-done-outline' as const,
          title: 'No Completed Bookings',
          message: 'Your completed stays will appear here after check-out.',
        };
      case 'canceled':
        return {
          icon: 'close-circle-outline' as const,
          title: 'No Canceled Bookings',
          message: 'Canceled bookings will appear here.',
        };
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText
            type="body-medium"
            style={{ marginTop: 16, color: subTextColor }}
          >
            Loading your bookings...
          </ThemedText>
        </View>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <View style={styles.centerContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={subTextColor}
          />
          <ThemedText
            type="card-title-medium"
            style={{ marginTop: 16, color: textColor }}
          >
            {error}
          </ThemedText>
        </View>
      </PageContainer>
    );
  }

  const emptyState = getEmptyStateContent();

  return (
    <PageContainer padding={0} gap={0}>
      <TabContainer initialTab="reserved" onTabChange={handleTabChange}>
        <Tab
          tab="reserved"
          label={`Reserved${
            bookingCounts.reserved > 0 ? ` (${bookingCounts.reserved})` : ''
          }`}
        />
        <Tab
          tab="completed"
          label={`Completed${
            bookingCounts.completed > 0 ? ` (${bookingCounts.completed})` : ''
          }`}
        />
        <Tab
          tab="canceled"
          label={`Canceled${
            bookingCounts.canceled > 0 ? ` (${bookingCounts.canceled})` : ''
          }`}
        />
      </TabContainer>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          sortedBookings.length === 0 && styles.emptyScrollContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
          />
        }
      >
        {sortedBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconWrapper,
                { backgroundColor: isDark ? '#1a1f2e' : '#f3f4f6' },
              ]}
            >
              <Ionicons name={emptyState.icon} size={48} color={subTextColor} />
            </View>
            <ThemedText
              type="card-title-medium"
              weight="semi-bold"
              style={{ marginTop: 20, color: textColor }}
            >
              {emptyState.title}
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={{
                marginTop: 8,
                color: subTextColor,
                textAlign: 'center',
                maxWidth: 280,
              }}
            >
              {emptyState.message}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.cardList}>
            {sortedBookings.map((booking, index) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPress={handleCardPress}
                index={index}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Booking Details Bottom Sheet */}
      <BookingDetailsBottomSheet
        booking={selectedBooking}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onCancelBooking={handleCancelBooking}
        onBookAgain={handleBookAgain}
        onRateBooking={handleRateBooking}
        hasReviewed={selectedBooking?.hasReviewed}
      />

      {/* Review Modal for Rating Bookings */}
      {user && bookingToReview && (
        <AddReview
          visible={reviewModalVisible}
          onClose={() => {
            setReviewModalVisible(false);
            setBookingToReview(null);
          }}
          onSubmit={async (payload) => {
            try {
              await createReview(payload);
              // Update local state to mark this booking as reviewed
              setBookings((prev) =>
                prev.map((b) =>
                  b.id === bookingToReview.id ? { ...b, hasReviewed: true } : b
                )
              );
              // Also update selected booking if it's the same one
              if (selectedBooking?.id === bookingToReview.id) {
                setSelectedBooking((prev) =>
                  prev ? { ...prev, hasReviewed: true } : null
                );
              }
              setReviewModalVisible(false);
              setBookingToReview(null);
              Alert.alert(
                'Thank You!',
                'Your review has been submitted successfully.'
              );
            } catch (error) {
              console.error('Error submitting review:', error);
              throw error;
            }
          }}
          touristId={user.id || ''}
          reviewType="room"
          reviewTypeId={bookingToReview.room_id || ''}
        />
      )}
    </PageContainer>
  );
};

export default Bookings;

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 240,
  },
  emptyScrollContent: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardList: {
    paddingHorizontal: 16,
    gap: 16,
  },
});
