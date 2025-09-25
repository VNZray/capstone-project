import Container from '@/components/Container';
import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import { useRoom } from '@/context/RoomContext';
import { Booking, BookingPayment, Guests } from '@/types/Booking';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface SummaryProps {
  data: any;
}

type Props = {
  data: Booking;
  guests: Guests;
  payment: BookingPayment;
  setData: React.Dispatch<React.SetStateAction<Booking>>;
  setGuests: React.Dispatch<React.SetStateAction<Guests>>;
  setPayment: React.Dispatch<React.SetStateAction<BookingPayment>>;
};

const Summary: React.FC<Props> = ({ data, guests, payment }) => {
  const { roomDetails } = useRoom();

  const [checkIn, setCheckIn] = useState<Date | null>(
    data.check_in_date || new Date()
  );
  const [checkOut, setCheckOut] = useState<Date | null>(
    data.check_out_date || null
  );
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

  const paymentLabel = payment.payment_method || '—';
  const purposeLabel = data.trip_purpose || '—';
  const travelerTypes: { label: string; value: number | undefined }[] = [
    { label: 'Local', value: data.local_counts },
    { label: 'Domestic', value: data.domestic_counts },
    { label: 'Foreign', value: data.foreign_counts },
    { label: 'Overseas', value: data.overseas_counts },
  ].filter((t) => (t.value || 0) > 0);

  return (
    <ScrollView>
      <PageContainer padding={16} gap={20}>
        <Container gap={8}>
          <ThemedText type="card-title-small" weight="semi-bold">
            Booking Summary
          </ThemedText>
          <Container padding={0} backgroundColor="transparent" gap={6}>
            <SummaryRow
              label="Room"
              value={roomDetails?.room_number ? roomDetails.room_number : '—'}
            />
            <SummaryRow
              label="Check-in"
              value={data.check_in_date ? formatDate(data.check_in_date) : '—'}
            />
            <SummaryRow
              label="Check-out"
              value={
                data.check_out_date ? formatDate(data.check_out_date) : '—'
              }
            />
            <SummaryRow
              label="Duration"
              value={
                checkIn && checkOut && days > 0
                  ? `${days} day${days > 1 ? 's' : ''} / ${nights} night${
                      nights !== 1 ? 's' : ''
                    }`
                  : 'Select check-in and check-out dates'
              }
            />
            <SummaryRow label="Guests (Pax)" value={String(data.pax || 0)} />
            <SummaryRow label="Trip Purpose" value={purposeLabel} />
            <SummaryRow label="Payment Method" value={paymentLabel} />
          </Container>
        </Container>

        <Container gap={8}>
          <ThemedText type="card-title-small" weight="semi-bold">
            Guest Details
          </ThemedText>
          <Container padding={0} backgroundColor="transparent" gap={10}>
            {guests.length === 0 && (
              <ThemedText type="body-extra-small" style={{ opacity: 0.6 }}>
                No guests provided yet.
              </ThemedText>
            )}
            {guests.map((g, i) => (
              <Container
                key={i}
                padding={0}
                backgroundColor="transparent"
                gap={4}
              >
                <ThemedText type="body-extra-small" weight="normal">
                  Guest {i + 1}: {g.name || '—'} | {g.age ?? '—'} yrs |{' '}
                  {genderLabel(g.gender) || '—'}
                </ThemedText>
              </Container>
            ))}
          </Container>
        </Container>

        <Container gap={8}>
          <ThemedText type="card-title-small" weight="semi-bold">
            Traveler Types
          </ThemedText>
          <Container padding={0} backgroundColor="transparent" gap={10}>
            {travelerTypes.length === 0 && (
              <ThemedText type="body-extra-small" style={{ opacity: 0.6 }}>
                None selected.
              </ThemedText>
            )}
            {travelerTypes.map((t) => (
              <SummaryRow
                key={t.label}
                label={t.label}
                value={String(t.value)}
              />
            ))}
          </Container>
        </Container>

        {/* Cash payment notice removed since 'Cash' is not in current payment_method union */}
      </PageContainer>
    </ScrollView>
  );
};

export default Summary;

// Helper subcomponents
interface SummaryRowProps {
  label: string;
  value: string;
}
const SummaryRow: React.FC<SummaryRowProps> = ({ label, value }) => (
  <Container
    padding={0}
    direction="row"
    justify="space-between"
    backgroundColor="transparent"
    style={{ gap: 8 }}
  >
    <ThemedText type="body-extra-small" weight="normal">
      {label}
    </ThemedText>
    <ThemedText type="body-extra-small" weight="normal">
      {value}
    </ThemedText>
  </Container>
);

interface MiniBadgeProps {
  label: string;
  caption?: string;
}
const MiniBadge: React.FC<MiniBadgeProps> = ({ label, caption }) => (
  <View style={styles.badge}>
    <ThemedText type="label-extra-small" weight="semi-bold">
      {label}
    </ThemedText>
    {caption && (
      <ThemedText type="label-extra-small" style={{ opacity: 0.6 }}>
        {caption}
      </ThemedText>
    )}
  </View>
);

function formatDate(d?: Date) {
  if (!d) return '';
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
function genderLabel(g: any) {
  if (g === 1 || g === '1') return 'Male';
  if (g === 2 || g === '2') return 'Female';
  return String(g || '');
}

const styles = StyleSheet.create({
  inlineWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    gap: 2,
    minWidth: 60,
    alignItems: 'center',
  },
});
