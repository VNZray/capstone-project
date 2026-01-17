import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageContainer from '@/components/PageContainer';
import Container from '@/components/Container';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import ChangeEmail from './components/ChangeEmail';
import ChangePassword from './components/ChangesPassword';
import SectionHeader from '@/components/ui/SectionHeader';
import MenuItem from '@/components/ui/MenuItem';

const AccountSecurity = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, logout, login } = useAuth();

  const bg = Colors.light.background;
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';

  // Modal states
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Mask email for display
  const maskEmail = (email?: string) => {
    if (!email) return 'Not set';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal =
      local.length > 3
        ? local.substring(0, 3) + '***'
        : local.substring(0, 1) + '***';
    return `${maskedLocal}@${domain}`;
  };

  // Handle successful email change
  const handleEmailChangeSuccess = async () => {
    try {
      // Refresh user data from server

      Alert.alert(
        'Email Changed',
        'Your email has been updated successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      Alert.alert(
        'Email Changed',
        'Your email has been updated. Please log in again with your new email.',
        [{ text: 'OK', onPress: () => logout?.() }]
      );
    }
  };

  // Handle successful password change
  const handlePasswordChangeSuccess = () => {
    Alert.alert(
      'Password Changed',
      'Your password has been updated. For security, please log in again.',
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Log Out',
          onPress: () => logout?.(),
        },
      ]
    );
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Please type "DELETE" to confirm account deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'I Understand',
                  style: 'destructive',
                  onPress: async () => {
                    // TODO: Implement API call
                    Alert.alert(
                      'Account Deletion Requested',
                      'Your account deletion request has been submitted. You will receive an email confirmation.'
                    );
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <PageContainer style={{ backgroundColor: bg }} padding={0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container gap={8} backgroundColor="transparent">
          <SectionHeader title="Login Credentials" />

          <Container
            style={[styles.section, { backgroundColor: cardBg }]}
            elevation={1}
            gap={0}
            padding={0}
          >
            <MenuItem
              icon="mail-outline"
              label="Email Address"
              subLabel={maskEmail(user?.email)}
              onPress={() => setShowChangeEmail(true)}
            />
            <MenuItem
              icon="lock-closed-outline"
              label="Password"
              subLabel="••••••••"
              onPress={() => setShowChangePassword(true)}
            />
          </Container>

          <SectionHeader title="Account Status" />

          <Container
            style={[styles.section, { backgroundColor: cardBg }]}
            elevation={1}
            gap={0}
            padding={0}
          >
            <MenuItem
              icon={user?.is_verified ? 'checkmark-circle' : 'alert-circle'}
              iconColor={
                user?.is_verified ? Colors.light.success : Colors.light.warning
              }
              label="Email Verification"
              subLabel={user?.is_verified ? 'Verified' : 'Not Verified'}
              onPress={
                user?.is_verified
                  ? undefined
                  : () =>
                      Alert.alert(
                        'Verify Email',
                        'A verification email will be sent to your email address.'
                      )
              }
            />
            <MenuItem
              icon={user?.is_active ? 'shield-checkmark' : 'shield'}
              label="Account Status"
              subLabel={user?.is_active ? 'Active' : 'Inactive'}
              iconColor={
                user?.is_active ? Colors.light.success : Colors.light.error
              }
            />
          </Container>

          <SectionHeader title="Danger Zone" />

          <Container
            style={[styles.section, { backgroundColor: cardBg }]}
            elevation={1}
            gap={0}
            padding={0}
          >
            <MenuItem
              icon="trash-outline"
              label="Delete Account"
              onPress={handleDeleteAccount}
              subLabel="Permanently delete your account and all data"
              iconColor={Colors.light.error}
            />
          </Container>

          {/* Info Note */}
          <Container style={styles.infoNote}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={subTextColor}
            />
            <ThemedText
              type="label-small"
              style={{ color: subTextColor, marginLeft: 8, flex: 1 }}
            >
              For security reasons, changing your email or password may require
              you to log in again.
            </ThemedText>
          </Container>
        </Container>
      </ScrollView>

      {/* Change Email Component */}
      <ChangeEmail
        visible={showChangeEmail}
        onClose={() => setShowChangeEmail(false)}
        currentEmail={user?.email}
        userId={user?.user_id}
        onSuccess={handleEmailChangeSuccess}
      />

      {/* Change Password Component */}
      <ChangePassword
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        userEmail={user?.email}
        userId={user?.user_id}
        onSuccess={handlePasswordChangeSuccess}
      />
    </PageContainer>
  );
};

export default AccountSecurity;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
    gap: 16,
  },
  section: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 24,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
});
