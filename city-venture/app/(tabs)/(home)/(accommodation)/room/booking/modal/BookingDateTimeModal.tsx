import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { ThemedText } from '../../../../../../../components/themed-text';
import { Colors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import { format, addHours, set } from 'date-fns';
import DateInput from '../../../../../../../components/DateInput';
import RadioButton, {
  RadioItem,
} from '../../../../../../../components/RadioButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  DateTimeRangePicker,
  DateAvailabilityInfo,
} from '../../../../../../../components/ui/DateTimeRangePicker';
import BaseModal from '../../../../../../../components/BaseModal';

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

type BookingDateTimeModalProps = {
  visible: boolean;
  bookingType: 'overnight' | 'short-stay';
  onClose: () => void;
  onConfirm: (
    checkInDate: Date,
    checkOutDate: Date,
    checkInTime: Date,
    checkOutTime: Date
  ) => void;
  initialCheckInDate?: Date | null;
  initialCheckOutDate?: Date | null;
  initialCheckInTime?: Date;
  initialCheckOutTime?: Date;
  dateStatuses?: Record<string, 'reserved' | 'occupied' | 'unavailable'>;
  availabilityData?: DateAvailabilityInfo[];
  roomId?: string;
  businessId?: string;
  minDate?: Date;
  maxDate?: Date;
};

const BookingDateTimeModal: React.FC<BookingDateTimeModalProps> = ({
  visible,
  bookingType,
  onClose,
  onConfirm,
  initialCheckInDate,
  initialCheckOutDate,
  initialCheckInTime,
  initialCheckOutTime,
  dateStatuses = {},
  availabilityData = [],
  roomId,
  businessId,
  minDate,
  maxDate,
}) => {
  // Short-stay states
  const [shortStayDate, setShortStayDate] = useState<Date | null>(
    initialCheckInDate ?? null
  );
  const [shortStayTime, setShortStayTime] = useState<Date>(
    initialCheckInTime || new Date()
  );
  const [shortStayDuration, setShortStayDuration] = useState<string>('3');
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Overnight states
  const [showDateTimeRangePicker, setShowDateTimeRangePicker] = useState(false);
  const [overnightCheckIn, setOvernightCheckIn] = useState<Date | null>(
    initialCheckInDate ?? null
  );
  const [overnightCheckOut, setOvernightCheckOut] = useState<Date | null>(
    initialCheckOutDate ?? null
  );
  const [overnightCheckInTime, setOvernightCheckInTime] = useState<Date>(
    initialCheckInTime || new Date()
  );
  const [overnightCheckOutTime, setOvernightCheckOutTime] = useState<Date>(
    initialCheckOutTime || new Date()
  );

  // Reset states when modal opens with new initial values
  useEffect(() => {
    if (visible) {
      setShortStayDate(initialCheckInDate ?? null);
      setShortStayTime(initialCheckInTime || new Date());
      setOvernightCheckIn(initialCheckInDate ?? null);
      setOvernightCheckOut(initialCheckOutDate ?? null);
      setOvernightCheckInTime(initialCheckInTime || new Date());
      setOvernightCheckOutTime(initialCheckOutTime || new Date());
    }
  }, [
    visible,
    initialCheckInDate,
    initialCheckOutDate,
    initialCheckInTime,
    initialCheckOutTime,
  ]);

  const handleShortStayConfirm = () => {
    if (!shortStayDate) return;

    const hours = parseInt(shortStayDuration, 10) || 1;

    // Combine date and time
    const startDateTime = new Date(
      shortStayDate.getFullYear(),
      shortStayDate.getMonth(),
      shortStayDate.getDate(),
      shortStayTime.getHours(),
      shortStayTime.getMinutes(),
      shortStayTime.getSeconds()
    );

    // Calculate end time
    const endDateTime = addHours(startDateTime, hours);

    onConfirm(startDateTime, endDateTime, startDateTime, endDateTime);
    onClose();
  };

  const handleOvernightConfirm = () => {
    if (!overnightCheckIn || !overnightCheckOut) return;

    const checkIn = new Date(
      overnightCheckIn.getFullYear(),
      overnightCheckIn.getMonth(),
      overnightCheckIn.getDate(),
      overnightCheckInTime.getHours(),
      overnightCheckInTime.getMinutes(),
      overnightCheckInTime.getSeconds()
    );

    const checkOut = new Date(
      overnightCheckOut.getFullYear(),
      overnightCheckOut.getMonth(),
      overnightCheckOut.getDate(),
      overnightCheckOutTime.getHours(),
      overnightCheckOutTime.getMinutes(),
      overnightCheckOutTime.getSeconds()
    );

    onConfirm(checkIn, checkOut, overnightCheckInTime, overnightCheckOutTime);
    onClose();
  };

  const calculatedEndTime =
    shortStayDate && shortStayTime
      ? addHours(
          new Date(
            shortStayDate.getFullYear(),
            shortStayDate.getMonth(),
            shortStayDate.getDate(),
            shortStayTime.getHours(),
            shortStayTime.getMinutes(),
            shortStayTime.getSeconds()
          ),
          parseInt(shortStayDuration, 10) || 1
        )
      : null;

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={
        bookingType === 'short-stay'
          ? 'Short Stay Booking'
          : 'Overnight Booking'
      }
      subtitle={
        bookingType === 'short-stay'
          ? 'Select date, time, and duration'
          : 'Select check-in and check-out dates'
      }
      primaryButtonLabel="Confirm"
      onPrimaryPress={
        bookingType === 'short-stay'
          ? handleShortStayConfirm
          : handleOvernightConfirm
      }
      primaryButtonDisabled={
        bookingType === 'short-stay'
          ? !shortStayDate
          : !overnightCheckIn || !overnightCheckOut
      }
      secondaryButtonLabel="Cancel"
      onSecondaryPress={onClose}
    >
      {bookingType === 'short-stay' ? (
        <>
          {/* Date Selection */}
          <View>
            <ThemedText
              type="label-medium"
              weight="semi-bold"
              style={{ marginBottom: 8 }}
            >
              Select Date
            </ThemedText>
            <DateInput
              requireConfirmation
              selectionVariant="filled"
              mode="single"
              label=""
              dateStatuses={dateStatuses}
              enableSingleStatusVisuals
              showStatusLegend
              placeholder="Select date"
              value={shortStayDate}
              onChange={(date) => {
                setShortStayDate(date);
                if (date) {
                  setShortStayTime((prev) => {
                    const t = prev instanceof Date ? prev : new Date();
                    return new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                      t.getHours(),
                      t.getMinutes(),
                      t.getSeconds()
                    );
                  });
                }
              }}
              disablePast
            />
          </View>

          {/* Time Selection */}
          <View style={styles.timePickerContainer}>
            <ThemedText
              type="label-medium"
              weight="semi-bold"
              style={{ marginBottom: 8 }}
            >
              Check-in Time
            </ThemedText>
            <Pressable
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons
                name="time-outline"
                size={20}
                color={Colors.light.primary}
              />
              <ThemedText type="body-medium" weight="medium">
                {shortStayDate
                  ? format(shortStayTime, 'hh:mm a')
                  : 'Select time'}
              </ThemedText>
            </Pressable>
          </View>

          {showTimePicker && (
            <View>
              <Pressable onPress={() => setShowTimePicker(false)} />
              {Platform.OS === 'ios' ? (
                <BaseModal
                  title="Check-in Time"
                  visible={showTimePicker}
                  onClose={() => setShowTimePicker(false)}
                  scrollable={false}
                  primaryButtonLabel="Done"
                  onPrimaryPress={() => setShowTimePicker(false)}
                  secondaryButtonLabel="Cancel"
                  onSecondaryPress={() => setShowTimePicker(false)}
                >
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    <DateTimePicker
                      value={shortStayTime}
                      mode="time"
                      display="spinner"
                      onChange={(event, selectedTime) => {
                        if (selectedTime) setShortStayTime(selectedTime);
                      }}
                    />
                  </View>
                </BaseModal>
              ) : (
                <View style={{ display: 'flex', alignItems: 'center' }}>
                  <DateTimePicker
                    value={shortStayTime}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      setShowTimePicker(false);
                      if (selectedTime) setShortStayTime(selectedTime);
                    }}
                  />
                </View>
              )}
            </View>
          )}

          {/* Duration */}
          <RadioButton
            label="Duration"
            items={hourlyOptions}
            value={shortStayDuration}
            onChange={(item) => setShortStayDuration(String(item?.id ?? '3'))}
          />

          {/* Summary */}
          {shortStayDate && calculatedEndTime && (
            <View style={styles.summaryCard}>
              <Ionicons
                name="information-circle"
                size={20}
                color={Colors.light.primary}
              />
              <View style={{ flex: 1 }}>
                <ThemedText
                  type="body-small"
                  weight="semi-bold"
                  style={{ color: Colors.light.primary, marginBottom: 4 }}
                >
                  Booking Summary
                </ThemedText>
                <ThemedText
                  type="body-small"
                  style={{ color: Colors.light.textSecondary }}
                >
                  {format(shortStayDate, 'MMM dd, yyyy')} •{' '}
                  {format(shortStayTime, 'hh:mm a')} -{' '}
                  {format(calculatedEndTime, 'hh:mm a')}
                  {shortStayDate.toDateString() !==
                    calculatedEndTime.toDateString() &&
                    ` (${format(calculatedEndTime, 'MMM dd')})`}
                </ThemedText>
                <ThemedText
                  type="body-small"
                  weight="medium"
                  style={{ color: Colors.light.primary, marginTop: 2 }}
                >
                  {shortStayDuration} hour
                  {parseInt(shortStayDuration) > 1 ? 's' : ''} stay
                </ThemedText>
              </View>
            </View>
          )}
        </>
      ) : (
        <>
          {/* Overnight Date Range Display */}
          <Pressable
            style={styles.dateRangeDisplay}
            onPress={() => setShowDateTimeRangePicker(true)}
          >
            <View style={styles.dateRangeContent}>
              <View style={styles.dateColumn}>
                <View style={styles.iconLabel}>
                  <Ionicons
                    name="calendar"
                    size={16}
                    color={Colors.light.primary}
                  />
                  <ThemedText
                    type="label-small"
                    style={{ color: Colors.light.textSecondary }}
                  >
                    Check-in
                  </ThemedText>
                </View>
                <ThemedText type="body-medium" weight="semi-bold">
                  {overnightCheckIn
                    ? format(overnightCheckIn, 'MMM dd, yyyy')
                    : 'Select date'}
                </ThemedText>
                <ThemedText
                  type="body-small"
                  style={{ color: Colors.light.textSecondary }}
                >
                  {overnightCheckIn
                    ? format(overnightCheckInTime, 'hh:mm a')
                    : '--:-- --'}
                </ThemedText>
              </View>

              <Ionicons
                name="arrow-forward"
                size={20}
                color={Colors.light.textSecondary}
              />

              <View style={styles.dateColumn}>
                <View style={styles.iconLabel}>
                  <Ionicons
                    name="calendar"
                    size={16}
                    color={Colors.light.primary}
                  />
                  <ThemedText
                    type="label-small"
                    style={{ color: Colors.light.textSecondary }}
                  >
                    Check-out
                  </ThemedText>
                </View>
                <ThemedText type="body-medium" weight="semi-bold">
                  {overnightCheckOut
                    ? format(overnightCheckOut, 'MMM dd, yyyy')
                    : 'Select date'}
                </ThemedText>
                <ThemedText
                  type="body-small"
                  style={{ color: Colors.light.textSecondary }}
                >
                  {overnightCheckOut
                    ? format(overnightCheckOutTime, 'hh:mm a')
                    : '--:-- --'}
                </ThemedText>
              </View>
            </View>

            <View style={styles.changeButtonContainer}>
              <Ionicons
                name="create-outline"
                size={18}
                color={Colors.light.primary}
              />
              <ThemedText
                type="body-small"
                weight="semi-bold"
                style={{ color: Colors.light.primary }}
              >
                {overnightCheckIn && overnightCheckOut
                  ? 'Change Dates & Times'
                  : 'Select Dates & Times'}
              </ThemedText>
            </View>
          </Pressable>

          {/* DateTimeRangePicker Modal */}
          <DateTimeRangePicker
            visible={showDateTimeRangePicker}
            onClose={() => setShowDateTimeRangePicker(false)}
            onConfirm={(startDate, endDate, startTime, endTime) => {
              setOvernightCheckIn(startDate);
              setOvernightCheckOut(endDate);
              setOvernightCheckInTime(startTime);
              setOvernightCheckOutTime(endTime);
              setShowDateTimeRangePicker(false);
            }}
            initialStartDate={overnightCheckIn || undefined}
            initialEndDate={overnightCheckOut || undefined}
            initialStartTime={overnightCheckInTime}
            initialEndTime={overnightCheckOutTime}
            availabilityData={availabilityData}
            roomId={roomId}
            businessId={businessId}
            minDate={minDate || new Date()}
            maxDate={maxDate}
          />
        </>
      )}
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  timePickerContainer: {
    gap: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.surfaceOverlay,
    borderWidth: 1,
    borderColor: Colors.light.primary + '30',
  },
  dateRangeDisplay: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: Colors.light.surface,
    gap: 12,
    borderColor: Colors.light.border,
  },
  dateRangeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateColumn: {
    flex: 1,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  changeButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.surfaceOverlay,
  },
});

export default BookingDateTimeModal;
