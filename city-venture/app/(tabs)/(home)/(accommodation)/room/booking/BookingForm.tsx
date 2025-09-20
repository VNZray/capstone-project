import Container from '@/components/Container';
import Dropdown from '@/components/Dropdown';
import PageContainer from '@/components/PageContainer';
import FormTextInput from '@/components/TextInput';
import { ThemedText } from '@/components/themed-text';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

const BookingForm = () => {
  const [paxCount, setPaxCount] = useState<number>(0);

  const handlePaxChange = (value: string) => {
    const num = parseInt(value) || 0;
    setPaxCount(num);
  };

  const renderGuestForms = () => {
    const guestForms = [];
    for (let i = 1; i <= paxCount; i++) {
      guestForms.push(
        <Container
          key={i}
          direction="row"
          padding={0}
          backgroundColor="transparent"
        >
          <FormTextInput
            size="small"
            label={`Guest ${i}`}
            required
            placeholder="Full Name"
            columns={2}
          />

          <FormTextInput
            size="small"
            label="Age"
            required
            placeholder="Age"
            keyboardType="numeric"
            columns={1}
            maxLength={2}
            pattern={/^[1-9]\d*$/}
            customValidator={(value) => {
              const num = parseInt(value);
              if (num < 1) return 'Age must be at least 1';
              if (num > 120) return 'Age must be less than 120';
              return null;
            }}
          />

          <Dropdown
            withSearch={false}
            label="Gender"
            size="small"
            items={[
              { id: 1, label: 'Male' },
              { id: 2, label: 'Female' },
            ]}
            style={{ flex: 1 }}
          />
        </Container>
      );
    }
    return guestForms;
  };
  return (
    <ScrollView>
      <PageContainer padding={0}>
        <FormTextInput
          size="small"
          keyboardType="numeric"
          label="Pax"
          placeholder="Enter number of pax"
          required
          minLength={1}
          pattern={/^[1-9]\d*$/}
          validateOnBlur
          onChangeText={handlePaxChange}
          customValidator={(value) => {
            const num = parseInt(value);
            if (num < 1) return 'At least 1 guest is required';
            if (num > 20) return 'Maximum 20 guests allowed';
            return null;
          }}
        />

        <Container direction="row" padding={0} backgroundColor="transparent">
          <FormTextInput
            size="small"
            keyboardType="numeric"
            label="Adult(s)"
            placeholder="Number of Adult(s)"
            required
            pattern={/^[1-9]\d*$/}
            validateOnBlur
            customValidator={(value) => {
              const num = parseInt(value);
              if (num < 1) return 'At least 1 adult is required';
              if (num > 10) return 'Maximum 10 adults allowed';
              return null;
            }}
          />

          <FormTextInput
            size="small"
            keyboardType="numeric"
            label="Children"
            placeholder="Number of children"
            pattern={/^[1-9]\d*$/}
            validateOnBlur
            customValidator={(value) => {
              if (value === '') return null; // Optional field
              const num = parseInt(value);
              if (num > 10) return 'Maximum 10 children allowed';
              return null;
            }}
          />
        </Container>

        {paxCount > 0 && (
          <>
            <ThemedText
              type="label-medium"
              style={{ marginTop: 16, marginBottom: 8 }}
            >
              Guest Information ({paxCount} guest{paxCount > 1 ? 's' : ''})
            </ThemedText>
            {renderGuestForms()}
          </>
        )}
      </PageContainer>
    </ScrollView>
  );
};

export default BookingForm;

const styles = StyleSheet.create({});
