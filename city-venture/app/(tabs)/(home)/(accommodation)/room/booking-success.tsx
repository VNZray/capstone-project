/**
 * Booking Payment Success Deep Link Handler
 * This screen handles the deep link redirect from PayMongo via backend.
 * Shows the success modal and provides navigation options.
 *
 * Route: /(accommodation)/room/booking-success
 * Deep Link: cityventure://(accommodation)/room/booking-success?paymentSuccess=1&bookingId=xxx
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, colors } from '@/constants/color';
import { getBookingById } from '@/query/accommodationQuery';
import { BookingPaymentSuccessModal } from './(booking)/modal';
import debugLogger from '@/utils/debugLogger';

interface BookingDetails {
  id: string;
  room_name?: string;
  check_in_date?: string;
  check_out_date?: string;
  total_price?: number;
  booking_status?: string;
}

const BookingSuccessScreen = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme as keyof typeof Colors];

  const { bookingId } = useLocalSearchParams<{
    bookingId?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);

  // Fetch booking details when screen loads
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        setShowModal(true);
        return;
      }

      try {
        debugLogger({
          title: 'BookingSuccess: Fetching booking details',
          data: { bookingId },
        });

        const booking = await getBookingById(bookingId);

        if (booking) {
          setBookingDetails({
            id: booking.id,
            room_name: booking.room?.room_name || booking.room?.name,
            check_in_date: booking.check_in_date,
            check_out_date: booking.check_out_date,
            total_price: booking.total_price,
            booking_status: booking.booking_status,
          });
        }
      } catch (error: any) {
        debugLogger({
          title: 'BookingSuccess: Failed to fetch booking',
          error: error?.response?.data || error,
        });
      } finally {
        setLoading(false);
        setShowModal(true);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleViewBooking = useCallback(() => {
    // Navigate to bookings list - dismiss all first then navigate
    router.dismissAll();
    setTimeout(() => {
      router.push('/(tabs)/(profile)/(bookings)');
    }, 100);
  }, [router]);

  const handleBackToHome = useCallback(() => {
    // Navigate to home - dismiss all and go to root tabs
    router.dismissAll();
    setTimeout(() => {
      router.replace('/(tabs)/(home)');
    }, 100);
  }, [router]);

  const handleClose = useCallback(() => {
    // Default to home if modal is closed
    router.dismissAll();
    setTimeout(() => {
      router.replace('/(tabs)/(home)');
    }, 100);
  }, [router]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Loading booking details...
            </Text>
          </View>
        ) : (
          <BookingPaymentSuccessModal
            visible={showModal}
            onClose={handleClose}
            onViewBooking={handleViewBooking}
            onBackToHome={handleBackToHome}
            bookingId={bookingId || bookingDetails?.id}
            roomName={bookingDetails?.room_name}
            checkInDate={bookingDetails?.check_in_date}
            checkOutDate={bookingDetails?.check_out_date}
            totalAmount={bookingDetails?.total_price}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
});

export default BookingSuccessScreen;
