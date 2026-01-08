import apiClient from '@/services/apiClient';
import type { Booking } from '@/types/Booking';

/**
 * Fetch all bookings for a specific business
 * Used to check room availability across date ranges
 */
export async function fetchBookingsByBusinessId(
  businessId: string,
  opts?: { noCache?: boolean }
): Promise<Booking[]> {
  const cacheSuffix = opts?.noCache ? `?ts=${Date.now()}` : '';
  const { data } = await apiClient.get(
    `/booking/business/${businessId}${cacheSuffix}`,
    {
      headers: opts?.noCache
        ? {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        }
        : undefined,
    }
  );
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch bookings for a specific room
 */
export async function fetchBookingsByRoomId(
  roomId: string,
  opts?: { noCache?: boolean }
): Promise<Booking[]> {
  const cacheSuffix = opts?.noCache ? `?ts=${Date.now()}` : '';
  const { data } = await apiClient.get(
    `/booking/room/${roomId}${cacheSuffix}`,
    {
      headers: opts?.noCache
        ? {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        }
        : undefined,
    }
  );
  return Array.isArray(data) ? data : [];
}

/**
 * Check if a room is available for a given date range
 * Returns true if the room is available (no conflicting bookings)
 */
export function isRoomAvailableForDateRange(
  roomBookings: Booking[],
  checkInDate: Date,
  checkOutDate: Date
): boolean {
  // Filter for active bookings (not canceled)
  const activeBookings = roomBookings.filter(
    (booking) =>
      booking.booking_status !== 'Canceled' &&
      booking.check_in_date &&
      booking.check_out_date
  );

  // Check for any overlapping bookings
  for (const booking of activeBookings) {
    const bookingCheckIn = new Date(
      typeof booking.check_in_date === 'string' ||
        booking.check_in_date instanceof String
        ? booking.check_in_date.toString()
        : booking.check_in_date!
    );
    const bookingCheckOut = new Date(
      typeof booking.check_out_date === 'string' ||
        booking.check_out_date instanceof String
        ? booking.check_out_date.toString()
        : booking.check_out_date!
    );

    // Check for overlap:
    // New booking starts before existing ends AND new booking ends after existing starts
    const hasOverlap =
      checkInDate < bookingCheckOut && checkOutDate > bookingCheckIn;

    if (hasOverlap) {
      return false; // Room is not available
    }
  }

  return true; // No conflicts, room is available
}

/**
 * Get all available rooms for a date range from a list of rooms and their bookings
 */
export function filterAvailableRooms(
  rooms: any[],
  allBookings: Booking[],
  checkInDate: Date,
  checkOutDate: Date
): any[] {
  return rooms.filter((room) => {
    // Get bookings for this specific room
    const roomBookings = allBookings.filter((b) => b.room_id === room.id);

    // Check if room is available for the date range
    return isRoomAvailableForDateRange(roomBookings, checkInDate, checkOutDate);
  });
}

/**
 * Generate date markers from bookings for calendar display
 * Reserved bookings show as warning (yellow), Checked-In as error (red/occupied)
 */
export function generateBookingDateMarkers(bookings: Booking[]): {
  date: Date;
  status: 'warning' | 'error';
  label: string;
}[] {
  const markers: { date: Date; status: 'warning' | 'error'; label: string }[] = [];

  // Filter for active bookings
  const activeBookings = bookings.filter(
    (booking) =>
      booking.booking_status !== 'Canceled' &&
      booking.booking_status !== 'Checked-Out' &&
      booking.check_in_date &&
      booking.check_out_date
  );

  activeBookings.forEach((booking) => {
    const start = new Date(
      typeof booking.check_in_date === 'string' ||
        booking.check_in_date instanceof String
        ? booking.check_in_date.toString()
        : booking.check_in_date!
    );
    const end = new Date(
      typeof booking.check_out_date === 'string' ||
        booking.check_out_date instanceof String
        ? booking.check_out_date.toString()
        : booking.check_out_date!
    );

    // Determine status based on booking status
    const status: 'warning' | 'error' =
      booking.booking_status === 'Checked-In' ? 'error' : 'warning';
    const label = booking.booking_status === 'Checked-In' ? 'Occupied' : 'Reserved';

    // Generate a marker for each day in the booking range
    const current = new Date(start);
    while (current <= end) {
      markers.push({
        date: new Date(current),
        status,
        label,
      });
      current.setDate(current.getDate() + 1);
    }
  });

  return markers;
}

