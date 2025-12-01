import Button from '@/components/Button';
import Container from '@/components/Container';
import { ThemedText } from '@/components/themed-text';
import { Colors, card } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Booking } from '@/types/Booking';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Alert,
} from 'react-native';
import Chip from '@/components/Chip';
import placeholder from '@/assets/images/room-placeholder.png';

type BookingDetailsProps = {
  visible: boolean;
  onClose: () => void;
  booking:
    | (Booking & {
        room_number?: string;
        business_name?: string;
        room_image?: string;
      })
    | null;
  onCancelBooking?: (bookingId: string) => void;
  onBookAgain?: (booking: Booking) => void;
};

const BookingDetailsModal: React.FC<BookingDetailsProps> = ({
  visible,
  onClose,
  booking,
  onCancelBooking,
  onBookAgain,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [cancelling, setCancelling] = useState(false);

  const surface = isDark ? card.dark : card.light;
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const borderColor = isDark ? '#262B3A' : '#E3E7EF';
  const overlayBg = isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.5)';

  if (!booking) return null;

  // Format date
  const formatDate = (dateString?: Date | string | String): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString as string);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (dateString?: Date | string | String): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString as string);
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

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        {
          text: 'No, Keep It',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            if (booking.id && onCancelBooking) {
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

  const handleBookAgain = () => {
    if (onBookAgain) {
      onBookAgain(booking);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: overlayBg }]}>
        <View style={[styles.modalContainer, { backgroundColor: surface }]}>
          {/* Header */}
          <View
            style={[styles.modalHeader, { borderBottomColor: borderColor }]}
          >
            <ThemedText
              type="card-title-large"
              weight="semi-bold"
              style={{ color: textColor }}
            >
              Booking Details
            </ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={textColor} />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Room Image */}
            <Image
              source={
                booking.room_image ? { uri: booking.room_image } : placeholder
              }
              style={styles.detailImage}
              resizeMode="cover"
            />

            {/* Room Info Section */}
            <Container
              style={[
                styles.section,
                { backgroundColor: isDark ? '#1a1f2e' : '#f8f9fa' },
              ]}
            >
              <View style={styles.sectionRow}>
                <View style={{ flex: 1 }}>
                  <ThemedText
                    type="card-title-large"
                    weight="bold"
                    style={{ color: textColor }}
                  >
                    Room {booking.room_number || 'N/A'}
                  </ThemedText>
                  {booking.business_name && (
                    <ThemedText
                      type="body-medium"
                      style={{ color: subTextColor, marginTop: 4 }}
                    >
                      {booking.business_name}
                    </ThemedText>
                  )}
                </View>
                <Chip
                  label={booking.booking_status || 'Unknown'}
                  size="medium"
                  variant="soft"
                  color={getStatusColor(booking.booking_status)}
                />
              </View>
            </Container>

            {/* Booking Information */}
            <Container style={styles.section}>
              <ThemedText
                type="card-title-medium"
                weight="semi-bold"
                style={{ color: textColor, marginBottom: 16 }}
              >
                Booking Information
              </ThemedText>

              {/* Check-in */}
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="log-in-outline"
                    size={20}
                    color={Colors.light.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText
                    type="label-small"
                    style={{ color: subTextColor }}
                  >
                    Check-in
                  </ThemedText>
                  <ThemedText
                    type="body-medium"
                    weight="semi-bold"
                    style={{ color: textColor }}
                  >
                    {formatDate(booking.check_in_date)}
                  </ThemedText>
                  <ThemedText
                    type="label-small"
                    style={{ color: subTextColor }}
                  >
                    {formatTime(booking.check_in_time)}
                  </ThemedText>
                </View>
              </View>

              {/* Check-out */}
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color={Colors.light.error}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText
                    type="label-small"
                    style={{ color: subTextColor }}
                  >
                    Check-out
                  </ThemedText>
                  <ThemedText
                    type="body-medium"
                    weight="semi-bold"
                    style={{ color: textColor }}
                  >
                    {formatDate(booking.check_out_date)}
                  </ThemedText>
                  <ThemedText
                    type="label-small"
                    style={{ color: subTextColor }}
                  >
                    {formatTime(booking.check_out_time)}
                  </ThemedText>
                </View>
              </View>

              {/* Booking Type */}
              {booking.booking_type && (
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Ionicons
                      name="moon-outline"
                      size={20}
                      color={Colors.light.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText
                      type="label-small"
                      style={{ color: subTextColor }}
                    >
                      Booking Type
                    </ThemedText>
                    <ThemedText
                      type="body-medium"
                      weight="semi-bold"
                      style={{ color: textColor }}
                    >
                      {booking.booking_type === 'overnight'
                        ? 'Overnight Stay'
                        : 'Short Stay'}
                    </ThemedText>
                  </View>
                </View>
              )}

              {/* Guests */}
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="people-outline"
                    size={20}
                    color={Colors.light.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText
                    type="label-small"
                    style={{ color: subTextColor }}
                  >
                    Guests
                  </ThemedText>
                  <ThemedText
                    type="body-medium"
                    weight="semi-bold"
                    style={{ color: textColor }}
                  >
                    {booking.pax || 0} {booking.pax === 1 ? 'Guest' : 'Guests'}
                  </ThemedText>
                  {(booking.num_adults ||
                    booking.num_children ||
                    booking.num_infants) && (
                    <ThemedText
                      type="label-small"
                      style={{ color: subTextColor, marginTop: 2 }}
                    >
                      {booking.num_adults ? `${booking.num_adults} Adults` : ''}
                      {booking.num_children
                        ? `, ${booking.num_children} Children`
                        : ''}
                      {booking.num_infants
                        ? `, ${booking.num_infants} Infants`
                        : ''}
                    </ThemedText>
                  )}
                </View>
              </View>
            </Container>

            {/* Payment Information */}
            <Container style={styles.section}>
              <ThemedText
                type="card-title-medium"
                weight="semi-bold"
                style={{ color: textColor, marginBottom: 16 }}
              >
                Payment Information
              </ThemedText>

              <View style={styles.paymentRow}>
                <ThemedText type="body-medium" style={{ color: subTextColor }}>
                  Total Amount
                </ThemedText>
                <ThemedText
                  type="body-large"
                  weight="bold"
                  style={{ color: textColor }}
                >
                  {formatPrice(booking.total_price)}
                </ThemedText>
              </View>

              {booking.balance !== undefined && booking.balance > 0 && (
                <View style={styles.paymentRow}>
                  <ThemedText
                    type="body-medium"
                    style={{ color: subTextColor }}
                  >
                    Balance Due
                  </ThemedText>
                  <ThemedText
                    type="body-large"
                    weight="bold"
                    style={{ color: Colors.light.error }}
                  >
                    {formatPrice(booking.balance)}
                  </ThemedText>
                </View>
              )}

              {booking.balance === 0 && (
                <View style={[styles.paymentRow, { marginTop: 8 }]}>
                  <View style={styles.paidBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={Colors.light.success}
                    />
                    <ThemedText
                      type="label-small"
                      weight="semi-bold"
                      style={{ color: Colors.light.success, marginLeft: 4 }}
                    >
                      Fully Paid
                    </ThemedText>
                  </View>
                </View>
              )}
            </Container>

            {/* Trip Purpose */}
            {booking.trip_purpose && (
              <Container style={styles.section}>
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
              </Container>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.modalFooter, { borderTopColor: borderColor }]}>
            {booking.booking_status === 'Reserved' && (
              <Button
                label={cancelling ? 'Cancelling...' : 'Cancel Booking'}
                onPress={handleCancelBooking}
                variant="soft"
                color="error"
                size="large"
                disabled={cancelling}
                startIcon={cancelling ? undefined : 'close-circle-outline'}
                style={{ flex: 1 }}
              />
            )}

            {booking.booking_status === 'Checked-Out' && (
              <Button
                label="Book Again"
                onPress={handleBookAgain}
                variant="solid"
                color="primary"
                size="large"
                startIcon="refresh-outline"
                style={{ flex: 1 }}
              />
            )}

            {booking.booking_status !== 'Reserved' &&
              booking.booking_status !== 'Checked-Out' && (
                <Button
                  label="Close"
                  onPress={onClose}
                  variant="soft"
                  color="neutral"
                  size="large"
                  style={{ flex: 1 }}
                />
              )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BookingDetailsModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  detailImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#e5e7eb',
  },
  section: {
    padding: 16,
    borderRadius: 0,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(70, 130, 180, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
});
