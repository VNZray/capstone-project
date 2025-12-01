import Button from '@/components/Button';
import Container from '@/components/Container';
import PageContainer from '@/components/PageContainer';
import RadioButton from '@/components/RadioButton';
import FormTextInput from '@/components/TextInput';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';

import { useRoom } from '@/context/RoomContext';
import { Booking, BookingPayment } from '@/types/Booking';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { parse } from 'date-fns';

type Props = {
  data: Booking;
  payment: BookingPayment;
  setData: React.Dispatch<React.SetStateAction<Booking>>;
  setPayment: React.Dispatch<React.SetStateAction<BookingPayment>>;
};

const Payment: React.FC<Props> = ({ data, payment, setData, setPayment }) => {
  const { roomDetails } = useRoom();


  // Helper to parse 'YYYY-MM-DD HH:mm:ss' to Date
  const parseDateTime = (dt: string | Date | null | undefined) => {
    if (!dt) return null;
    if (dt instanceof Date) return dt;
    // Try to parse string
    // Accepts 'YYYY-MM-DD HH:mm:ss' or ISO
    if (typeof dt === 'string') {
      // Try date-fns parse
      const parsed = parse(dt, 'yyyy-MM-dd HH:mm:ss', new Date());
      if (!isNaN(parsed.getTime())) return parsed;
      // fallback: try Date constructor
      const fallback = new Date(dt);
      if (!isNaN(fallback.getTime())) return fallback;
    }
    return null;
  };

  const checkIn = parseDateTime(data.check_in_date as string) || null;
  const checkOut = parseDateTime(data.check_out_date as string) || null;

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
  // Total payable after discounts (full amount owed for the booking)
  const totalPayable = Math.max(subtotal - discountTotal, 0);

  // Derived payment breakdown
  const isPartial = (paymentType || '').toLowerCase().includes('partial');
  const amountDue = useMemo(
    () => (isPartial ? Math.round(totalPayable * 0.5) : totalPayable),
    [isPartial, totalPayable]
  );
  const balance = useMemo(
    () => Math.max(totalPayable - amountDue, 0),
    [totalPayable, amountDue]
  );

  // Persist booking + payment upward whenever dependencies change
  useEffect(() => {
    setData((prev) => ({
      ...prev,
      total_price: totalPayable, // full amount of the booking
    }));
    setPayment((prev) => ({
      ...prev,
      payment_method: paymentMethod as BookingPayment['payment_method'],
      payment_type: paymentType as BookingPayment['payment_type'],
      amount: amountDue, // amount to be paid now
    }));
  }, [paymentMethod, paymentType, totalPayable, amountDue, balance, setPayment, setData]);

  return (
    <ScrollView>
      <PageContainer padding={16} gap={16} style={{ paddingBottom: 100 }}>
        {/* 1. DETAILS SECTION */}
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

        {/* 2. PAYMENT METHOD */}
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
          onChange={(item) => {
            const selected = item?.id ? String(item.id) : null;
            setPaymentMethod(selected);
            // Force Full Payment when Cash is selected
            if (selected === 'Cash') {
              setPaymentType('Full Payment');
            }
          }}
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

        {/* 3. PAYMENT TYPE (if not Cash) */}
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

        {/* 4. DISCOUNTS */}
        <Container gap={8}>
          <ThemedText type="card-title-small" weight="medium">
            Discounts
          </ThemedText>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Container padding={0} style={{ flex: 1 }}>
              {/* Hidden placeholder to keep layout consistent with existing RadioButton styling if any */}
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
            <Button onPress={handleApplyDiscount} label="Apply" />
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
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <ThemedText
                  type="body-extra-small"
                  darkColor={colors.error}
                  lightColor={colors.error}
                  weight="medium"
                >
                  -₱{d.amount.toLocaleString()}
                </ThemedText>
                <Button
                  label="Remove"
                  size="small"
                  color="error"
                  startIcon={'trash'}
                  icon
                  variant="soft"
                  onPress={() => {
                    setDiscounts((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    minWidth: 0,
                  }}
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
            <ThemedText
              darkColor={colors.error}
              lightColor={colors.error}
              type="body-extra-small"
              weight="medium"
            >
              {discountTotal > 0 ? `₱${discountTotal.toLocaleString()}` : '—'}
            </ThemedText>
          </Container>
        </Container>

        {/* 5. TOTAL AMOUNT */}
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
              {amountDue > 0 ? `₱${amountDue.toLocaleString()}` : '—'}
            </ThemedText>
          </Container>
          {balance > 0 && (
            <Container
              padding={0}
              backgroundColor="transparent"
              direction="row"
              justify="space-between"
            >
              <ThemedText type="body-extra-small" weight="medium">
                Remaining Balance
              </ThemedText>
              <ThemedText type="body-extra-small" weight="medium">
                ₱{balance.toLocaleString()}
              </ThemedText>
            </Container>
          )}
          <Container
            padding={0}
            backgroundColor="transparent"
            direction="row"
            justify="space-between"
            style={{ marginTop: 4 }}
          >
            <ThemedText type="body-extra-small" weight="medium" style={{ opacity: 0.7 }}>
              Total
            </ThemedText>
            <ThemedText type="body-extra-small" weight="medium" style={{ opacity: 0.7 }}>
              {totalPayable > 0 ? `₱${totalPayable.toLocaleString()}` : '—'}
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
      </PageContainer>
    </ScrollView>
  );
};

export default Payment;

const styles = StyleSheet.create({});
