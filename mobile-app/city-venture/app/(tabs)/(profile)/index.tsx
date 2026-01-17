import Button from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { colors, Colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import LoginPromptModal from '@/components/LoginPromptModal';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePreventDoubleNavigation } from '@/hooks/usePreventDoubleNavigation';
import { Routes } from '@/routes/mainRoutes';
import MenuItem from '@/components/ui/MenuItem';
import SectionHeader from '@/components/ui/SectionHeader';

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const { push, replace, isNavigating } = usePreventDoubleNavigation();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

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

  // Guest mode: Show login prompt
  if (!isAuthenticated) {
    return (
      <View
        style={[
          styles.screen,
          {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: bg,
            paddingHorizontal: 32,
          },
        ]}
      >
        <ThemedText
          type="title-large"
          weight="bold"
          style={{ marginBottom: 12 }}
        >
          Your Profile Awaits
        </ThemedText>
        <ThemedText
          type="body-medium"
          style={{
            color: textSecondary,
            marginBottom: 32,
            textAlign: 'center',
            lineHeight: 22,
          }}
        >
          Sign in to access your bookings, orders, and personalized travel
          experience.
        </ThemedText>
        <View style={{ width: '100%', maxWidth: 300 }}>
          <Button
            label="Log In"
            variant="solid"
            color="primary"
            size="large"
            radius={12}
            onPress={() => setShowLoginPrompt(true)}
          />
        </View>

        <LoginPromptModal
          visible={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          actionName="access your profile"
          title="Login to View Profile"
          message="Sign in to manage your bookings, orders, and account settings."
        />
      </View>
    );
  }

  const onAccount = () => push(Routes.profile.account);
  const onSettings = () => push(Routes.profile.settings);
  const onBookings = () => push(Routes.profile.bookings.index);
  const onEvents = () => push(Routes.profile.events.index);
  const onReports = () => push(Routes.profile.reports.index);
  const onReviews = () => push(Routes.profile.reviews);
  const onSecurity = () => push(Routes.profile.security);
  const onRateApp = () => push(Routes.profile.rateApp);

  const onNotifications = () => push(Routes.profile.notifications);
  const onTransactions = () => push(Routes.profile.transactions);

  const onTerms = () => push(Routes.profile.terms);
  const onPrivacy = () => push(Routes.profile.privacy);

  return (
    <View style={[styles.screen, { backgroundColor: Colors.light.primary }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Gradient */}
        <View
          style={[
            styles.headerContainer,
            { backgroundColor: Colors.light.primary },
          ]}
        >
          <LinearGradient
            colors={[Colors.light.primary, '#142860']}
            style={[styles.headerGradient]}
          >
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <Image
                  source={
                    user?.user_profile
                      ? { uri: user.user_profile }
                      : require('@/assets/images/react-logo.png')
                  }
                  style={styles.avatar}
                  resizeMode="cover"
                />
                <Pressable style={styles.editBadge} onPress={onAccount}>
                  <FontAwesome5 name="camera" size={10} color="#fff" />
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
              icon="megaphone-outline"
              iconColor="#EC4899"
              iconBg="#FCE7F3"
              label="Events"
              onPress={onEvents}
              border={border}
            />

            <MenuItem
              icon="notifications-outline"
              iconColor="#8B5CF6"
              iconBg="#F3E8FF"
              label="Notification Settings"
              onPress={onNotifications}
              border={border}
            />

            <MenuItem
              icon="notifications-outline"
              iconColor={Colors.light.warning}
              iconBg="#FEF3C7"
              label="Transaction History"
              onPress={onTransactions}
              border={border}
            />

            <MenuItem
              icon="chatbubble-ellipses-outline"
              iconColor="#EC4899"
              iconBg="#FCE7F3"
              label="My Reviews"
              onPress={onReviews}
              border={border}
            />

            <MenuItem
              icon="person-outline"
              iconColor="#6366F1"
              iconBg="#EEF2FF"
              label="Personnal Information"
              onPress={onAccount}
              last
            />
            <MenuItem
              icon="shield-outline"
              iconColor="#10B981"
              iconBg="#ECFDF5"
              label="Account Security"
              onPress={onSecurity}
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
              onPress={onRateApp}
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
              onPress={onTerms}
              border={border}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              iconColor="#14B8A6"
              iconBg="#F0FDFA"
              label="Privacy Policy"
              onPress={onPrivacy}
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
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
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
});
