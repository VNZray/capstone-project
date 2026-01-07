/**
 * Booking Payment Success Modal
 * Displayed as a fullscreen modal when user returns from PayMongo checkout after successful payment.
 * Shows booking confirmation with animated success state.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BookingPaymentSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  onViewBooking: () => void;
  onBackToHome: () => void;
  bookingId?: string;
  roomName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  totalAmount?: number;
}

const BookingPaymentSuccessModal: React.FC<BookingPaymentSuccessModalProps> = ({
  visible,
  onClose,
  onViewBooking,
  onBackToHome,
  bookingId,
  roomName,
  checkInDate,
  checkOutDate,
  totalAmount,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { h1, body } = useTypography();

  // Animation values
  const iconScale = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  const checkmarkScale = useSharedValue(0);

  const palette = {
    bg: isDark ? '#0D1B2A' : '#F8F9FA',
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
    successBg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
    successText: '#10B981',
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (visible) {
      // Reset animations
      iconScale.value = 0;
      iconRotation.value = 0;
      contentOpacity.value = 0;
      contentTranslateY.value = 50;
      checkmarkScale.value = 0;

      // Trigger animations
      iconScale.value = withSpring(1, { damping: 12, stiffness: 100 });
      iconRotation.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
      checkmarkScale.value = withDelay(300, withSpring(1, { damping: 10 }));
      contentOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
      contentTranslateY.value = withDelay(400, withSpring(0, { damping: 15 }));
    }
  }, [visible]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotation.value}deg` },
    ],
  }));

  const animatedCheckmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return '—';
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: palette.bg }]}>
        {/* Success Icon */}
        <Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
          <LinearGradient
            colors={['#10B981', '#34D399']}
            style={styles.gradientIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View style={animatedCheckmarkStyle}>
              <Ionicons name="checkmark" size={64} color="#FFF" />
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.contentWrapper, animatedContentStyle]}>
          <Text style={[styles.title, { color: palette.text, fontSize: h1 }]}>
            Booking Confirmed!
          </Text>
          <Text
            style={[styles.subtitle, { color: palette.subText, fontSize: body }]}
          >
            Your accommodation has been successfully reserved.
          </Text>

          {/* Booking Details Card */}
          <View
            style={[
              styles.detailsCard,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            {/* Booking ID */}
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: palette.subText }]}>
                Booking ID
              </Text>
              <Text
                style={[styles.detailValue, { color: palette.text }]}
                numberOfLines={1}
              >
                #{bookingId?.slice(0, 8).toUpperCase() || '—'}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: palette.border }]} />

            {/* Room Name */}
            {roomName && (
              <>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: palette.subText }]}>
                    Room
                  </Text>
                  <Text
                    style={[styles.detailValue, { color: palette.text }]}
                    numberOfLines={1}
                  >
                    {roomName}
                  </Text>
                </View>
                <View
                  style={[styles.divider, { backgroundColor: palette.border }]}
                />
              </>
            )}

            {/* Check-in / Check-out */}
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: palette.subText }]}>
                Check-in
              </Text>
              <Text style={[styles.detailValue, { color: palette.text }]}>
                {formatDate(checkInDate)}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: palette.border }]} />

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: palette.subText }]}>
                Check-out
              </Text>
              <Text style={[styles.detailValue, { color: palette.text }]}>
                {formatDate(checkOutDate)}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: palette.border }]} />

            {/* Amount Paid */}
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: palette.subText }]}>
                Amount Paid
              </Text>
              <View style={styles.paidBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={palette.successText}
                />
                <Text style={[styles.paidText, { color: palette.successText }]}>
                  {formatCurrency(totalAmount)}
                </Text>
              </View>
            </View>
          </View>

          {/* Info Box */}
          <View style={[styles.infoBox, { backgroundColor: palette.successBg }]}>
            <Ionicons
              name="information-circle"
              size={20}
              color={palette.successText}
            />
            <Text style={[styles.infoText, { color: palette.successText }]}>
              A confirmation email will be sent to your registered email address.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={onViewBooking}
            >
              <Ionicons name="calendar" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>View Booking</Text>
            </Pressable>

            <Pressable
              style={[styles.secondaryButton, { borderColor: palette.border }]}
              onPress={onBackToHome}
            >
              <Text style={[styles.secondaryButtonText, { color: palette.text }]}>
                Back to Home
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconWrapper: {
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  gradientIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  detailsCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: SCREEN_WIDTH * 0.45,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paidText: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookingPaymentSuccessModal;
