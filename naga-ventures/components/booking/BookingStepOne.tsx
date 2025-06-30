import React from 'react';
import { ScrollView, TextInput, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface Props {
  pax: string;
  guestNames: string[];
  numChildren: string;
  numAdults: string;
  travelerTypes: string[];
  travelerCounts: Record<string, string>;
  tripPurpose: string;
  onChange: (field: string, value: any) => void;
  onGuestNameChange: (index: number, value: string) => void;
  onToggleTravelerType: (type: string) => void;
}

const BookingFormStepOne: React.FC<Props> = ({
  pax,
  guestNames,
  numChildren,
  numAdults,
  travelerTypes,
  travelerCounts,
  tripPurpose,
  onChange,
  onGuestNameChange,
  onToggleTravelerType,
}) => {
  return (
    <>
      <ThemedText type="profileTitle" style={styles.formTitle}>Guest Information</ThemedText>
      <ScrollView style={styles.bookingFormContainer}>
        <ThemedText style={styles.subtitle} type="subtitle">Pax:</ThemedText>
        <TextInput style={styles.input} keyboardType="numeric" placeholder="Pax" value={pax} onChangeText={(val) => onChange('pax', val)} />

        {guestNames.map((name, index) => (
          <View key={index}>
            <ThemedText style={styles.subtitle} type="subtitle">Guest Name {index + 1}</ThemedText>
            <TextInput style={styles.input} placeholder={`Guest Name ${index + 1}`} value={name} onChangeText={(text) => onGuestNameChange(index, text)} />
          </View>
        ))}

        <ThemedText style={styles.subtitle} type="subtitle">Number of Children:</ThemedText>
        <TextInput style={styles.input} keyboardType="numeric" placeholder="Number of Children" value={numChildren} onChangeText={(val) => onChange('numChildren', val)} />

        <ThemedText style={styles.subtitle} type="subtitle">Number of Adults:</ThemedText>
        <TextInput style={styles.input} keyboardType="numeric" placeholder="Number of Adults" value={numAdults} onChangeText={(val) => onChange('numAdults', val)} />

        <ThemedText style={styles.subtitle} type="subtitle">Traveler Type:</ThemedText>
        {["Foreign", "Overseas", "Domestic", "Local"].map(type => (
          <TouchableOpacity key={type} style={styles.checkboxRow} onPress={() => onToggleTravelerType(type)}>
            <View style={[styles.checkbox, travelerTypes.includes(type) && styles.checked]} />
            <Text>{type}</Text>
          </TouchableOpacity>
        ))}

        {travelerTypes.map(type => (
          <TextInput key={type} style={styles.input} keyboardType="numeric" placeholder={`Number of ${type}`} value={travelerCounts[type]} onChangeText={(val) => onChange(`travelerCounts.${type}`, val)} />
        ))}

        <ThemedText style={styles.subtitle} type="subtitle">Trip Purpose:</ThemedText>
        {["Leisure", "Business", "Education", "Other"].map(purpose => (
          <TouchableOpacity key={purpose} onPress={() => onChange('tripPurpose', purpose)} style={styles.radioRow}>
            <View style={[styles.radioOuter, tripPurpose === purpose && styles.radioSelected]}>
              {tripPurpose === purpose && <View style={styles.radioInner} />}
            </View>
            <Text>{purpose}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  formTitle: {
    paddingTop: 80,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    height: 120,
    backgroundColor: '#0A1B47',
    marginBottom: 16,
  },
  bookingFormContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 0,
    marginBottom: 8,
    color: '#333',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  checked: {
    backgroundColor: '#0A1B47',
    borderColor: '#0A1B47',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0A1B47',
  },
  radioSelected: {
    borderColor: '#0A1B47',
  },
});

export default BookingFormStepOne;
