import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import FormTextInput from '@/components/TextInput';
import DateInput from '@/components/DateInput';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import { FontAwesome5 } from '@expo/vector-icons';
import Section from '@/components/Section';

interface PersonalDetailsProps {
  data: {
    firstName: string;
    middleName: string;
    lastName: string;
    gender: string;
    birthdate: Date;
    phoneNumber: string;
    nationality: string;
  };
  onUpdate: (data: any) => void;
}

export default function PersonalDetails({
  data,
  onUpdate,
}: PersonalDetailsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {/* Basic Information Section */}
      <Section icon="user" title="Basic Information" isDark={isDark}>
        <FormTextInput
          label="First Name"
          placeholder="Enter your first name"
          value={data.firstName}
          onChangeText={(text) => onUpdate({ firstName: text })}
          variant="outlined"
          autoCapitalize="words"
          required
        />

        <FormTextInput
          label="Middle Name"
          placeholder="Enter your middle name (optional)"
          value={data.middleName}
          onChangeText={(text) => onUpdate({ middleName: text })}
          variant="outlined"
          autoCapitalize="words"
        />

        <FormTextInput
          label="Last Name"
          placeholder="Enter your last name"
          value={data.lastName}
          onChangeText={(text) => onUpdate({ lastName: text })}
          variant="outlined"
          autoCapitalize="words"
          required
        />

        <View>
          <ThemedText type="label-medium" mb={8}>
            Gender{' '}
            <ThemedText type="label-small" style={{ color: colors.error }}>
              *
            </ThemedText>
          </ThemedText>
          <View style={styles.radioGroup}>
            {[
              { value: 'Male', icon: 'mars' },
              { value: 'Female', icon: 'venus' },
              { value: 'Prefer not to say', icon: 'genderless' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.radioButton,
                  {
                    backgroundColor: isDark ? '#1B2232' : '#F9F9F9',
                    borderColor:
                      data.gender === option.value
                        ? colors.primary
                        : isDark
                        ? '#2A3142'
                        : '#E5E7EB',
                  },
                  data.gender === option.value && styles.radioSelected,
                ]}
                onPress={() => onUpdate({ gender: option.value })}
              >
                <FontAwesome5
                  name={option.icon}
                  size={14}
                  color={
                    data.gender === option.value
                      ? colors.primary
                      : isDark
                      ? '#8B92A6'
                      : '#64748B'
                  }
                />
                <ThemedText
                  type="label-small"
                  style={[
                    { marginLeft: 6 },
                    data.gender === option.value && {
                      color: colors.primary,
                      fontWeight: '600',
                    },
                  ]}
                >
                  {option.value}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <DateInput
          label="Date of Birth"
          placeholder="Select your birthdate"
          variant="outlined"
          style={{ flex: 1 }}
          mode="single"
          size="medium"
          showStatusLegend={false}
          requireConfirmation
          selectionVariant="filled"
          value={data.birthdate}
          disableFuture
          onChange={(d) => {
            if (d) onUpdate({ birthdate: d });
          }}
        />

        <FormTextInput
          label="Nationality"
          placeholder="e.g., Filipino, American"
          value={data.nationality}
          onChangeText={(text) => onUpdate({ nationality: text })}
          variant="outlined"
          autoCapitalize="words"
          required
        />
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  radioGroup: {
    gap: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
  },
  radioSelected: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
});
