// Shared types for calendar components

// Date marker status for styling
// - none: no special styling
// - primary: selected/active state (blue)
// - warning: reserved/pending booking (yellow/orange)
// - error: occupied/blocked/unavailable (red)
export type DateMarkerStatus = 'none' | 'primary' | 'warning' | 'error';

// Individual date marker info
export type DateMarker = {
    date: Date;
    status: DateMarkerStatus;
    label?: string;
    // Optional: identify the type of marker for legend display
    markerType?: 'booking' | 'blocked';
};

// Calendar theme colors (derived from app theme)
export type CalendarTheme = {
    primary: string;
    primaryLight: string;
    warning: string;
    warningLight: string;
    error: string;
    errorLight: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    surface: string;
    active: string;
};

// Common calendar props
export type BaseCalendarProps = {
    minDate?: Date;
    maxDate?: Date;
    markers?: DateMarker[];
    theme?: Partial<CalendarTheme>;
};
