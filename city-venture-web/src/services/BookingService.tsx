import apiClient from "./apiClient";
import type { Bookings } from "../types/Booking";
import type { Room } from "@/src/types/Business";
import type { User } from "@/src/types/User";

export const fetchBookingsByRoomId = async (
  room_id: string
): Promise<Bookings[]> => {
  const { data } = await apiClient.get<Bookings[]>(
    `/booking/room/${room_id}`
  );
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
 * Fetch user data by user_id
 * Uses apiClient for proper authentication with new token system
 */
export const fetchUserData = async (userId: string): Promise<User> => {
  const { data } = await apiClient.get<User>(`/users/${userId}`);
  return data;
};