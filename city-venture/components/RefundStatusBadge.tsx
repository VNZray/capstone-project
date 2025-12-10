/**
 * Refund Status Badge
 * 
 * Visual indicator for refund status in order lists and details.
 * Shows processing state with appropriate colors and icons.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as RefundService from '@/services/RefundService';
import type { RefundStatus } from '@/services/RefundService';

interface RefundStatusBadgeProps {
  status: RefundStatus;
  amount?: number;
  compact?: boolean;
}

const RefundStatusBadge: React.FC<RefundStatusBadgeProps> = ({
  status,
  amount,
  compact = false,
}) => {
  const color = RefundService.getRefundStatusColor(status);
  const label = RefundService.getRefundStatusLabel(status);

  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'processing':
        return 'refresh-outline';
      case 'succeeded':
        return 'checkmark-circle';
      case 'failed':
        return 'close-circle';
      case 'cancelled':
        return 'ban-outline';
      default:
        return 'help-circle-outline';
    }
  };

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: color + '20' }]}>
        <Ionicons name={getIcon()} size={14} color={color} />
        <Text style={[styles.compactText, { color }]}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: color + '15' }]}>
      <View style={styles.row}>
        <Ionicons name={getIcon()} size={18} color={color} />
        <Text style={[styles.label, { color }]}>Refund {label}</Text>
      </View>
      {amount !== undefined && (
        <Text style={[styles.amount, { color }]}>
          ₱{amount.toFixed(2)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RefundStatusBadge;
