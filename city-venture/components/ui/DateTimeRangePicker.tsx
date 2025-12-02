import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/color';
import {
  format,
  addDays,
  isSameDay,
  isAfter,
  isBefore,
  startOfDay,
  set,
} from 'date-fns';
import BaseModal from '../BaseModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Room availability status
export type RoomAvailability = 'available' | 'reserved' | 'occupied';

// Date availability info
export type DateAvailabilityInfo = {
  date: Date;
  status: RoomAvailability;
  availableRooms?: number;
  totalRooms?: number;
};

export type DateTimeRangePickerProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (
    startDate: Date,
    endDate: Date,
    startTime: Date,
    endTime: Date
  ) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  initialStartTime?: Date;
  initialEndTime?: Date;
  availabilityData?: DateAvailabilityInfo[];
  roomId?: string;
  businessId?: string;
  minDate?: Date;
  maxDate?: Date;
  loading?: boolean;
};

export const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = ({
  visible,
  onClose,
  onConfirm,
  initialStartDate,
  initialEndDate,
  initialStartTime,
  initialEndTime,
  availabilityData = [],
  roomId,
  businessId,
  minDate = new Date(),
  maxDate = addDays(new Date(), 365),
  loading = false,
}) => {
  const theme = Colors.light;

  const [startDate, setStartDate] = useState<Date>(
    initialStartDate || new Date()
  );
  const [endDate, setEndDate] = useState<Date>(
    initialEndDate || addDays(new Date(), 1)
  );
  const [startTime, setStartTime] = useState<Date>(
    initialStartTime || new Date()
  );
  const [endTime, setEndTime] = useState<Date>(initialEndTime || new Date());

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStartDate, setSelectingStartDate] = useState(true);

  useEffect(() => {
    if (visible) {
      setStartDate(initialStartDate || new Date());
      setEndDate(initialEndDate || addDays(new Date(), 1));
      setStartTime(initialStartTime || new Date());
      setEndTime(initialEndTime || new Date());
      setCurrentMonth(initialStartDate || new Date());
      setSelectingStartDate(true);
    }
  }, [visible]);

  const getAvailabilityForDate = (
    date: Date
  ): DateAvailabilityInfo | undefined => {
    return availabilityData.find((item) => isSameDay(item.date, date));
  };

  const getStatusColor = (status: RoomAvailability): string => {
    switch (status) {
      case 'reserved':
        return theme.warning;
      case 'occupied':
        return theme.error;
      default:
        return 'transparent';
    }
  };

  const getStatusBgColor = (status: RoomAvailability): string => {
    switch (status) {
      case 'reserved':
        return theme.warningLight;
      case 'occupied':
        return theme.errorLight;
      default:
        return 'transparent';
    }
  };

  const handleDatePress = (date: Date) => {
    const dateStart = startOfDay(date);
    const availability = getAvailabilityForDate(date);

    // Prevent selecting reserved or occupied dates
    if (
      availability &&
      (availability.status === 'reserved' || availability.status === 'occupied')
    ) {
      return;
    }

    if (selectingStartDate) {
      setStartDate(dateStart);
      // Auto-advance to end date selection
      if (
        isAfter(dateStart, startOfDay(endDate)) ||
        isSameDay(dateStart, endDate)
      ) {
        setEndDate(addDays(dateStart, 1));
      }
      setSelectingStartDate(false);
    } else {
      if (isBefore(dateStart, startOfDay(startDate))) {
        // If selected date is before start date, swap them
        setEndDate(startDate);
        setStartDate(dateStart);
      } else {
        setEndDate(dateStart);
      }
      setSelectingStartDate(true);
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return (
      <View style={styles.calendar}>
        {/* Month header */}
        <View style={styles.monthHeader}>
          <Pressable
            onPress={() => setCurrentMonth(new Date(year, month - 1, 1))}
            style={styles.monthNavButton}
          >
            <Ionicons name="chevron-back" size={24} color={theme.primary} />
          </Pressable>

          <ThemedText type="card-title-medium" weight="bold">
            {format(currentMonth, 'MMMM yyyy')}
          </ThemedText>

          <Pressable
            onPress={() => setCurrentMonth(new Date(year, month + 1, 1))}
            style={styles.monthNavButton}
          >
            <Ionicons name="chevron-forward" size={24} color={theme.primary} />
          </Pressable>
        </View>

        {/* Day labels */}
        <View style={styles.dayLabels}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <View key={day} style={styles.dayLabel}>
              <ThemedText
                type="body-extra-small"
                weight="semi-bold"
                style={{ color: theme.textSecondary }}
              >
                {day}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            if (!day) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const availability = getAvailabilityForDate(day);
            const isStartDate = isSameDay(day, startDate);
            const isEndDate = isSameDay(day, endDate);
            const isInRange = isAfter(day, startDate) && isBefore(day, endDate);
            const isPastOrFuture =
              isBefore(day, minDate) || isAfter(day, maxDate);
            const isReservedOrOccupied =
              availability &&
              (availability.status === 'reserved' ||
                availability.status === 'occupied');
            const isDisabled = isPastOrFuture || isReservedOrOccupied;
            const isToday = isSameDay(day, new Date());

            return (
              <Pressable
                key={index}
                style={[
                  styles.dayCell,
                  isStartDate && styles.startDateCell,
                  isEndDate && styles.endDateCell,
                  isInRange && styles.inRangeCell,
                  isDisabled && styles.disabledCell,
                ]}
                onPress={() => !isDisabled && handleDatePress(day)}
                disabled={isDisabled}
              >
                <View
                  style={[
                    styles.dayContent,
                    // Only show background for reserved/occupied (not available)
                    availability &&
                      availability.status !== 'available' && {
                        backgroundColor: getStatusBgColor(availability.status),
                        borderColor: getStatusColor(availability.status),
                        borderWidth: 1.5,
                      },
                    (isStartDate || isEndDate) && {
                      backgroundColor: theme.primary,
                      borderWidth: 0,
                      borderRadius: '50%',
                    },
                    isToday &&
                      !isStartDate &&
                      !isEndDate && {
                        borderColor: theme.active,
                        borderWidth: 2,
                      },
                  ]}
                >
                  <ThemedText
                    type="body-small"
                    weight={isStartDate || isEndDate ? 'bold' : 'normal'}
                    style={{
                      color:
                        isStartDate || isEndDate
                          ? '#FFFFFF'
                          : isDisabled
                          ? theme.textTertiary
                          : theme.text,
                    }}
                  >
                    {day.getDate()}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  const handleConfirm = () => {
    onConfirm(startDate, endDate, startTime, endTime);
    onClose();
  };

  return (
    <BaseModal
      title="Select Date & Time Range"
      visible={visible}
      onClose={onClose}
      scrollable={true}
      primaryButtonLabel="Confirm"
      onPrimaryPress={handleConfirm}
      secondaryButtonLabel="Cancel"
      onSecondaryPress={onClose}
    >
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText
              type="body-medium"
              style={{ color: theme.textSecondary, marginTop: 16 }}
            >
              Loading availability...
            </ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.selectionIndicator}>
              <ThemedText
                type="body-small"
                style={{ color: theme.textSecondary }}
              >
                {selectingStartDate
                  ? 'Select check-in date'
                  : 'Select check-out date'}
              </ThemedText>
            </View>

            {/* Selected dates display */}
            <View style={styles.selectedDatesContainer}>
              <View style={styles.dateDisplay}>
                <ThemedText
                  type="label-small"
                  style={{ color: theme.textSecondary }}
                >
                  Check-in
                </ThemedText>
                <ThemedText type="body-medium" weight="semi-bold">
                  {format(startDate, 'MMM dd, yyyy')}
                </ThemedText>
              </View>

              <Ionicons
                name="arrow-forward"
                size={20}
                color={theme.textSecondary}
              />

              <View style={styles.dateDisplay}>
                <ThemedText
                  type="label-small"
                  style={{ color: theme.textSecondary }}
                >
                  Check-out
                </ThemedText>
                <ThemedText type="body-medium" weight="semi-bold">
                  {format(endDate, 'MMM dd, yyyy')}
                </ThemedText>
              </View>
            </View>

            {/* Calendar */}
            {renderCalendar()}

            {/* Availability legend */}
            <View style={styles.legend}>
              <View style={styles.legendItems}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor: 'transparent',
                        borderColor: theme.border,
                        borderWidth: 1.5,
                      },
                    ]}
                  />
                  <ThemedText type="body-extra-small">Available</ThemedText>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor: theme.warningLight,
                        borderColor: theme.warning,
                        borderWidth: 1.5,
                      },
                    ]}
                  />
                  <ThemedText type="body-extra-small">Reserved</ThemedText>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor: theme.errorLight,
                        borderColor: theme.error,
                        borderWidth: 1.5,
                      },
                    ]}
                  />
                  <ThemedText type="body-extra-small">Occupied</ThemedText>
                </View>
              </View>
            </View>

            {/* Time selection */}
            <View style={styles.timeSection}>
              <ThemedText
                type="card-title-small"
                weight="bold"
                style={{ marginBottom: 12 }}
              >
                Select Time
              </ThemedText>

              <View style={styles.timePickersRow}>
                {/* Start time */}
                <View style={styles.timePicker}>
                  <ThemedText
                    type="label-small"
                    style={{ color: theme.textSecondary, marginBottom: 8 }}
                  >
                    Check-in Time
                  </ThemedText>
                  <Pressable
                    style={[styles.timeButton, { borderColor: theme.border }]}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={theme.primary}
                    />
                    <ThemedText type="body-medium" weight="medium">
                      {format(startTime, 'hh:mm a')}
                    </ThemedText>
                  </Pressable>
                </View>

                {/* End time */}
                <View style={styles.timePicker}>
                  <ThemedText
                    type="label-small"
                    style={{ color: theme.textSecondary, marginBottom: 8 }}
                  >
                    Check-out Time
                  </ThemedText>
                  <Pressable
                    style={[styles.timeButton, { borderColor: theme.border }]}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={theme.primary}
                    />
                    <ThemedText type="body-medium" weight="medium">
                      {format(endTime, 'hh:mm a')}
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
          </>
        )}
      </View>

      {showStartTimePicker && (
        <View>
          <Pressable onPress={() => setShowStartTimePicker(false)} />
          {Platform.OS === 'ios' ? (
            <BaseModal
              title="Check-in Time"
              visible={showStartTimePicker}
              onClose={() => setShowStartTimePicker(false)}
              scrollable={false}
              primaryButtonLabel="Done"
              onPrimaryPress={() => setShowStartTimePicker(false)}
              secondaryButtonLabel="Cancel"
              onSecondaryPress={() => setShowStartTimePicker(false)}
            >
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedTime) => {
                    if (selectedTime) setStartTime(selectedTime);
                  }}
                />
              </View>
            </BaseModal>
          ) : (
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowStartTimePicker(false);
                  if (selectedTime) setStartTime(selectedTime);
                }}
              />
            </View>
          )}
        </View>
      )}
      {showEndTimePicker && (
        <View>
          <Pressable onPress={() => setShowEndTimePicker(false)} />
          {Platform.OS === 'ios' ? (
            <BaseModal
              title="Check-out Time"
              visible={showEndTimePicker}
              onClose={() => setShowEndTimePicker(false)}
              scrollable={false}
              primaryButtonLabel="Done"
              onPrimaryPress={() => setShowEndTimePicker(false)}
              secondaryButtonLabel="Cancel"
              onSecondaryPress={() => setShowEndTimePicker(false)}
            >
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedTime) => {
                    if (selectedTime) setEndTime(selectedTime);
                  }}
                />
              </View>
            </BaseModal>
          ) : (
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <DateTimePicker
                value={endTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowEndTimePicker(false);
                  if (selectedTime) setEndTime(selectedTime);
                }}
              />
            </View>
          )}
        </View>
      )}
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  content: {},
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  selectionIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.surfaceOverlay,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedDatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  calendar: {
    marginBottom: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  monthNavButton: {
    padding: 8,
  },
  dayLabels: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayLabel: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  dayContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    position: 'relative',
  },
  startDateCell: {
    backgroundColor: Colors.light.primary + '50',
    borderTopStartRadius: '50%',
    borderBottomLeftRadius: '50%',
  },
  endDateCell: {
    backgroundColor: Colors.light.primary + '50',
    borderTopEndRadius: '50%',
    borderBottomRightRadius: '50%',
  },
  inRangeCell: {
    backgroundColor: Colors.light.primary + '50',
  },
  disabledCell: {
    opacity: 0.3,
  },
  legend: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
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
    borderWidth: 1.5,
  },
  timeSection: {
    marginBottom: 20,
  },
  timePickersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timePicker: {
    flex: 1,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: Colors.light.surface,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1.5,
    backgroundColor: Colors.light.surface,
  },
  confirmButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
