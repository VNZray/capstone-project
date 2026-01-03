import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import Chip from '@/components/Chip';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, card } from '@/constants/color';
import placeholder from '@/assets/images/room-placeholder.png';
import type { Booking } from '@/types/Booking';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type BookingWithDetails = Booking & {
  room_number?: string;
  business_name?: string;
  room_image?: string;
};

type BookingCardProps = {
  booking: BookingWithDetails;
  onPress: (booking: BookingWithDetails) => void;
  index?: number;
};

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPress,
  index = 0,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const surface = isDark ? card.dark : card.light;
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const borderColor = isDark ? '#262B3A' : '#E3E7EF';

  // Animation delay based on index for staggered effect
  const animationDelay = index * 80;

  // Format date to short format
  const formatShortDate = (dateString?: Date | string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
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

  // Get status icon
  const getStatusIcon = (status?: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'Reserved':
        return 'time-outline';
      case 'Checked-In':
        return 'checkmark-circle-outline';
      case 'Checked-Out':
        return 'exit-outline';
      case 'Canceled':
        return 'close-circle-outline';
      case 'Pending':
        return 'hourglass-outline';
      default:
        return 'help-circle-outline';
    }
  };

  // Calculate nights between check-in and check-out
  const calculateNights = (): number => {
    if (!booking.check_in_date || !booking.check_out_date) return 0;
    const checkIn = new Date(String(booking.check_in_date));
    const checkOut = new Date(String(booking.check_out_date));
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(animationDelay).duration(400).springify()}
      onPress={() => onPress(booking)}
      style={[
        styles.card,
        {
          backgroundColor: surface,
          borderColor: borderColor,
        },
      ]}
    >
      {/* Room Image with overlay gradient */}
      <View style={styles.imageContainer}>
        <Image
          source={
            booking.room_image ? { uri: booking.room_image } : placeholder
          }
          style={styles.roomImage}
          resizeMode="cover"
        />
        {/* Status badge on image */}
        <View style={styles.statusBadge}>
          <Chip
            label={booking.booking_status || 'Unknown'}
            size="small"
            variant="solid"
            color={getStatusColor(booking.booking_status)}
          />
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Room Title */}
        <View style={styles.titleRow}>
          <ThemedText
            type="card-title-medium"
            weight="bold"
            numberOfLines={1}
            style={{ color: textColor }}
          >
            Room {booking.room_number || 'N/A'}
          </ThemedText>
          {booking.total_price && (
            <ThemedText
              type="body-medium"
              weight="bold"
              style={{ color: Colors.light.primary }}
            >
              ₱{booking.total_price.toLocaleString()}
            </ThemedText>
          )}
        </View>

        {/* Business Name */}
        {booking.business_name && (
          <ThemedText
            type="label-small"
            numberOfLines={1}
            style={{ color: subTextColor, marginTop: 2 }}
          >
            {booking.business_name}
          </ThemedText>
        )}

        {/* Date Range */}
        <View style={styles.dateContainer}>
          <View style={styles.dateItem}>
            <Ionicons
              name="enter-outline"
              size={14}
              color={Colors.light.success}
            />
            <ThemedText
              type="label-small"
              style={{ color: textColor, marginLeft: 4 }}
            >
              {formatShortDate(
                booking.check_in_date
                  ? String(booking.check_in_date)
                  : undefined
              )}
            </ThemedText>
          </View>
          <View style={styles.dateDivider}>
            <View
              style={[styles.dividerLine, { backgroundColor: borderColor }]}
            />
            <View
              style={[
                styles.nightsBadge,
                { backgroundColor: isDark ? '#1a1f2e' : '#f3f4f6' },
              ]}
            >
              <Ionicons name="moon-outline" size={10} color={subTextColor} />
              <ThemedText
                type="label-extra-small"
                style={{ color: subTextColor, marginLeft: 2 }}
              >
                {nights} {nights === 1 ? 'night' : 'nights'}
              </ThemedText>
            </View>
            <View
              style={[styles.dividerLine, { backgroundColor: borderColor }]}
            />
          </View>
          <View style={styles.dateItem}>
            <Ionicons
              name="exit-outline"
              size={14}
              color={Colors.light.error}
            />
            <ThemedText
              type="label-small"
              style={{ color: textColor, marginLeft: 4 }}
            >
              {formatShortDate(
                booking.check_out_date
                  ? String(booking.check_out_date)
                  : undefined
              )}
            </ThemedText>
          </View>
        </View>

        {/* Footer with guests and booking type */}
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons name="people-outline" size={14} color={subTextColor} />
            <ThemedText
              type="label-small"
              style={{ color: subTextColor, marginLeft: 4 }}
            >
              {booking.pax || 0} {(booking.pax || 0) === 1 ? 'Guest' : 'Guests'}
            </ThemedText>
          </View>
          {booking.booking_type && (
            <View style={styles.footerItem}>
              <Ionicons
                name={
                  booking.booking_type === 'overnight'
                    ? 'bed-outline'
                    : 'sunny-outline'
                }
                size={14}
                color={subTextColor}
              />
              <ThemedText
                type="label-small"
                style={{ color: subTextColor, marginLeft: 4 }}
              >
                {booking.booking_type === 'overnight'
                  ? 'Overnight'
                  : 'Short Stay'}
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Tap indicator */}
      <View style={styles.tapIndicator}>
        <Ionicons name="chevron-forward" size={18} color={subTextColor} />
      </View>
    </AnimatedPressable>
  );
};

export default BookingCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  roomImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  cardContent: {
    padding: 14,
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateDivider: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  nightsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tapIndicator: {
    position: 'absolute',
    right: 12,
    bottom: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
