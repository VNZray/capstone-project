import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Image, StyleSheet, View, Alert } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { Colors, card } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Booking } from '@/types/Booking';
import Chip from '@/components/Chip';
import placeholder from '@/assets/images/room-placeholder.png';

type BookingWithDetails = Booking & {
  room_number?: string;
  business_name?: string;
  room_image?: string;
};

type BookingDetailsBottomSheetProps = {
  booking: BookingWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelBooking?: (bookingId: string) => Promise<void>;
  onBookAgain?: (booking: Booking) => void;
  onRateBooking?: (booking: Booking) => void;
  hasReviewed?: boolean;
};

const BookingDetailsBottomSheet: React.FC<BookingDetailsBottomSheetProps> = ({
  booking,
  isOpen,
  onClose,
  onCancelBooking,
  onBookAgain,
  onRateBooking,
  hasReviewed = false,
}) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [cancelling, setCancelling] = useState(false);

  const surface = isDark ? card.dark : card.light;
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const borderColor = isDark ? '#262B3A' : '#E3E7EF';
  const handleColor = isDark ? '#4B5563' : '#D1D5DB';

  // Snap points for different content heights
  const snapPoints = useMemo(() => ['65%', '92%'], []);

  // Present/dismiss modal based on isOpen prop
  useEffect(() => {
    if (isOpen && booking) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isOpen, booking]);

  // Handle sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    []
  );

  // Format date
  const formatDate = (dateString?: Date | string | String): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString as string);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (timeString?: Date | string | String): string => {
    if (!timeString) return 'N/A';
    const timeStr = String(timeString);

    if (timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);

      if (isNaN(hour) || isNaN(minute)) return 'N/A';

      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const displayMinute = minute.toString().padStart(2, '0');

      return `${displayHour}:${displayMinute} ${period}`;
    }

    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return 'N/A';

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format currency
  const formatPrice = (price?: number): string => {
    if (!price) return '₱0.00';
    return `₱${price.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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

  // Handle cancel booking
  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            if (booking?.id && onCancelBooking) {
              setCancelling(true);
              try {
                await onCancelBooking(booking.id);
                onClose();
              } catch (error) {
                Alert.alert(
                  'Error',
                  'Failed to cancel booking. Please try again.'
                );
              } finally {
                setCancelling(false);
              }
            }
          },
        },
      ]
    );
  };

  // Handle book again
  const handleBookAgain = () => {
    if (booking && onBookAgain) {
      onBookAgain(booking);
      onClose();
    }
  };

  // Handle rate booking
  const handleRateBooking = () => {
    if (booking && onRateBooking) {
      onRateBooking(booking);
      onClose();
    }
  };

  // Calculate nights
  const calculateNights = (): number => {
    if (!booking?.check_in_date || !booking?.check_out_date) return 0;
    const checkIn = new Date(String(booking.check_in_date));
    const checkOut = new Date(String(booking.check_out_date));
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Don't render if no booking data
  if (!booking) return null;

  const nights = calculateNights();

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      backgroundStyle={[styles.sheetBackground, { backgroundColor: surface }]}
      handleIndicatorStyle={[
        styles.handleIndicator,
        { backgroundColor: handleColor },
      ]}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Room Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              booking.room_image ? { uri: booking.room_image } : placeholder
            }
            style={styles.detailImage}
            resizeMode="cover"
          />
          {/* Status overlay */}
          <View style={styles.imageOverlay}>
            <Chip
              label={booking.booking_status || 'Unknown'}
              size="medium"
              variant="solid"
              color={getStatusColor(booking.booking_status)}
            />
          </View>
        </View>

        {/* Room Info Header */}
        <View style={[styles.headerSection, { backgroundColor: surface }]}>
          <View style={styles.headerContent}>
            <ThemedText
              type="header-small"
              weight="bold"
              style={{ color: textColor }}
            >
              Room {booking.room_number || 'N/A'}
            </ThemedText>
            {booking.business_name && (
              <View style={styles.businessRow}>
                <Ionicons
                  name="business-outline"
                  size={14}
                  color={subTextColor}
                />
                <ThemedText
                  type="body-medium"
                  style={{ color: subTextColor, marginLeft: 6 }}
                >
                  {booking.business_name}
                </ThemedText>
              </View>
            )}
          </View>
          <View style={styles.priceContainer}>
            <ThemedText type="label-small" style={{ color: subTextColor }}>
              Total
            </ThemedText>
            <ThemedText
              type="header-small"
              weight="bold"
              style={{ color: Colors.light.primary }}
            >
              {formatPrice(booking.total_price)}
            </ThemedText>
          </View>
        </View>

        {/* Date Range Card */}
        <View
          style={[
            styles.dateCard,
            { backgroundColor: isDark ? '#1a1f2e' : '#f8f9fa', borderColor },
          ]}
        >
          <View style={styles.dateColumn}>
            <View
              style={[
                styles.dateIconWrapper,
                { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
              ]}
            >
              <Ionicons
                name="enter-outline"
                size={20}
                color={Colors.light.success}
              />
            </View>
            <ThemedText
              type="label-small"
              style={{ color: subTextColor, marginTop: 6 }}
            >
              Check-in
            </ThemedText>
            <ThemedText
              type="body-medium"
              weight="semi-bold"
              style={{ color: textColor, marginTop: 2 }}
            >
              {formatDate(booking.check_in_date)}
            </ThemedText>
            <ThemedText type="label-small" style={{ color: subTextColor }}>
              {formatTime(booking.check_in_time)}
            </ThemedText>
          </View>

          <View style={styles.dateDivider}>
            <View
              style={[styles.dividerLine, { backgroundColor: borderColor }]}
            />
            <View
              style={[
                styles.nightsBadge,
                { backgroundColor: surface, borderColor },
              ]}
            >
              <Ionicons name="moon" size={12} color={Colors.light.primary} />
              <ThemedText
                type="label-small"
                weight="semi-bold"
                style={{ color: textColor, marginLeft: 4 }}
              >
                {nights}
              </ThemedText>
            </View>
            <View
              style={[styles.dividerLine, { backgroundColor: borderColor }]}
            />
          </View>

          <View style={styles.dateColumn}>
            <View
              style={[
                styles.dateIconWrapper,
                { backgroundColor: 'rgba(185, 28, 28, 0.1)' },
              ]}
            >
              <Ionicons
                name="exit-outline"
                size={20}
                color={Colors.light.error}
              />
            </View>
            <ThemedText
              type="label-small"
              style={{ color: subTextColor, marginTop: 6 }}
            >
              Check-out
            </ThemedText>
            <ThemedText
              type="body-medium"
              weight="semi-bold"
              style={{ color: textColor, marginTop: 2 }}
            >
              {formatDate(booking.check_out_date)}
            </ThemedText>
            <ThemedText type="label-small" style={{ color: subTextColor }}>
              {formatTime(booking.check_out_time)}
            </ThemedText>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <ThemedText
            type="card-title-medium"
            weight="semi-bold"
            style={{ color: textColor, marginBottom: 16 }}
          >
            Booking Details
          </ThemedText>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            {/* Guests */}
            <View
              style={[
                styles.detailItem,
                { backgroundColor: isDark ? '#1a1f2e' : '#f8f9fa' },
              ]}
            >
              <View
                style={[
                  styles.detailIcon,
                  { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
                ]}
              >
                <Ionicons name="people" size={18} color={Colors.light.info} />
              </View>
              <ThemedText type="label-small" style={{ color: subTextColor }}>
                Guests
              </ThemedText>
              <ThemedText
                type="body-medium"
                weight="semi-bold"
                style={{ color: textColor }}
              >
                {booking.pax || 0}
              </ThemedText>
            </View>

            {/* Booking Type */}
            {booking.booking_type && (
              <View
                style={[
                  styles.detailItem,
                  { backgroundColor: isDark ? '#1a1f2e' : '#f8f9fa' },
                ]}
              >
                <View
                  style={[
                    styles.detailIcon,
                    { backgroundColor: 'rgba(139, 92, 246, 0.1)' },
                  ]}
                >
                  <Ionicons
                    name={
                      booking.booking_type === 'overnight' ? 'bed' : 'sunny'
                    }
                    size={18}
                    color="#8B5CF6"
                  />
                </View>
                <ThemedText type="label-small" style={{ color: subTextColor }}>
                  Type
                </ThemedText>
                <ThemedText
                  type="body-medium"
                  weight="semi-bold"
                  style={{ color: textColor }}
                >
                  {booking.booking_type === 'overnight'
                    ? 'Overnight'
                    : 'Short Stay'}
                </ThemedText>
              </View>
            )}

            {/* Payment Status */}
            <View
              style={[
                styles.detailItem,
                { backgroundColor: isDark ? '#1a1f2e' : '#f8f9fa' },
              ]}
            >
              <View
                style={[
                  styles.detailIcon,
                  {
                    backgroundColor:
                      booking.balance === 0
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(249, 115, 22, 0.1)',
                  },
                ]}
              >
                <Ionicons
                  name={booking.balance === 0 ? 'checkmark-circle' : 'wallet'}
                  size={18}
                  color={
                    booking.balance === 0
                      ? Colors.light.success
                      : Colors.light.warning
                  }
                />
              </View>
              <ThemedText type="label-small" style={{ color: subTextColor }}>
                Payment
              </ThemedText>
              <ThemedText
                type="body-medium"
                weight="semi-bold"
                style={{ color: textColor }}
              >
                {booking.balance === 0 ? 'Paid' : 'Pending'}
              </ThemedText>
              {booking.balance !== undefined && booking.balance > 0 && (
                <ThemedText
                  type="label-extra-small"
                  style={{ color: Colors.light.warning }}
                >
                  {formatPrice(booking.balance)}
                </ThemedText>
              )}
            </View>
          </View>
        </View>

        {/* Trip Purpose */}
        {booking.trip_purpose && (
          <View style={styles.purposeSection}>
            <ThemedText
              type="card-title-medium"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              Trip Purpose
            </ThemedText>
            <ThemedText type="body-medium" style={{ color: subTextColor }}>
              {booking.trip_purpose}
            </ThemedText>
          </View>
        )}
      </BottomSheetScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionSection, { borderTopColor: borderColor }]}>
        {booking.booking_status === 'Reserved' && (
          <Button
            label={cancelling ? 'Cancelling...' : 'Cancel Booking'}
            onPress={handleCancelBooking}
            variant="soft"
            color="error"
            size="large"
            disabled={cancelling}
            fullWidth
          />
        )}

        {booking.booking_status === 'Checked-Out' && (
          <View style={{ gap: 12 }}>
            {!hasReviewed && (
              <Button
                label="Rate Us"
                onPress={handleRateBooking}
                variant="solid"
                color="warning"
                size="large"
                startIcon="star"
                fullWidth
              />
            )}
            <Button
              label="Book Again"
              onPress={handleBookAgain}
              variant="outlined"
              color="primary"
              size="large"
              fullWidth
            />
          </View>
        )}

        {booking.booking_status !== 'Reserved' &&
          booking.booking_status !== 'Checked-Out' && (
            <Button
              label="Close"
              onPress={onClose}
              variant="outlined"
              color="neutral"
              size="large"
              fullWidth
            />
          )}
      </View>
    </BottomSheetModal>
  );
};

export default BookingDetailsBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  scrollContent: {},
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  detailImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 16,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 20,
  },
  headerContent: {
    flex: 1,
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  dateColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dateIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDivider: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dividerLine: {
    width: 1,
    height: 24,
  },
  nightsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 8,
  },
  detailsSection: {
    padding: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 4,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  purposeSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionSection: {
    padding: 16,
    borderTopWidth: 1,
    marginTop: 8,
  },
});
