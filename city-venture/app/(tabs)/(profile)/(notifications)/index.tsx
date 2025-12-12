import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import PageContainer from '@/components/PageContainer';
import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks';
import Container from '@/components/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import MenuItem from '@/components/ui/MenuItem';
import { useNotifications } from '@/context/NotificationContext';
import type { NotificationPreferences } from '@/services/NotificationPreferencesService';

const NotificationSettings = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const {
    preferences,
    loadingPreferences: loading,
    updatePreferences,
    refreshNotifications,
  } = useNotifications();

  const bg = Colors.light.background;
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const borderColor = isDark ? '#262B3A' : '#E3E7EF';

  // Reload preferences when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('[NotificationSettings] Screen focused, reloading data');
      refreshNotifications();
    }, [refreshNotifications])
  );

  const handleToggle = async (key: keyof NotificationPreferences) => {
    if (!preferences) return;

    const currentValue = preferences[key];
    const newValue = !currentValue;

    console.log(
      `[NotificationSettings] Toggling ${key} from ${currentValue} to ${newValue}`
    );

    try {
      await updatePreferences({ [key]: newValue });
      console.log('[NotificationSettings] Update successful');
    } catch (error) {
      console.error(
        '[NotificationSettings] Failed to update preferences:',
        error
      );
      Alert.alert(
        'Error',
        'Failed to update notification settings. Please try again.'
      );
    }
  };

  if (loading || !preferences) {
    return (
      <PageContainer style={{ backgroundColor: bg }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer style={{ backgroundColor: bg }} padding={0}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Container gap={8} backgroundColor="transparent">
          {/* Push Notifications */}
          <SectionHeader title="Push Notifications" />

          <Container
            style={[styles.section, { backgroundColor: cardBg }]}
            elevation={1}
            gap={0}
            padding={0}
          >
            <MenuItem
              icon="notifications-outline"
              iconColor="#6366F1"
              iconBg="#EEF2FF"
              label="Enable Push Notifications"
              border={borderColor}
              switch
              activated={preferences.push_enabled}
              onSwitchChange={() => handleToggle('push_enabled')}
            />

            {preferences.push_enabled && (
              <>
                <MenuItem
                  icon="bed-outline"
                  iconColor="#10B981"
                  iconBg="#D1FAE5"
                  label="Booking Notifications"
                  subLabel="Check-ins, confirmations, reminders"
                  border={borderColor}
                  switch
                  activated={preferences.push_bookings}
                  onSwitchChange={() => handleToggle('push_bookings')}
                />

                <MenuItem
                  icon="cart-outline"
                  iconColor="#F59E0B"
                  iconBg="#FEF3C7"
                  label="Order Notifications"
                  subLabel="Order status, pickups, deliveries"
                  border={borderColor}
                  switch
                  activated={preferences.push_orders}
                  onSwitchChange={() => handleToggle('push_orders')}
                />

                <MenuItem
                  icon="card-outline"
                  iconColor="#EF4444"
                  iconBg="#FEE2E2"
                  label="Payment Notifications"
                  subLabel="Payments, refunds, confirmations"
                  border={borderColor}
                  switch
                  activated={preferences.push_payments}
                  onSwitchChange={() => handleToggle('push_payments')}
                />

                <MenuItem
                  icon="megaphone-outline"
                  iconColor="#8B5CF6"
                  iconBg="#EDE9FE"
                  label="Promotions & Offers"
                  subLabel="Special deals and discounts"
                  border={borderColor}
                  switch
                  activated={preferences.push_promotions}
                  onSwitchChange={() => handleToggle('push_promotions')}
                />
              </>
            )}
          </Container>

          {/* Email Notifications (Future) */}
          <SectionHeader title="Email Notifications" />

          <Container
            style={[styles.section, { backgroundColor: cardBg }]}
            elevation={1}
            gap={0}
            padding={0}
          >
            <MenuItem
              icon="mail-outline"
              iconColor="#3B82F6"
              iconBg="#DBEAFE"
              label="Enable Email Notifications"
              subLabel="Coming soon"
              border={borderColor}
              switch
              activated={false}
              onSwitchChange={() => {}}
            />
          </Container>

          {/* SMS Notifications (Future) */}
          <SectionHeader title="SMS Notifications" />

          <Container
            style={[styles.section, { backgroundColor: cardBg }]}
            elevation={1}
            gap={0}
            padding={0}
          >
            <MenuItem
              icon="chatbubble-outline"
              iconColor="#14B8A6"
              iconBg="#CCFBF1"
              label="Enable SMS Notifications"
              subLabel="Coming soon"
              border={borderColor}
              switch
              activated={false}
              onSwitchChange={() => {}}
            />
          </Container>

          <View style={{ height: 20 }} />
        </Container>
      </ScrollView>
    </PageContainer>
  );
};

export default NotificationSettings;

const styles = StyleSheet.create({
  section: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
});
