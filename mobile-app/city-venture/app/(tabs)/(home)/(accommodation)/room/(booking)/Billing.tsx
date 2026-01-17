import Button from '@/components/Button';
import Container from '@/components/Container';
import PageContainer from '@/components/PageContainer';
import RadioButton from '@/components/RadioButton';
import FormTextInput from '@/components/TextInput';
import { ThemedText } from '@/components/themed-text';
import { background, colors } from '@/constants/color';

import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { useAccommodation } from '@/context/AccommodationContext';
import { Booking, BookingPayment } from '@/types/Booking';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Platform,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { parse, format } from 'date-fns';
import * as PromotionService from '@/services/PromotionService';
import type { Promotion } from '@/types/Promotion';
import { createFullBooking } from '@/query/accommodationQuery';
import {
  initiateBookingPayment,
  mapPaymentMethodType,
  openBookingCheckout,
  dismissBookingBrowser,
  verifyBookingPayment,
} from '@/services/BookingPaymentService';
import { Routes } from '@/routes/mainRoutes';
import API_URL from '@/services/api';
import debugLogger from '@/utils/debugLogger';
import { AppHeader } from '@/components/header/AppHeader';
import {
  fetchSeasonalPricingByRoomId,
  calculateLocalPriceForDateRange,
} from '@/services/SeasonalPricingService';
import type { SeasonalPricing } from '@/types/SeasonalPricing';

/**
 * Billing Page - Payment method selection and processing
 * Receives booking data via route params and handles payment
 */
const BillingPage: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { roomDetails } = useRoom();
  const { user } = useAuth();
  const { selectedAccommodationId } = useAccommodation();
  const navigation = useNavigation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const bgColor = colorScheme === 'dark' ? background.dark : background.light;

  // Get booking data from route params
  const params = useLocalSearchParams<{
    bookingData?: string;
    paymentData?: string;
  }>();

  // Parse booking data from params
  const initialBookingData = useMemo<Booking>(() => {
    if (params.bookingData) {
      try {
        return JSON.parse(params.bookingData);
      } catch {
        return {} as Booking;
      }
    }
    return {} as Booking;
  }, [params.bookingData]);

  const initialPaymentData = useMemo<BookingPayment>(() => {
    if (params.paymentData) {
      try {
        return JSON.parse(params.paymentData);
      } catch {
        return { payment_type: 'Full Payment', amount: 0 };
      }
    }
    return { payment_type: 'Full Payment', amount: 0 };
  }, [params.paymentData]);

  // Local state for booking and payment
  const [bookingData, setBookingData] = useState<Booking>(initialBookingData);
  const [paymentData, setPaymentData] =
    useState<BookingPayment>(initialPaymentData);
  const [submitting, setSubmitting] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [seasonalPricing, setSeasonalPricing] =
    useState<SeasonalPricing | null>(null);
  const [loadingSeasonalPricing, setLoadingSeasonalPricing] = useState(true);

  // Fetch seasonal pricing for the room
  useEffect(() => {
    const fetchPricing = async () => {
      if (!roomDetails?.id) {
        setLoadingSeasonalPricing(false);
        return;
      }
      try {
        const pricing = await fetchSeasonalPricingByRoomId(roomDetails.id);
        setSeasonalPricing(pricing);
      } catch (error) {
        console.log('[Billing] Failed to fetch seasonal pricing:', error);
        setSeasonalPricing(null);
      } finally {
        setLoadingSeasonalPricing(false);
      }
    };
    fetchPricing();
  }, [roomDetails?.id]);

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

  // Helper to parse time string (HH:mm:ss) and combine with date
  const combineDateTime = (
    dateVal: string | Date | null | undefined,
    timeVal: string | Date | null | undefined
  ): Date | null => {
    if (!dateVal) return null;

    // Parse the date
    let baseDate: Date;
    if (dateVal instanceof Date) {
      baseDate = dateVal;
    } else {
      // Try parsing as yyyy-MM-dd first
      const parsed = parse(dateVal, 'yyyy-MM-dd', new Date());
      if (!isNaN(parsed.getTime())) {
        baseDate = parsed;
      } else {
        // Fallback to Date constructor
        baseDate = new Date(dateVal);
        if (isNaN(baseDate.getTime())) return null;
      }
    }

    // If no time provided, return date at midnight
    if (!timeVal) return baseDate;

    // Parse the time and combine with date
    let hours = 0,
      minutes = 0,
      seconds = 0;
    if (timeVal instanceof Date) {
      hours = timeVal.getHours();
      minutes = timeVal.getMinutes();
      seconds = timeVal.getSeconds();
    } else if (typeof timeVal === 'string') {
      // Parse HH:mm:ss or HH:mm format
      const timeParts = timeVal.split(':');
      hours = parseInt(timeParts[0]) || 0;
      minutes = parseInt(timeParts[1]) || 0;
      seconds = parseInt(timeParts[2]) || 0;
    }

    return new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      hours,
      minutes,
      seconds
    );
  };

  // Use booking_type field as primary indicator for short-stay
  const isShortStay = bookingData.booking_type === 'short-stay';

  // Combine date and time for accurate calculations
  const checkIn = isShortStay
    ? combineDateTime(
        bookingData.check_in_date as string | Date | undefined,
        bookingData.check_in_time as string | Date | undefined
      )
    : parseDateTime(bookingData.check_in_date as string);
  const checkOut = isShortStay
    ? combineDateTime(
        bookingData.check_out_date as string | Date | undefined,
        bookingData.check_out_time as string | Date | undefined
      )
    : parseDateTime(bookingData.check_out_date as string);

  // Calculate days and nights for overnight, or hours for short stay
  let days = 0;
  let nights = 0;
  let hours = 0;

  if (checkIn && checkOut) {
    if (isShortStay) {
      // Calculate hours for short-stay display
      const totalHours =
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      hours = Math.max(1, Math.round(totalHours)); // Minimum 1 hour
    } else {
      // Overnight stay: normalize to midnight to avoid timezone issues
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
      const diff =
        (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24);
      days = diff > 0 ? diff : 0;
      nights = days > 0 ? days - 1 : 0;
    }
  }

  const [paymentMethod, setPaymentMethod] = useState<string | null>(
    paymentData.payment_method || null
  );
  const [paymentType, setPaymentType] = useState<string>(
    paymentData.payment_type || 'Full Payment'
  );

  // Discounts - Each discount: positive amount to subtract from subtotal
  const [discounts, setDiscounts] = useState<
    {
      label: string;
      amount: number;
      type: 'room' | 'coupon' | 'code';
      promotionId?: string;
    }[]
  >([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState<string | null>(null);

  // Fetch promotions on mount
  useEffect(() => {
    const fetchPromotions = async () => {
      if (!selectedAccommodationId) {
        setLoadingPromotions(false);
        return;
      }

      setLoadingPromotions(true);
      try {
        const promos = await PromotionService.fetchPromotionsByBusinessId(
          selectedAccommodationId
        );
        console.log('[Billing] Fetched promotions:', promos);
        setPromotions(promos);
      } catch (error) {
        console.error('Failed to fetch promotions:', error);
      } finally {
        setLoadingPromotions(false);
      }
    };

    fetchPromotions();
  }, [selectedAccommodationId]);

  const handleApplyDiscount = () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) {
      setDiscountError('Please enter a code.');
      return;
    }

    // Check if code already applied
    if (discounts.some((d) => d.label.includes(code))) {
      setDiscountError('Code already applied.');
      return;
    }

    // Only allow one coupon/code at a time
    const hasCouponOrCode = discounts.some(
      (d) => d.type === 'coupon' || d.type === 'code'
    );
    if (hasCouponOrCode) {
      setDiscountError('Only one discount coupon or promo code can be used.');
      return;
    }

    // Find matching promotion from backend
    const matchingPromo = promotions.find(
      (p) =>
        p.promo_code?.toUpperCase() === code &&
        (p.promo_type === 1 || p.promo_type === 3)
    );

    if (matchingPromo) {
      // Check usage limit
      if (
        matchingPromo.usage_limit &&
        (matchingPromo.used_count || 0) >= matchingPromo.usage_limit
      ) {
        setDiscountError('This code has reached its usage limit.');
        return;
      }

      let discountAmount = 0;
      let discountType: 'coupon' | 'code' = 'coupon';

      if (matchingPromo.promo_type === 1) {
        // Discount Coupon - percentage off
        discountType = 'coupon';
        if (matchingPromo.discount_percentage) {
          discountAmount = Math.floor(
            (baseRoomPrice + bookingFee) *
              (matchingPromo.discount_percentage / 100)
          );
        }
      } else if (matchingPromo.promo_type === 3) {
        // Promo Code - fixed amount off
        discountType = 'code';
        discountAmount = matchingPromo.fixed_discount_amount || 0;
      }

      if (discountAmount > 0) {
        setDiscounts((prev) => [
          ...prev,
          {
            label:
              discountType === 'coupon'
                ? `${matchingPromo.title} (${matchingPromo.discount_percentage}% OFF)`
                : `${matchingPromo.title} (₱${discountAmount} OFF)`,
            amount: discountAmount,
            type: discountType,
            promotionId: matchingPromo.id,
          },
        ]);
        setDiscountCode('');
        setDiscountError(null);
        Alert.alert('Success', `${matchingPromo.title} applied successfully!`);
      } else {
        setDiscountError('Invalid discount value.');
      }
    } else {
      setDiscountError('Invalid or expired code.');
    }
  };

  // Base room price (without fees) only when date range valid
  // Uses seasonal pricing if available and valid, otherwise falls back to flat room_price
  // For short-stay: uses per_hour_rate if available
  const baseRoomPrice = useMemo(() => {
    if (isShortStay) {
      // For short stay, charge per hour using per_hour_rate
      if (hours <= 0) return 0;
      const hourlyRate = roomDetails?.per_hour_rate;
      if (!hourlyRate || hourlyRate <= 0) {
        // Fallback to daily rate if per_hour_rate not set (shouldn't happen)
        const fallbackPrice = Number(roomDetails?.room_price) || 0;
        return fallbackPrice;
      }
      return hourlyRate * hours;
    }

    // For overnight stays
    if (!roomDetails?.room_price) return 0;
    const fallbackPrice = Number(roomDetails.room_price);
    if (days <= 0) return 0;

    if (
      seasonalPricing &&
      seasonalPricing.base_price > 0 &&
      checkIn &&
      checkOut
    ) {
      // Use local calculation with seasonal pricing
      const startDateStr = format(checkIn, 'yyyy-MM-dd');
      const endDateStr = format(checkOut, 'yyyy-MM-dd');
      const seasonalTotal = calculateLocalPriceForDateRange(
        seasonalPricing,
        startDateStr,
        endDateStr
      );
      // If seasonal calculation returns valid price, use it; otherwise fallback
      return seasonalTotal > 0 ? seasonalTotal : fallbackPrice * days;
    }

    // Fallback to flat rate
    return fallbackPrice * days;
  }, [
    roomDetails?.room_price,
    roomDetails?.per_hour_rate,
    days,
    hours,
    isShortStay,
    seasonalPricing,
    checkIn,
    checkOut,
  ]);

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

  const subtotal =
    Number(baseRoomPrice) + Number(bookingFee) + Number(transactionFee);
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

  // Auto-apply room discounts when promotions and baseRoomPrice are ready
  useEffect(() => {
    if (!loadingPromotions && promotions.length > 0 && baseRoomPrice > 0) {
      // Filter for valid room discounts (type 2) with active status and valid dates
      const now = new Date();
      const validRoomDiscounts = promotions.filter((p) => {
        const isRoomDiscount = p.promo_type === 2;
        // Handle both boolean and integer values (database returns 1/0)
        const isActive = p.is_active === true || p.is_active === 1;
        const hasDiscount = p.discount_percentage && p.discount_percentage > 0;
        const startDate = new Date(p.start_date);
        const isStarted = startDate <= now;
        const notExpired = !p.end_date || new Date(p.end_date) >= now;

        console.log('[Billing Effect] Checking promo:', {
          title: p.title,
          isRoomDiscount,
          isActive,
          is_active_raw: p.is_active,
          hasDiscount,
          isStarted,
          notExpired,
          start_date: p.start_date,
          end_date: p.end_date,
        });

        return (
          isRoomDiscount && isActive && hasDiscount && isStarted && notExpired
        );
      });

      console.log('[Billing Effect] Valid room discounts:', validRoomDiscounts);

      // Apply only if no room discount already applied
      const hasRoomDiscount = discounts.some((d) => d.type === 'room');
      if (!hasRoomDiscount && validRoomDiscounts.length > 0) {
        // Apply the best room discount (highest percentage)
        const bestDiscount = validRoomDiscounts.reduce((prev, current) =>
          (current.discount_percentage || 0) > (prev.discount_percentage || 0)
            ? current
            : prev
        );

        console.log('[Billing Effect] Applying best discount:', bestDiscount);

        const discountAmount = Math.floor(
          baseRoomPrice * ((bestDiscount.discount_percentage || 0) / 100)
        );

        console.log(
          '[Billing Effect] Discount amount:',
          discountAmount,
          'from baseRoomPrice:',
          baseRoomPrice
        );

        setDiscounts((prev) => [
          ...prev,
          {
            label: `${bestDiscount.title} (${bestDiscount.discount_percentage}% OFF)`,
            amount: discountAmount,
            type: 'room',
            promotionId: bestDiscount.id,
          },
        ]);
      } else if (!hasRoomDiscount) {
        console.log('[Billing Effect] No valid room discounts found to apply');
      }
    }
    // Only run when these specific dependencies change, not discounts to avoid loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingPromotions, promotions, baseRoomPrice]);

  // Update local state whenever payment details change
  useEffect(() => {
    const appliedPromotions = discounts
      .filter((d) => d.promotionId)
      .map((d) => d.promotionId as string);

    setBookingData((prev: Booking) => ({
      ...prev,
      total_price: totalPayable,
      applied_promotions: appliedPromotions,
    }));
    setPaymentData((prev: BookingPayment) => ({
      ...prev,
      payment_method: paymentMethod as BookingPayment['payment_method'],
      payment_type: paymentType as BookingPayment['payment_type'],
      amount: amountDue,
    }));
  }, [paymentMethod, paymentType, totalPayable, amountDue, discounts]);

  // Validation
  const isPaymentValid = (): boolean => {
    return !!paymentMethod && amountDue > 0;
  };

  // Handle previous - go back to booking form
  const handlePrevious = () => {
    navigation.goBack();
  };

  // Cash booking confirmation
  const sendBookingConfirmation = async () => {
    if (submitting) return;

    if (!roomDetails?.id || !user?.id) {
      Alert.alert('Error', 'Room or user not found.');
      return;
    }

    try {
      setSubmitting(true);

      const bookingPayload: Booking = {
        ...bookingData,
        room_id: roomDetails.id,
        tourist_id: user.id,
        booking_status: 'Pending',
        balance: Number(bookingData.total_price) - Number(paymentData.amount),
      };

      debugLogger({
        title: 'Cash Booking Submission',
        data: bookingPayload,
      });

      const created = await createFullBooking(bookingPayload, undefined);

      debugLogger({
        title: 'Booking Created',
        data: created,
        successMessage: 'Booking successfully created.',
      });

      if (created?.id) {
        router.replace({
          pathname: '/(tabs)/(home)/(accommodation)/room/(booking)/Summary',
          params: {
            bookingData: JSON.stringify({
              ...bookingData,
              id: created.id,
              booking_status: created.booking_status,
            }),
            paymentData: JSON.stringify(paymentData),
          },
        });
      }
    } catch (e: any) {
      debugLogger({
        title: 'Booking Error',
        error: e?.response?.data || e,
      });
      Alert.alert(
        'Error',
        e?.response?.data?.message || e.message || 'Failed to create booking'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Online payment processing
  const processPayment = async () => {
    if (submitting) return;

    if (!roomDetails?.id || !user?.id) {
      Alert.alert('Error', 'Room or user not found.');
      return;
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      Alert.alert('Payment', 'Invalid amount to charge.');
      return;
    }

    try {
      setSubmitting(true);

      let bookingId = bookingData.id;

      const bookingPayload: Booking = {
        ...bookingData,
        room_id: roomDetails.id,
        tourist_id: user.id,
        booking_status: 'Pending',
        balance: Number(bookingData.total_price) - Number(paymentData.amount),
      };

      // Create booking first if not exists
      if (!bookingId) {
        debugLogger({
          title: 'Creating booking before payment',
          data: { roomId: roomDetails.id, userId: user.id },
        });

        const created = await createFullBooking(bookingPayload, undefined);

        if (!created?.id) {
          Alert.alert('Error', 'Failed to create booking. Please try again.');
          setSubmitting(false);
          return;
        }

        bookingId = created.id;
        setBookingData((prev) => ({
          ...prev,
          id: created.id,
          booking_status: created.booking_status || prev.booking_status,
        }));
      }

      if (!bookingId) {
        Alert.alert('Error', 'Booking ID not found.');
        setSubmitting(false);
        return;
      }

      const paymentMethodType = mapPaymentMethodType(
        paymentData.payment_method || 'gcash'
      );

      debugLogger({
        title: 'Initiating Payment',
        data: {
          amount: paymentData.amount,
          paymentMethodType,
          bookingId,
        },
      });

      const response = await initiateBookingPayment(bookingId, {
        payment_method_type: paymentMethodType,
        payment_type: paymentData.payment_type || 'Full Payment',
        amount: paymentData.amount,
      });

      if (!response.success || !response.data?.checkout_url) {
        Alert.alert('Payment', response.message || 'No checkout URL returned.');
        setSubmitting(false);
        return;
      }

      const { checkout_url: checkoutUrl, payment_id } = response.data;

      const backendBaseUrl = API_URL ? API_URL.replace('/api', '') : '';
      const returnUrl = `${backendBaseUrl}/bookings/${bookingId}/payment-success`;

      const authResult = await openBookingCheckout(checkoutUrl, returnUrl);
      dismissBookingBrowser();

      if (authResult.type === 'cancel') {
        router.replace(
          Routes.accommodation.room.bookingCancel({
            bookingId,
            reason: 'cancelled',
          })
        );
        return;
      }

      // Verify payment
      try {
        const verifyResponse = await verifyBookingPayment(
          bookingId,
          payment_id
        );

        if (
          verifyResponse.data.verified &&
          verifyResponse.data.payment_status === 'success'
        ) {
          router.replace(
            Routes.accommodation.room.bookingSuccess({
              bookingId,
              paymentSuccess: '1',
            })
          );
        } else if (verifyResponse.data.payment_status === 'failed') {
          router.replace(
            Routes.accommodation.room.bookingCancel({
              bookingId,
              reason:
                verifyResponse.data.last_payment_error?.message ||
                'Payment failed',
            })
          );
        } else {
          router.replace(
            Routes.accommodation.room.bookingSuccess({
              bookingId,
              paymentSuccess: '1',
            })
          );
        }
      } catch (verifyError) {
        console.error('Payment verification error:', verifyError);
        router.replace(
          Routes.accommodation.room.bookingSuccess({
            bookingId,
            paymentSuccess: '1',
          })
        );
      }
    } catch (err: any) {
      console.error('Payment Error:', err);
      debugLogger({
        title: 'Payment Error',
        error: err?.response?.data || err,
      });
      Alert.alert(
        'Payment error',
        err?.response?.data?.message ||
          err?.message ||
          'Failed to process payment.'
      );
      setSubmitting(false);
    }
  };

  // Handle Pay Now button
  const handlePayNow = () => {
    if (!isPaymentValid()) {
      Alert.alert('Invalid Payment', 'Please select a payment method.');
      return;
    }

    if (paymentMethod === 'Cash') {
      sendBookingConfirmation();
    } else {
      processPayment();
    }
  };

  const TAB_BAR_HEIGHT = 60;

  return (
    <PageContainer padding={0}>
      <AppHeader backButton title="Billing" background="primary" />

      <ScrollView>
        <View style={{ padding: 16, paddingBottom: 180, gap: 16 }}>
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
                {isShortStay ? 'Duration' : "Day's of Stay"}
              </ThemedText>
              <ThemedText type="body-extra-small" weight="medium">
                {checkIn && checkOut
                  ? isShortStay
                    ? `${hours} hour${hours !== 1 ? 's' : ''}`
                    : days > 0
                    ? `${days} day${days > 1 ? 's' : ''} / ${nights} night${
                        nights !== 1 ? 's' : ''
                      }`
                    : 'Select check-in and check-out dates'
                  : 'Select check-in and check-out dates'}
              </ThemedText>
            </Container>
            <Container
              padding={0}
              backgroundColor="transparent"
              direction="row"
              justify="space-between"
            >
              <View>
                <ThemedText type="body-extra-small" weight="medium">
                  Room Price{isShortStay ? ' (1 Night Rate)' : ''}
                </ThemedText>
                {isShortStay && (
                  <ThemedText
                    type="body-extra-small"
                    weight="normal"
                    style={{ opacity: 0.7, fontSize: 10 }}
                  >
                    Short stay charged at one night's price
                  </ThemedText>
                )}
              </View>
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
                Cash payment may take up to 24 hours or earlier to process.
                Please wait for confirmation before checking in. Cancel your
                reservation at any time.
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
            <View
              style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}
            >
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
                key={`${d.type}-${idx}`}
                padding={0}
                backgroundColor="transparent"
                direction="row"
                justify="space-between"
                align="center"
                style={{ gap: 8 }}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText type="body-extra-small" weight="medium">
                    {d.label}
                  </ThemedText>
                  <ThemedText
                    type="body-extra-small"
                    style={{ opacity: 0.6, fontSize: 10 }}
                  >
                    {d.type === 'room'
                      ? 'Room Discount (Auto-applied)'
                      : d.type === 'coupon'
                      ? 'Discount Coupon'
                      : 'Promo Code'}
                  </ThemedText>
                </View>
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
                  {d.type !== 'room' && (
                    <Button
                      label="Remove"
                      size="small"
                      color="error"
                      startIcon={'trash'}
                      icon
                      variant="soft"
                      onPress={() => {
                        setDiscounts((prev) =>
                          prev.filter((_, i) => i !== idx)
                        );
                      }}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        minWidth: 0,
                      }}
                      textStyle={{ fontSize: 12 }}
                    />
                  )}
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
              <ThemedText
                type="body-extra-small"
                weight="medium"
                style={{ opacity: 0.7 }}
              >
                Total
              </ThemedText>
              <ThemedText
                type="body-extra-small"
                weight="medium"
                style={{ opacity: 0.7 }}
              >
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
        </View>
      </ScrollView>

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
          label="Previous"
          style={{ flex: 1 }}
          variant="outlined"
          onPress={handlePrevious}
        />

        <Button
          label={
            submitting
              ? 'Processing...'
              : paymentMethod === 'Cash'
              ? 'Confirm Booking'
              : 'Pay Now'
          }
          fullWidth
          color="primary"
          variant="solid"
          elevation={3}
          style={{
            flex: 1,
            opacity: submitting || !isPaymentValid() ? 0.6 : 1,
          }}
          disabled={submitting || !isPaymentValid()}
          onPress={handlePayNow}
        />
      </View>
    </PageContainer>
  );
};

export default BillingPage;

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
