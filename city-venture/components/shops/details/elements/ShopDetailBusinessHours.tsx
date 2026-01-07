import type {
  BusinessProfileHours,
  BusinessProfileOperatingStatus,
  BusinessProfileDayKey,
} from '@/components/shops/details/types';
import { ShopColors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ShopDetailBusinessHoursProps {
  hours: BusinessProfileHours;
  status?: BusinessProfileOperatingStatus;
}

const DAYS: BusinessProfileDayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

const formatHours = (value?: { open: string; close: string; isClosed?: boolean }) => {
  if (!value) return 'Closed';
  if (value.isClosed) return 'Closed';
  return `${value.open} - ${value.close}`;
};

const getCurrentDay = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

const ShopDetailBusinessHours: React.FC<ShopDetailBusinessHoursProps> = ({ hours, status }) => {
  const currentDay = getCurrentDay();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Ionicons name="time" size={20} color={ShopColors.accent} />
            <Text style={styles.cardTitle}>Business Hours</Text>
          </View>
          {status && (
            <View
              style={[
                styles.statusBadge,
                status.isOpen ? styles.statusOpen : styles.statusClosed,
              ]}
            >
              <View style={[
                styles.statusDot, 
                { backgroundColor: status.isOpen ? ShopColors.success : ShopColors.error }
              ]} />
              <Text style={[
                styles.statusText,
                { color: status.isOpen ? ShopColors.success : ShopColors.error }
              ]}>{status.label}</Text>
            </View>
          )}
        </View>

        {status?.nextOpening && (
          <View style={styles.nextOpeningContainer}>
            <Text style={styles.nextOpeningText}>Next opening: {status.nextOpening}</Text>
          </View>
        )}

        <View style={styles.hoursList}>
          {DAYS.map((day) => {
            const isToday = day === currentDay;
            return (
              <View key={day} style={[styles.row, isToday && styles.todayRow]}>
                <Text style={[styles.dayLabel, isToday && styles.todayText]}>{capitalize(day)}</Text>
                <Text style={[styles.dayValue, isToday && styles.todayText]}>{formatHours(hours[day])}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  statusOpen: {
    backgroundColor: '#ECFDF5',
  },
  statusClosed: {
    backgroundColor: '#FEF2F2',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  nextOpeningContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  nextOpeningText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
  },
  hoursList: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayRow: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dayLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textPrimary,
    width: 100,
  },
  dayValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  todayText: {
    color: ShopColors.accent,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default ShopDetailBusinessHours;
