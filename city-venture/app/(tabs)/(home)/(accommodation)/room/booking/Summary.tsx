import Button from '@/components/Button';
import Container from '@/components/Container';
import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import { background, card, colors } from '@/constants/color';
import { useRoom } from '@/context/RoomContext';
import { Booking, BookingPayment } from '@/types/Booking';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  data?: Booking;
  payment?: BookingPayment;
  setData?: React.Dispatch<React.SetStateAction<Booking>>;
  setPayment?: React.Dispatch<React.SetStateAction<BookingPayment>>;
};

const Summary: React.FC<Props> = ({ data, payment }) => {
  const { roomDetails } = useRoom();
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookingData?: string;
    guests?: string;
    paymentData?: string;
  }>();

  const colorScheme = useColorScheme();
  const bg = colorScheme === 'dark' ? background.dark : background.light;
  const cardBg = colorScheme === 'dark' ? card.dark : card.light;

  const bookingData = useMemo(() => {
    if (data) return data as Booking;
    if (params?.bookingData) {
      try {
        return JSON.parse(String(params.bookingData)) as Booking;
      } catch {}
    }
    return {} as Booking;
  }, [data, params]);
  const paymentData = useMemo(() => {
    if (payment) return payment as BookingPayment;
    if (params?.paymentData) {
      try {
        return JSON.parse(String(params.paymentData)) as BookingPayment;
      } catch {}
    }
    return {} as BookingPayment;
  }, [payment, params]);

  const [checkIn, setCheckIn] = useState<Date | null>(
    bookingData?.check_in_date
      ? new Date(bookingData.check_in_date as any)
      : null
  );
  const [checkOut, setCheckOut] = useState<Date | null>(
    bookingData?.check_out_date
      ? new Date(bookingData.check_out_date as any)
      : null
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

  const [isVisible, setIsVisible] = useState(true); // Always show for now since it's a full screen modal
  const paymentLabel = paymentData?.payment_method || '—';
  const purposeLabel = bookingData?.trip_purpose || '—';
  const travelerTypes: { label: string; value: number | undefined }[] = [
    { label: 'Local', value: bookingData?.local_counts },
    { label: 'Domestic', value: bookingData?.domestic_counts },
    { label: 'Foreign', value: bookingData?.foreign_counts },
    { label: 'Overseas', value: bookingData?.overseas_counts },
  ].filter((t) => (t.value || 0) > 0);

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      style={{ backgroundColor: bg }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <PageContainer padding={20} gap={16}>
          {/* Hero Success Section */}
          <View style={styles.hero}>
            <View style={styles.heroIconWrap}>
              <MaterialCommunityIcons
                name="check-decagram"
                size={64}
                color="#fff"
              />
            </View>
            <ThemedText
              type="title-large"
              weight="bold"
              style={{ textAlign: 'center' }}
            >
              Booking Confirmed!
            </ThemedText>
            <ThemedText
              type="body-small"
              style={{ textAlign: 'center', opacity: 0.8 }}
            >
              Thank you for your reservation. Please review your check-in
              details below.
            </ThemedText>
          </View>

          {/* Details Card */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <InfoRow
              icon="door"
              label="Room"
              value={
                roomDetails?.room_number ? String(roomDetails.room_number) : '—'
              }
            />
            <InfoRow
              icon="calendar-check"
              label="Check-in"
              value={
                bookingData?.check_in_date
                  ? formatDate(bookingData.check_in_date)
                  : '—'
              }
            />
            <InfoRow
              icon="calendar-remove"
              label="Check-out"
              value={
                bookingData?.check_out_date
                  ? formatDate(bookingData.check_out_date)
                  : '—'
              }
            />
            <InfoRow
              icon="clock-outline"
              label="Duration"
              value={
                checkIn && checkOut && days > 0
                  ? `${days} day${days > 1 ? 's' : ''} / ${nights} night${
                      nights !== 1 ? 's' : ''
                    }`
                  : 'Select check-in and check-out dates'
              }
            />
            <InfoRow
              icon="account-group"
              label="Guests (Pax)"
              value={String(bookingData?.pax || 0)}
            />
            <InfoRow
              icon="wallet"
              label="Payment Method"
              value={paymentLabel}
            />
            {purposeLabel && (
              <InfoRow
                icon="briefcase"
                label="Trip Purpose"
                value={purposeLabel}
              />
            )}
          </View>

          {/* Arrival Tips */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <ThemedText
              type="card-title-small"
              weight="semi-bold"
              style={{ marginBottom: 8 }}
            >
              Arrival & Check-in Info
            </ThemedText>
            <Bullet>
              Bring a valid government-issued ID for verification.
            </Bullet>
            <Bullet>Present your booking details at the reception.</Bullet>
            <Bullet>
              Check-in starts at 2:00 PM; check-out is until 12:00 NN.
            </Bullet>
            <Bullet>
              For assistance, contact the property staff upon arrival.
            </Bullet>
          </View>

          <Button
            size="large"
            label="Okay"
            onPress={() => {
              setIsVisible(false);
              router.replace('/(tabs)/(home)/(accommodation)/room/profile');
            }}
          />

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText
              type="label-large"
              weight="medium"
              style={{ opacity: 0.6 }}
            >
              City Venture
            </ThemedText>
          </View>
        </PageContainer>
      </SafeAreaView>
    </Modal>
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

// New helper: InfoRow with icon on the left and value on the right
const InfoRow: React.FC<{ icon: any; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <View style={styles.infoRow}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <MaterialCommunityIcons name={icon} size={18} color={colors.success} />
      <ThemedText type="body-extra-small" weight="medium">
        {label}
      </ThemedText>
    </View>
    <ThemedText
      type="body-extra-small"
      weight="normal"
      style={{ opacity: 0.9 }}
    >
      {value}
    </ThemedText>
  </View>
);

// New helper: Bullet line with leading dot/check icon
const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.bulletRow}>
    <MaterialCommunityIcons
      name="check-circle"
      size={16}
      color={colors.success}
      style={{ marginTop: 2 }}
    />
    <ThemedText type="body-extra-small" style={{ flex: 1 }}>
      {children}
    </ThemedText>
  </View>
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
  headerBar: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  hero: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  heroIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
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
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
