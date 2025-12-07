import Button from '@/components/Button';
import PageContainer from '@/components/PageContainer';
import { useRoom } from '@/context/RoomContext';
import { Booking, BookingPayment } from '@/types/Booking';
import { useNavigation, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { background } from '@/constants/color';
import BookingForm from './BookingForm';
import { Routes } from '@/routes';

/**
 * Booking Index Page - BookingForm only
 * Navigation flow: index → BookingDate (select dates) → index → Billing (payment)
 */
const BookingIndex = () => {
  const insets = useSafeAreaInsets();
  const { roomDetails } = useRoom();
  const navigation = useNavigation();
  const router = useRouter();

  const [bookingData, setBookingData] = React.useState<Booking>({
    pax: 1,
    num_adults: 1,
    num_children: 0,
    num_infants: 0,
    foreign_counts: 0,
    domestic_counts: 0,
    overseas_counts: 0,
    local_counts: 1,
    business_id: roomDetails?.business_id,
  });

  const [paymentData, setPaymentData] = React.useState<BookingPayment>({
    payment_type: 'Full Payment',
    amount: 0,
  });

  // Validation for booking form
  const isFormValid = (): boolean => {
    const paxValid = typeof bookingData.pax === 'number' && bookingData.pax > 0;
    const datesValid =
      !!bookingData.check_in_date && !!bookingData.check_out_date;
    const tripPurposeValid =
      !!bookingData.trip_purpose && bookingData.trip_purpose.trim().length > 0;

    const travelerCountsSum =
      (bookingData.local_counts || 0) +
      (bookingData.domestic_counts || 0) +
      (bookingData.foreign_counts || 0) +
      (bookingData.overseas_counts || 0);
    const travelerCountsValid = travelerCountsSum > 0;

    return paxValid && datesValid && tripPurposeValid && travelerCountsValid;
  };

  // Get validation message
  const getValidationMessage = (): string | null => {
    if (typeof bookingData.pax !== 'number' || bookingData.pax < 1) {
      return 'Please enter number of guests (pax)';
    }
    if (!bookingData.check_in_date || !bookingData.check_out_date) {
      return 'Please select check-in and check-out dates';
    }
    if (
      !bookingData.trip_purpose ||
      bookingData.trip_purpose.trim().length === 0
    ) {
      return 'Please select a trip purpose';
    }
    const travelerCountsSum =
      (bookingData.local_counts || 0) +
      (bookingData.domestic_counts || 0) +
      (bookingData.foreign_counts || 0) +
      (bookingData.overseas_counts || 0);
    if (travelerCountsSum === 0) {
      return 'Please select at least one traveler type and enter count';
    }
    return null;
  };

  // Navigate to Billing page
  const handleProceedToPayment = () => {
    const validationMsg = getValidationMessage();
    if (validationMsg) {
      Alert.alert('Incomplete Information', validationMsg);
      return;
    }

    router.push({
      pathname: '/(tabs)/(home)/(accommodation)/room/(booking)/Billing',
      params: {
        bookingData: JSON.stringify(bookingData),
        paymentData: JSON.stringify(paymentData),
      },
    });
  };

  // Handle cancel
  const handleCancel = () => {
    router.push(Routes.accommodation.room.profile(roomDetails?.id || ''));
  };

  const colorScheme = useColorScheme();
  const bgColor = colorScheme === 'dark' ? background.dark : background.light;

  const TAB_BAR_HEIGHT = 60;

  return (
    <PageContainer padding={0}>
      <View style={{ flex: 1 }}>
        <BookingForm
          data={bookingData}
          setData={setBookingData}
          payment={paymentData}
          setPayment={setPaymentData}
        />
      </View>

      {/* Fixed Bottom Actions */}
      <View
        style={[
          styles.fabBar,
          {
            paddingBottom:
              Platform.OS === 'ios'
                ? insets.bottom + TAB_BAR_HEIGHT
                : 12 + insets.bottom + TAB_BAR_HEIGHT,
            paddingTop: Platform.OS === 'ios' ? 16 : 12,
            backgroundColor: bgColor,
          },
        ]}
      >
        <Button
          label="Cancel"
          style={{ flex: 1 }}
          variant="outlined"
          onPress={handleCancel}
        />

        <Button
          label="Proceed to Payment"
          fullWidth
          color="primary"
          variant="solid"
          elevation={3}
          style={{
            flex: 1,
            opacity: !isFormValid() ? 0.6 : 1,
          }}
          disabled={!isFormValid()}
          onPress={handleProceedToPayment}
        />
      </View>
    </PageContainer>
  );
};

export default BookingIndex;

const styles = StyleSheet.create({
  fabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});
