import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type TransactionStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentFor = 'booking' | 'order' | 'reservation' | 'subscription';

export interface Transaction {
  id: string;
  title: string;
  date: string;
  status: TransactionStatus;
  amount: number;
  payment_method: string;
  payment_for: PaymentFor;
  reference_id?: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const borderColor = isDark ? '#262B3A' : '#E3E7EF';

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format amount
  const formatAmount = (amount: number): string => {
    return `₱${amount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusConfig = (status: TransactionStatus) => {
    switch (status) {
      case 'paid':
        return {
          color: Colors.light.success,
          label: 'Success',
          icon: 'checkmark-circle',
        };
      case 'failed':
        return {
          color: Colors.light.error,
          label: 'Failed',
          icon: 'close-circle',
        };
      case 'refunded':
        return {
          color: Colors.light.info,
          label: 'Refunded',
          icon: 'arrow-undo-circle',
        };
      case 'pending':
        return {
          color: Colors.light.warning,
          label: 'Pending',
          icon: 'time',
        };
    }
  };

  const getTypeIcon = (type: PaymentFor) => {
    switch (type) {
      case 'booking':
        return 'bed';
      case 'order':
        return 'cart';
      case 'reservation':
        return 'calendar';
      case 'subscription':
        return 'repeat';
      default:
        return 'card';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    const lowerMethod = method.toLowerCase();
    if (lowerMethod.includes('gcash')) return 'logo-google';
    if (lowerMethod.includes('maya') || lowerMethod.includes('paymaya'))
      return 'card';
    if (lowerMethod.includes('card')) return 'card';
    return 'wallet';
  };

  const statusConfig = getStatusConfig(transaction.status);

  const CardContent = (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      {/* Left: Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor:
              transaction.status === 'paid'
                ? 'rgba(34, 197, 94, 0.1)'
                : transaction.status === 'failed'
                ? 'rgba(239, 68, 68, 0.1)'
                : transaction.status === 'refunded'
                ? 'rgba(59, 130, 246, 0.1)'
                : 'rgba(251, 146, 60, 0.1)',
          },
        ]}
      >
        <Ionicons
          name={getTypeIcon(transaction.payment_for) as any}
          size={24}
          color={statusConfig.color}
        />
      </View>

      {/* Middle: Details */}
      <View style={styles.detailsContainer}>
        <ThemedText
          type="body-medium"
          weight="semi-bold"
          style={{ color: textColor, marginBottom: 4 }}
        >
          {transaction.title}
        </ThemedText>

        <ThemedText
          type="label-small"
          style={{ color: subTextColor, marginBottom: 6 }}
        >
          {formatDate(transaction.date)}
        </ThemedText>

        {/* Payment Method */}
        <View style={styles.paymentMethodRow}>
          <Ionicons
            name={getPaymentMethodIcon(transaction.payment_method) as any}
            size={14}
            color={subTextColor}
          />
          <ThemedText
            type="label-small"
            style={{ color: subTextColor, marginLeft: 4 }}
          >
            {transaction.payment_method}
          </ThemedText>
        </View>
      </View>

      {/* Right: Amount & Status */}
      <View style={styles.amountContainer}>
        <ThemedText
          type="body-medium"
          weight="semi-bold"
          style={[
            {
              color:
                transaction.status === 'failed'
                  ? Colors.light.error
                  : transaction.status === 'paid'
                  ? Colors.light.success
                  : transaction.status === 'refunded'
                  ? Colors.light.info
                  : textColor,
            },
            transaction.status === 'failed' && styles.strikethrough,
          ]}
        >
          {formatAmount(transaction.amount)}
        </ThemedText>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${statusConfig.color}15` },
          ]}
        >
          <Ionicons
            name={statusConfig.icon as any}
            size={12}
            color={statusConfig.color}
          />
          <ThemedText
            type="label-small"
            weight="medium"
            style={{ color: statusConfig.color, marginLeft: 4 }}
          >
            {statusConfig.label}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        {CardContent}
      </Pressable>
    );
  }

  return CardContent;
};

export default TransactionCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
});
