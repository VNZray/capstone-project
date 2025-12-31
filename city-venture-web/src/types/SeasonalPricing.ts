/**
 * Seasonal Pricing Types
 *
 * Defines types for seasonal and weekend pricing configurations
 * Uses month-based seasons (peak, high, low) and weekend day pricing
 */

export type SeasonType = 'peak' | 'high' | 'low' | 'base';
export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface SeasonalPricing {
    id: string;
    business_id: string;
    room_id: string | null;
    base_price: number;
    weekend_price: number | null;
    weekend_days: DayOfWeek[] | string | null;
    peak_season_price: number | null;
    peak_season_months: number[] | string | null;
    high_season_price: number | null;
    high_season_months: number[] | string | null;
    low_season_price: number | null;
    low_season_months: number[] | string | null;
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

// Constants for the seasonal pricing form
export const MONTHS = [
    { value: 1, label: 'January', short: 'Jan' },
    { value: 2, label: 'February', short: 'Feb' },
    { value: 3, label: 'March', short: 'Mar' },
    { value: 4, label: 'April', short: 'Apr' },
    { value: 5, label: 'May', short: 'May' },
    { value: 6, label: 'June', short: 'Jun' },
    { value: 7, label: 'July', short: 'Jul' },
    { value: 8, label: 'August', short: 'Aug' },
    { value: 9, label: 'September', short: 'Sep' },
    { value: 10, label: 'October', short: 'Oct' },
    { value: 11, label: 'November', short: 'Nov' },
    { value: 12, label: 'December', short: 'Dec' },
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

// Default selections for form
export const DEFAULT_WEEKEND_DAYS: DayOfWeek[] = ['Friday', 'Saturday'];
export const DEFAULT_PEAK_MONTHS: number[] = [12, 1, 2]; // Dec, Jan, Feb (holiday season)
export const DEFAULT_HIGH_MONTHS: number[] = [3, 4, 5]; // Mar, Apr, May (spring)
export const DEFAULT_LOW_MONTHS: number[] = [6, 7, 8]; // Jun, Jul, Aug (summer off-season)

// Price type display labels
export const PRICE_TYPE_LABELS: Record<string, string> = {
    default: 'Standard Rate',
    base: 'Base Rate',
    weekend: 'Weekend Rate',
    peak_season: 'Peak Season',
    high_season: 'High Season',
    low_season: 'Low Season',
};

// Season display colors
export const SEASON_COLORS = {
    peak: '#ef4444',   // Red
    high: '#f59e0b',   // Amber
    low: '#22c55e',    // Green
    base: '#6b7280',   // Gray
    weekend: '#8b5cf6', // Purple
} as const;
