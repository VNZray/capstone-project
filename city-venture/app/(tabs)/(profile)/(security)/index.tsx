import React, { useState } from 'react';
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

type SecurityRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  description?: string;
  onPress?: () => void;
  showArrow?: boolean;
  iconColor?: string;
  danger?: boolean;
};

const SecurityRow: React.FC<SecurityRowProps> = ({
  icon,
  label,
  value,
  description,
  onPress,
  showArrow = true,
  iconColor,
  danger = false,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const textColor = danger
    ? Colors.light.error
    : isDark
    ? '#ECEDEE'
    : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const borderColor = isDark ? '#262B3A' : '#E3E7EF';
  const bgColor = danger
    ? 'rgba(185, 28, 28, 0.08)'
    : isDark
    ? '#1a1f2e'
    : '#f3f4f6';

  return (
    <Pressable
      onPress={onPress}
      style={[styles.securityRow, { borderBottomColor: borderColor }]}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
          <Ionicons
            name={icon}
            size={20}
            color={
              iconColor || (danger ? Colors.light.error : Colors.light.primary)
            }
          />
        </View>
        <View style={styles.textContainer}>
          <ThemedText
            type="body-medium"
            weight="medium"
            style={{ color: textColor }}
          >
            {label}
          </ThemedText>
          {(value || description) && (
            <ThemedText
              type="label-small"
              style={{ color: subTextColor, marginTop: 2 }}
              numberOfLines={1}
            >
              {value || description}
            </ThemedText>
          )}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={subTextColor} />
      )}
    </Pressable>
  );
};

const AccountSecurity = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, logout } = useAuth();

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
  const handleEmailChangeSuccess = () => {
    Alert.alert(
      'Email Changed',
      'Your email has been updated. Please log in again with your new email.',
      [{ text: 'OK', onPress: () => logout?.() }]
    );
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
        {/* Email Section */}
        <Container
          style={[styles.section, { backgroundColor: cardBg }]}
          elevation={1}
          gap={0}
          padding={0}
        >
          <View style={styles.sectionHeader}>
            <ThemedText
              type="card-title-medium"
              weight="semi-bold"
              style={{ color: textColor }}
            >
              Login Credentials
            </ThemedText>
          </View>

          <SecurityRow
            icon="mail-outline"
            label="Email Address"
            value={maskEmail(user?.email)}
            onPress={() => setShowChangeEmail(true)}
          />
          <SecurityRow
            icon="lock-closed-outline"
            label="Password"
            value="••••••••"
            description="Last changed: Unknown"
            onPress={() => setShowChangePassword(true)}
          />
        </Container>

        {/* Security Status */}
        <Container
          style={[styles.section, { backgroundColor: cardBg }]}
          elevation={1}
          gap={0}
          padding={0}
        >
          <View style={styles.sectionHeader}>
            <ThemedText
              type="card-title-medium"
              weight="semi-bold"
              style={{ color: textColor }}
            >
              Account Status
            </ThemedText>
          </View>

          <SecurityRow
            icon={user?.is_verified ? 'checkmark-circle' : 'alert-circle'}
            label="Email Verification"
            value={user?.is_verified ? 'Verified' : 'Not Verified'}
            iconColor={
              user?.is_verified ? Colors.light.success : Colors.light.warning
            }
            showArrow={!user?.is_verified}
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
          <SecurityRow
            icon={user?.is_active ? 'shield-checkmark' : 'shield'}
            label="Account Status"
            value={user?.is_active ? 'Active' : 'Inactive'}
            iconColor={
              user?.is_active ? Colors.light.success : Colors.light.error
            }
            showArrow={false}
          />
          <SecurityRow
            icon="time-outline"
            label="Last Login"
            value={
              user?.last_login
                ? new Date(user.last_login).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : 'Unknown'
            }
            showArrow={false}
          />
        </Container>

        {/* Danger Zone */}
        <Container
          style={[styles.section, { backgroundColor: cardBg }]}
          elevation={1}
          gap={0}
          padding={0}
        >
          <View style={styles.sectionHeader}>
            <ThemedText
              type="card-title-medium"
              weight="semi-bold"
              style={{ color: Colors.light.error }}
            >
              Danger Zone
            </ThemedText>
          </View>

          <SecurityRow
            icon="trash-outline"
            label="Delete Account"
            description="Permanently delete your account and all data"
            onPress={handleDeleteAccount}
            danger
          />
        </Container>

        {/* Info Note */}
        <View style={styles.infoNote}>
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
        </View>
      </ScrollView>

      {/* Change Email Component */}
      <ChangeEmail
        visible={showChangeEmail}
        onClose={() => setShowChangeEmail(false)}
        currentEmail={user?.email}
        userId={user?.id || user?.user_id}
        onSuccess={handleEmailChangeSuccess}
      />

      {/* Change Password Component */}
      <ChangePassword
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        userEmail={user?.email}
        userId={user?.id || user?.user_id}
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
    marginHorizontal: 16,
    marginTop: 24,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
});
