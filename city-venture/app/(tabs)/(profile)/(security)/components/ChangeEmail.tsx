import Button from '@/components/Button';
import Container from '@/components/Container';
import FormTextInput from '@/components/TextInput';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import apiClient from '@/services/apiClient';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, login } = useAuth();

  const bg = Colors.light.background;
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const handleColor = isDark ? '#4B5563' : '#D1D5DB';

  const [step, setStep] = useState<ChangeEmailStep>('password');
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Snap points for bottom sheet
  const snapPoints = useMemo(() => ['100%'], []);

  // Present/dismiss bottom sheet based on visible prop
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  // Handle sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    []
  );

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
      setStep('otp');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to send verification code.';
      setError(message);
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
      setStep('success');

      // Wait 2 seconds before closing and triggering success callback
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 2000);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Invalid verification code.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);

    try {
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
          <>
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
          </>
        );

      case 'email':
        return (
          <>
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
          </>
        );

      case 'otp':
        return (
          <>
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
          </>
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
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableDynamicSizing={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={[styles.sheetBackground, { backgroundColor: bg }]}
      handleIndicatorStyle={[
        styles.handleIndicator,
        { backgroundColor: handleColor },
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.modalHeader}>
        <ThemedText
          type="card-title-medium"
          weight="semi-bold"
          style={{ color: textColor }}
        >
          Change Email
        </ThemedText>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={styles.modalContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default ChangeEmail;

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  cancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modalContent: {
    padding: 20,
    flexGrow: 1,
  },
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
