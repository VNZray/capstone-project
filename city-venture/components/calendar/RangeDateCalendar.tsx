import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import {
  format,
  isSameDay,
  isAfter,
  isBefore,
  startOfDay,
  addDays,
} from 'date-fns';
import type {
  BaseCalendarProps,
  DateMarker,
  DateMarkerStatus,
  CalendarTheme,
} from './types';

export type RangeDateCalendarProps = BaseCalendarProps & {
  startDate?: Date;
  endDate?: Date;
  onRangeSelect: (startDate: Date, endDate: Date | null) => void;
  initialMonth?: Date;
  allowSameDay?: boolean;
};

// Get marker status background color
const getMarkerBgColor = (
  status: DateMarkerStatus,
  theme: CalendarTheme
): string => {
  switch (status) {
    case 'primary':
      return theme.primaryLight;
    case 'warning':
      return theme.warningLight;
    case 'error':
      return theme.errorLight;
    default:
      return 'transparent';
  }
};

// Get marker status border color
const getMarkerBorderColor = (
  status: DateMarkerStatus,
  theme: CalendarTheme
): string => {
  switch (status) {
    case 'primary':
      return theme.primary;
    case 'warning':
      return theme.warning;
    case 'error':
      return theme.error;
    default:
      return 'transparent';
  }
};

const RangeDateCalendar: React.FC<RangeDateCalendarProps> = ({
  startDate,
  endDate,
  onRangeSelect,
  initialMonth,
  minDate = new Date(),
  maxDate = addDays(new Date(), 365),
  markers = [],
  theme: customTheme,
  allowSameDay = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    initialMonth || startDate || new Date()
  );
  const [selectingStart, setSelectingStart] = useState(true);

  // Merge default theme with custom theme
  const theme: CalendarTheme = useMemo(
    () => ({
      primary: Colors.light.primary,
      primaryLight: Colors.light.primary + '20',
      warning: Colors.light.warning,
      warningLight: Colors.light.warningLight || Colors.light.warning + '20',
      error: Colors.light.error,
      errorLight: Colors.light.errorLight || Colors.light.error + '20',
      text: Colors.light.text,
      textSecondary: Colors.light.textSecondary,
      textTertiary: Colors.light.textTertiary || '#9CA3AF',
      border: Colors.light.border,
      surface: Colors.light.surface,
      active: Colors.light.active,
      ...customTheme,
    }),
    [customTheme]
  );

  // Get marker for a specific date
  const getMarkerForDate = useCallback(
    (date: Date): DateMarker | undefined => {
      return markers.find((marker) => isSameDay(marker.date, date));
    },
    [markers]
  );

  // Check if date is disabled
  const isDateDisabled = useCallback(
    (date: Date, marker?: DateMarker): boolean => {
      const isPastOrFuture =
        isBefore(startOfDay(date), startOfDay(minDate)) ||
        isAfter(startOfDay(date), startOfDay(maxDate));
      const isBlockedByMarker =
        marker?.status === 'error' || marker?.status === 'warning';
      return isPastOrFuture || !!isBlockedByMarker;
    },
    [minDate, maxDate]
  );

  // Navigate months
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  }, []);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentMonth]);

  // Handle date press
  const handleDatePress = useCallback(
    (date: Date) => {
      const dateStart = startOfDay(date);

      if (selectingStart) {
        // Starting new selection
        onRangeSelect(dateStart, null);
        setSelectingStart(false);
      } else {
        // Completing the range
        if (startDate) {
          if (isBefore(dateStart, startOfDay(startDate))) {
            // Selected date is before start, swap them
            onRangeSelect(dateStart, startDate);
          } else if (!allowSameDay && isSameDay(dateStart, startDate)) {
            // Same day selected, set end to next day
            onRangeSelect(startDate, addDays(dateStart, 1));
          } else {
            onRangeSelect(startDate, dateStart);
          }
        }
        setSelectingStart(true);
      }
    },
    [selectingStart, startDate, onRangeSelect, allowSameDay]
  );

  // Check if date is in range
  const isInRange = useCallback(
    (date: Date): boolean => {
      if (!startDate || !endDate) return false;
      return isAfter(date, startDate) && isBefore(date, endDate);
    },
    [startDate, endDate]
  );

  return (
    <View style={styles.container}>
      {/* Selection indicator */}
      <View
        style={[styles.selectionIndicator, { backgroundColor: theme.surface }]}
      >
        <ThemedText type="body-small" style={{ color: theme.textSecondary }}>
          {selectingStart ? 'Select start date' : 'Select end date'}
        </ThemedText>
      </View>

      {/* Month Navigation Header */}
      <View style={styles.monthHeader}>
        <Pressable onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
        </Pressable>

        <ThemedText type="card-title-medium" weight="bold">
          {format(currentMonth, 'MMMM yyyy')}
        </ThemedText>

        <Pressable onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={theme.primary} />
        </Pressable>
      </View>

      {/* Day Labels */}
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

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          if (!day) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const marker = getMarkerForDate(day);
          const isStartDate = startDate && isSameDay(day, startDate);
          const isEndDate = endDate && isSameDay(day, endDate);
          const isRangeDate = isInRange(day);
          const isToday = isSameDay(day, new Date());
          const isDisabled = isDateDisabled(day, marker);

          return (
            <Pressable
              key={index}
              style={[
                styles.dayCell,
                isStartDate && {
                  backgroundColor: theme.primaryLight,
                  borderTopLeftRadius: 100,
                  borderBottomLeftRadius: 100,
                },
                isEndDate && {
                  backgroundColor: theme.primaryLight,
                  borderTopRightRadius: 100,
                  borderBottomRightRadius: 100,
                },
                isRangeDate && {
                  backgroundColor: theme.primaryLight,
                },
              ]}
              onPress={() => !isDisabled && handleDatePress(day)}
              disabled={isDisabled}
            >
              <View
                style={[
                  styles.dayContent,

                  // Marker background (only if not selected)
                  !isStartDate &&
                    !isEndDate &&
                    marker &&
                    marker.status !== 'none' && {
                      backgroundColor: getMarkerBgColor(marker.status, theme),
                      borderColor: getMarkerBorderColor(marker.status, theme),
                      borderWidth: 1.5,
                    },
                  // Start/End selected state
                  (isStartDate || isEndDate) && {
                    backgroundColor: theme.primary,
                    borderWidth: 0,
                    borderRadius: Platform.OS === 'ios' ? '100%' : '100%',
                    overflow: 'hidden',
                  },
                  // Today indicator
                  isToday &&
                    !isStartDate &&
                    !isEndDate &&
                    !marker && {
                      borderColor: theme.active,
                      borderWidth: 2,
                    },
                  isDisabled && styles.disabledContent,
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

export default RangeDateCalendar;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectionIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  navButton: {
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
    borderRadius: Platform.OS === 'ios' ? '100%' : '100%',
    overflow: 'hidden',
  },
  disabledContent: {
    opacity: 0.4,
  },
});
