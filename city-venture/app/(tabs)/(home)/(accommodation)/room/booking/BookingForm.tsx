import Checklist, { ChecklistItem, ChecklistRef } from '@/components/Checklist';
import Container from '@/components/Container';
import PageContainer from '@/components/PageContainer';
import RadioButton, { RadioItem } from '@/components/RadioButton';
import FormTextInput from '@/components/TextInput';
import { DateAvailabilityInfo } from '@/components/ui/DateTimeRangePicker';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { fetchAllBookings } from '@/services/AccommodationService';
import { Booking, BookingPayment } from '@/types/Booking';
import debugLogger from '@/utils/debugLogger';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/color';
import { format, addDays } from 'date-fns';
import BookingDateTimeModal from './modal/BookingDateTimeModal';

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

const bookingTypes: RadioItem[] = [
  { id: 'overnight', label: 'Overnight Stay (One or more nights)' },
  { id: 'short-stay', label: 'Short Stay (1 hour or more)' },
];

const hourlyOptions: RadioItem[] = [
  { id: '1', label: '1 Hour' },
  { id: '2', label: '2 Hours' },
  { id: '3', label: '3 Hours' },
  { id: '4', label: '4 Hours' },
  { id: '5', label: '5 Hours' },
  { id: '6', label: '6 Hours' },
  { id: '8', label: '8 Hours' },
  { id: '12', label: '12 Hours' },
];

type Props = {
  data: Booking;
  payment: BookingPayment;
  setData: React.Dispatch<React.SetStateAction<Booking>>;
  setPayment: React.Dispatch<React.SetStateAction<BookingPayment>>;
};

const BookingForm: React.FC<Props> = ({
  data,
  payment,
  setData,
  setPayment,
}) => {
  const { roomDetails, selectedDateRange } = useRoom();
  const { user } = useAuth();

  // Core counts
  const [pax, setPax] = useState<number>(data.pax || 0);
  const [numberOfAdults, setNumberOfAdults] = useState<number>(
    data.num_adults || 0
  );
  const [numberOfChildren, setNumberOfChildren] = useState<number>(
    data.num_children || 0
  );
  const [numberOfInfants, setNumberOfInfants] = useState<number>(
    data.num_infants || 0
  );

  // Booking type
  const [bookingType, setBookingType] = useState<string>(
    data.booking_type || 'overnight'
  );

  // Traveler types & purpose
  const listRef = useRef<ChecklistRef>(null);
  const [selectedTypes, setSelectedTypes] = useState<ChecklistItem[]>([]);
  const [typeCounts, setTypeCounts] = useState<Record<string, string>>({});
  const [tripPurposeValue, setTripPurposeValue] = useState<string>(
    tripPurpose.find((tp) => tp.label === data.trip_purpose)?.id?.toString() ||
      ''
  );
  const [customPurpose, setCustomPurpose] = useState('');

  // Date range - Initialize from context if available
  const [checkInDate, setCheckInDate] = useState<Date | null>(
    (data.check_in_date as Date) || selectedDateRange.start || null
  );
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(
    (data.check_out_date as Date) || selectedDateRange.end || null
  );

  // Time states for check-in and check-out
  const [checkInTime, setCheckInTime] = useState<Date>(new Date());
  const [checkOutTime, setCheckOutTime] = useState<Date>(new Date());

  // Modal visibility
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Status map for current user's own bookings (self-blocking only)
  const [statusMap, setStatusMap] = useState<
    Record<string, 'reserved' | 'occupied' | 'unavailable'>
  >({});

  // Availability data for DateTimeRangePicker
  const [availabilityData, setAvailabilityData] = useState<
    DateAvailabilityInfo[]
  >([]);

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
          (b: any) =>
            String(b.room_id) === String(roomDetails.id) &&
            String(b.tourist_id) === String(user.id)
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
          for (
            let d = new Date(start);
            d.getTime() <= end.getTime();
            d.setDate(d.getDate() + 1)
          ) {
            const key = toYMD(d);
            if (b.booking_status === 'Canceled') continue; // Do not block canceled
            if (b.booking_status === 'Checked-In') map[key] = 'occupied';
            else if (b.booking_status === 'Reserved') map[key] = 'reserved';
            else if (b.booking_status === 'Pending') map[key] = 'unavailable';
            // treat pending self booking as unavailable to avoid duplicates
            else if (b.booking_status === 'Booked') map[key] = 'unavailable';
          }
        });
        setStatusMap(map);

        // Convert statusMap to availabilityData for DateTimeRangePicker
        const availData: DateAvailabilityInfo[] = [];
        const today = new Date();
        for (let i = 0; i < 90; i++) {
          const date = addDays(today, i);
          const key = toYMD(date);
          const status = map[key];

          availData.push({
            date,
            status:
              status === 'occupied'
                ? 'occupied'
                : status === 'reserved'
                ? 'reserved'
                : 'available',
            availableRooms: status ? 0 : 1, // Simplified - 0 if booked, 1 if available
            totalRooms: 1,
          });
        }
        setAvailabilityData(availData);
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
    const selectedPurpose = tripPurpose.find(
      (tp) => tp.id === tripPurposeValue
    );

    // Format dates and times for the booking data
    // For short-stay: both dates might be the same day (e.g., Dec 1 10am - 2pm)
    // For overnight: dates are typically different days
    const formattedCheckIn = checkInDate
      ? format(checkInDate, 'yyyy-MM-dd')
      : undefined;
    const formattedCheckOut = checkOutDate
      ? format(checkOutDate, 'yyyy-MM-dd')
      : undefined;

    // Format times - these can span across midnight for short-stay
    const formattedCheckInTime = checkInTime
      ? format(checkInTime, 'HH:mm:ss')
      : undefined;

    const formattedCheckOutTime = checkOutTime
      ? format(checkOutTime, 'HH:mm:ss')
      : undefined;

    setData((prev) => ({
      ...prev,
      room_id: roomDetails?.id,
      pax,
      num_adults: numberOfAdults,
      num_children: numberOfChildren,
      num_infants: numberOfInfants,
      check_in_date: formattedCheckIn as any,
      check_out_date: formattedCheckOut as any,

      // Include times - critical for short-stay bookings within the same day
      check_in_time: formattedCheckInTime,
      check_out_time: formattedCheckOutTime,

      booking_type: bookingType as 'overnight' | 'short-stay',
      trip_purpose:
        tripPurposeValue === '5'
          ? customPurpose
          : selectedPurpose?.label || customPurpose,
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
    checkInDate,
    checkOutDate,
    checkInTime,
    checkOutTime,
    bookingType,
    tripPurposeValue,
    customPurpose,
    typeCounts,
    setData,
    roomDetails?.id,
  ]);

  return (
    <ScrollView>
      <PageContainer padding={16} gap={16} style={{ paddingBottom: 100 }}>
        <RadioButton
          label="Booking Type"
          items={bookingTypes}
          value={bookingType}
          onChange={(item) =>
            setBookingType(item?.id?.toString() || 'overnight')
          }
        />

        {/* Booking Date/Time Display Card */}
        <Pressable
          style={styles.bookingCard}
          onPress={() => setShowBookingModal(true)}
        >
          <View style={styles.bookingCardHeader}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color={Colors.light.primary}
            />
            <View style={{ flex: 1 }}>
              <ThemedText type="label-medium" weight="semi-bold">
                {bookingType === 'short-stay'
                  ? 'Short Stay Details'
                  : 'Check-in / Check-out'}
              </ThemedText>
              <ThemedText
                type="body-small"
                style={{ color: Colors.light.textSecondary }}
              >
                {checkInDate && checkOutDate
                  ? bookingType === 'short-stay'
                    ? `${format(checkInDate, 'MMM dd, yyyy')} • ${format(
                        checkInTime,
                        'hh:mm a'
                      )} - ${format(checkOutTime, 'hh:mm a')}`
                    : `${format(checkInDate, 'MMM dd')} - ${format(
                        checkOutDate,
                        'MMM dd, yyyy'
                      )}`
                  : 'Tap to select dates and times'}
              </ThemedText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.light.textSecondary}
            />
          </View>
        </Pressable>

        {/* Booking Date/Time Modal */}
        <BookingDateTimeModal
          visible={showBookingModal}
          bookingType={bookingType as 'overnight' | 'short-stay'}
          onClose={() => setShowBookingModal(false)}
          onConfirm={(checkIn, checkOut, checkInT, checkOutT) => {
            setCheckInDate(checkIn);
            setCheckOutDate(checkOut);
            setCheckInTime(checkInT);
            setCheckOutTime(checkOutT);
          }}
          initialCheckInDate={checkInDate}
          initialCheckOutDate={checkOutDate}
          initialCheckInTime={checkInTime}
          initialCheckOutTime={checkOutTime}
          dateStatuses={statusMap}
          availabilityData={availabilityData}
          roomId={roomDetails?.id}
          businessId={roomDetails?.business_id}
          minDate={new Date()}
          maxDate={addDays(new Date(), 365)}
        />

        <Container direction="row" padding={0} backgroundColor="transparent">
          <FormTextInput
            size="small"
            keyboardType="numeric"
            label="Pax"
            placeholder="e.g., 4"
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

          <FormTextInput
            size="small"
            keyboardType="numeric"
            label="Adult(s)"
            placeholder="e.g., 2"
            editable={false}
            value={numberOfAdults.toString()}
          />
        </Container>

        <Container direction="row" padding={0} backgroundColor="transparent">
          <FormTextInput
            size="small"
            keyboardType="numeric"
            label="Children"
            maxLength={2}
            placeholder="e.g., 2"
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
            placeholder="e.g., 2"
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

const styles = StyleSheet.create({
  bookingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
