import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Colors, card, background } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { format, addDays } from 'date-fns';
import Button from '@/components/Button';
import PageContainer from '@/components/PageContainer';
import {
  RangeDateCalendar,
  TimeRangePicker,
  SingleDateCalendar,
} from '@/components/calendar';
import type { DateMarker } from '@/components/calendar';
import { AppHeader } from '@/components/header/AppHeader';
import { useRoom } from '@/context/RoomContext';
import { useAccommodation } from '@/context/AccommodationContext';
import {
  fetchBookingsByRoomId,
  generateBookingDateMarkers,
} from '@/services/BookingService';
import {
  fetchBlockedDatesByRoomId,
  generateBlockedDateMarkers,
} from '@/services/RoomService';
import { fetchBusinessPolicies } from '@/services/BusinessPoliciesService';
import type { BusinessPolicies } from '@/types/BusinessPolicies';

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

export type BookingDateResult = {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
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

const TAB_BAR_HEIGHT = 60;

const BookingDatePage: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { roomDetails } = useRoom();
  const { selectedAccommodationId } = useAccommodation();
  const params = useLocalSearchParams<{
    bookingType?: string;
    initialStartDate?: string;
    initialEndDate?: string;
    initialStartTime?: string;
    initialEndTime?: string;
    availabilityData?: string;
  }>();

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const surface = isDark ? card.dark : card.light;
  const bgColor = isDark ? background.dark : background.light;
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const borderColor = isDark ? '#262B3A' : '#E3E7EF';

  // Parse params
  const bookingType = (params.bookingType as BookingType) || 'overnight';
  const minDate = new Date();
  const maxDate = addDays(new Date(), 365);

  // State for fetched markers
  const [bookingMarkers, setBookingMarkers] = useState<DateMarker[]>([]);
  const [blockedMarkers, setBlockedMarkers] = useState<DateMarker[]>([]);
  const [loadingMarkers, setLoadingMarkers] = useState(false);
  const [businessPolicies, setBusinessPolicies] =
    useState<BusinessPolicies | null>(null);

  // Fetch business policies for check-in/check-out times
  useEffect(() => {
    const loadBusinessPolicies = async () => {
      if (!selectedAccommodationId) return;
      try {
        const policies = await fetchBusinessPolicies(selectedAccommodationId);
        setBusinessPolicies(policies);
      } catch (error) {
        console.error('Failed to load business policies:', error);
      }
    };

    loadBusinessPolicies();
  }, [selectedAccommodationId]);

  // Fetch bookings and blocked dates for the room
  useEffect(() => {
    const fetchRoomAvailability = async () => {
      if (!roomDetails?.id) return;

      setLoadingMarkers(true);
      try {
        // Fetch both bookings and blocked dates in parallel
        const [bookings, blockedDates] = await Promise.all([
          fetchBookingsByRoomId(roomDetails.id),
          fetchBlockedDatesByRoomId(roomDetails.id),
        ]);

        // Generate markers from bookings
        const bookingDateMarkers = generateBookingDateMarkers(bookings);
        setBookingMarkers(bookingDateMarkers);

        // Generate markers from blocked dates
        const blockedDateMarkers = generateBlockedDateMarkers(blockedDates);
        setBlockedMarkers(blockedDateMarkers);
      } catch (error) {
        console.error('Failed to fetch room availability:', error);
      } finally {
        setLoadingMarkers(false);
      }
    };

    fetchRoomAvailability();
  }, [roomDetails?.id]);

  // Parse availability data from params (legacy support)
  const availabilityData: DateAvailabilityInfo[] = useMemo(() => {
    if (!params.availabilityData) return [];
    try {
      const parsed = JSON.parse(params.availabilityData);
      return parsed.map((item: any) => ({
        ...item,
        date: new Date(item.date),
      }));
    } catch {
      return [];
    }
  }, [params.availabilityData]);

  // Parse time string (HH:MM:SS) to hours and minutes
  const parseTimeString = (
    timeStr: string | null
  ): { hours: number; minutes: number } | null => {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return {
        hours: parseInt(parts[0], 10) || 0,
        minutes: parseInt(parts[1], 10) || 0,
      };
    }
    return null;
  };

  // Default times based on booking type and business policies
  const getDefaultStartTime = useCallback(() => {
    const time = new Date();

    if (bookingType === 'overnight') {
      // Use business check-in time if available
      const checkInTime = parseTimeString(
        businessPolicies?.check_in_time ?? null
      );
      if (checkInTime) {
        time.setHours(checkInTime.hours, checkInTime.minutes, 0, 0);
      } else {
        time.setHours(14, 0, 0, 0); // Default: 2:00 PM check-in
      }
    } else {
      time.setHours(8, 0, 0, 0); // 8:00 AM for short-stay
    }
    return time;
  }, [bookingType, businessPolicies?.check_in_time]);

  const getDefaultEndTime = useCallback(() => {
    const time = new Date();

    if (bookingType === 'overnight') {
      // Use business check-out time if available
      const checkOutTime = parseTimeString(
        businessPolicies?.check_out_time ?? null
      );
      if (checkOutTime) {
        time.setHours(checkOutTime.hours, checkOutTime.minutes, 0, 0);
      } else {
        time.setHours(12, 0, 0, 0); // Default: 12:00 PM check-out
      }
    } else {
      time.setHours(17, 0, 0, 0); // 5:00 PM for short-stay
    }
    return time;
  }, [bookingType, businessPolicies?.check_out_time]);

  // Parse initial dates from params
  const parseInitialDate = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  // State
  const [startDate, setStartDate] = useState<Date>(
    parseInitialDate(params.initialStartDate) || new Date()
  );
  const [endDate, setEndDate] = useState<Date>(
    parseInitialDate(params.initialEndDate) ||
      addDays(new Date(), bookingType === 'overnight' ? 1 : 0)
  );
  const [startTime, setStartTime] = useState<Date>(
    parseInitialDate(params.initialStartTime) || getDefaultStartTime()
  );
  const [endTime, setEndTime] = useState<Date>(
    parseInitialDate(params.initialEndTime) || getDefaultEndTime()
  );

  // Update times when business policies are loaded
  useEffect(() => {
    if (businessPolicies && !params.initialStartTime) {
      setStartTime(getDefaultStartTime());
    }
    if (businessPolicies && !params.initialEndTime) {
      setEndTime(getDefaultEndTime());
    }
  }, [
    businessPolicies,
    getDefaultStartTime,
    getDefaultEndTime,
    params.initialStartTime,
    params.initialEndTime,
  ]);

  // Convert availability data to date markers
  const dateMarkers: DateMarker[] = useMemo(() => {
    // Start with param-based availability data (legacy support)
    const paramMarkers = availabilityData
      .filter((item) => item.status !== 'available')
      .map((item) => ({
        date: item.date,
        status: availabilityToMarkerStatus(item.status),
        label: item.status,
      }));

    // Combine all markers: bookings + blocked dates + param-based
    return [...bookingMarkers, ...blockedMarkers, ...paramMarkers];
  }, [availabilityData, bookingMarkers, blockedMarkers]);

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

  // Handle confirm - navigate back to BookingForm with result
  const handleConfirm = useCallback(() => {
    const result: BookingDateResult = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      bookingType,
    };

    // Navigate back to the booking form with the result as a param
    router.replace({
      pathname: '/(tabs)/(home)/(accommodation)/room/(booking)',
      params: {
        bookingDateResult: JSON.stringify(result),
      },
    });
  }, [startDate, endDate, startTime, endTime, bookingType, router]);

  // Handle cancel - just go back
  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const nights = calculateNights();
  const isOvernight = bookingType === 'overnight';

  return (
    <PageContainer padding={0}>
      <View style={{ flex: 1 }}>
        <AppHeader backButton title="Select Date & Time" background="primary" />

        <ScrollView
          style={{ backgroundColor: surface }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 180 }]}
          showsVerticalScrollIndicator={false}
        >
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
              <ThemedText type="label-small" style={{ color: subTextColor }}>
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
        </ScrollView>
        {/* Fixed Bottom Actions */}
        <View
          style={[
            styles.fabBar,
            {
              paddingBottom:
                Platform.OS === 'ios'
                  ? insets.bottom + TAB_BAR_HEIGHT
                  : 12 + insets.bottom + TAB_BAR_HEIGHT,
              paddingTop: Platform.OS === 'ios' ? 16 : 12,
              backgroundColor: bgColor,
            },
          ]}
        >
          <Button
            label="Cancel"
            style={{ flex: 1 }}
            variant="outlined"
            onPress={handleCancel}
          />

          <Button
            label="Confirm"
            fullWidth
            color="primary"
            variant="solid"
            elevation={3}
            style={{ flex: 1 }}
            onPress={handleConfirm}
          />
        </View>
      </View>
    </PageContainer>
  );
};

export default BookingDatePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
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
  fabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});
