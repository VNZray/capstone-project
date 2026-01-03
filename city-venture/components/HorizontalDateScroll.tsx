import React, { useRef } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';

type DateItem = {
  date: Date;
  dayName: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
  isSaturday: boolean;
  isSunday: boolean;
};

type HorizontalDateScrollProps = {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  daysToShow?: number;
};

const HorizontalDateScroll: React.FC<HorizontalDateScrollProps> = ({
  onDateSelect,
  selectedDate,
  daysToShow = 14,
}) => {
  const colors = Colors.light;
  const scrollViewRef = useRef<ScrollView>(null);
  const todayRef = useRef<View>(null);

  // Generate dates array
  const generateDates = (): DateItem[] => {
    const dates: DateItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      dates.push({
        date,
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        monthName: monthNames[date.getMonth()],
        isToday: i === 0,
        isSaturday: date.getDay() === 6,
        isSunday: date.getDay() === 0,
      });
    }

    return dates;
  };

  const dates = generateDates();
  const currentSelectedDate = selectedDate || new Date();

  const isSameDate = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollView}
    >
      {dates.map((item, index) => {
        const isSelected = isSameDate(item.date, currentSelectedDate);
        const isWeekend = item.isSaturday || item.isSunday;

        return (
          <Pressable
            key={index}
            ref={item.isToday ? todayRef : undefined}
            onPress={() => onDateSelect?.(item.date)}
            style={[
              styles.dateItem,
              {
                backgroundColor: isSelected ? colors.accent : colors.surface,
                borderColor: isSelected ? colors.accent : colors.border,
              },
            ]}
          >
            <ThemedText
              type="label-small"
              weight={isWeekend ? 'bold' : 'normal'}
              style={[
                styles.dayName,
                {
                  color: isSelected
                    ? '#FFF'
                    : isWeekend
                    ? colors.error
                    : colors.textSecondary,
                },
              ]}
            >
              {item.dayName}
            </ThemedText>
            <ThemedText
              type="title-small"
              weight="bold"
              style={[
                styles.dayNumber,
                {
                  color: isSelected ? '#FFF' : colors.text,
                },
              ]}
            >
              {item.dayNumber}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dateItem: {
    width: 60,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 4,
  },
  dayName: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  dayNumber: {
    fontSize: 18,
  },
});

export default HorizontalDateScroll;
