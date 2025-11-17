import type {
  BusinessProfileHours,
  BusinessProfileOperatingStatus,
  BusinessProfileDayKey,
} from '@/components/shops/details/types';
import { ShopColors } from '@/constants/ShopColors';
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

const ShopDetailBusinessHours: React.FC<ShopDetailBusinessHoursProps> = ({ hours, status }) => (
  <View style={styles.card}>
    <View style={styles.headerRow}>
      <Text style={styles.cardTitle}>Business Hours</Text>
      {status && (
        <View
          style={[
            styles.statusBadge,
            status.isOpen ? styles.statusOpen : styles.statusClosed,
          ]}
        >
          <Text style={styles.statusText}>{status.label}</Text>
        </View>
      )}
    </View>

    {status?.nextOpening && (
      <Text style={styles.nextOpening}>Next opening: {status.nextOpening}</Text>
    )}

    {DAYS.map((day) => (
      <View key={day} style={styles.row}>
        <Text style={styles.dayLabel}>{capitalize(day)}</Text>
        <Text style={styles.dayValue}>{formatHours(hours[day])}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusOpen: {
    backgroundColor: '#E0F8F1',
  },
  statusClosed: {
    backgroundColor: '#FEE9E7',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.accent,
  },
  nextOpening: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dayLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textPrimary,
  },
  dayValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
});

export default ShopDetailBusinessHours;
