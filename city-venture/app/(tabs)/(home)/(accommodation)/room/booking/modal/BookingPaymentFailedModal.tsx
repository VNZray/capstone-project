/**
 * Booking Payment Failed Modal
 * Displayed as a fullscreen modal when booking payment fails or is cancelled.
 * Shows error details with retry and navigation options.
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
  withRepeat,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FailureType = 'failed' | 'cancelled' | 'expired' | 'error';

interface BookingPaymentFailedModalProps {
  visible: boolean;
  onClose: () => void;
  onRetryPayment: () => void;
  onViewBooking?: () => void;
  onBackToHome: () => void;
  bookingId?: string;
  errorMessage?: string;
  failureType?: FailureType;
}

const getFailureConfig = (type: FailureType) => {
  switch (type) {
    case 'cancelled':
      return {
        icon: 'close-circle' as const,
        title: 'Payment Cancelled',
        subtitle: 'You cancelled the payment process. Your booking is still pending.',
        color: '#F59E0B', // Warning yellow/orange
      };
    case 'expired':
      return {
        icon: 'time' as const,
        title: 'Payment Expired',
        subtitle: 'The payment session has expired. Please try again.',
        color: '#8B5CF6', // Purple
      };
    case 'error':
      return {
        icon: 'warning' as const,
        title: 'Something Went Wrong',
        subtitle: 'An unexpected error occurred. Please try again later.',
        color: '#EF4444', // Red
      };
    case 'failed':
    default:
      return {
        icon: 'alert-circle' as const,
        title: 'Payment Failed',
        subtitle: 'Your payment could not be processed. Please try again.',
        color: '#EF4444', // Red
      };
  }
};

const BookingPaymentFailedModal: React.FC<BookingPaymentFailedModalProps> = ({
  visible,
  onClose,
  onRetryPayment,
  onViewBooking,
  onBackToHome,
  bookingId,
  errorMessage,
  failureType = 'failed',
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { h1, body } = useTypography();

  // Animation values
  const iconScale = useSharedValue(0);
  const iconShake = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  const pulseOpacity = useSharedValue(0.3);

  const config = getFailureConfig(failureType);

  const palette = {
    bg: isDark ? '#0D1B2A' : '#F8F9FA',
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
    errorBg: isDark ? `${config.color}20` : `${config.color}10`,
    errorText: config.color,
  };

  useEffect(() => {
    if (visible) {
      // Reset animations
      iconScale.value = 0;
      iconShake.value = 0;
      contentOpacity.value = 0;
      contentTranslateY.value = 50;

      // Trigger animations
      iconScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      iconShake.value = withSequence(
        withDelay(
          300,
          withSequence(
            withTiming(-8, { duration: 80 }),
            withTiming(8, { duration: 80 }),
            withTiming(-6, { duration: 60 }),
            withTiming(6, { duration: 60 }),
            withTiming(0, { duration: 60 })
          )
        )
      );
      contentOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
      contentTranslateY.value = withDelay(400, withSpring(0, { damping: 15 }));
      
      // Subtle pulse on the icon background
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        true
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { translateX: iconShake.value },
    ],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: palette.bg }]}>
        {/* Error Icon */}
        <Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
          <Animated.View
            style={[
              styles.iconPulse,
              { backgroundColor: config.color },
              animatedPulseStyle,
            ]}
          />
          <View
            style={[styles.iconCircle, { backgroundColor: palette.errorBg }]}
          >
            <Ionicons name={config.icon} size={72} color={config.color} />
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.contentWrapper, animatedContentStyle]}>
          <Text style={[styles.title, { color: palette.text, fontSize: h1 }]}>
            {config.title}
          </Text>
          <Text
            style={[styles.subtitle, { color: palette.subText, fontSize: body }]}
          >
            {config.subtitle}
          </Text>

          {/* Error Details Card */}
          {(errorMessage || bookingId) && (
            <View
              style={[
                styles.detailsCard,
                { backgroundColor: palette.card, borderColor: palette.border },
              ]}
            >
              {bookingId && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: palette.subText }]}>
                      Booking ID
                    </Text>
                    <Text
                      style={[styles.detailValue, { color: palette.text }]}
                      numberOfLines={1}
                    >
                      #{bookingId.slice(0, 8).toUpperCase()}
                    </Text>
                  </View>
                  {errorMessage && (
                    <View
                      style={[styles.divider, { backgroundColor: palette.border }]}
                    />
                  )}
                </>
              )}

              {errorMessage && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: palette.subText }]}>
                    Details
                  </Text>
                  <Text
                    style={[
                      styles.errorMessage,
                      { color: palette.errorText },
                    ]}
                    numberOfLines={2}
                  >
                    {errorMessage}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Info Box */}
          <View style={[styles.infoBox, { backgroundColor: palette.errorBg }]}>
            <Ionicons
              name="information-circle"
              size={20}
              color={palette.errorText}
            />
            <Text style={[styles.infoText, { color: palette.errorText }]}>
              {failureType === 'cancelled'
                ? 'Your booking reservation is saved. You can complete the payment from your bookings.'
                : 'Don\'t worry, no charges were made. You can safely try again.'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={onRetryPayment}
            >
              <Ionicons name="refresh" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>
                {failureType === 'cancelled' ? 'Continue Payment' : 'Try Again'}
              </Text>
            </Pressable>

            {onViewBooking && (
              <Pressable
                style={[
                  styles.secondaryButton,
                  { borderColor: palette.border, backgroundColor: palette.card },
                ]}
                onPress={onViewBooking}
              >
                <Ionicons name="calendar-outline" size={18} color={palette.text} />
                <Text style={[styles.secondaryButtonText, { color: palette.text }]}>
                  View Booking
                </Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.tertiaryButton]}
              onPress={onBackToHome}
            >
              <Text style={[styles.tertiaryButtonText, { color: palette.subText }]}>
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
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPulse: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
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
    paddingHorizontal: 16,
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
    alignItems: 'flex-start',
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
  errorMessage: {
    fontSize: 13,
    fontWeight: '500',
    maxWidth: SCREEN_WIDTH * 0.5,
    textAlign: 'right',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    width: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 1,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tertiaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default BookingPaymentFailedModal;
