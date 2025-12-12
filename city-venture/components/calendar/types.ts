// Shared types for calendar components

// Date marker status for styling
export type DateMarkerStatus = 'none' | 'primary' | 'warning' | 'error';

// Individual date marker info
export type DateMarker = {
    date: Date;
    status: DateMarkerStatus;
    label?: string;
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
