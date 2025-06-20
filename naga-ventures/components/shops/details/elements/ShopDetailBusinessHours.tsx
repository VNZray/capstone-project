import { ShopColors } from '@/constants/ShopColors';
import type { ShopBusinessHours } from '@/types/shop';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ShopDetailBusinessHoursProps {
  businessHours: ShopBusinessHours;
  currentDay?: string;
}

const ShopDetailBusinessHours: React.FC<ShopDetailBusinessHoursProps> = ({ 
  businessHours, 
  currentDay 
}) => {
  const getCurrentDay = () => {
    if (currentDay) return currentDay.toLowerCase();
    return new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  };

  const todayKey = getCurrentDay() as keyof ShopBusinessHours;

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <View style={styles.container}>
      {dayOrder.map((day, index) => {
        const dayKey = day as keyof ShopBusinessHours;
        const hours = businessHours[dayKey];
        const isToday = dayKey === todayKey;
        
        if (!hours) return null;

        return (
          <View 
            key={day} 
            style={[
              styles.hourRow,
              isToday && styles.todayRow
            ]}
          >
            <Text style={[
              styles.dayText,
              isToday && styles.todayDayText
            ]}>
              {dayNames[index]}
            </Text>
            <Text style={[
              styles.timeText,
              isToday && styles.todayTimeText,
              hours.isClosed && styles.closedText
            ]}>
              {hours.isClosed 
                ? 'Closed' 
                : `${formatTime(hours.open)} - ${formatTime(hours.close)}`
              }
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  todayRow: {
    backgroundColor: ShopColors.accent + '08',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  dayText: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  timeText: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textPrimary,
  },
  todayDayText: {
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.accent,
  },
  todayTimeText: {
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
  },
  closedText: {
    color: ShopColors.error,
    fontStyle: 'italic',
  },
});

export default React.memo(ShopDetailBusinessHours);