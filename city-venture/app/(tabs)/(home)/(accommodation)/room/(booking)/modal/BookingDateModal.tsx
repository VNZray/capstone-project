import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors, card } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { format, addDays } from 'date-fns';
import Button from '@/components/Button';
import {
  RangeDateCalendar,
  TimeRangePicker,
  SingleDateCalendar,
} from '@/components/calendar';
import type { DateMarker } from '@/components/calendar';

// Booking type
export type BookingType = 'overnight' | 'short-stay';

// Room availability status for marking dates
export type RoomAvailability = 'available' | 'reserved' | 'occupied';

// Date availability info from API
export type DateAvailabilityInfo = {
  date: Date;
  status: RoomAvailability;
  availableRooms?: number;
  totalRooms?: number;
};

export type BookingDateModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: BookingDateResult) => void;
  bookingType: BookingType;
  initialStartDate?: Date;
  initialEndDate?: Date;
  initialStartTime?: Date;
  initialEndTime?: Date;
  availabilityData?: DateAvailabilityInfo[];
  loading?: boolean;
  minDate?: Date;
  maxDate?: Date;
};

export type BookingDateResult = {
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
  bookingType: BookingType;
};

// Convert availability status to marker status
const availabilityToMarkerStatus = (
  status: RoomAvailability
): 'none' | 'warning' | 'error' => {
  switch (status) {
    case 'reserved':
      return 'warning';
    case 'occupied':
      return 'error';
    default:
      return 'none';
  }
};

const BookingDateModal: React.FC<BookingDateModalProps> = ({
  visible,
  onClose,
  onConfirm,
  bookingType,
  initialStartDate,
  initialEndDate,
  initialStartTime,
  initialEndTime,
  availabilityData = [],
  loading = false,
  minDate = new Date(),
  maxDate = addDays(new Date(), 365),
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const surface = isDark ? card.dark : card.light;
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const borderColor = isDark ? '#262B3A' : '#E3E7EF';

  // Default times based on booking type
  const getDefaultStartTime = () => {
    const time = new Date();
    if (bookingType === 'overnight') {
      time.setHours(14, 0, 0, 0); // 2:00 PM check-in
    } else {
      time.setHours(8, 0, 0, 0); // 8:00 AM
    }
    return time;
  };

  const getDefaultEndTime = () => {
    const time = new Date();
    if (bookingType === 'overnight') {
      time.setHours(12, 0, 0, 0); // 12:00 PM check-out
    } else {
      time.setHours(17, 0, 0, 0); // 5:00 PM
    }
    return time;
  };

  // State
  const [startDate, setStartDate] = useState<Date>(
    initialStartDate || new Date()
  );
  const [endDate, setEndDate] = useState<Date>(
    initialEndDate || addDays(new Date(), bookingType === 'overnight' ? 1 : 0)
  );
  const [startTime, setStartTime] = useState<Date>(
    initialStartTime || getDefaultStartTime()
  );
  const [endTime, setEndTime] = useState<Date>(
    initialEndTime || getDefaultEndTime()
  );

  // Convert availability data to date markers
  const dateMarkers: DateMarker[] = useMemo(() => {
    return availabilityData
      .filter((item) => item.status !== 'available')
      .map((item) => ({
        date: item.date,
        status: availabilityToMarkerStatus(item.status),
        label: item.status,
      }));
  }, [availabilityData]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setStartDate(initialStartDate || new Date());
      setEndDate(
        initialEndDate ||
          addDays(new Date(), bookingType === 'overnight' ? 1 : 0)
      );
      setStartTime(initialStartTime || getDefaultStartTime());
      setEndTime(initialEndTime || getDefaultEndTime());
    }
  }, [visible, bookingType]);

  // Handle date range selection (for overnight)
  const handleRangeSelect = useCallback((start: Date, end: Date | null) => {
    setStartDate(start);
    if (end) {
      setEndDate(end);
    }
  }, []);

  // Handle single date selection (for short-stay)
  const handleSingleDateSelect = useCallback((date: Date) => {
    setStartDate(date);
    setEndDate(date); // Same day for short-stay
  }, []);

  // Calculate nights
  const calculateNights = (): number => {
    if (bookingType === 'short-stay') return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Handle confirm
  const handleConfirm = useCallback(() => {
    onConfirm({
      startDate,
      endDate,
      startTime,
      endTime,
      bookingType,
    });
    onClose();
  }, [startDate, endDate, startTime, endTime, bookingType, onConfirm, onClose]);

  const nights = calculateNights();
  const isOvernight = bookingType === 'overnight';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: surface }]}>
        {/* Header */}
        <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <ThemedText
              type="header-small"
              weight="bold"
              style={{ color: textColor }}
            >
              {isOvernight
                ? 'Select Check-in & Check-out'
                : 'Select Date & Time'}
            </ThemedText>
            <ThemedText
              type="body-small"
              style={{ color: subTextColor, marginTop: 4 }}
            >
              {isOvernight
                ? 'Choose your stay dates'
                : 'Choose your visit time'}
            </ThemedText>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <ThemedText
                type="body-medium"
                style={{ color: subTextColor, marginTop: 16 }}
              >
                Loading availability...
              </ThemedText>
            </View>
          ) : (
            <>
              {/* Selected Dates Summary */}
              <View
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: isDark ? '#1a1f2e' : '#f8f9fa',
                    borderColor,
                  },
                ]}
              >
                <View style={styles.summaryItem}>
                  <ThemedText
                    type="label-small"
                    style={{ color: subTextColor }}
                  >
                    {isOvernight ? 'Check-in' : 'Date'}
                  </ThemedText>
                  <ThemedText
                    type="body-medium"
                    weight="semi-bold"
                    style={{ color: textColor }}
                  >
                    {format(startDate, 'MMM dd, yyyy')}
                  </ThemedText>
                </View>

                {isOvernight && (
                  <>
                    <View style={styles.summaryDivider}>
                      <View
                        style={[
                          styles.nightsBadge,
                          { backgroundColor: surface, borderColor },
                        ]}
                      >
                        <Ionicons
                          name="moon"
                          size={12}
                          color={Colors.light.primary}
                        />
                        <ThemedText
                          type="label-small"
                          weight="semi-bold"
                          style={{ color: textColor, marginLeft: 4 }}
                        >
                          {nights}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.summaryItem}>
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
                        {format(endDate, 'MMM dd, yyyy')}
                      </ThemedText>
                    </View>
                  </>
                )}
              </View>

              {/* Calendar Section */}
              <View style={styles.section}>
                <ThemedText
                  type="card-title-small"
                  weight="bold"
                  style={{ marginBottom: 16, color: textColor }}
                >
                  {isOvernight ? 'Select Dates' : 'Select Date'}
                </ThemedText>

                {isOvernight ? (
                  <RangeDateCalendar
                    startDate={startDate}
                    endDate={endDate}
                    onRangeSelect={handleRangeSelect}
                    minDate={minDate}
                    maxDate={maxDate}
                    markers={dateMarkers}
                  />
                ) : (
                  <SingleDateCalendar
                    selectedDate={startDate}
                    onDateSelect={handleSingleDateSelect}
                    minDate={minDate}
                    maxDate={maxDate}
                    markers={dateMarkers}
                  />
                )}
              </View>

              {/* Legend */}
              <View style={[styles.legend, { borderColor }]}>
                <View style={styles.legendItems}>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        {
                          backgroundColor: 'transparent',
                          borderColor: borderColor,
                          borderWidth: 1.5,
                        },
                      ]}
                    />
                    <ThemedText
                      type="body-extra-small"
                      style={{ color: subTextColor }}
                    >
                      Available
                    </ThemedText>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        {
                          backgroundColor: Colors.light.warningLight,
                          borderColor: Colors.light.warning,
                          borderWidth: 1.5,
                        },
                      ]}
                    />
                    <ThemedText
                      type="body-extra-small"
                      style={{ color: subTextColor }}
                    >
                      Reserved
                    </ThemedText>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        {
                          backgroundColor: Colors.light.errorLight,
                          borderColor: Colors.light.error,
                          borderWidth: 1.5,
                        },
                      ]}
                    />
                    <ThemedText
                      type="body-extra-small"
                      style={{ color: subTextColor }}
                    >
                      Occupied
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Time Section */}
              <View style={styles.section}>
                <ThemedText
                  type="card-title-small"
                  weight="bold"
                  style={{ marginBottom: 16, color: textColor }}
                >
                  {isOvernight ? 'Check-in & Check-out Time' : 'Visit Time'}
                </ThemedText>

                <TimeRangePicker
                  startTime={startTime}
                  endTime={endTime}
                  onStartTimeChange={setStartTime}
                  onEndTimeChange={setEndTime}
                  startLabel={isOvernight ? 'Check-in Time' : 'Start Time'}
                  endLabel={isOvernight ? 'Check-out Time' : 'End Time'}
                />
              </View>

              {/* Actions */}
              <View style={[styles.actions, { borderTopColor: borderColor }]}>
                <Button
                  label="Cancel"
                  variant="outlined"
                  color="neutral"
                  size="large"
                  onPress={onClose}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Confirm"
                  variant="solid"
                  color="primary"
                  size="large"
                  onPress={handleConfirm}
                  style={{ flex: 1 }}
                />
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default BookingDateModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  nightsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  section: {
    marginBottom: 20,
  },
  legend: {
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    marginTop: 8,
  },
});
