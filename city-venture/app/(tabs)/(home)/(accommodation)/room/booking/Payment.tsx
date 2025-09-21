import Container from '@/components/Container';
import DateInput from '@/components/DateInput';
import PageContainer from '@/components/PageContainer';
import RadioButton from '@/components/RadioButton';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { useRoom } from '@/context/RoomContext';
import { Booking, BookingPayment, Guests } from '@/types/Booking';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

type Props = {
  data: Booking;
  guests: Guests;
  payment: BookingPayment;
  setData: React.Dispatch<React.SetStateAction<Booking>>;
  setGuests: React.Dispatch<React.SetStateAction<Guests>>;
  setPayment: React.Dispatch<React.SetStateAction<BookingPayment>>;
};

const Payment: React.FC<Props> = ({
  data,
  guests,
  payment,
  setData,
  setGuests,
  setPayment,
}) => {
    const { roomDetails } = useRoom();
  
  const [checkIn, setCheckIn] = useState<Date | null>(data.check_in_date || new Date());
  const [checkOut, setCheckOut] = useState<Date | null>(data.check_out_date || null);

  // Calculate days and nights
  let days = 0;
  let nights = 0;
  if (checkIn && checkOut) {
    // Normalize to midnight to avoid timezone issues
    const inDate = new Date(
      checkIn.getFullYear(),
      checkIn.getMonth(),
      checkIn.getDate()
    );
    const outDate = new Date(
      checkOut.getFullYear(),
      checkOut.getMonth(),
      checkOut.getDate()
    );
    const diff = (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24);
    days = diff > 0 ? diff : 0;
    nights = days > 0 ? days - 1 : 0;
  }

  const [paymentMethod, setPaymentMethod] = useState<string | null>(payment.payment_method || null);

  // Discounts (future implementation). Each discount: positive amount to subtract from subtotal.
  // Example structure left empty for now; can be populated by promo code logic later.
  const [discounts, setDiscounts] = useState<{ label: string; amount: number }[]>([]);

  // Base room price (without fees) only when date range valid
  const baseRoomPrice = useMemo(() => {
    if (!roomDetails?.room_price || days <= 0) return 0;
    return Number(roomDetails.room_price) * days;
  }, [roomDetails?.room_price, days]);

  // Fixed booking fee (apply only if base price exists)
  const bookingFee = baseRoomPrice > 0 ? 50 : 0;

  // Transaction fee assumption: 3% of base room price for non-cash online methods; 0 otherwise.
  const transactionFee = useMemo(() => {
    if (!baseRoomPrice) return 0;
    if (!paymentMethod || paymentMethod === 'Cash') return 0;
    return Math.round(baseRoomPrice * 0.03); // TODO: replace with real gateway fee logic
  }, [baseRoomPrice, paymentMethod]);

  const discountTotal = useMemo(
    () => discounts.reduce((sum, d) => sum + (d.amount > 0 ? d.amount : 0), 0),
    [discounts]
  );

  const subtotal = baseRoomPrice + bookingFee + transactionFee;
  const totalPayable = Math.max(subtotal - discountTotal, 0);

  // persist booking and payment changes upward
  useEffect(() => {
    setData(prev => ({
      ...prev,
      check_in_date: checkIn || undefined,
      check_out_date: checkOut || undefined,
      total_price: totalPayable || undefined,
    }));
  }, [checkIn, checkOut, totalPayable, setData]);

  useEffect(() => {
    setPayment(prev => ({
      ...prev,
      payment_method: paymentMethod as BookingPayment['payment_method'],
      amount: totalPayable,
    }));
  }, [paymentMethod, totalPayable, setPayment]);

  return (
    <ScrollView>
      <PageContainer padding={16} gap={16}>
        <Container padding={0} direction="row" backgroundColor="transparent">
          <DateInput
            selectionVariant="filled"
            size="small"
            style={{ flex: 1 }}
            requireConfirmation={true}
            label="Check-in Date"
            value={checkIn}
            onChange={setCheckIn}
          />
          <DateInput
            selectionVariant="filled"
            size="small"
            style={{ flex: 1 }}
            requireConfirmation={true}
            label="Check-out Date"
            value={checkOut}
            onChange={setCheckOut}
            minDate={checkIn || undefined}
          />
        </Container>
        <Container gap={8}>
          <ThemedText type="card-title-small" weight="medium">
            Details
          </ThemedText>

          <Container
            padding={0}
            backgroundColor="transparent"
            direction="row"
            justify="space-between"
          >
            <ThemedText type="body-extra-small" weight="medium">
              Day's of Stay
            </ThemedText>

            <ThemedText type="body-extra-small" weight="medium">
              {checkIn && checkOut && days > 0
                ? `${days} day${days > 1 ? 's' : ''} / ${nights} night${
                    nights !== 1 ? 's' : ''
                  }`
                : 'Select check-in and check-out dates'}
            </ThemedText>
          </Container>

          <Container
            padding={0}
            backgroundColor="transparent"
            direction="row"
            justify="space-between"
          >
            <ThemedText type="body-extra-small" weight="medium">Room Price</ThemedText>
            <ThemedText type="body-extra-small" weight="medium">
              {baseRoomPrice > 0 ? `₱${baseRoomPrice.toLocaleString()}` : '—'}
            </ThemedText>
          </Container>
          <Container
            padding={0}
            backgroundColor="transparent"
            direction="row"
            justify="space-between"
          >
            <ThemedText type="body-extra-small" weight="medium">Booking Fee</ThemedText>
            <ThemedText type="body-extra-small" weight="medium">
              {bookingFee ? `₱${bookingFee.toLocaleString()}` : '—'}
            </ThemedText>
          </Container>
          <Container
            padding={0}
            backgroundColor="transparent"
            direction="row"
            justify="space-between"
          >
            <ThemedText type="body-extra-small" weight="medium">Transaction Fee</ThemedText>
            <ThemedText type="body-extra-small" weight="medium">
              {transactionFee ? `₱${transactionFee.toLocaleString()}` : '—'}
            </ThemedText>
          </Container>
          <Container
            padding={0}
            backgroundColor="transparent"
            direction="row"
            justify="space-between"
          >
            <ThemedText type="body-extra-small" weight="medium">Subtotal</ThemedText>
            <ThemedText type="body-extra-small" weight="medium">
              {subtotal > 0 ? `₱${subtotal.toLocaleString()}` : '—'}
            </ThemedText>
          </Container>
        </Container>

        <Container gap={8}>
          <ThemedText type="card-title-small" weight="medium">
            Discounts
          </ThemedText>
          {discounts.length === 0 && (
            <ThemedText type="body-extra-small" style={{ opacity: 0.6 }}>
              No discounts applied.
            </ThemedText>
          )}
          {discounts.map(d => (
            <Container
              key={d.label}
              padding={0}
              backgroundColor="transparent"
              direction="row"
              justify="space-between"
            >
              <ThemedText type="body-extra-small" weight="medium">{d.label}</ThemedText>
              <ThemedText type="body-extra-small" weight="medium">-₱{d.amount.toLocaleString()}</ThemedText>
            </Container>
          ))}
          <Container
            padding={0}
            backgroundColor="transparent"
            direction="row"
            justify="space-between"
          >
            <ThemedText type="body-extra-small" weight="medium">Total Discounts</ThemedText>
            <ThemedText type="body-extra-small" weight="medium">
              {discountTotal > 0 ? `₱${discountTotal.toLocaleString()}` : '—'}
            </ThemedText>
          </Container>
        </Container>

        <Container gap={8}>
          <ThemedText type="card-title-small" weight="medium">
            Total Payable
          </ThemedText>
          <Container
            padding={0}
            backgroundColor="transparent"
            direction="row"
            justify="space-between"
          >
            <ThemedText type="body-extra-small" weight="bold">Amount Due</ThemedText>
            <ThemedText type="body-extra-small" weight="bold" style={{ color: colors.primary }}>
              {totalPayable > 0 ? `₱${totalPayable.toLocaleString()}` : '—'}
            </ThemedText>
          </Container>
        </Container>

        <RadioButton
          size="medium"
            label="Select Payment Method"
            items={[
              { id: 'Gcash', label: 'Gcash' },
              { id: 'Paymaya', label: 'Paymaya' },
              { id: 'Credit Card', label: 'Credit Card' },
              { id: 'Cash', label: 'Cash' },

            ]}
            value={paymentMethod}
            onChange={(item) => setPaymentMethod(item?.id ? String(item.id) : null)}
          />

        {paymentMethod === 'Cash' && (
          <Container
            style={{ flexWrap: 'wrap' }}
            variant="soft"
            backgroundColor={colors.warning}
          >
            <ThemedText
              startIcon={
                <MaterialIcons
                  name="warning"
                  size={28}
                  color={colors.primary}
                />
              }
              type="label-small"
              weight="medium"
            >
              Cash payment may take up to 24 hours or earlier to process. Please
              wait for confirmation before checking in. Cancel your reservation
              at any time.
            </ThemedText>
          </Container>
        )}
      </PageContainer>
    </ScrollView>
  );
};

export default Payment;

const styles = StyleSheet.create({});
