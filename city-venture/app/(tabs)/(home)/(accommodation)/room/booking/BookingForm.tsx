import Checklist, { ChecklistItem, ChecklistRef } from '@/components/Checklist';
import Container from '@/components/Container';
import Dropdown from '@/components/Dropdown';
import PageContainer from '@/components/PageContainer';
import RadioButton, { RadioItem } from '@/components/RadioButton';
import FormTextInput from '@/components/TextInput';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { useRoom } from '@/context/RoomContext';
import { Booking, BookingPayment, Guest, Guests } from '@/types/Booking';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const travelerType: ChecklistItem[] = [
  { id: '1', label: 'Local' },
  { id: '2', label: 'Domestic' },
  { id: '3', label: 'Foreign' },
  { id: '4', label: 'Overseas' },
];

const tripPurpose: RadioItem[] = [
  { id: '1', label: 'Business' },
  { id: '2', label: 'Leisure' },
  { id: '3', label: 'Family Visit' },
  { id: '4', label: 'Vacation' },
  { id: '5', label: 'Other' },
];

type Props = {
  data: Booking;
  guests: Guests; // Guests is already Guest[]
  payment: BookingPayment;
  setData: React.Dispatch<React.SetStateAction<Booking>>;
  setGuests: React.Dispatch<React.SetStateAction<Guests>>;
  setPayment: React.Dispatch<React.SetStateAction<BookingPayment>>;
};

const BookingForm: React.FC<Props> = ({
  data,
  guests,
  payment,
  setData,
  setGuests,
  setPayment,
}) => {
  const { roomDetails } = useRoom();
  const [pax, setPax] = useState<number>(data.pax || 0);
  const listRef = useRef<ChecklistRef>(null);
  const [selectedTypes, setSelectedTypes] = useState<ChecklistItem[]>([]);
  const [typeCounts, setTypeCounts] = useState<Record<string, string>>({});
  // Store trip purpose as id (string)
  const [tripPurposeValue, setTripPurposeValue] = useState<string>(
    tripPurpose.find((tp) => tp.label === data.trip_purpose)?.id?.toString() ||
      ''
  );
  const [customPurpose, setCustomPurpose] = useState('');

  // Guests editing state derived from guests array
  React.useEffect(() => {
    // ensure guests length matches pax
    if (pax !== guests.length) {
      setGuests((prev) => {
        const next = [...prev];
        if (pax > next.length) {
          for (let i = next.length; i < pax; i++) {
            next.push({
              booking_id: data.id!,
              name: '',
              age: null,
              gender: '',
            });
          }
        } else if (pax < next.length) {
          next.length = pax;
        }
        return next;
      });
    }
  }, [pax, guests.length, setGuests, data.id]);
  const handlePaxChange = (value: string) => {
    const num = parseInt(value) || 0;
    setPax(num);
  };

  const [numberOfAdults, setNumberOfAdults] = useState<number>(
    data.num_adults || 0
  );
  const [numberOfChildren, setNumberOfChildren] = useState<number>(
    data.num_children || 0
  );

  // Handle traveler type selection change
  const handleTravelerTypeChange = (items: ChecklistItem[]) => {
    setSelectedTypes(items);
    // Remove counts for unselected types
    setTypeCounts((prev) => {
      const next: Record<string, string> = {};
      items.forEach((it) => {
        next[it.id] = prev[it.id] || '';
      });
      return next;
    });
  };

  // Update booking data when core fields change
  React.useEffect(() => {
    // Map id to label for storage, except for 'Other'
    const selectedPurpose = tripPurpose.find(
      (tp) => tp.id === tripPurposeValue
    );
    setData((prev) => ({
      ...prev,
      room_id: roomDetails?.id,
      pax,
      num_adults: numberOfAdults,
      num_children: numberOfChildren,
      trip_purpose:
        tripPurposeValue === '5'
          ? customPurpose
          : selectedPurpose?.label || customPurpose,
      // set traveler counts from typeCounts
      local_counts: parseInt(typeCounts['1'] || '0') || 0,
      domestic_counts: parseInt(typeCounts['2'] || '0') || 0,
      foreign_counts: parseInt(typeCounts['3'] || '0') || 0,
      overseas_counts: parseInt(typeCounts['4'] || '0') || 0,
    }));
  }, [
    pax,
    numberOfAdults,
    numberOfChildren,
    tripPurposeValue,
    customPurpose,
    typeCounts,
    setData,
    roomDetails?.id,
  ]);

  // Render a FormTextInput for each selected traveler type (as plain Views, not FlatList)
  const renderTypeInputs = () => (
    <View>
      {selectedTypes.map((type) => (
        <FormTextInput
          key={type.id}
          size="small"
          keyboardType="numeric"
          label={`Number of ${type.label}`}
          placeholder={`Enter number of ${type.label.toLowerCase()}`}
          required
          minLength={1}
          maxLength={2}
          pattern={/^[1-9]\d*$/}
          value={typeCounts[type.id]}
          onChangeText={(value) => {
            setTypeCounts((prev) => ({ ...prev, [type.id]: value }));
          }}
          customValidator={(value) => {
            if (!value) return `Required`;
            const num = parseInt(value);
            if (isNaN(num) || num < 0) return 'Must be a positive number';
            if (num > 100) return 'Too many';
            return null;
          }}
          
        />
      ))}
    </View>
  );

  // Render guest forms as plain Views, not FlatList
  const updateGuest = (index: number, patch: Partial<Guest>) => {
    setGuests((prev) => {
      const next = [...prev];
      if (!next[index]) {
        next[index] = {
          booking_id: data.id!,
          name: '',
          age: null,
          gender: '',
        };
      }
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const renderGuestForms = () => (
    <Container padding={0} backgroundColor="transparent">
      {guests.map((g, idx) => {
        const i = idx + 1;
        return (
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
              value={g.name}
              onChangeText={(value) => updateGuest(idx, { name: value })}
            />
            <FormTextInput
              size="small"
              label="Age"
              required
              placeholder="Age"
              keyboardType="numeric"
              columns={4}
              maxLength={2}
              pattern={/^[1-9]\d*$/}
              value={g.age !== null && g.age !== undefined ? String(g.age) : ''}
              onChangeText={(value) =>
                updateGuest(idx, { age: value ? parseInt(value) : null })
              }
              customValidator={(value) => {
                const num = parseInt(value);
                if (isNaN(num) || num < 1) return 'Age must be at least 1';
                if (num > 120) return 'Age must be less than 120';
                return null;
              }}
            />
            <Dropdown
              required
              withSearch={false}
              label="Gender"
              size="small"
              items={[
                { id: 'Male', label: 'Male' },
                { id: 'Female', label: 'Female' },
              ]}
              value={
                g.gender === 'Male' || g.gender === 'Female'
                  ? g.gender
                  : g.gender
              }
              onSelect={(item) => updateGuest(idx, { gender: item.id })}
              style={{ flex: 1 }}
            />
          </Container>
        );
      })}
    </Container>
  );
  const allGuestsComplete =
    guests.length > 0 &&
    guests.every((g) => g.name.trim() && g.age && g.age > 0 && g.gender);

  return (
    <ScrollView>
      <PageContainer padding={16} gap={16}>
        <FormTextInput
          size="small"
          keyboardType="numeric"
          label="Pax"
          placeholder="Enter number of pax"
          required
          minLength={1}
          maxLength={2}
          pattern={/^[1-9]\d*$/}
          validateOnBlur
          onChangeText={handlePaxChange}
          customValidator={(value) => {
            const num = parseInt(value);
            if (num < 1) return 'At least 1 guest is required';
            if (num > 20) return 'Maximum 20 guests allowed';
            return null;
          }}
          value={pax === 0 ? '' : pax.toString()}
        />

        <Container direction="row" padding={0} backgroundColor="transparent">
          <FormTextInput
            size="small"
            keyboardType="numeric"
            label="Adult(s)"
            placeholder="Number of Adult(s)"
            required
            minLength={1}
            maxLength={2}
            pattern={/^[1-9]\d*$/}
            validateOnBlur
            customValidator={(value) => {
              const num = parseInt(value);
              if (num < 1) return 'At least 1 adult is required';
              if (num > 10) return 'Maximum 10 adults allowed';
              return null;
            }}
            onChangeText={(value) => setNumberOfAdults(parseInt(value) || 0)}
            value={numberOfAdults === 0 ? '' : numberOfAdults.toString()}
          />

          <FormTextInput
            size="small"
            keyboardType="numeric"
            label="Children"
            maxLength={2}
            placeholder="Number of children"
            pattern={/^[1-9]\d*$/}
            validateOnBlur
            customValidator={(value) => {
              if (value === '') return null; // Optional field
              const num = parseInt(value);
              if (num > 10) return 'Maximum 10 children allowed';
              return null;
            }}
            onChangeText={(value) => setNumberOfChildren(parseInt(value) || 0)}
            value={numberOfChildren === 0 ? '' : numberOfChildren.toString()}
          />
        </Container>

        {pax > 0 && guests.length > 0 && (
          <>
            <Container
              variant="soft"
              backgroundColor={
                allGuestsComplete ? colors.success : colors.warning
              }
            >
              <ThemedText
                startIcon={
                  <MaterialIcons
                    name={allGuestsComplete ? 'check-circle' : 'warning'}
                    size={18}
                  />
                }
                type="label-small"
                weight="medium"
              >
                Please Provide Guest Information ({pax} guest
                {pax > 1 ? 's' : ''})
              </ThemedText>
            </Container>
            {renderGuestForms()}
          </>
        )}

        <Checklist
          ref={listRef}
          items={travelerType}
          onChange={handleTravelerTypeChange}
          size="small"
          validateOnChange
          label="Traveler Type (Select all that apply)"
          values={selectedTypes.map((t) => t.id)}
        />

        {selectedTypes.length > 0 && <>{renderTypeInputs()}</>}

        <RadioButton
          label="Trip Purpose"
          items={tripPurpose}
          value={tripPurposeValue}
          onChange={(item) =>
            setTripPurposeValue(item?.id !== undefined ? String(item.id) : '')
          }
        />

        {tripPurposeValue === '5' && (
          <FormTextInput
            label="Please specify your trip purpose"
            required
            value={customPurpose}
            onChangeText={setCustomPurpose}
            minLength={2}
            maxLength={64}
            placeholder="Enter purpose"
            size="small"
            customValidator={(value) => {
              if (!value || value.trim().length < 2)
                return 'Please specify your purpose';
              return null;
            }}
          />
        )}
      </PageContainer>
    </ScrollView>
  );
};

export default BookingForm;

const styles = StyleSheet.create({});
