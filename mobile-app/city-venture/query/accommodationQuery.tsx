import apiClient from "@/services/api/apiClient";
import { Booking, BookingPayment } from "@/types/Booking";
import debugLogger from "@/utils/debugLogger";

// Utility: remove undefined fields & normalize dates (YYYY-MM-DD) for backend compatibility
const normalizeDate = (d: Date | string | undefined) => {
  if (!d) return undefined;
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString().split("T")[0];
};

const sanitizePayload = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const out: Record<string, any> = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v === undefined) return; // drop undefined
    if (k.endsWith("_date")) {
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
    title: "API POST /booking",
    data: booking,
  });
  const response = await apiClient.post(`/booking`, booking);
  debugLogger({
    title: "API GET /booking response",
    data: response.data,
  });
  return response.data;
};

// Create a payment record for a booking
export const createBookingPayment = async (
  booking_id: string | number,
  payment: BookingPayment,
) => {
  if (!payment?.payment_method) return null;
  const payload = sanitizePayload({
    ...payment,
    payment_for_id: booking_id,
  });
  debugLogger({
    title: "API POST /payment payload",
    data: payload,
  });
  const response = await apiClient.post(`/payment`, payload);
  debugLogger({
    title: "API POST /payment response",
    data: response.data,
  });
  return response.data;
};

// Pay for a booking - creates payment record and updates booking balance
export const payBooking = async (
  bookingId: string | number,
  payment: BookingPayment,
  totalPrice: number,
) => {
  debugLogger({
    title: "FLOW Pay booking",
    data: { bookingId, payment, totalPrice },
  });

  if (!payment || payment.payment_method === "Cash") {
    debugLogger({
      title: "FLOW Payment skipped (Cash or no payment data)",
      successMessage: `No payment record created for booking ${bookingId}`,
    });
    return null;
  }

  try {
    // Ensure payment_for_id is set to the booking ID
    const paymentWithBookingId: BookingPayment = {
      ...payment,
      payment_for_id: String(bookingId),
    };

    const paymentResult = await createBookingPayment(
      bookingId,
      paymentWithBookingId,
    );

    // After successful payment creation, adjust booking balance if partial or full
    const paid = Number(payment.amount) || 0;
    const newBalance = Math.max(totalPrice - paid, 0);

    try {
      if (!isNaN(newBalance)) {
        await apiClient.put(`/booking/${bookingId}`, { balance: newBalance });
        debugLogger({
          title: "FLOW Booking balance updated",
          data: { bookingId, newBalance },
        });
      }
    } catch (e) {
      debugLogger({
        title: "FLOW Updating booking balance failed (non-fatal)",
        error: e,
      });
    }

    debugLogger({
      title: "FLOW Payment completed",
      successMessage: `Payment complete for booking ${bookingId}`,
    });

    return paymentResult;
  } catch (e) {
    debugLogger({
      title: "FLOW Creating payment failed",
      error: e,
    });
    throw e;
  }
};

// Composite helper to create booking and payment sequentially
export const createFullBooking = async (
  booking: Booking,
  payment?: BookingPayment,
) => {
  debugLogger({
    title: "FLOW Creating full booking",
    data: { booking, payment },
  });

  const createdBooking = await bookRoom(booking);
  const bookingId = createdBooking?.id;

  if (!bookingId) {
    debugLogger({
      title: "FLOW Booking create response unexpected",
      data: createdBooking,
      error: "Booking ID missing after creation",
    });
    throw new Error("Booking ID missing after creation");
  }

  // If payment is provided and not Cash, process the payment
  if (payment && payment.payment_method !== "Cash") {
    const totalPrice = Number(booking.total_price) || 0;
    await payBooking(bookingId, payment, totalPrice);
  } else {
    debugLogger({
      title: "FLOW Booking created without payment record",
      successMessage: `Booking complete (id=${bookingId}) - no payment created`,
    });
  }

  debugLogger({
    title: "FLOW Full booking completed",
    successMessage: `Booking complete (id=${bookingId})`,
  });
  return createdBooking;
};

export const getBookingsByTourist = async (tourist_id: string) => {
  const response = await apiClient.get(`booking/tourist/${tourist_id}`);
  return response.data;
};

export const getBookingById = async (booking_id: string) => {
  const response = await apiClient.get(`booking/${booking_id}`);
  return response.data;
};

export const cancelBooking = async (booking_id: string) => {
  const response = await apiClient.put(`booking/${booking_id}`, {
    booking_status: "Canceled",
  });
  return response.data;
};
