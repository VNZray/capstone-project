import api from '@/services/api';
import { Booking, BookingPayment, Guests } from '@/types/Booking';
import debugLogger from '@/utils/debugLogger';
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
  const booking = sanitizePayload(bookingData);
  debugLogger({
    title: 'API POST /booking',
    data: booking,
  });
  const response = await axios.post(`${api}/booking`, booking);
  debugLogger({
    title: 'API GET /booking response',
    data: response.data,
  });
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
    payment_for_id: booking_id,
  });
  debugLogger({
    title: 'API POST /payment payload',
    data: payload,
  });
  const response = await axios.post(`${api}/payment`, payload);
  debugLogger({
    title: 'API POST /payment response',
    data: response.data,
  });
  return response.data;
};

// Composite helper to create booking, guests, and payment sequentially
export const createFullBooking = async (
  booking?: Booking,
  payment?: BookingPayment
) => {
  debugLogger({
    title: 'FLOW Creating full booking',
    data: { booking, payment },
  });
  if (!booking) {
    throw new Error('Booking data is required');
  }
  const createdBooking = await bookRoom(booking);
  const bookingId = createdBooking?.id;
  if (!bookingId) {
    debugLogger({
      title: 'FLOW Booking create response unexpected',
      data: createdBooking,
      error: 'Booking ID missing after creation',
    });
    throw new Error('Booking ID missing after creation');
  }

  // If no payment provided or payment method is Cash, skip creating a payment record
  if (!payment || payment.payment_method === 'Cash') {
    debugLogger({
      title: 'FLOW Booking created without payment record',
      successMessage: `Booking complete (id=${bookingId}) - no payment created`,
    });
    return createdBooking;
  }

  try {
    await createBookingPayment(bookingId, payment);
    // After successful payment creation, adjust booking balance if partial or full
    const total = Number(booking.total_price) || 0;
    const paid = Number(payment.amount) || 0;
    const newBalance = Math.max(total - paid, 0);
    try {
      if (!isNaN(newBalance)) {
        await axios.put(`${api}/booking/${bookingId}`, { balance: newBalance });
        (createdBooking as any).balance = newBalance;
      }
    } catch (e) {
      debugLogger({
        title: 'FLOW Updating booking balance failed (non-fatal)',
        error: e,
      });
    }
  } catch (e) {
    debugLogger({
      title: 'FLOW Creating payment failed',
      error: e,
    });
    throw e;
  }
  debugLogger({
    title: 'FLOW Full booking completed',
    successMessage: `Booking complete (id=${bookingId})`,
  });
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
