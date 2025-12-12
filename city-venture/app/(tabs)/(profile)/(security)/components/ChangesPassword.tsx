import Button from '@/components/Button';
import FormTextInput from '@/components/TextInput';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { generateOTP } from '@/services/emailService';
import {
  storeUserOtp,
  clearUserOtp,
  updateUserPassword,
  getUserById,
} from '@/services/UserService';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '@/components/ui/BottomSheetModal';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Container from '@/components/Container';

type ChangePasswordStep =
  | 'send-otp'
  | 'verify-otp'
  | 'new-password'
  | 'success';

interface ChangePasswordProps {
  visible: boolean;
  onClose: () => void;
  userEmail?: string;
  userId?: string;
  onSuccess?: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({
  visible,
  onClose,
  userEmail,
  userId,
  onSuccess,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuth();

  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';

  const [step, setStep] = useState<ChangePasswordStep>('send-otp');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClose = () => {
    setStep('send-otp');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setIsLoading(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const maskEmail = (email?: string) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal =
      local.length > 3
        ? local.substring(0, 3) + '***'
        : local.substring(0, 1) + '***';
    return `${maskedLocal}@${domain}`;
  };

  const handleSendOtp = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Generate OTP
      const otpCode = generateOTP();
      console.log('🔐 Generated OTP for password change:', otpCode);

      // Store OTP in user database
      if (userId) {
        await storeUserOtp(userId, parseInt(otpCode));
        console.log('✅ OTP stored in database for user:', userId);
      }

      // Send OTP email (currently disabled but structure ready)
      // await sendOTP(userEmail || '', 'Password Reset', 10);

      setStep('verify-otp');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to send verification code.';
      setError(message);
      console.error('❌ Error sending OTP:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
      setStep('new-password');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Invalid verification code.';
      setError(message);
      console.error('❌ Error verifying OTP:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setError('Password must contain uppercase, lowercase, and a number.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Update password and clear OTP
      await updateUserPassword(userId, newPassword, parseInt(otp));
      await clearUserOtp(userId);

      console.log('✅ Password updated successfully');

      setStep('success');
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to change password.';
      setError(message);
      console.error('❌ Error changing password:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Generate new OTP
      const otpCode = generateOTP();
      console.log('🔐 Resent OTP for password change:', otpCode);

      // Store new OTP in user database
      if (userId) {
        await storeUserOtp(userId, parseInt(otpCode));
        console.log('✅ New OTP stored in database');
      }

      // Send OTP email (currently disabled but structure ready)
      // await sendOTP(userEmail || '', 'Password Reset', 10);
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!newPassword) return { level: 0, text: '', color: '#E5E7EB' };

    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[a-z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;

    if (strength <= 2)
      return { level: 1, text: 'Weak', color: Colors.light.error };
    if (strength <= 3)
      return { level: 2, text: 'Medium', color: Colors.light.warning };
    if (strength <= 4)
      return { level: 3, text: 'Strong', color: Colors.light.success };
    return { level: 4, text: 'Very Strong', color: Colors.light.success };
  };

  const passwordStrength = getPasswordStrength();

  const renderStepContent = () => {
    switch (step) {
      case 'send-otp':
        return (
          <Container backgroundColor="transparent">
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepActive]} />
              <View style={styles.stepLine} />
              <View style={styles.stepDot} />
              <View style={styles.stepLine} />
              <View style={styles.stepDot} />
            </View>

            <View style={styles.sendOtpIcon}>
              <Ionicons
                name="lock-closed"
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
              To change your password, we&apos;ll send a verification code to{' '}
              {maskEmail(user?.email)}
            </ThemedText>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={Colors.light.error}
                />
                <ThemedText type="label-small" style={styles.errorText}>
                  {error}
                </ThemedText>
              </View>
            ) : null}

            <Button
              label={isLoading ? 'Sending...' : 'Send Verification Code'}
              onPress={handleSendOtp}
              disabled={isLoading}
              variant="solid"
              color="primary"
              size="large"
            />
          </Container>
        );

      case 'verify-otp':
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

            <View style={styles.sendOtpIcon}>
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
              Enter the 6-digit code sent to
            </ThemedText>
            <ThemedText
              type="body-medium"
              weight="semi-bold"
              style={{
                color: textColor,
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              {maskEmail(user?.email)}
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

            <View style={{ height: 24 }} />

            <Button
              label={isLoading ? 'Verifying...' : 'Verify Code'}
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
              onPress={() => setStep('send-otp')}
              style={styles.backButton}
            >
              <ThemedText type="body-medium" style={{ color: subTextColor }}>
                Back
              </ThemedText>
            </Pressable>
          </>
        );

      case 'new-password':
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

            <View style={styles.sendOtpIcon}>
              <Ionicons name="key" size={48} color={Colors.light.primary} />
            </View>

            <ThemedText
              type="body-medium"
              style={{
                color: subTextColor,
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              Create a strong password for your account
            </ThemedText>

            <View style={styles.passwordInputContainer}>
              <FormTextInput
                label="New Password"
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setError('');
                }}
                secureTextEntry={!showPassword}
                variant="outlined"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={subTextColor}
                />
              </Pressable>
            </View>

            {newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            level <= passwordStrength.level
                              ? passwordStrength.color
                              : '#E5E7EB',
                        },
                      ]}
                    />
                  ))}
                </View>
                <ThemedText
                  type="label-small"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.text}
                </ThemedText>
              </View>
            )}

            <View style={{ height: 16 }} />

            <View style={styles.passwordInputContainer}>
              <FormTextInput
                label="Confirm Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError('');
                }}
                secureTextEntry={!showConfirmPassword}
                variant="outlined"
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={subTextColor}
                />
              </Pressable>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={Colors.light.error}
                />
                <ThemedText type="label-small" style={styles.errorText}>
                  {error}
                </ThemedText>
              </View>
            )}

            <View style={styles.requirements}>
              <View style={styles.requirementRow}>
                <Ionicons
                  name={
                    newPassword.length >= 8
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={16}
                  color={
                    newPassword.length >= 8
                      ? Colors.light.success
                      : subTextColor
                  }
                />
                <ThemedText
                  type="label-small"
                  style={{ color: subTextColor, marginLeft: 8 }}
                >
                  At least 8 characters
                </ThemedText>
              </View>
              <View style={styles.requirementRow}>
                <Ionicons
                  name={
                    /[A-Z]/.test(newPassword)
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={16}
                  color={
                    /[A-Z]/.test(newPassword)
                      ? Colors.light.success
                      : subTextColor
                  }
                />
                <ThemedText
                  type="label-small"
                  style={{ color: subTextColor, marginLeft: 8 }}
                >
                  One uppercase letter
                </ThemedText>
              </View>
              <View style={styles.requirementRow}>
                <Ionicons
                  name={
                    /[a-z]/.test(newPassword)
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={16}
                  color={
                    /[a-z]/.test(newPassword)
                      ? Colors.light.success
                      : subTextColor
                  }
                />
                <ThemedText
                  type="label-small"
                  style={{ color: subTextColor, marginLeft: 8 }}
                >
                  One lowercase letter
                </ThemedText>
              </View>
              <View style={styles.requirementRow}>
                <Ionicons
                  name={
                    /[0-9]/.test(newPassword)
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={16}
                  color={
                    /[0-9]/.test(newPassword)
                      ? Colors.light.success
                      : subTextColor
                  }
                />
                <ThemedText
                  type="label-small"
                  style={{ color: subTextColor, marginLeft: 8 }}
                >
                  One number
                </ThemedText>
              </View>
            </View>

            <View style={{ height: 24 }} />

            <Button
              label={isLoading ? 'Changing...' : 'Change Password'}
              onPress={handleChangePassword}
              disabled={isLoading}
              variant="solid"
              color="primary"
              size="large"
            />
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
              Password Changed!
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={{ color: subTextColor, textAlign: 'center' }}
            >
              Your password has been updated successfully
            </ThemedText>
          </View>
        );
    }
  };

  return (
    <BottomSheetModal
      isOpen={visible}
      onClose={handleClose}
      headerTitle="Change Password"
      snapPoints={['100%']}
      content={renderStepContent()}
    />
  );
};

export default ChangePassword;

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
  sendOtpIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(185, 28, 28, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.light.error,
    marginLeft: 8,
    flex: 1,
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
  passwordInputContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 38,
    padding: 4,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  requirements: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
