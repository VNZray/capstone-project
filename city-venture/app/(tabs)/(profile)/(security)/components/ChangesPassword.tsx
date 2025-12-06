import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Button from '@/components/Button';
import FormTextInput from '@/components/TextInput';
import apiClient from '@/services/apiClient';

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

  const bg = Colors.light.background;
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';

  // Step management
  const [step, setStep] = useState<ChangePasswordStep>('send-otp');

  // Form states
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset state when modal closes
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

  // Mask email for display
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

  // Step 1: Send OTP to email
  const handleSendOtp = async () => {
    setError('');
    setIsLoading(true);

    try {
      await apiClient.post('/auth/send-password-change-otp', {
        email: userEmail,
        userId,
      });
      setStep('verify-otp');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to send verification code.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
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
      await apiClient.post('/auth/verify-password-otp', {
        otp,
        email: userEmail,
        userId,
      });
      setStep('new-password');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Invalid verification code.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Set new password
  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    // Check for at least one uppercase, one lowercase, and one number
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
      await apiClient.post('/auth/change-password', {
        otp,
        newPassword,
        userId,
      });

      setStep('success');
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to change password.';
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
      await apiClient.post('/auth/send-password-change-otp', {
        email: userEmail,
        userId,
      });
      Alert.alert(
        'Code Sent',
        'A new verification code has been sent to your email.'
      );
    } catch (err: any) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
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

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 'send-otp':
        return (
          <>
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
              To change your password, we'll send a verification code to
            </ThemedText>
            <ThemedText
              type="body-medium"
              weight="semi-bold"
              style={{
                color: textColor,
                marginBottom: 32,
                textAlign: 'center',
              }}
            >
              {maskEmail(userEmail)}
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
              fullWidth
            />
          </>
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
              {maskEmail(userEmail)}
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
              fullWidth
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

            <ThemedText
              type="body-medium"
              style={{
                color: subTextColor,
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              Create a strong password for your account.
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

            {/* Password strength indicator */}
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
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError('');
                }}
                secureTextEntry={!showConfirmPassword}
                variant="outlined"
                errorText={error}
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

            {/* Password requirements */}
            <View style={styles.requirements}>
              <ThemedText
                type="label-small"
                style={{ color: subTextColor, marginBottom: 8 }}
              >
                Password requirements:
              </ThemedText>
              {[
                {
                  check: newPassword.length >= 8,
                  text: 'At least 8 characters',
                },
                {
                  check: /[A-Z]/.test(newPassword),
                  text: 'One uppercase letter',
                },
                {
                  check: /[a-z]/.test(newPassword),
                  text: 'One lowercase letter',
                },
                { check: /[0-9]/.test(newPassword), text: 'One number' },
              ].map((req, idx) => (
                <View key={idx} style={styles.requirementRow}>
                  <Ionicons
                    name={req.check ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={req.check ? Colors.light.success : subTextColor}
                  />
                  <ThemedText
                    type="label-small"
                    style={{
                      color: req.check ? Colors.light.success : subTextColor,
                      marginLeft: 6,
                    }}
                  >
                    {req.text}
                  </ThemedText>
                </View>
              ))}
            </View>

            <View style={{ height: 24 }} />

            <Button
              label={isLoading ? 'Changing...' : 'Change Password'}
              onPress={handleChangePassword}
              disabled={isLoading}
              variant="solid"
              color="primary"
              size="large"
              fullWidth
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
              Your password has been updated successfully.
            </ThemedText>
          </View>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.modalContainer, { backgroundColor: bg }]}
      >
        <View style={styles.modalHeader}>
          <View style={{ width: 50 }} />
          <ThemedText
            type="card-title-medium"
            weight="semi-bold"
            style={{ color: textColor }}
          >
            Change Password
          </ThemedText>
          <Pressable onPress={handleClose} style={styles.cancelButton}>
            <ThemedText
              type="body-medium"
              style={{ color: Colors.light.primary }}
            >
              Cancel
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.modalContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
