import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNotifications } from '@/context/NotificationContext';
import { Colors } from '@/constants/color';

interface NotificationBadgeProps {
  size?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * NotificationBadge - Shows unread notification count
 *
 * Usage in tab icon:
 * ```tsx
 * import NotificationBadge from '@/components/notification/NotificationBadge';
 *
 * <View>
 *   <Ionicons name="notifications-outline" size={24} />
 *   <NotificationBadge />
 * </View>
 * ```
 */
export default function NotificationBadge({
  size = 18,
  position = 'top-right',
}: NotificationBadgeProps) {
  const { unreadCount } = useNotifications();

  if (unreadCount === 0) {
    return null;
  }

  const positionStyles = {
    'top-right': { top: -4, right: -8 },
    'top-left': { top: -4, left: -8 },
    'bottom-right': { bottom: -4, right: -8 },
    'bottom-left': { bottom: -4, left: -8 },
  };

  const displayCount = unreadCount > 99 ? '99+' : unreadCount.toString();

  return (
    <View
      style={[
        styles.badge,
        {
          minWidth: size,
          height: size,
          borderRadius: size / 2,
          ...positionStyles[position],
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            fontSize: size * 0.6,
          },
        ]}
      >
        {displayCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
});
