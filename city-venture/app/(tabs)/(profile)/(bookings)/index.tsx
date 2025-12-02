import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import {
  getBookingsByTourist,
  cancelBooking,
} from '@/query/accommodationQuery';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Alert,
} from 'react-native';
import type { Booking } from '@/types/Booking';
import type { Room } from '@/types/Business';
import { fetchRoomDetails } from '@/services/RoomService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, card } from '@/constants/color';
import Chip from '@/components/Chip';
import placeholder from '@/assets/images/room-placeholder.png';
import { Ionicons } from '@expo/vector-icons';
import BookingDetailsModal from './components/BookingDetails';
import { useRoom } from '@/context/RoomContext';
import { useAccommodation } from '@/context/AccommodationContext';
import { navigateToRoomProfile } from '@/routes/accommodationRoutes';

type BookingWithDetails = Booking & {
  room_number?: string;
  business_name?: string;
  room_image?: string;
};

type GroupedBookings = {
  [date: string]: BookingWithDetails[];
};

const Bookings = () => {
  const { user } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { setRoomId } = useRoom();
  const { setAccommodationId } = useAccommodation();

  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingWithDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const surface = isDark ? card.dark : card.light;
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const borderColor = isDark ? '#262B3A' : '#E3E7EF';

  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const data = await getBookingsByTourist(user.id);

      // Fetch room details for each booking
      const bookingsWithDetails = await Promise.all(
        data.map(async (booking: Booking) => {
          try {
            const room: Room = await fetchRoomDetails(booking.room_id || '');
            return {
              ...booking,
              room_number: room.room_number,
              room_image: room.room_image,
              // Note: business_name would need to be fetched from business API
              // For now, we'll leave it undefined
            };
          } catch {
            return booking;
          }
        })
      );

      setBookings(bookingsWithDetails);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, [fetchBookings]);

  const handleCardPress = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
      Alert.alert('Success', 'Your booking has been cancelled successfully.');
      // Refresh bookings list
      fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      throw error;
    }
  };

  const handleBookAgain = (booking: Booking) => {
    // Navigate to room profile to book again
    if (booking.room_id && booking.business_id) {
      setRoomId(booking.room_id);
      setAccommodationId(booking.business_id);
      navigateToRoomProfile();
    } else {
      Alert.alert('Error', 'Unable to find room details for rebooking.');
    }
  };

  // Format date to readable string
  const formatDate = (dateString?: Date | string): string => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format date to short format for card
  const formatShortDate = (dateString?: Date | string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Group bookings by check-in date
  const groupedBookings: GroupedBookings = bookings.reduce((acc, booking) => {
    const dateKey = formatDate(
      typeof booking.check_in_date === 'string' ||
        booking.check_in_date instanceof Date
        ? booking.check_in_date
        : booking.check_in_date?.toString()
    );
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(booking);
    return acc;
  }, {} as GroupedBookings);

  // Sort dates (most recent first)
  const sortedDates = Object.keys(groupedBookings).sort((a, b) => {
    const checkInA = groupedBookings[a][0].check_in_date;
    const checkInB = groupedBookings[b][0].check_in_date;
    const dateA =
      checkInA instanceof Date
        ? checkInA
        : typeof checkInA === 'string'
        ? new Date(checkInA)
        : new Date(0);
    const dateB =
      checkInB instanceof Date
        ? checkInB
        : typeof checkInB === 'string'
        ? new Date(checkInB)
        : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  // Get status color
  const getStatusColor = (
    status?: string
  ): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
    switch (status) {
      case 'Reserved':
        return 'warning';
      case 'Checked-In':
        return 'success';
      case 'Checked-Out':
        return 'neutral';
      case 'Canceled':
        return 'error';
      case 'Pending':
        return 'info';
      default:
        return 'neutral';
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

  if (bookings.length === 0) {
    return (
      <PageContainer>
        <View style={styles.centerContainer}>
          <Ionicons name="calendar-outline" size={64} color={subTextColor} />
          <ThemedText
            type="card-title-medium"
            style={{ marginTop: 16, color: textColor }}
          >
            No Bookings Yet
          </ThemedText>
          <ThemedText
            type="body-medium"
            style={{ marginTop: 8, color: subTextColor, textAlign: 'center' }}
          >
            Your booking history will appear here once you make a reservation.
          </ThemedText>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer padding={0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
          />
        }
      >
        {sortedDates.map((dateKey) => (
          <View key={dateKey} style={styles.section}>
            {/* Date Section Header */}
            <View
              style={[styles.sectionHeader, { borderBottomColor: borderColor }]}
            >
              <ThemedText
                type="card-title-medium"
                weight="semi-bold"
                style={{ color: textColor }}
              >
                {dateKey}
              </ThemedText>
            </View>

            {/* Booking Cards */}
            <View style={styles.cardList}>
              {groupedBookings[dateKey].map((booking) => (
                <Pressable
                  key={booking.id}
                  onPress={() => handleCardPress(booking)}
                  style={({ pressed }) => [
                    styles.card,
                    {
                      backgroundColor: surface,
                      borderColor: borderColor,
                      opacity: pressed ? 0.7 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  {/* Room Image */}
                  <Image
                    source={
                      booking.room_image
                        ? { uri: booking.room_image }
                        : placeholder
                    }
                    style={styles.roomImage}
                    resizeMode="cover"
                  />

                  {/* Booking Details */}
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <ThemedText
                          type="card-title-medium"
                          weight="semi-bold"
                          numberOfLines={1}
                          style={{ color: textColor }}
                        >
                          Room {booking.room_number || 'N/A'}
                        </ThemedText>
                        {booking.business_name && (
                          <ThemedText
                            type="label-small"
                            numberOfLines={1}
                            style={{ color: subTextColor, marginTop: 2 }}
                          >
                            {booking.business_name}
                          </ThemedText>
                        )}
                      </View>
                      <Chip
                        label={booking.booking_status || 'Unknown'}
                        size="small"
                        variant="soft"
                        color={getStatusColor(booking.booking_status)}
                      />
                    </View>

                    {/* Check-in Date Info */}
                    <View style={styles.infoRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={subTextColor}
                      />
                      <ThemedText
                        type="label-small"
                        style={{ color: subTextColor, marginLeft: 6 }}
                      >
                        Check-in:{' '}
                        {formatShortDate(
                          typeof booking.check_in_date === 'string' ||
                            booking.check_in_date instanceof Date
                            ? booking.check_in_date
                            : booking.check_in_date?.toString()
                        )}
                      </ThemedText>
                    </View>

                    {/* Pax Count */}
                    {booking.pax && (
                      <View style={styles.infoRow}>
                        <Ionicons
                          name="people-outline"
                          size={16}
                          color={subTextColor}
                        />
                        <ThemedText
                          type="label-small"
                          style={{ color: subTextColor, marginLeft: 6 }}
                        >
                          {booking.pax} {booking.pax === 1 ? 'Guest' : 'Guests'}
                        </ThemedText>
                      </View>
                    )}
                  </View>

                  {/* Tap indicator */}
                  <View style={styles.tapIndicator}>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={subTextColor}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        visible={showDetails}
        onClose={() => setShowDetails(false)}
        booking={selectedBooking}
        onCancelBooking={handleCancelBooking}
        onBookAgain={handleBookAgain}
      />
    </PageContainer>
  );
};

export default Bookings;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  cardList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    position: 'relative',
  },
  roomImage: {
    width: 120,
    height: 120,
    backgroundColor: '#e5e7eb',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  tapIndicator: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
});
