import Checklist, { ChecklistItem, ChecklistRef } from '@/components/Checklist';
import Container from '@/components/Container';
import DateInput from '@/components/DateInput';
import PageContainer from '@/components/PageContainer';
import RadioButton, { RadioItem } from '@/components/RadioButton';
import FormTextInput from '@/components/TextInput';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { fetchAllBookings } from '@/services/AccommodationService';
import { Booking, BookingPayment } from '@/types/Booking';
import debugLogger from '@/utils/debugLogger';
import React, { useEffect, useRef, useState } from 'react';
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
  payment: BookingPayment;
  setData: React.Dispatch<React.SetStateAction<Booking>>;
  setPayment: React.Dispatch<React.SetStateAction<BookingPayment>>;
};

const BookingForm: React.FC<Props> = ({ data, payment, setData, setPayment }) => {
  const { roomDetails } = useRoom();
  const { user } = useAuth();

  // Core counts
  const [pax, setPax] = useState<number>(data.pax || 0);
  const [numberOfAdults, setNumberOfAdults] = useState<number>(data.num_adults || 0);
  const [numberOfChildren, setNumberOfChildren] = useState<number>(data.num_children || 0);
  const [numberOfInfants, setNumberOfInfants] = useState<number>(data.num_infants || 0);

  // Traveler types & purpose
  const listRef = useRef<ChecklistRef>(null);
  const [selectedTypes, setSelectedTypes] = useState<ChecklistItem[]>([]);
  const [typeCounts, setTypeCounts] = useState<Record<string, string>>({});
  const [tripPurposeValue, setTripPurposeValue] = useState<string>(
    tripPurpose.find((tp) => tp.label === data.trip_purpose)?.id?.toString() || ''
  );
  const [customPurpose, setCustomPurpose] = useState('');

  // Date range
  const [checkIn, setCheckIn] = useState<Date | null>((data.check_in_date as Date) || null);
  const [checkOut, setCheckOut] = useState<Date | null>((data.check_out_date as Date) || null);

  // Status map for current user's own bookings (self-blocking only)
  const [statusMap, setStatusMap] = useState<Record<string, 'reserved' | 'occupied' | 'unavailable'>>({});

  // Helpers
  const handlePaxChange = (value: string) => {
    const num = parseInt(value) || 0;
    setPax(num);
  };

  const toYMD = (d: Date | string) => {
    const date = d instanceof Date ? d : new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Load ONLY this user's bookings for this room to prevent duplicate self-bookings.
  // Other users' bookings are intentionally ignored so they don't block.
  useEffect(() => {
    const loadSelfBookings = async () => {
      if (!roomDetails?.id || !user?.id) return;
      try {
        const all = await fetchAllBookings();
        const mineSameRoom = (all || []).filter(
          (b: any) => String(b.room_id) === String(roomDetails.id) && String(b.tourist_id) === String(user.id)
        );

        debugLogger({
          title: 'BookingForm: Self bookings for this room',
            data: {
              totalFetched: all?.length || 0,
              selfRoomCount: mineSameRoom.length,
              user: user.id,
              room: roomDetails.id,
            },
        });

        const map: Record<string, 'reserved' | 'occupied' | 'unavailable'> = {};
        mineSameRoom.forEach((b: any) => {
          if (!b.check_in_date || !b.check_out_date) return;
            const start = new Date(b.check_in_date);
            const end = new Date(b.check_out_date);
            for (let d = new Date(start); d.getTime() <= end.getTime(); d.setDate(d.getDate() + 1)) {
              const key = toYMD(d);
              if (b.booking_status === 'Canceled') continue; // Do not block canceled
              if (b.booking_status === 'Checked-In') map[key] = 'occupied';
              else if (b.booking_status === 'Reserved') map[key] = 'reserved';
              else if (b.booking_status === 'Pending') map[key] = 'unavailable'; // treat pending self booking as unavailable to avoid duplicates
              else if (b.booking_status === 'Booked') map[key] = 'unavailable';
            }
        });
        setStatusMap(map);
      } catch (e) {
        debugLogger({ title: 'BookingForm: loadSelfBookings error', error: e });
      }
    };
    loadSelfBookings();
  }, [roomDetails?.id, user?.id]);

  const handleTravelerTypeChange = (items: ChecklistItem[]) => {
    setSelectedTypes(items);
    setTypeCounts((prev) => {
      const next: Record<string, string> = {};
      items.forEach((it) => {
        next[it.id] = prev[it.id] || '';
      });
      return next;
    });
  };

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

  // Derive adults whenever pax / children / infants change
  React.useEffect(() => {
    const adults = Math.max(pax - numberOfChildren - numberOfInfants, 0);
    setNumberOfAdults(adults);
  }, [pax, numberOfChildren, numberOfInfants]);

  // Auto-fill traveler type count when only one type is selected
  React.useEffect(() => {
    if (selectedTypes.length === 1) {
      const only = selectedTypes[0];
      setTypeCounts((prev) => ({ ...prev, [only.id]: pax.toString() }));
    }
  }, [selectedTypes, pax]);

  React.useEffect(() => {
    const selectedPurpose = tripPurpose.find((tp) => tp.id === tripPurposeValue);
    setData((prev) => ({
      ...prev,
      room_id: roomDetails?.id,
      pax,
      num_adults: numberOfAdults,
      num_children: numberOfChildren,
      num_infants: numberOfInfants,
      check_in_date: checkIn || undefined,
      check_out_date: checkOut || undefined,
      trip_purpose: tripPurposeValue === '5' ? customPurpose : selectedPurpose?.label || customPurpose,
      local_counts: parseInt(typeCounts['1'] || '0') || 0,
      domestic_counts: parseInt(typeCounts['2'] || '0') || 0,
      foreign_counts: parseInt(typeCounts['3'] || '0') || 0,
      overseas_counts: parseInt(typeCounts['4'] || '0') || 0,
    }));
  }, [
    pax,
    numberOfAdults,
    numberOfChildren,
    numberOfInfants,
    checkIn,
    checkOut,
    tripPurposeValue,
    customPurpose,
    typeCounts,
    setData,
    roomDetails?.id,
  ]);

  return (
    <ScrollView>
      <PageContainer padding={16} gap={16}>
        <DateInput
          requireConfirmation
          selectionVariant="filled"
          mode="range"
          label="Select Date Range"
          dateStatuses={statusMap}
          enableSingleStatusVisuals
          showStatusLegend
          rangePlaceholder={{ start: 'Check-in', end: 'Check-out' }}
          rangeValue={{ start: checkIn, end: checkOut }}
          onRangeChange={({ start, end }) => {
            setCheckIn(start || null);
            setCheckOut(end || null);
          }}
          rangePlaceholderValue={{ start: 'Check-in', end: 'Check-out' }}
          disablePast
          overlapAlertMessage="Your selected range includes already booked dates for this room. Please choose different dates."
        />

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
            if (num < 1) return 'At least 1 pax is required';
            if (num > 20) return 'Maximum 20 pax allowed';
            return null;
          }}
          value={pax === 0 ? '' : pax.toString()}
        />

        <Container direction="row" padding={0} backgroundColor="transparent">
          <FormTextInput
            size="small"
            keyboardType="numeric"
            label="Adult(s)"
            placeholder="Auto"
            editable={false}
            value={numberOfAdults.toString()}
          />

          <FormTextInput
            size="small"
            keyboardType="numeric"
            label="Children"
            maxLength={2}
            placeholder="No. of children(s)"
            pattern={/^[0-9]\d*$/}
            validateOnBlur
            customValidator={(value) => {
              if (value === '') return null; // Optional
              const num = parseInt(value);
              if (num > 10) return 'Maximum 10 children allowed';
              if (num + numberOfInfants > pax) return 'Exceeds pax';
              return null;
            }}
            onChangeText={(value) => {
              let num = parseInt(value) || 0;
              if (num > pax) num = pax; // cap
              // adjust infants if overflow
              if (num + numberOfInfants > pax) {
                const remaining = pax - num;
                setNumberOfInfants(Math.max(0, remaining));
              }
              setNumberOfChildren(num);
            }}
            value={numberOfChildren === 0 ? '' : numberOfChildren.toString()}
          />

          <FormTextInput
            size="small"
            keyboardType="numeric"
            label="Infants"
            maxLength={2}
            placeholder="No. of infant(s)"
            pattern={/^[0-9]\d*$/}
            validateOnBlur
            customValidator={(value) => {
              if (value === '') return null; // Optional
              const num = parseInt(value);
              if (num > 10) return 'Maximum 10 infants allowed';
              if (num + numberOfChildren > pax) return 'Exceeds pax';
              return null;
            }}
            onChangeText={(value) => {
              let num = parseInt(value) || 0;
              if (num > pax) num = pax; // cap
              if (num + numberOfChildren > pax) {
                const remaining = pax - numberOfChildren;
                num = Math.max(0, remaining);
              }
              setNumberOfInfants(num);
            }}
            value={numberOfInfants === 0 ? '' : numberOfInfants.toString()}
          />
        </Container>

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
