import api from '@/services/api';
import { Booking, BookingPayment, Guests } from '@/types/Booking';
import axios from 'axios';

// Utility: remove undefined fields & normalize dates (YYYY-MM-DD) for backend compatibility
const normalizeDate = (d: Date | string | undefined) => {
  if (!d) return undefined;
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString().split('T')[0];
};

const sanitizePayload = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const out: Record<string, any> = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v === undefined) return; // drop undefined
    if (k.endsWith('_date')) {
      const normalized = normalizeDate(v as any);
      if (normalized) out[k] = normalized; // only include valid dates
      return;
    }
    out[k] = v;
  });
  return out as Partial<T>;
};

export const bookRoom = async (bookingData: Booking) => {
  const payload = sanitizePayload(bookingData);
  // Debug log (can be removed in production)
  console.log('[API] POST /booking payload:', payload);
  const response = await axios.post(`${api}/booking`, payload);
  console.log('[API] POST /booking response:', response.data);
  return response.data;
};

// Add guests to a booking
export const addGuestsToBooking = async (
  booking_id: string | number,
  guests: Guests
) => {
  if (!guests || guests.length === 0) return null;
  const mapped = guests.map((g) => ({
    booking_id,
    guest_name: g.guest_name,
    age: g.age === null || g.age === undefined ? 0 : g.age, // fallback to 0 if backend disallows null
    gender: g.gender || 'unspecified',
  }));
  console.log('[API] POST /booking/:id/guests payload:', mapped);
  const response = await axios.post(`${api}/booking/${booking_id}/guests`, {
    guests: mapped,
  });
  console.log('[API] POST /booking/:id/guests response:', response.data);
  return response.data;
};

// Create a payment record for a booking
export const createBookingPayment = async (
  booking_id: string | number,
  payment: BookingPayment
) => {
  if (!payment?.payment_method) return null;
  const payload = sanitizePayload({
    ...payment,
    booking_id,
  });
  console.log('[API] POST /booking/:id/payment payload:', payload);
  const response = await axios.post(
    `${api}/booking/${booking_id}/payment`,
    payload
  );
  console.log('[API] POST /booking/:id/payment response:', response.data);
  return response.data;
};

// Composite helper to create booking, guests, and payment sequentially
export const createFullBooking = async (
  booking: Booking,
  guests: Guests,
  payment: BookingPayment
) => {
  console.log('[FLOW] Creating full booking');
  const createdBooking = await bookRoom(booking);
  const bookingId =
    createdBooking?.id ||
    createdBooking?.booking_id ||
    createdBooking?.data?.id ||
    createdBooking?.data?.booking_id ||
    booking.id;
  if (!bookingId) {
    console.error('[FLOW] Booking create response unexpected:', createdBooking);
    throw new Error('Booking ID missing after creation');
  }
  try {
    await addGuestsToBooking(bookingId, guests || []);
  } catch (e) {
    console.error('[FLOW] Adding guests failed', e);
    throw e;
  }
  try {
    await createBookingPayment(bookingId, payment);
  } catch (e) {
    console.error('[FLOW] Creating payment failed', e);
    throw e;
  }
  console.log('[FLOW] Full booking completed (id=', bookingId, ')');
  return createdBooking;
};

// Lightweight variant: create booking + guests ONLY (payment intentionally skipped)
// Use this when UI still collects a payment method but backend payment recording
// is temporarily disabled. Returns the created booking response.
// NOTE: Payment persistence disabled. To restore full flow, call createFullBooking instead.
export const createBookingAndGuests = async (
  booking: Booking,
  guests: Guests
) => {
  console.log('[FLOW] Creating booking (payment skipped)');
  const createdBooking = await bookRoom(booking);
  const bookingId =
    createdBooking?.id ||
    createdBooking?.booking_id ||
    createdBooking?.data?.id ||
    createdBooking?.data?.booking_id ||
    booking.id;
  if (!bookingId) {
    console.error('[FLOW] Booking create response unexpected:', createdBooking);
    throw new Error('Booking ID missing after creation');
  }
  try {
    await addGuestsToBooking(bookingId, guests || []);
  } catch (e) {
    console.error('[FLOW] Adding guests failed', e);
    throw e;
  }
  console.log('[FLOW] Booking completed without payment (id=', bookingId, ')');
  return createdBooking;
};

export const getBookingsByTourist = async (tourist_id: string) => {
  const response = await axios.get(`${api}/booking/tourist/${tourist_id}`);
  return response.data;
};

export const getBookingById = async (booking_id: string) => {
  const response = await axios.get(`${api}/booking/${booking_id}`);
  return response.data;
};

export const cancelBooking = async (booking_id: string) => {
  const response = await axios.put(`${api}/booking/${booking_id}`, {
    booking_status: 'Canceled',
  });
  return response.data;
};
