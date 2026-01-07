import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, Animated } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Button from '@/components/Button';
import { FontAwesome5 } from '@expo/vector-icons';

interface VerificationProps {
  generatedOTP: string;
  verificationType: 'email' | 'phone';
  contactInfo: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
}

export default function Verification({
  generatedOTP,
  verificationType,
  contactInfo,
  onVerify,
  onResend,
}: VerificationProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  const successOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleResend = () => {
    onResend();
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleChangeText = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const pastedOtp = text.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedOtp.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp === generatedOTP) {
      setIsVerified(true);

      // Success animation sequence
      Animated.parallel([
        // Scale pulse animation
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Icon rotation
        Animated.timing(iconRotateAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Success text fade in
        Animated.timing(successOpacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Delay before calling onVerify to show success state
        setTimeout(() => {
          onVerify(enteredOtp);
        }, 800);
      });
    } else {
      shakeAnimation();
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const iconRotate = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isComplete = otp.every((digit) => digit !== '');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isVerified
                ? colors.success + '15'
                : colors.primary + '15',
              transform: [{ scale: scaleAnim }, { rotate: iconRotate }],
            },
          ]}
        >
          <FontAwesome5
            name={isVerified ? 'check' : 'lock'}
            size={32}
            color={isVerified ? colors.success : colors.primary}
          />
        </Animated.View>
        <Animated.View style={{ opacity: isVerified ? successOpacityAnim : 1 }}>
          <ThemedText
            type="title-medium"
            weight="bold"
            style={{
              textAlign: 'center',
              marginTop: 16,
              color: isVerified ? colors.success : undefined,
            }}
          >
            {isVerified
              ? 'Verified!'
              : `Verify Your ${
                  verificationType === 'email' ? 'Email' : 'Phone'
                }`}
          </ThemedText>
        </Animated.View>
        {!isVerified && (
          <>
            <ThemedText
              type="body-medium"
              style={{
                textAlign: 'center',
                marginTop: 8,
                color: isDark ? '#8B92A6' : '#64748B',
              }}
            >
              Enter the 6-digit code sent to
            </ThemedText>
            <ThemedText
              type="body-medium"
              weight="semi-bold"
              style={{
                textAlign: 'center',
                marginTop: 4,
                color: colors.primary,
              }}
            >
              {contactInfo}
            </ThemedText>
          </>
        )}
        {isVerified && (
          <Animated.View style={{ opacity: successOpacityAnim }}>
            <ThemedText
              type="body-medium"
              style={{
                textAlign: 'center',
                marginTop: 8,
                color: colors.success,
              }}
            >
              Your code has been verified successfully!
            </ThemedText>
          </Animated.View>
        )}
      </View>

      <Animated.View
        style={[
          styles.otpContainer,
          { transform: [{ translateX: shakeAnim }] },
        ]}
      >
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              styles.otpInput,
              {
                backgroundColor: isDark ? '#1B2232' : '#FFFFFF',
                borderWidth: 2,
                borderColor: isVerified
                  ? colors.success
                  : digit
                  ? colors.primary
                  : isDark
                  ? '#2A3142'
                  : '#E5E7EB',
                color: isDark ? '#ECEDEE' : '#0D1B2A',
                shadowColor: isVerified
                  ? colors.success
                  : digit
                  ? colors.primary
                  : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: digit || isVerified ? 0.2 : 0,
                shadowRadius: 8,
                elevation: digit || isVerified ? 4 : 0,
              },
            ]}
            value={digit}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            editable={!isVerified}
          />
        ))}
      </Animated.View>

      {/* Timer Display */}
      {!canResend && (
        <View
          style={[styles.timerBox, { backgroundColor: colors.info + '10' }]}
        >
          <FontAwesome5 name="clock" size={14} color={colors.info} />
          <ThemedText
            type="body-small"
            style={{ marginLeft: 8, color: colors.info }}
          >
            Code expires in {Math.floor(timer / 60)}:
            {(timer % 60).toString().padStart(2, '0')}
          </ThemedText>
        </View>
      )}

      <View style={styles.debugBox}>
        <FontAwesome5
          name="bug"
          size={12}
          color={colors.warning}
          style={{ marginRight: 8 }}
        />
        <ThemedText type="label-small" style={{ flex: 1 }}>
          Test Code:{' '}
          <ThemedText type="label-small" weight="bold">
            {generatedOTP}
          </ThemedText>
        </ThemedText>
      </View>

      <Button
        fullWidth
        size="large"
        label="Verify Code"
        color="primary"
        variant="solid"
        onPress={handleVerify}
        disabled={!isComplete || isVerified}
      />

      {!isVerified && (
        <View style={styles.resendContainer}>
          <ThemedText
            type="body-small"
            style={{ color: isDark ? '#8B92A6' : '#64748B' }}
          >
            Didn&apos;t receive the code?
          </ThemedText>
          <Pressable onPress={handleResend} disabled={!canResend}>
            <ThemedText
              type="link-small"
              weight="semi-bold"
              style={{
                color: canResend
                  ? colors.primary
                  : isDark
                  ? '#4B5563'
                  : '#CBD5E1',
                textDecorationLine: canResend ? 'underline' : 'none',
              }}
            >
              Resend Code {!canResend && `(${timer}s)`}
            </ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 8,
  },
  otpInput: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  debugBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning + '30',
    borderStyle: 'dashed',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
});
