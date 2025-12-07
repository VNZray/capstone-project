import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
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

export type SingleDateCalendarProps = BaseCalendarProps & {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  initialMonth?: Date;
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

const SingleDateCalendar: React.FC<SingleDateCalendarProps> = ({
  selectedDate,
  onDateSelect,
  initialMonth,
  minDate = new Date(),
  maxDate = addDays(new Date(), 365),
  markers = [],
  theme: customTheme,
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    initialMonth || selectedDate || new Date()
  );

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

  // Check if date is disabled (based on marker status or date range)
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

    // Empty cells before first day
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // All days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentMonth]);

  // Handle date press
  const handleDatePress = useCallback(
    (date: Date) => {
      onDateSelect(startOfDay(date));
    },
    [onDateSelect]
  );

  return (
    <View style={styles.container}>
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
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const isDisabled = isDateDisabled(day, marker);

          return (
            <Pressable
              key={index}
              style={styles.dayCell}
              onPress={() => !isDisabled && handleDatePress(day)}
              disabled={isDisabled}
            >
              <View
                style={[
                  styles.dayContent,
                  // Marker background (only if not selected)
                  !isSelected &&
                    marker &&
                    marker.status !== 'none' && {
                      backgroundColor: getMarkerBgColor(marker.status, theme),
                      borderColor: getMarkerBorderColor(marker.status, theme),
                      borderWidth: 1.5,
                    },
                  // Selected state
                  isSelected && {
                    backgroundColor: theme.primary,
                    borderWidth: 0,
                  },
                  // Today indicator (if not selected and no marker)
                  isToday &&
                    !isSelected &&
                    !marker && {
                      borderColor: theme.active,
                      borderWidth: 2,
                    },
                  // Disabled state
                  isDisabled && styles.disabledContent,
                ]}
              >
                <ThemedText
                  type="body-small"
                  weight={isSelected ? 'bold' : 'normal'}
                  style={{
                    color: isSelected
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

export default SingleDateCalendar;

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
    borderRadius: 100,
  },
  disabledContent: {
    opacity: 0.3,
  },
});
