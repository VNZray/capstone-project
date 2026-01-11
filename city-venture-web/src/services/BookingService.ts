import apiClient from "./apiClient";
import type { Booking, Bookings } from "../types/Booking";
import type { Room } from "@/src/types/Business";
import type { User } from "@/src/types/User";
import { findOrCreateGuest } from "./GuestService";
import type { CreateGuestInput } from "../types/Guest";

export const fetchBookingsByRoomId = async (
  room_id: string
): Promise<Bookings[]> => {
  const { data } = await apiClient.get<Bookings[]>(`/booking/room/${room_id}`);
  return Array.isArray(data) ? data : [data]; // ensure it's always an array
};

/**
 * Fetch all bookings belonging to a business by first retrieving its rooms
 */
export const fetchBookingsByBusinessId = async (
  business_id: string
): Promise<Bookings> => {
  if (!business_id) return [];
  // Get rooms for the business
  const { data: roomsData } = await apiClient.get<Room[] | Room>(
    `/room/${business_id}`
  );
  const rooms: Room[] = Array.isArray(roomsData) ? roomsData : [roomsData];
  if (rooms.length === 0) return [];

  // Fetch bookings for all rooms in parallel
  const bookingResults = await Promise.all(
    rooms.map(
      (room) =>
        apiClient
          .get<Bookings | Bookings[number]>(`/booking/room/${room.id}`)
          .then((res) => (Array.isArray(res.data) ? res.data : [res.data]))
          .catch(() => []) // fail-soft per room
    )
  );

  return bookingResults.flat();
};

/** Update booking status */
export const updateBookingStatus = async (id: string, status: string) => {
  const { data } = await apiClient.put(`/booking/${id}`, {
    booking_status: status,
  });
  return data;
};

/** Fetch booking by ID */
export const fetchBookingById = async (
  id: string
): Promise<Bookings[number]> => {
  const { data } = await apiClient.get<Bookings[number]>(`/booking/${id}`);
  return data;
};

export const fetchTourist = async (tourist_id: string) => {
  const { data } = await apiClient.get(`/tourist/${tourist_id}`);
  return data;
};

/** Batch fetch guest info (name and profile) by tourist IDs */
export const fetchGuestInfoByIds = async (
  touristIds: string[]
): Promise<Record<string, { name: string; user_profile?: string }>> => {
  const results = await Promise.allSettled(
    touristIds.map(async (id) => {
      try {
        const tourist = await fetchTourist(id);
        let userData = undefined;
        if (tourist?.user_id) {
          const userRes = await apiClient.get(`/users/${tourist.user_id}`);
          userData = userRes.data;
        }
        return {
          id,
          name:
            [tourist?.first_name, tourist?.last_name]
              .filter(Boolean)
              .join(" ") || "—",
          user_profile: userData?.user_profile,
        };
      } catch {
        return { id, name: "—" };
      }
    })
  );

  const guestMap: Record<string, { name: string; user_profile?: string }> = {};
  results.forEach((res) => {
    if (res.status === "fulfilled") {
      const { id, ...info } = res.value;
      guestMap[id] = info;
    }
  });
  return guestMap;
};

/**
 * Get guest name from booking
 * Handles both tourist_id and guest_id (walk-in guests)
 */
export const getGuestNameFromBooking = (booking: Booking): string => {
  // First, check if guest info is already in the booking (from stored procedure)
  if (booking.guest_first_name || booking.guest_last_name) {
    const parts = [
      booking.guest_first_name,
      booking.guest_middle_name,
      booking.guest_last_name,
    ].filter(Boolean);
    return parts.join(' ') || '—';
  }

  // Fallback to deprecated fields
  if (booking.guest_name) {
    return booking.guest_name;
  }

  return '—';
};

/**
 * Fetch user data by user_id
 * Uses apiClient for proper authentication with new token system
 */
export const fetchUserData = async (userId: string): Promise<User> => {
  const { data } = await apiClient.get<User>(`/users/${userId}`);
  return data;
};

// ==================== Walk-In Booking Functions ====================

import type {
  WalkInBookingRequest,
  GuestSearchResult,
  TodaysArrivalsResponse,
  TodaysDeparturesResponse,
  CurrentlyOccupiedResponse,
} from "../types/Booking";

/**
 * Create a walk-in booking (onsite check-in)
 * Automatically creates or finds guest record before creating booking
 */
export const createWalkInBooking = async (
  request: WalkInBookingRequest & { guestData?: CreateGuestInput }
): Promise<Booking & { message: string }> => {
  let guestId = request.guest_id;

  // If guest data is provided and no guest_id, create/find guest first
  if (!guestId && request.guestData) {
    console.log('Creating/finding guest with data:', request.guestData);
    const guest = await findOrCreateGuest(request.guestData);
    console.log('Guest created/found:', guest);
    guestId = guest.id;
  }

  // Remove guestData from request as it's not part of booking API
  const { guestData, ...bookingRequest } = request as any;

  const finalRequest = {
    ...bookingRequest,
    guest_id: guestId,
  };

  console.log('Sending walk-in booking request:', finalRequest);

  const { data } = await apiClient.post<Booking & { message: string }>(
    "/booking/walk-in",
    finalRequest
  );
  return data;
};

/**
 * Search for guests by name, phone, or email
 * Used for walk-in bookings to find existing guest accounts
 */
export const searchGuests = async (
  query: string,
  businessId?: string
): Promise<GuestSearchResult[]> => {
  const params: Record<string, string> = { query };
  if (businessId) params.business_id = businessId;

  const { data } = await apiClient.get<GuestSearchResult[]>(
    "/booking/search/guests",
    { params }
  );
  return Array.isArray(data) ? data : [];
};

/**
 * Get today's arrivals for a business
 */
export const fetchTodaysArrivals = async (
  businessId: string
): Promise<TodaysArrivalsResponse> => {
  const { data } = await apiClient.get<TodaysArrivalsResponse>(
    `/booking/business/${businessId}/arrivals`
  );
  return data;
};

/**
 * Get today's departures for a business
 */
export const fetchTodaysDepartures = async (
  businessId: string
): Promise<TodaysDeparturesResponse> => {
  const { data } = await apiClient.get<TodaysDeparturesResponse>(
    `/booking/business/${businessId}/departures`
  );
  return data;
};

/**
 * Get currently occupied rooms for a business
 */
export const fetchCurrentlyOccupied = async (
  businessId: string
): Promise<CurrentlyOccupiedResponse> => {
  const { data } = await apiClient.get<CurrentlyOccupiedResponse>(
    `/booking/business/${businessId}/occupied`
  );
  return data;
};
