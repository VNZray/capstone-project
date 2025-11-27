import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Order, OrderStatus } from '@/types/Order';

interface OrderCardProps {
  order: Order;
  onPress: (orderId: string) => void;
  activeTab: 'active' | 'completed' | 'cancelled';
}

const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'PENDING':
      return colors.warning;
    case 'ACCEPTED':
    case 'PREPARING':
      return colors.info;
    case 'READY_FOR_PICKUP':
    case 'PICKED_UP':
      return colors.success;
    case 'CANCELLED_BY_USER':
    case 'CANCELLED_BY_BUSINESS':
    case 'FAILED_PAYMENT':
      return colors.error;
    default:
      return colors.primary;
  }
};

const getStatusLabel = (status: OrderStatus): string => {
  return status.replace(/_/g, ' ');
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress, activeTab }) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const type = useTypography();
  const { body, bodySmall } = type;

  const palette = {
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
    divider: isDark ? '#2A2F36' : '#F3F4F6',
  };

  // Get the first item's image if available
  const firstItemImage = order.items?.[0]?.product_image_url;

  return (
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
        },
      ]}
      onPress={() => onPress(order.id)}
    >
      {/* Header: Status & Date */}
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <Ionicons
            name={
              order.status === 'PICKED_UP'
                ? 'checkmark-circle'
                : order.status.includes('CANCELLED')
                ? 'close-circle'
                : 'time'
            }
            size={18}
            color={getStatusColor(order.status)}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(order.status), fontSize: bodySmall },
            ]}
          >
            {getStatusLabel(order.status)}
          </Text>
        </View>
        <Text
          style={[
            styles.dateText,
            { color: palette.subText, fontSize: bodySmall },
          ]}
        >
          {new Date(order.created_at).toLocaleDateString()}
        </Text>
      </View>

      {/* Content: Image & Info */}
      <View style={styles.content}>
        <View
          style={[styles.imageContainer, { backgroundColor: palette.divider }]}
        >
          {firstItemImage ? (
            <Image
              source={{ uri: firstItemImage }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="fast-food" size={24} color={palette.subText} />
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text
            style={[
              styles.businessName,
              { color: palette.text, fontSize: body },
            ]}
          >
            {order.business_name || 'Business Name'}
          </Text>

          <Text
            style={[
              styles.itemsText,
              { color: palette.subText, fontSize: bodySmall },
            ]}
            numberOfLines={2}
          >
            {order.items
              ?.map((item) => `${item.quantity}x ${item.product_name}`)
              .join(', ')}
          </Text>

          <Text
            style={[styles.priceText, { color: palette.text, fontSize: body }]}
          >
            ₱{(order.total_amount || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={[styles.trackButton, { backgroundColor: palette.divider }]}
          onPress={() => onPress(order.id)}
        >
          <Text
            style={[
              styles.trackButtonText,
              { color: palette.text, fontSize: bodySmall },
            ]}
          >
            {activeTab === 'active' ? 'Track Package' : 'View Details'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateText: {
    fontWeight: '500',
  },
  content: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  businessName: {
    fontWeight: '700',
    marginBottom: 4,
  },
  itemsText: {
    marginBottom: 8,
    lineHeight: 18,
  },
  priceText: {
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
  },
  trackButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackButtonText: {
    fontWeight: '600',
  },
});

export default OrderCard;
