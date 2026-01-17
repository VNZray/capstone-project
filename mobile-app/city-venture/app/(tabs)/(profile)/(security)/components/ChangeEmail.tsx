import Button from '@/components/Button';
import Container from '@/components/Container';
import FormTextInput from '@/components/TextInput';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { generateOTP } from '@/services/emailService';
import {
  storeUserOtp,
  clearUserOtp,
  updateUserEmail,
  getUserById,
} from '@/services/UserService';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '@/components/ui/BottomSheetModal';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type ChangeEmailStep = 'password' | 'email' | 'otp' | 'success';

interface ChangeEmailProps {
  visible: boolean;
  onClose: () => void;
  currentEmail?: string;
  userId?: string;
  onSuccess?: () => void;
}

const ChangeEmail: React.FC<ChangeEmailProps> = ({
  visible,
  onClose,
  currentEmail,
  userId,
  onSuccess,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, login } = useAuth();

  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';

  const [step, setStep] = useState<ChangeEmailStep>('password');
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setStep('password');
    setPassword('');
    setNewEmail('');
    setOtp('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  // Step 1: Verify password
  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await login(user?.email || '', password);
      setStep('email');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Incorrect password. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Check if email exists and send OTP
  const handleSendOtp = async () => {
    if (!newEmail.trim()) {
      setError('Please enter a new email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (newEmail.toLowerCase() === currentEmail?.toLowerCase()) {
      setError('New email cannot be the same as your current email.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Generate OTP
      const otpCode = generateOTP();
      console.log('🔐 Generated OTP for email change:', otpCode);

      // Store OTP in user database
      if (userId) {
        await storeUserOtp(userId, parseInt(otpCode));
        console.log('✅ OTP stored in database for user:', userId);
      }

      // Send OTP email (currently disabled but structure ready)
      // await sendOTP(newEmail, 'Email Change', 10);

      setStep('otp');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to send verification code.';
      setError(message);
      console.error('❌ Error sending OTP:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Verify OTP and change email
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Fetch user data to compare OTP
      if (!userId) {
        throw new Error('User ID is required');
      }

      const userData = await getUserById(userId);
      console.log('🔍 Comparing OTPs - Input:', otp, 'Stored:', userData.otp);

      // Verify OTP matches
      if (userData.otp?.toString() !== otp) {
        setError('Invalid verification code. Please try again.');
        setIsLoading(false);
        return;
      }

      console.log('✅ OTP verified successfully');

      // Update email and clear OTP
      await updateUserEmail(userId, newEmail, parseInt(otp));
      await clearUserOtp(userId);

      console.log('✅ Email updated successfully to:', newEmail);
      login(newEmail, password);
      setStep('success');

      // Wait 2 seconds before closing and triggering success callback
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 2000);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Invalid verification code.';
      setError(message);
      console.error('❌ Error verifying OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Generate new OTP
      const otpCode = generateOTP();
      console.log('🔐 Resent OTP for email change:', otpCode);

      // Store new OTP in user database
      if (userId) {
        await storeUserOtp(userId, parseInt(otpCode));
        console.log('✅ New OTP stored in database');
      }

      // Send OTP email (currently disabled but structure ready)
      // await sendOTP(newEmail, 'Email Change', 10);
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'password':
        return (
          <Container backgroundColor="transparent">
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepActive]} />
              <View style={styles.stepLine} />
              <View style={styles.stepDot} />
              <View style={styles.stepLine} />
              <View style={styles.stepDot} />
            </View>

            <ThemedText
              type="body-medium"
              style={{
                color: subTextColor,
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              For security, please enter your current password to continue.
            </ThemedText>

            <FormTextInput
              label="Current Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              secureTextEntry
              variant="outlined"
              errorText={error}
            />

            <View style={{ height: 24 }} />

            <Button
              label={isLoading ? 'Verifying...' : 'Continue'}
              onPress={handleVerifyPassword}
              disabled={isLoading}
              variant="solid"
              color="primary"
              size="large"
            />
          </Container>
        );

      case 'email':
        return (
          <Container backgroundColor="transparent">
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepCompleted]}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
              <View style={[styles.stepLine, styles.stepLineCompleted]} />
              <View style={[styles.stepDot, styles.stepActive]} />
              <View style={styles.stepLine} />
              <View style={styles.stepDot} />
            </View>

            <ThemedText
              type="body-medium"
              style={{
                color: subTextColor,
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              Enter your new email address. We&apos;ll send a verification code
              to confirm.
            </ThemedText>

            <Container padding={0} backgroundColor="transparent">
              <FormTextInput
                label="Current Email"
                value={currentEmail || ''}
                editable={false}
                variant="outlined"
              />

              <FormTextInput
                label="New Email Address"
                placeholder="Enter new email"
                value={newEmail}
                onChangeText={(text) => {
                  setNewEmail(text);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                variant="outlined"
                errorText={error}
              />
            </Container>

            <View style={{ height: 24 }} />

            <Button
              label={isLoading ? 'Sending...' : 'Send Verification Code'}
              onPress={handleSendOtp}
              disabled={isLoading}
              variant="solid"
              color="primary"
              size="large"
            />

            <Pressable
              onPress={() => setStep('password')}
              style={styles.backButton}
            >
              <ThemedText type="body-medium" style={{ color: subTextColor }}>
                Back
              </ThemedText>
            </Pressable>
          </Container>
        );

      case 'otp':
        return (
          <Container backgroundColor="transparent">
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepCompleted]}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
              <View style={[styles.stepLine, styles.stepLineCompleted]} />
              <View style={[styles.stepDot, styles.stepCompleted]}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
              <View style={[styles.stepLine, styles.stepLineCompleted]} />
              <View style={[styles.stepDot, styles.stepActive]} />
            </View>

            <View style={styles.otpIcon}>
              <Ionicons
                name="mail-unread"
                size={48}
                color={Colors.light.primary}
              />
            </View>

            <ThemedText
              type="body-medium"
              style={{
                color: subTextColor,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              We&apos;ve sent a 6-digit verification code to
            </ThemedText>
            <Container padding={0} backgroundColor="transparent">
              <ThemedText
                type="body-medium"
                weight="semi-bold"
                style={{
                  color: textColor,
                  marginBottom: 24,
                  textAlign: 'center',
                }}
              >
                {newEmail}
              </ThemedText>

              <FormTextInput
                label="Verification Code"
                placeholder="Enter 6-digit code"
                value={otp}
                onChangeText={(text) => {
                  setOtp(text.replace(/[^0-9]/g, '').slice(0, 6));
                  setError('');
                }}
                keyboardType="number-pad"
                maxLength={6}
                variant="outlined"
                errorText={error}
              />
            </Container>
            <View style={{ height: 24 }} />

            <Button
              label={isLoading ? 'Verifying...' : 'Verify & Change Email'}
              onPress={handleVerifyOtp}
              disabled={isLoading}
              variant="solid"
              color="primary"
              size="large"
            />

            <Pressable onPress={handleResendOtp} style={styles.resendButton}>
              <ThemedText
                type="body-medium"
                style={{ color: Colors.light.primary }}
              >
                Resend Code
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setStep('email')}
              style={styles.backButton}
            >
              <ThemedText type="body-medium" style={{ color: subTextColor }}>
                Back
              </ThemedText>
            </Pressable>
          </Container>
        );

      case 'success':
        return (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons
                name="checkmark-circle"
                size={64}
                color={Colors.light.success}
              />
            </View>
            <ThemedText
              type="card-title-medium"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8, textAlign: 'center' }}
            >
              Email Changed Successfully!
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={{ color: subTextColor, textAlign: 'center' }}
            >
              Your email has been updated to {newEmail}
            </ThemedText>
          </View>
        );
    }
  };

  return (
    <BottomSheetModal
      isOpen={visible}
      onClose={handleClose}
      headerTitle="Change Email"
      snapPoints={['100%']}
      content={renderStepContent()}
    />
  );
};

export default ChangeEmail;

const styles = StyleSheet.create({
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: Colors.light.primary,
    borderWidth: 3,
    borderColor: 'rgba(10, 27, 71, 0.2)',
  },
  stepCompleted: {
    backgroundColor: Colors.light.success,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  stepLineCompleted: {
    backgroundColor: Colors.light.success,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  otpIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
});
