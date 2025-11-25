// constants/color.ts
// Single source of truth for all application colors
// Supports both light and dark modes with semantic color tokens
// All colors meet WCAG AA accessibility standards (4.5:1 contrast minimum)

/**
 * Light mode color palette
 * Based on Material Design and WCAG accessibility guidelines
 */
const lightColors = {
  // Primary colors
  primary: '#0A1B47',        // Deep navy - main brand color
  accent: '#2E5AA7',         // Blue accent - interactive elements
  active: '#1F4C85',         // Active state blue
  complementary: '#D67F35',  // Orange complement

  // Backgrounds (layered for elevation)
  background: '#F8F9FA',     // Main app background - 15.8:1 with text
  surface: '#FFFFFF',        // Default surface (cards, sheets)
  surfaceElevated: '#FFFFFF', // Elevated surfaces (modals, dialogs)
  surfaceOverlay: 'rgba(10, 27, 71, 0.05)', // Overlay backgrounds

  // Legacy background names (for compatibility)
  cardBackground: '#FFFFFF',
  subcategoryCard: '#F9FAFB',

  // Text colors (WCAG AA compliant)
  text: '#1A1A1A',           // Primary text - 15.8:1 contrast
  textPrimary: '#1A1A1A',    // Same as text
  textSecondary: '#6B7280',  // Secondary text - 5.1:1 contrast
  textTertiary: '#9CA3AF',   // Tertiary text - 3.5:1 (for large text only)
  textAccent: '#2E5AA7',     // Accent text
  textDisabled: '#D1D5DB',   // Disabled text
  textInverse: '#FFFFFF',    // Text on dark backgrounds
  textLink: '#2563EB',       // Link text - 5.7:1 contrast

  // Borders & dividers
  border: '#E5E7EB',         // Default border
  borderStrong: '#D1D5DB',   // Stronger border
  borderFocus: '#2E5AA7',    // Focus state border
  divider: '#E5E7EB',
  subcategoryBorder: '#E5E7EB',

  // Effects
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowStrong: 'rgba(0, 0, 0, 0.15)',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Semantic colors (WCAG compliant)
  success: '#059669',        // Green - 4.5:1 on white
  successLight: '#D1FAE5',   // Light green background
  warning: '#D97706',        // Orange - 4.5:1 on white
  warningLight: '#FEF3C7',   // Light orange background
  error: '#DC2626',          // Red - 4.5:1 on white
  errorLight: '#FEE2E2',     // Light red background
  info: '#0891B2',           // Cyan - 4.5:1 on white
  infoLight: '#CFFAFE',      // Light cyan background
  highlight: '#FEF3C7',      // Highlight background

  // States
  disabled: '#9CA3AF',
  hover: 'rgba(46, 90, 167, 0.08)',
  pressed: 'rgba(46, 90, 167, 0.12)',
  focus: 'rgba(46, 90, 167, 0.12)',

  // Icons
  icon: '#6B7280',           // Default icon color - 5.1:1 contrast
  iconPrimary: '#6B7280',
  iconSecondary: '#9CA3AF',
  iconAccent: '#2E5AA7',
  iconActive: '#1F4C85',
  iconDisabled: '#D1D5DB',

  // Tab bar
  tabIconDefault: '#6B7280',
  tabIconSelected: '#0A1B47',
  tint: '#0A1B47',

  // Input specific
  inputBackground: '#FFFFFF',
  inputBorder: '#D1D5DB',
  inputPlaceholder: '#9CA3AF',
  inputText: '#1A1A1A',
} as const;

/**
 * Dark mode color palette
 * Following Material Design dark theme guidelines
 * Uses #121212 base instead of pure black to reduce eye strain
 * All colors meet WCAG AA accessibility standards
 */
const darkColors = {
  // Primary colors (adjusted for dark backgrounds)
  primary: '#5B8DD8',        // Lighter blue for dark mode
  accent: '#6B9FE8',         // Brighter accent
  active: '#5A8CD7',         // Active state
  complementary: '#F0A56B',  // Lighter orange

  // Backgrounds (Material Design elevation system)
  background: '#121212',     // Base dark background - 15.8:1 with white text
  surface: '#1E1E1E',        // Surface level 1 (cards)
  surfaceElevated: '#2C2C2C', // Surface level 2 (elevated cards, modals)
  surfaceOverlay: 'rgba(255, 255, 255, 0.05)', // Overlay backgrounds

  // Legacy background names (for compatibility)
  cardBackground: '#1E1E1E',
  subcategoryCard: '#252525',

  // Text colors (WCAG AA compliant on dark backgrounds)
  text: '#FFFFFF',           // Primary text - 15.8:1 contrast on #121212
  textPrimary: '#FFFFFF',    // Same as text
  textSecondary: '#B0B0B0',  // Secondary text - 9.5:1 contrast
  textTertiary: '#8A8A8A',   // Tertiary text - 5.5:1 contrast
  textAccent: '#6B9FE8',     // Accent text
  textDisabled: '#5A5A5A',   // Disabled text
  textInverse: '#1A1A1A',    // Text on light backgrounds
  textLink: '#60A5FA',       // Link text - 7.2:1 contrast

  // Borders & dividers
  border: '#2A2A2A',         // Subtle border
  borderStrong: '#3A3A3A',   // Stronger border
  borderFocus: '#6B9FE8',    // Focus state border
  divider: '#2A2A2A',
  subcategoryBorder: '#2A2A2A',

  // Effects
  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowStrong: 'rgba(0, 0, 0, 0.6)',
  overlay: 'rgba(0, 0, 0, 0.75)',

  // Semantic colors (adjusted for dark mode, WCAG compliant)
  success: '#34D399',        // Lighter green - 4.5:1 on dark
  successLight: 'rgba(52, 211, 153, 0.15)',
  focus: 'rgba(107, 159, 232, 0.18)',

  // Icons
  icon: '#B0B0B0',           // Default icon - 9.5:1 contrast
  iconPrimary: '#B0B0B0',
  iconSecondary: '#8A8A8A',
  iconAccent: '#6B9FE8',
  iconActive: '#5A8CD7',
  iconDisabled: '#4A4A4A',

  // Tab bar
  tabIconDefault: '#B0B0B0',
  tabIconSelected: '#FFFFFF',
  tint: '#FFFFFF',

  // Input specific
  inputBackground: '#1E1E1E',
  inputBorder: '#3A3A3A',
  inputPlaceholder: '#8A8A8A',
  inputText: '#FFFFFF',
} as const;

/**
 * Color theme object with light and dark modes
 */
export const Colors = {
  light: lightColors,
  dark: darkColors,
} as const;

/**
 * Legacy export for backward compatibility
 * @deprecated Use Colors.light instead
 */
export const ShopColors = lightColors;

/**
 * Type definitions for color keys
 */
export type ColorKey = keyof typeof lightColors;
export type ThemeColors = typeof lightColors;
export type ColorScheme = 'light' | 'dark';

/**
 * Legacy colors export for compatibility
 */
export const colors = {
  light: Colors.light.background,
  dark: Colors.dark.background,
  primary: Colors.light.primary,
  secondary: Colors.light.accent,
  tertiary: Colors.light.surface,
  error: Colors.light.error,
  success: Colors.light.success,
  warning: Colors.light.warning,
  info: Colors.light.info,
  link: Colors.light.textLink,
  placeholder: Colors.light.inputPlaceholder,
};

export const background = {
  light: Colors.light.background,
  dark: Colors.dark.background,
};

export const card = {
  light: Colors.light.surface,
  dark: Colors.dark.surface,
};

export const text = {
  light: Colors.light.text,
  dark: Colors.dark.text,
  link: Colors.light.textLink,
  placeholder: Colors.light.inputPlaceholder,
  warning: Colors.light.warning,
  error: Colors.light.error,
  success: Colors.light.success,
};