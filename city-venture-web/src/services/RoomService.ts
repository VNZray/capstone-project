import apiClient from "./apiClient";
import type { Room } from "../types/Business";
import * as PromotionService from "./PromotionService";
/** Get stored Room ID */
export const getStoredRoomId = (): string | null => {
  return localStorage.getItem("selectedRoomId");
};

/** Set Room ID */
export const setStoredRoomId = (id: string) => {
  localStorage.setItem("selectedRoomId", id);
};

/** Clear stored Room ID */
export const clearStoredRoomId = () => {
  localStorage.removeItem("selectedRoomId");
};

/** Fetch Room Details from API */
export const fetchRoomDetails = async (room_id: string): Promise<Room> => {
  const { data } = await apiClient.get<Room>(`/room/profile/${room_id}`);
  return data;
};

/** Fetch Rooms by Business ID */
export const fetchRoomsByBusinessId = async (
  business_id: string
): Promise<Room[]> => {
  const { data } = await apiClient.get(`/room/${business_id}`);
  return Array.isArray(data) ? data : [data]; // ensure it's always an array
};

/** Batch fetch room numbers by IDs */
export const fetchRoomNumbersByIds = async (
  roomIds: string[]
): Promise<Record<string, string>> => {
  const results = await Promise.allSettled(
    roomIds.map(async (roomId) => {
      try {
        const room = await fetchRoomDetails(roomId);
        return { id: roomId, room_number: room?.room_number || "—" };
      } catch {
        return { id: roomId, room_number: "—" };
      }
    })
  );

  const roomMap: Record<string, string> = {};
  results.forEach((res) => {
    if (res.status === "fulfilled") {
      roomMap[res.value.id] = res.value.room_number;
    }
  });
  return roomMap;
};

/** Get active room discount for a business */
export const getActiveRoomDiscount = async (
  businessId: string
): Promise<number | null> => {
  try {
    const activePromotions =
      await PromotionService.fetchActivePromotionsByBusinessId(businessId);

    // Find the first active room_discount promotion (promo_type = 2 based on migration)
    const roomDiscount = activePromotions.find(
      (promo) =>
        promo.promo_name === "room_discount" && promo.discount_percentage
    );

    return roomDiscount?.discount_percentage || null;
  } catch (error) {
    console.error("Error fetching room discount:", error);
    return null;
  }
};

/** Calculate discounted price */
export const calculateDiscountedPrice = (
  originalPrice: number,
  discountPercentage: number | null
): number => {
  if (!discountPercentage || discountPercentage <= 0) return originalPrice;
  return originalPrice * (1 - discountPercentage / 100);
};

/** Fetch available rooms by business ID and date range */
export const fetchAvailableRoomsByDateRange = async (
  businessId: string,
  startDate: string,
  endDate: string
): Promise<Room[]> => {
  try {
    const { data } = await apiClient.get(
      `/booking/business/${businessId}/available-rooms`,
      {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      }
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching available rooms:", error);
    return [];
  }
};
