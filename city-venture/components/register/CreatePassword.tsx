import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import FormTextInput from '@/components/TextInput';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';


interface CreatePasswordProps {
  data: {
    password: string;
    confirmPassword: string;
  };
  onUpdate: (data: any) => void;
}

export default function CreatePassword({
  data,
  onUpdate,
}: CreatePasswordProps) {
  const passwordsMatch = data.password === data.confirmPassword;
  const showMatchError = data.confirmPassword.length > 0 && !passwordsMatch;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <FormTextInput
        label="Password"
        placeholder="Enter your password"
        value={data.password}
        onChangeText={(text) => onUpdate({ password: text })}
        variant="outlined"
        required
        helperText="At least 8 characters, including uppercase, lowercase, and numbers"
        secureTextEntry={!showPassword}
        rightIcon={showPassword ? 'eye-slash' : 'eye'}
        onPressRightIcon={() => setShowPassword((p) => !p)}
      />

      <FormTextInput
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={data.confirmPassword}
        onChangeText={(text) => onUpdate({ confirmPassword: text })}
        secureTextEntry={!showPassword}
        rightIcon={showPassword ? 'eye-slash' : 'eye'}
        onPressRightIcon={() => setShowPassword((p) => !p)}
        variant="outlined"
        required
        errorText={showMatchError ? 'Passwords do not match' : undefined}
      />

      <View style={styles.requirements}>
        <ThemedText type="label-small" weight="semi-bold" mb={8}>
          Password Requirements:
        </ThemedText>
        <PasswordRequirement
          met={data.password.length >= 8}
          text="At least 8 characters"
        />
        <PasswordRequirement
          met={/[A-Z]/.test(data.password)}
          text="Contains uppercase letter"
        />
        <PasswordRequirement
          met={/[a-z]/.test(data.password)}
          text="Contains lowercase letter"
        />
        <PasswordRequirement
          met={/[0-9]/.test(data.password)}
          text="Contains number"
        />
      </View>

      <View style={styles.termsContainer}>
        <ThemedText type="body-small" style={{ textAlign: 'center' }}>
          By signing up, you agree to our{' '}
          <ThemedText type="link-small">Terms and Conditions</ThemedText> and{' '}
          <ThemedText type="link-small">Privacy Policy</ThemedText>
        </ThemedText>
      </View>
    </View>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={styles.requirement}>
      <View
        style={[
          styles.requirementDot,
          { backgroundColor: met ? colors.success : colors.primary },
        ]}
      />
      <ThemedText
        type="body-small"
        style={{ color: met ? colors.success : colors.primary }}
      >
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    marginBottom: 8,
  },
  requirements: {
    backgroundColor: colors.primary + '10',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  requirementDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  termsContainer: {
    marginTop: 8,
  },
});
