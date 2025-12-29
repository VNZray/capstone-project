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

export interface CreateSeasonalPricingRequest {
    business_id: string;
    room_id?: string | null;
    base_price: number;
    weekend_price?: number | null;
    weekend_days?: DayOfWeek[] | null;
    peak_season_price?: number | null;
    peak_season_months?: number[] | null;
    high_season_price?: number | null;
    high_season_months?: number[] | null;
    low_season_price?: number | null;
    low_season_months?: number[] | null;
    is_active?: boolean;
}

export interface UpdateSeasonalPricingRequest {
    base_price?: number;
    weekend_price?: number | null;
    weekend_days?: DayOfWeek[] | null;
    peak_season_price?: number | null;
    peak_season_months?: number[] | null;
    high_season_price?: number | null;
    high_season_months?: number[] | null;
    low_season_price?: number | null;
    low_season_months?: number[] | null;
    is_active?: boolean;
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

// Constants for UI
export const MONTHS = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
];

export const DAYS_OF_WEEK: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

export const SEASON_COLORS = {
    peak: '#ef4444', // red
    high: '#f97316', // orange
    low: '#22c55e', // green
    base: '#6b7280', // gray
    weekend: '#8b5cf6', // purple
} as const;

export const PRICE_TYPE_LABELS = {
    default: 'Default',
    base: 'Base Rate',
    weekend: 'Weekend Rate',
    peak_season: 'Peak Season',
    high_season: 'High Season',
    low_season: 'Low Season',
} as const;

// Default weekend days (Friday, Saturday, Sunday)
export const DEFAULT_WEEKEND_DAYS: DayOfWeek[] = ['Friday', 'Saturday', 'Sunday'];

// Default season months
export const DEFAULT_PEAK_MONTHS = [6, 7, 8]; // Jun-Aug
export const DEFAULT_HIGH_MONTHS = [12, 1, 2]; // Dec-Feb
export const DEFAULT_LOW_MONTHS = [3, 4, 5, 9, 10, 11]; // Mar-May, Sep-Nov
