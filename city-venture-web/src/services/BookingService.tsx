import axios from "axios";
import type { Bookings } from "../types/Booking";
import type { Room } from "@/src/types/Business";
import api from "@/src/services/api";

export const fetchBookingsByRoomId = async (
  room_id: string
): Promise<Bookings[]> => {
  const { data } = await axios.get<Bookings[]>(
    `${api}/booking/room/${room_id}`
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
  const { data: roomsData } = await axios.get<Room[] | Room>(
    `${api}/room/${business_id}`
  );
  const rooms: Room[] = Array.isArray(roomsData) ? roomsData : [roomsData];
  if (rooms.length === 0) return [];

  // Fetch bookings for all rooms in parallel
  const bookingResults = await Promise.all(
    rooms.map(
      (room) =>
        axios
          .get<Bookings | Bookings[number]>(`${api}/booking/room/${room.id}`)
          .then((res) => (Array.isArray(res.data) ? res.data : [res.data]))
          .catch(() => []) // fail-soft per room
    )
  );

  return bookingResults.flat();
};

/** Update booking status */
export const updateBookingStatus = async (id: string, status: string) => {
  const { data } = await axios.put(`${api}/booking/${id}`, {
    booking_status: status,
  });
  return data;
};

/** Fetch booking by ID */
export const fetchBookingById = async (
  id: string
): Promise<Bookings[number]> => {
  const { data } = await axios.get<Bookings[number]>(`${api}/booking/${id}`);
  return data;
};

export const fetchTourist = async (tourist_id: string) => {
  const { data } = await axios.get(`${api}/tourist/${tourist_id}`);
  return data;
};