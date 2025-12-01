import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import FormTextInput from '@/components/TextInput';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import Button from '@/components/Button';
import { FontAwesome5 } from '@expo/vector-icons';

interface ContactDetailsProps {
  data: {
    email: string;
    phoneNumber: string;
    verificationType: 'email' | 'phone';
  };
  onUpdate: (data: any) => void;
  onSendOTP: () => void;
}

export default function ContactDetails({
  data,
  onUpdate,
  onSendOTP,
}: ContactDetailsProps) {
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <View
        style={[styles.infoHeader, { backgroundColor: colors.info + '10' }]}
      >
        <FontAwesome5 name="shield-alt" size={20} color={colors.info} />
        <ThemedText type="body-medium" style={{ flex: 1, marginLeft: 12 }}>
          We'll send a verification code to confirm your identity
        </ThemedText>
      </View>

      <View style={styles.inputGroup}>
        <FormTextInput
          startDecorator={
            <FontAwesome5
              name="envelope"
              size={16}
              color={isDark ? '#8B92A6' : '#64748B'}
            />
          }
          label="Email Address"
          placeholder="your.email@example.com"
          value={data.email}
          onChangeText={(text) => onUpdate({ email: text })}
          autoCapitalize="none"
          keyboardType="email-address"
          variant="outlined"
          required
        />

        <FormTextInput
          startDecorator={
            <FontAwesome5
              name="phone"
              size={16}
              color={isDark ? '#8B92A6' : '#64748B'}
            />
          }
          label="Phone Number"
          placeholder="+63 XXX XXX XXXX"
          value={data.phoneNumber}
          onChangeText={(text) => onUpdate({ phoneNumber: text })}
          keyboardType="phone-pad"
          variant="outlined"
          required
          helperText="Include country code for international numbers"
        />
      </View>

      <View style={styles.verificationSection}>
        <ThemedText type="label-medium" weight="semi-bold" mb={12}>
          Choose verification method:
        </ThemedText>
        <View style={styles.radioGroup}>
          {[
            { value: 'email' as const, label: 'Email', icon: 'envelope' },
            { value: 'phone' as const, label: 'SMS', icon: 'comment-dots' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.verificationOption,
                {
                  backgroundColor: isDark ? '#1B2232' : '#F9F9F9',
                  borderColor:
                    data.verificationType === option.value
                      ? colors.primary
                      : isDark
                      ? '#2A3142'
                      : '#E5E7EB',
                },
                data.verificationType === option.value &&
                  styles.verificationSelected,
              ]}
              onPress={() => onUpdate({ verificationType: option.value })}
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor:
                      data.verificationType === option.value
                        ? colors.primary + '20'
                        : isDark
                        ? '#2A3142'
                        : '#E5E7EB',
                  },
                ]}
              >
                <FontAwesome5
                  name={option.icon}
                  size={18}
                  color={
                    data.verificationType === option.value
                      ? colors.primary
                      : isDark
                      ? '#8B92A6'
                      : '#64748B'
                  }
                />
              </View>
              <ThemedText
                type="label-medium"
                weight="semi-bold"
                style={[
                  {
                    color:
                      data.verificationType === option.value
                        ? colors.primary
                        : isDark
                        ? '#8B92A6'
                        : '#64748B',
                  },
                ]}
              >
                {option.label}
              </ThemedText>
              {data.verificationType === option.value && (
                <FontAwesome5
                  name="check-circle"
                  size={20}
                  color={colors.success}
                  style={{ marginLeft: 'auto' }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.infoBox,
          {
            backgroundColor: colors.primary + '10',
            borderLeftColor: colors.primary,
          },
        ]}
      >
        <FontAwesome5 name="info-circle" size={16} color={colors.primary} />
        <ThemedText type="body-small" style={{ flex: 1, marginLeft: 12 }}>
          A 6-digit code will be sent to your{' '}
          {data.verificationType === 'email' ? 'email address' : 'phone number'}{' '}
          for verification
        </ThemedText>
      </View>

      <Button
        fullWidth
        size="large"
        label="Send Verification Code"
        color="primary"
        variant="solid"
        onPress={onSendOTP}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  inputGroup: {
    gap: 16,
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 40,
    zIndex: 10,
  },
  verificationSection: {
    marginTop: 8,
  },
  radioGroup: {
    gap: 12,
  },
  verificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  verificationSelected: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
});
