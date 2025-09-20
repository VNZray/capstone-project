import Button from '@/components/Button';
import PageContainer from '@/components/PageContainer';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BookingForm from './booking/BookingForm';
import Payment from './booking/Payment';
import Summary from './booking/Summary';
const booking = () => {
  const insets = useSafeAreaInsets();
  const { roomDetails } = useRoom();
  const { user } = useAuth();
  const navigation = useNavigation();

  const [step, setStep] = React.useState<'booking' | 'payment' | 'summary'>(
    'booking'
  );

  const sendBookingConfirmation = () => {
    // Here you would typically send the booking data to your backend server
    // For this example, we'll just log the booking details to the console
    console.log('Booking confirmed for user:', user?.id, 'Room:', roomDetails);
    // You can also show a success message or navigate to a different screen
  }

  useEffect(() => {
    step === 'booking' && navigation.setOptions({ title: 'Booking' });
    step === 'payment' && navigation.setOptions({ title: 'Payment' });
    step === 'summary' && navigation.setOptions({ title: 'Summary' });
  }, [step, navigation]);

  return (
    <PageContainer>
      <View>
        {step === 'booking' && <BookingForm />}
        {step === 'payment' && <Payment />}
        {step === 'summary' && <Summary />}
      </View>

      <View style={[styles.fabBar, { paddingBottom: 62 + insets.bottom }]}>
        <Button
          label="Previous"
          style={{ flex: 1 }}
          onPress={() => {
            if (step === 'payment') setStep('booking');
            else if (step === 'summary') setStep('payment');
          }}
        />

        <Button
          label={
            step === 'booking'
              ? 'Proceed to Payment'
              : step === 'payment'
              ? 'Proceed to Summary'
              : 'Finish Booking'
          }
          fullWidth
          color="primary"
          variant="solid"
          elevation={3}
          style={{ flex: 1 }}
          onPress={() => {
            if (step === 'booking') setStep('payment');
            else if (step === 'payment') setStep('summary');
            else if (step === 'summary') {
              sendBookingConfirmation();
              navigation.goBack();
            }
          }}
        />
      </View>
    </PageContainer>
  );
};

export default booking;

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
    // subtle backdrop & blur alternative (blur not added by default RN)
  },
});
