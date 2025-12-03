import Button from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { colors, Colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePreventDoubleNavigation } from '@/hooks/usePreventDoubleNavigation';
import { Routes } from '@/routes/mainRoutes';

const Profile = () => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { push, replace, isNavigating } = usePreventDoubleNavigation();

  // Colors (Light Mode Only)
  const bg = Colors.light.background;
  const card = Colors.light.surface;
  const textPrimary = Colors.light.text;
  const textSecondary = Colors.light.textSecondary;
  const border = Colors.light.border;

  const fullName = `${user?.first_name ?? 'Traveler'} ${
    user?.last_name ?? ''
  }`.trim();

  const handle = useMemo(
    () => (user?.email ? user.email.split('@')[0] : 'wanderer'),
    [user?.email]
  );

  if (!user) {
    return (
      <View
        style={[
          styles.screen,
          {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: bg,
          },
        ]}
      >
        <ThemedText type="sub-title-medium" weight="bold">
          You&apos;re not signed in
        </ThemedText>
        <ThemedText
          type="label-medium"
          style={{ color: textSecondary, marginTop: 6 }}
        >
          Please sign in to view your profile.
        </ThemedText>
        <View style={{ marginTop: 24, width: '60%' }}>
          <Button
            label="Go to Home"
            variant="solid"
            color="primary"
            size="large"
            fullWidth
            radius={16}
            onPress={() => replace(Routes.tabs.home)}
          />
        </View>
      </View>
    );
  }

  const onEdit = () => push(Routes.profile.edit);
  const onSettings = () => push('/(tabs)/(profile)/(settings)');
  const onBookings = () => push('/(tabs)/(profile)/(bookings)');
  const onReports = () => push(Routes.profile.reports.index);

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Gradient */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[Colors.light.primary, '#142860']}
            style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}
          >
            <View style={styles.headerTop}>
              <ThemedText
                type="title-small"
                weight="bold"
                style={{ color: 'white' }}
              >
                Profile
              </ThemedText>
              <Pressable
                onPress={onSettings}
                style={({ pressed }) => [
                  styles.iconBtn,
                  {
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: '#FFFFFF',
                  },
                ]}
              >
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={textPrimary}
                />
              </Pressable>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <Image
                  source={
                    user.user_profile
                      ? { uri: user.user_profile }
                      : require('@/assets/images/react-logo.png')
                  }
                  style={styles.avatar}
                  resizeMode="cover"
                />
                <Pressable style={styles.editBadge} onPress={onEdit}>
                  <FontAwesome5 name="pen" size={10} color="#fff" />
                </Pressable>
              </View>

              <View style={{ gap: 4, alignItems: 'center' }}>
                <ThemedText
                  type="title-medium"
                  weight="bold"
                  style={{ fontSize: 24, color: 'white' }}
                >
                  {fullName}
                </ThemedText>
                <ThemedText
                  type="body-small"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  @{handle}
                </ThemedText>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          <SectionHeader title="My Account" />
          <View style={[styles.menuGroup, { backgroundColor: card }]}>
            <MenuItem
              icon="receipt-outline"
              iconColor="#F59E0B"
              iconBg="#FFFBEB"
              label="My Orders"
              onPress={() => push(Routes.profile.orders.index)}
              border={border}
            />
            <MenuItem
              icon="calendar-outline"
              iconColor="#3B82F6"
              iconBg="#EBF8FF"
              label="My Bookings"
              onPress={onBookings}
              border={border}
            />
            <MenuItem
              icon="wallet-outline"
              iconColor="#10B981"
              iconBg="#ECFDF5"
              label="Payment Methods"
              onPress={() => {}}
              border={border}
            />
            <MenuItem
              icon="notifications-outline"
              iconColor="#8B5CF6"
              iconBg="#F3E8FF"
              label="Notification Preferences"
              onPress={() => {}}
              border={border}
            />
            <MenuItem
              icon="heart-outline"
              iconColor="#EF4444"
              iconBg="#FEF2F2"
              label="Favorites"
              onPress={() => {}}
              border={border}
            />
            <MenuItem
              icon="person-outline"
              iconColor="#6366F1"
              iconBg="#EEF2FF"
              label="Edit Profile"
              onPress={onEdit}
              last
            />
          </View>

          <SectionHeader title="Support & Other" />
          <View style={[styles.menuGroup, { backgroundColor: card }]}>
            <MenuItem
              icon="star-outline"
              iconColor="#F59E0B"
              iconBg="#FFFBEB"
              label="Rate The App"
              onPress={() => {}}
              border={border}
            />
            <MenuItem
              icon="flag-outline"
              iconColor="#EF4444"
              iconBg="#FEF2F2"
              label="Report a Problem"
              onPress={onReports}
              last
            />
          </View>

          <SectionHeader title="Legal" />
          <View style={[styles.menuGroup, { backgroundColor: card }]}>
            <MenuItem
              icon="document-text-outline"
              iconColor="#6366F1"
              iconBg="#EEF2FF"
              label="Terms and Conditions"
              onPress={() => {}}
              border={border}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              iconColor="#14B8A6"
              iconBg="#F0FDFA"
              label="Privacy Policy"
              onPress={() => {}}
              last
            />
          </View>

          <View style={{ marginTop: 32, marginBottom: 40 }}>
            <Button
              label="Log Out"
              onPress={async () => {
                logout();
                replace(Routes.root);
              }}
              variant="outlined"
              color="error"
              size="large"
              fullWidth
              radius={16}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;

// --- Components ---

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIndicator} />
    <ThemedText type="label-small" weight="bold" style={styles.sectionTitle}>
      {title}
    </ThemedText>
  </View>
);

const StatItem = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <View style={{ alignItems: 'center', flex: 1 }}>
    <ThemedText type="title-small" weight="bold" style={{ color }}>
      {value}
    </ThemedText>
    <ThemedText
      type="label-small"
      style={{
        color: color ? 'rgba(255,255,255,0.7)' : Colors.light.textSecondary,
      }}
    >
      {label}
    </ThemedText>
  </View>
);

const MenuItem = ({
  icon,
  label,
  onPress,
  last,
  color,
  border,
  iconColor,
  iconBg,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  last?: boolean;
  color?: string;
  border?: string;
  iconColor?: string;
  iconBg?: string;
}) => {
  const textColor = color || Colors.light.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        {
          backgroundColor: pressed ? '#F7FAFC' : 'transparent',
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: border || '#EDF2F7',
        },
      ]}
    >
      <View
        style={[styles.menuIconBox, { backgroundColor: iconBg || '#F3F4F6' }]}
      >
        <Ionicons name={icon} size={20} color={iconColor || '#718096'} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText
          type="body-medium"
          weight="medium"
          style={{ color: textColor }}
        >
          {label}
        </ThemedText>
      </View>
      <FontAwesome5 name="chevron-right" size={14} color="#C5A059" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerContainer: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileInfo: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  menuContainer: {
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 32,
    backgroundColor: Colors.light.background,
  },
  menuGroup: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  chevronContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionIndicator: {
    width: 4,
    height: 18,
    backgroundColor: Colors.light.accent,
    marginRight: 10,
    borderRadius: 2,
  },
  sectionTitle: {
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
