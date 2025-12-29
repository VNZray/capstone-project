/**
 * Seasonal Pricing Service
 *
 * Frontend service for managing seasonal and weekend pricing configurations
 */

import apiClient from "./apiClient";
import type {
    SeasonalPricing,
    CreateSeasonalPricingRequest,
    UpdateSeasonalPricingRequest,
    PriceCalculation,
    PriceRangeResult,
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
        `${BASE_PATH}/calculate/${roomId}/date`,
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
        `${BASE_PATH}/calculate/${roomId}/range`,
        { params: { start_date: startDate, end_date: endDate } }
    );
    return data;
};

/**
 * Helper: Format price breakdown for display
 */
export const formatPriceBreakdown = (result: PriceRangeResult): string => {
    const groupedByType: Record<string, { count: number; price: number }> = {};

    for (const item of result.breakdown) {
        const key = item.price_type;
        if (!groupedByType[key]) {
            groupedByType[key] = { count: 0, price: item.price };
        }
        groupedByType[key].count++;
    }

    const lines: string[] = [];
    for (const [type, info] of Object.entries(groupedByType)) {
        const label = type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        lines.push(`${info.count} night(s) @ ₱${info.price.toLocaleString()} (${label})`);
    }

    return lines.join('\n');
};

/**
 * Helper: Get current season type for a date
 */
export const getSeasonTypeForDate = (
    date: Date,
    pricing: SeasonalPricing | null
): 'peak' | 'high' | 'low' | 'base' => {
    if (!pricing) return 'base';

    const month = date.getMonth() + 1; // getMonth() is 0-indexed

    if (pricing.peak_season_months?.includes(month)) return 'peak';
    if (pricing.high_season_months?.includes(month)) return 'high';
    if (pricing.low_season_months?.includes(month)) return 'low';

    return 'base';
};

/**
 * Helper: Check if a date is a weekend day based on pricing config
 */
export const isWeekendDay = (date: Date, pricing: SeasonalPricing | null): boolean => {
    if (!pricing?.weekend_days) return false;

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return pricing.weekend_days.includes(dayName as any);
};
