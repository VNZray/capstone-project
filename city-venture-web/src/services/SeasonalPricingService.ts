/**
 * Seasonal Pricing Service
 *
 * Frontend service for managing month-based seasonal pricing configurations
 * Supports peak/high/low seasons and weekend pricing
 */

import apiClient from "./apiClient";
import type {
    SeasonalPricing,
    CreateSeasonalPricingRequest,
    UpdateSeasonalPricingRequest,
    PriceCalculation,
    PriceRangeResult,
    DayOfWeek,
} from "../types/SeasonalPricing";

const BASE_PATH = "/seasonal-pricing";

/**
 * Get all seasonal pricing configurations (Admin only)
 */
export const fetchAllSeasonalPricing = async (): Promise<SeasonalPricing[]> => {
    const { data } = await apiClient.get<SeasonalPricing[]>(BASE_PATH);
    return Array.isArray(data) ? data : [];
};

/**
 * Get seasonal pricing by ID
 */
export const fetchSeasonalPricingById = async (id: string): Promise<SeasonalPricing> => {
    const { data } = await apiClient.get<SeasonalPricing>(`${BASE_PATH}/${id}`);
    return data;
};

/**
 * Get seasonal pricing configurations for a business
 */
export const fetchSeasonalPricingByBusinessId = async (
    businessId: string
): Promise<SeasonalPricing[]> => {
    const { data } = await apiClient.get<SeasonalPricing[]>(
        `${BASE_PATH}/business/${businessId}`
    );
    return Array.isArray(data) ? data : [];
};

/**
 * Get seasonal pricing for a specific room
 * Returns single pricing configuration for the room
 */
export const fetchSeasonalPricingByRoomId = async (
    roomId: string
): Promise<SeasonalPricing | null> => {
    try {
        const { data } = await apiClient.get<SeasonalPricing>(
            `${BASE_PATH}/room/${roomId}`
        );
        return data;
    } catch (error: any) {
        // Return null if no pricing exists
        if (error?.response?.status === 404) {
            return null;
        }
        throw error;
    }
};

/**
 * Create seasonal pricing configuration
 */
export const createSeasonalPricing = async (
    request: CreateSeasonalPricingRequest
): Promise<SeasonalPricing> => {
    const { data } = await apiClient.post<{ message: string; data: SeasonalPricing }>(
        BASE_PATH,
        request
    );
    return data.data;
};

/**
 * Update seasonal pricing configuration
 */
export const updateSeasonalPricing = async (
    id: string,
    request: UpdateSeasonalPricingRequest
): Promise<SeasonalPricing> => {
    const { data } = await apiClient.put<{ message: string; data: SeasonalPricing }>(
        `${BASE_PATH}/${id}`,
        request
    );
    return data.data;
};

/**
 * Create or update seasonal pricing (upsert)
 * Creates new if doesn't exist, updates if exists for room/business
 */
export const upsertSeasonalPricing = async (
    request: CreateSeasonalPricingRequest
): Promise<SeasonalPricing> => {
    const { data } = await apiClient.post<{ message: string; data: SeasonalPricing }>(
        `${BASE_PATH}/upsert`,
        request
    );
    return data.data;
};

/**
 * Delete seasonal pricing configuration
 */
export const deleteSeasonalPricing = async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
};

/**
 * Calculate price for a specific date
 */
export const calculatePriceForDate = async (
    roomId: string,
    date: string
): Promise<PriceCalculation> => {
    const { data } = await apiClient.get<PriceCalculation>(
        `${BASE_PATH}/room/${roomId}/calculate`,
        { params: { date } }
    );
    return data;
};

/**
 * Calculate price for a date range with breakdown
 */
export const calculatePriceForDateRange = async (
    roomId: string,
    startDate: string,
    endDate: string
): Promise<PriceRangeResult> => {
    const { data } = await apiClient.get<PriceRangeResult>(
        `${BASE_PATH}/room/${roomId}/calculate-range`,
        { params: { start_date: startDate, end_date: endDate } }
    );
    return data;
};

/**
 * Helper: Parse JSON array field (handles both string and array)
 */
export const parseArrayField = <T>(
    field: T[] | string | null | undefined,
    defaultValue: T[] = []
): T[] => {
    if (!field) return defaultValue;
    if (typeof field === 'string') {
        try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : defaultValue;
        } catch {
            return defaultValue;
        }
    }
    return Array.isArray(field) ? field : defaultValue;
};

/**
 * Helper: Get the effective price for a date based on local calculation
 */
export const getLocalPriceForDate = (
    pricing: SeasonalPricing,
    dateStr: string
): number => {
    const date = new Date(dateStr + 'T00:00:00');
    const month = date.getMonth() + 1;
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek;

    let price = Number(pricing.base_price) || 0;

    // Parse month arrays
    const peakMonths = parseArrayField<number>(pricing.peak_season_months as number[] | string);
    const highMonths = parseArrayField<number>(pricing.high_season_months as number[] | string);
    const lowMonths = parseArrayField<number>(pricing.low_season_months as number[] | string);
    const weekendDays = parseArrayField<DayOfWeek>(pricing.weekend_days as DayOfWeek[] | string);

    // Seasonal pricing (priority: peak > high > low)
    if (peakMonths.includes(month) && pricing.peak_season_price) {
        price = Number(pricing.peak_season_price);
    } else if (highMonths.includes(month) && pricing.high_season_price) {
        price = Number(pricing.high_season_price);
    } else if (lowMonths.includes(month) && pricing.low_season_price) {
        price = Number(pricing.low_season_price);
    }

    // Weekend pricing (overrides if higher)
    const weekendPrice = Number(pricing.weekend_price) || 0;
    if (weekendDays.includes(dayName) && weekendPrice > price) {
        price = weekendPrice;
    }

    return price;
};

/**
 * Helper: Calculate total price for a date range locally
 */
export const calculateLocalPriceForDateRange = (
    pricing: SeasonalPricing,
    startDateStr: string,
    endDateStr: string
): number => {
    let totalPrice = 0;
    const currentDate = new Date(startDateStr + 'T00:00:00');
    const endDate = new Date(endDateStr + 'T00:00:00');

    while (currentDate < endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        totalPrice += getLocalPriceForDate(pricing, dateStr);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return totalPrice;
};

/**
 * Helper: Get the lowest available price from pricing config
 */
export const getLowestPrice = (
    pricing: SeasonalPricing | null,
    defaultPrice: number
): number => {
    if (!pricing) return defaultPrice;

    const prices = [
        pricing.base_price,
        pricing.low_season_price,
        pricing.high_season_price,
        pricing.peak_season_price,
        pricing.weekend_price,
    ].filter((p): p is number => p !== null && p !== undefined && p > 0);

    return prices.length > 0 ? Math.min(...prices) : defaultPrice;
};

/**
 * Helper: Get the highest available price from pricing config
 */
export const getHighestPrice = (
    pricing: SeasonalPricing | null,
    defaultPrice: number
): number => {
    if (!pricing) return defaultPrice;

    const prices = [
        pricing.base_price,
        pricing.low_season_price,
        pricing.high_season_price,
        pricing.peak_season_price,
        pricing.weekend_price,
    ].filter((p): p is number => p !== null && p !== undefined && p > 0);

    return prices.length > 0 ? Math.max(...prices) : defaultPrice;
};

/**
 * Helper: Format currency
 */
export const formatPrice = (price: number): string => {
    return `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
};

/**
 * Default export for convenient imports
 */
export default {
    fetchAllSeasonalPricing,
    fetchSeasonalPricingById,
    fetchSeasonalPricingByBusinessId,
    fetchSeasonalPricingByRoomId,
    createSeasonalPricing,
    updateSeasonalPricing,
    upsertSeasonalPricing,
    deleteSeasonalPricing,
    calculatePriceForDate,
    calculatePriceForDateRange,
    parseArrayField,
    getLocalPriceForDate,
    calculateLocalPriceForDateRange,
    getLowestPrice,
    getHighestPrice,
    formatPrice,
};
