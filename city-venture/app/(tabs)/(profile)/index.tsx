import Button from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { colors, Colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Profile = () => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

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
            onPress={() => router.replace('/(tabs)/(home)')}
          />
        </View>
      </View>
    );
  }

  const onEdit = () => router.push('/(tabs)/(profile)/(edit)');
  const onSettings = () => router.push('/(tabs)/(profile)/(settings)');
  const onBookings = () => router.push('/(tabs)/(profile)/(bookings)');
  const onReports = () => router.push('/(tabs)/(profile)/(reports)');

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Gradient */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#EAF4FF', '#F8F9FC']}
            style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}
          >
            <View style={styles.headerTop}>
              <ThemedText type="title-small" weight="bold">
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
                  style={{ fontSize: 24 }}
                >
                  {fullName}
                </ThemedText>
                <ThemedText type="body-small" style={{ color: textSecondary }}>
                  @{handle}
                </ThemedText>
              </View>
            </View>

            {/* Minimal Stats */}
            <View style={styles.statsRow}>
              <StatItem label="Trips" value="12" />
              <View style={[styles.statDivider, { backgroundColor: border }]} />
              <StatItem label="Reviews" value="15" />
              <View style={[styles.statDivider, { backgroundColor: border }]} />
              <StatItem label="Points" value="2.4k" />
            </View>
          </LinearGradient>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          <ThemedText
            type="label-small"
            weight="bold"
            style={{
              color: textSecondary,
              marginLeft: 20,
              marginBottom: 8,
              marginTop: 24,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            My Account
          </ThemedText>
          <View style={[styles.menuGroup, { backgroundColor: card }]}>
            <MenuItem
              icon="receipt-outline"
              iconColor="#F59E0B"
              iconBg="#FFFBEB"
              label="My Orders"
              onPress={() => router.push('/(tabs)/(profile)/orders' as any)}
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
              icon="heart-outline"
              iconColor="#EF4444"
              iconBg="#FEF2F2"
              label="Favorites"
              onPress={() => {}}
              border={border}
            />
            <MenuItem
              icon="person-outline"
              iconColor="#8B5CF6"
              iconBg="#F3E8FF"
              label="Edit Profile"
              onPress={onEdit}
              last
            />
          </View>

          <ThemedText
            type="label-small"
            weight="bold"
            style={{
              color: textSecondary,
              marginLeft: 20,
              marginBottom: 8,
              marginTop: 24,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Support & Other
          </ThemedText>
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
              iconColor="#10B981"
              iconBg="#ECFDF5"
              label="Report a Problem"
              onPress={onReports}
              border={border}
            />
            <MenuItem
              icon="log-out-outline"
              iconColor="#6B7280"
              iconBg="#F3F4F6"
              label="Log Out"
              onPress={async () => {
                logout();
                router.replace('/');
              }}
              color={colors.error}
              last
            />
          </View>

          <ThemedText
            type="label-small"
            weight="bold"
            style={{
              color: textSecondary,
              marginLeft: 20,
              marginBottom: 8,
              marginTop: 24,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Legal
          </ThemedText>
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
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;

// --- Components ---

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <View style={{ alignItems: 'center', flex: 1 }}>
    <ThemedText type="title-small" weight="bold">
      {value}
    </ThemedText>
    <ThemedText
      type="label-small"
      style={{ color: Colors.light.textSecondary }}
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
      <ThemedText
        type="body-medium"
        weight="medium"
        style={{ flex: 1, color: textColor }}
      >
        {label}
      </ThemedText>
      <Ionicons name="chevron-forward" size={18} color={'#CBD5E0'} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerContainer: {
    marginBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
    gap: 16,
    marginBottom: 32,
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
    width: 100,
    height: 100,
    borderRadius: 50,
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
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  menuContainer: {
    paddingHorizontal: 20,
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
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 16,
  },
});
