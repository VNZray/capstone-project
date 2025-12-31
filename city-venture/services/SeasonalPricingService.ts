/**
 * Seasonal Pricing Service
 *
 * Handles API calls for seasonal and weekend pricing configurations
 * Uses month-based seasons (peak, high, low) and weekend day pricing
 */

import apiClient from './apiClient';
import type {
    SeasonalPricing,
    PriceCalculation,
    PriceRangeResult,
    PriceBreakdown,
    DayOfWeek,
} from '@/types/SeasonalPricing';

const BASE_PATH = '/seasonal-pricing';

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

// Helper to parse JSON array field
const parseArrayField = <T>(field: T[] | string | null | undefined): T[] => {
    if (!field) return [];
    if (typeof field === 'string') {
        try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return Array.isArray(field) ? field : [];
};

/**
 * Helper: Get the effective price for a date based on local calculation
 * Used when we have seasonal pricing configured
 */
export const getLocalPriceForDate = (
    pricing: SeasonalPricing,
    dateStr: string
): number => {
    const date = new Date(dateStr + 'T00:00:00');
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek;

    // Ensure all prices are numbers
    let price = Number(pricing.base_price) || 0;

    // Parse month arrays
    const peakMonths = parseArrayField(pricing.peak_season_months);
    const highMonths = parseArrayField(pricing.high_season_months);
    const lowMonths = parseArrayField(pricing.low_season_months);
    const weekendDays = parseArrayField(pricing.weekend_days);

    // Check seasonal pricing (priority: peak > high > low)
    if (peakMonths.includes(month) && pricing.peak_season_price) {
        price = Number(pricing.peak_season_price) || price;
    } else if (highMonths.includes(month) && pricing.high_season_price) {
        price = Number(pricing.high_season_price) || price;
    } else if (lowMonths.includes(month) && pricing.low_season_price) {
        price = Number(pricing.low_season_price) || price;
    }

    // Weekend pricing overrides if higher
    const weekendPrice = Number(pricing.weekend_price) || 0;
    if (weekendDays.includes(dayName) && weekendPrice > 0) {
        if (weekendPrice > price) {
            price = weekendPrice;
        }
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
        const price = getLocalPriceForDate(pricing, dateStr);
        totalPrice += price;
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return totalPrice;
};

/**
 * Helper: Get detailed price breakdown for a date range
 */
export const getDetailedPriceBreakdown = (
    pricing: SeasonalPricing,
    startDateStr: string,
    endDateStr: string
): PriceBreakdown[] => {
    const breakdown: PriceBreakdown[] = [];

    const currentDate = new Date(startDateStr + 'T00:00:00');
    const endDate = new Date(endDateStr + 'T00:00:00');

    // Parse arrays once for efficiency
    const peakMonths = parseArrayField(pricing.peak_season_months);
    const highMonths = parseArrayField(pricing.high_season_months);
    const lowMonths = parseArrayField(pricing.low_season_months);
    const weekendDays = parseArrayField(pricing.weekend_days);

    while (currentDate < endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const month = currentDate.getMonth() + 1;
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

        let priceType = 'base';
        if (peakMonths.includes(month) && pricing.peak_season_price) {
            priceType = 'peak_season';
        } else if (highMonths.includes(month) && pricing.high_season_price) {
            priceType = 'high_season';
        } else if (lowMonths.includes(month) && pricing.low_season_price) {
            priceType = 'low_season';
        }

        const price = getLocalPriceForDate(pricing, dateStr);

        // Check if weekend override applied
        if (weekendDays.includes(dayName as DayOfWeek) && pricing.weekend_price) {
            if (Number(pricing.weekend_price) >= price) {
                priceType = 'weekend';
            }
        }

        breakdown.push({
            date: dateStr,
            day_name: dayName,
            price,
            price_type: priceType,
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return breakdown;
};

/**
 * Helper: Format price breakdown for display
 */
export const formatPriceBreakdown = (breakdown: PriceBreakdown[]): string => {
    const groupedByType: Record<string, { count: number; price: number }> = {};

    for (const item of breakdown) {
        const key = item.price_type;
        if (!groupedByType[key]) {
            groupedByType[key] = { count: 0, price: item.price };
        }
        groupedByType[key].count++;
    }

    const lines: string[] = [];
    for (const [type, info] of Object.entries(groupedByType)) {
        const label = type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        lines.push(`${info.count} night(s) @ ₱${info.price.toLocaleString()} (${label})`);
    }

    return lines.join('\n');
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

export default {
    fetchSeasonalPricingByBusinessId,
    fetchSeasonalPricingByRoomId,
    calculatePriceForDate,
    calculatePriceForDateRange,
    getLocalPriceForDate,
    calculateLocalPriceForDateRange,
    getDetailedPriceBreakdown,
    formatPriceBreakdown,
    getLowestPrice,
    getHighestPrice,
};
