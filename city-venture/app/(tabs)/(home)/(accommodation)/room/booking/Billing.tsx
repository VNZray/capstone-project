import Button from '@/components/Button';
import Container from '@/components/Container';
import DateInput from '@/components/DateInput';
import PageContainer from '@/components/PageContainer';
import RadioButton from '@/components/RadioButton';
import FormTextInput from '@/components/TextInput';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { useRoom } from '@/context/RoomContext';
import { Booking, BookingPayment, Guests } from '@/types/Booking';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

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

  const [checkIn, setCheckIn] = useState<Date | null>(
    data.check_in_date || new Date()
  );
  const [checkOut, setCheckOut] = useState<Date | null>(
    data.check_out_date || null
  );

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

  const [paymentMethod, setPaymentMethod] = useState<string | null>(
    payment.payment_method || null
  );
  const [paymentType, setPaymentType] = useState<string>(
    payment.payment_type || 'Full Payment'
  );

  // Discounts (future implementation). Each discount: positive amount to subtract from subtotal.
  const [discounts, setDiscounts] = useState<
    { label: string; amount: number }[]
  >([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState<string | null>(null);

  // Move validDiscounts inside handler to access latest values
  const handleApplyDiscount = () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) {
      setDiscountError('Please enter a code.');
      return;
    }
    if (discounts.some((d) => d.label === code)) {
      setDiscountError('Code already applied.');
      return;
    }
    // Calculate HALFPRICE based on current values
    const validDiscounts: Record<string, number> = {
      SAVE100: 100,
      SAVE500: 500,
      HALFPRICE: Math.floor(
        (baseRoomPrice + bookingFee + transactionFee) * 0.5
      ),
    };
    if (validDiscounts[code]) {
      setDiscounts((prev) => [
        ...prev,
        { label: code, amount: validDiscounts[code] },
      ]);
      setDiscountCode('');
      setDiscountError(null);
    } else {
      setDiscountError('Invalid or expired code.');
    }
  };

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
    setData((prev) => ({
      ...prev,
      check_in_date: checkIn || undefined,
      check_out_date: checkOut || undefined,
      total_price: totalPayable || undefined,
    }));
  }, [checkIn, checkOut, totalPayable, setData]);

  useEffect(() => {
    const normalizedType = (paymentType || '').toLowerCase();
    const isPartial = normalizedType.includes('partial');
    const amount = isPartial ? Math.round(totalPayable * 0.5) : totalPayable;
    setPayment((prev) => ({
      ...prev,
      payment_method: paymentMethod as BookingPayment['payment_method'],
      payment_type: paymentType as BookingPayment['payment_type'],
      amount: amount,
    }));
  }, [paymentMethod, paymentType, totalPayable, setPayment]);

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
            <ThemedText type="body-extra-small" weight="medium">
              Room Price
            </ThemedText>
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
            <ThemedText type="body-extra-small" weight="medium">
              Booking Fee
            </ThemedText>
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
            <ThemedText type="body-extra-small" weight="medium">
              Transaction Fee
            </ThemedText>
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
            <ThemedText type="body-extra-small" weight="medium">
              Subtotal
            </ThemedText>
            <ThemedText type="body-extra-small" weight="medium">
              {subtotal > 0 ? `₱${subtotal.toLocaleString()}` : '—'}
            </ThemedText>
          </Container>
        </Container>

        <Container gap={8}>
          <ThemedText type="card-title-small" weight="medium">
            Discounts
          </ThemedText>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Container padding={0} style={{ flex: 1 }}>
              <RadioButton
                label={undefined}
                items={[]}
                value={undefined}
                onChange={() => {}}
                style={{ display: 'none' }}
              />
              <FormTextInput
                placeholder="Enter discount code"
                value={discountCode}
                onChangeText={setDiscountCode}
                size="small"
              />
            </Container>
            <Button onPress={handleApplyDiscount} label="Apply"></Button>
          </View>
          {discountError && (
            <ThemedText
              type="body-extra-small"
              style={{ color: colors.error, marginBottom: 4 }}
            >
              {discountError}
            </ThemedText>
          )}
          {discounts.length === 0 && (
            <ThemedText type="body-extra-small" style={{ opacity: 0.6 }}>
              No discounts applied.
            </ThemedText>
          )}
          {discounts.map((d, idx) => (
            <Container
              key={d.label}
              padding={0}
              backgroundColor="transparent"
              direction="row"
              justify="space-between"
              align="center"
              style={{ gap: 8 }}
            >
              <ThemedText type="body-extra-small" weight="medium">
                {d.label}
              </ThemedText>
             <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
               <ThemedText type="body-extra-small" darkColor={colors.error} lightColor={colors.error} weight="medium">
                -₱{d.amount.toLocaleString()}
              </ThemedText>
              <Button
                label="Remove"
                size="small"
                color="error"
                startIcon={"trash"}
                icon
                variant="soft"
                onPress={() => {
                  setDiscounts((prev) => prev.filter((_, i) => i !== idx));
                }}
                style={{ paddingHorizontal: 8, paddingVertical: 2, minWidth: 0 }}
                textStyle={{ fontSize: 12 }}
              />
             </View>
            </Container>
          ))}
          <Container
            padding={0}
            backgroundColor="transparent"
            direction="row"
            justify="space-between"
          >
            <ThemedText type="body-extra-small" weight="medium">
              Total Discounts
            </ThemedText>
            <ThemedText darkColor={colors.error} lightColor={colors.error}  type="body-extra-small" weight="medium">
              {discountTotal > 0 ? `₱${discountTotal.toLocaleString()}` : '—'}
            </ThemedText>
          </Container>
        </Container>

        <Container gap={8}>
          <ThemedText type="card-title-small" weight="medium">
            Total Amount
          </ThemedText>
          <Container
            padding={0}
            backgroundColor="transparent"
            direction="row"
            justify="space-between"
          >
            <ThemedText type="body-extra-small" weight="bold">
              Amount Due
            </ThemedText>
            <ThemedText
              type="body-extra-small"
              weight="bold"
              style={{ color: colors.primary }}
            >
              {payment.amount > 0 ? `₱${payment.amount.toLocaleString()}` : '—'}
            </ThemedText>
          </Container>
          {paymentType === 'Partial Payment' && (
            <ThemedText
              type="body-extra-small"
              style={{ color: colors.success, marginTop: 4 }}
            >
              (Partial Payment: 50% of total)
            </ThemedText>
          )}
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
          onChange={(item) =>
            setPaymentMethod(item?.id ? String(item.id) : null)
          }
        />

        {/* Payment Type: Only show if not Cash */}
        {paymentMethod && paymentMethod !== 'Cash' && (
          <RadioButton
            size="medium"
            label="Payment Type"
            items={[
              { id: 'Full Payment', label: 'Full Payment' },
              { id: 'Partial Payment', label: 'Partial Payment' },
            ]}
            value={paymentType}
            onChange={(item) =>
              setPaymentType(item?.id ? String(item.id) : 'Full Payment')
            }
          />
        )}

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
