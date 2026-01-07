/**
 * Seasonal Pricing Types
 *
 * Defines types for seasonal and weekend pricing configurations
 */

export type SeasonType = 'peak' | 'high' | 'low' | 'base';
export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface SeasonalPricing {
    id: string;
    business_id: string;
    room_id: string | null;
    base_price: number;
    weekend_price: number | null;
    weekend_days: DayOfWeek[] | null;
    peak_season_price: number | null;
    peak_season_months: number[] | null;
    high_season_price: number | null;
    high_season_months: number[] | null;
    low_season_price: number | null;
    low_season_months: number[] | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Joined fields
    business_name?: string;
    room_number?: string;
    room_type?: string;
    default_price?: number;
}

export interface PriceCalculation {
    price: number;
    price_type: 'default' | 'base' | 'weekend' | 'peak_season' | 'high_season' | 'low_season';
    date: string;
    day_name: string;
}

export interface PriceBreakdown {
    date: string;
    day_name: string;
    price: number;
    price_type: string;
}

export interface PriceRangeSummary {
    total_price: number;
    nights: number;
    check_in: string;
    check_out: string;
}

export interface PriceRangeResult {
    breakdown: PriceBreakdown[];
    summary: PriceRangeSummary;
}

// Price type display labels
export const PRICE_TYPE_LABELS: Record<string, string> = {
    default: 'Standard Rate',
    base: 'Base Rate',
    weekend: 'Weekend Rate',
    peak_season: 'Peak Season',
    high_season: 'High Season',
    low_season: 'Low Season',
};

// Season colors for UI
export const SEASON_COLORS = {
    peak: '#ef4444',
    high: '#f97316',
    low: '#22c55e',
    base: '#6b7280',
    weekend: '#8b5cf6',
} as const;
