// constants/color.ts
// Single source of truth for all application colors
// Based on "Midnight & Sunlight" Design System v2.3
// All colors meet WCAG AA accessibility standards (4.5:1 contrast minimum)
//
// Design Philosophy: "The Art Gallery"
// - Minimalist Structure, Vibrant Content
// - 60% Neutral (backgrounds, whitespace)
// - 30% Brand (text, headers - Deep Navy)
// - 10% Accent (buttons, highlights - Solar Gold)

// ============================================================================
// BRAND COLORS - The Foundation
// ============================================================================
const BRAND = {
  deepNavy: '#0A1B47',      // Primary Brand - Headers, Text (Light), Primary Buttons
  solarGold: '#FFB703',     // Primary Action - CTAs, FABs, Notification Badges
  vividBlue: '#3B82F6',     // Interactive - Text links, active states, focus rings
} as const;

// ============================================================================
// SLATE SCALE - Cool Neutral Palette (Harmonizes with Navy)
// ============================================================================
const SLATE = {
  50: '#F8FAFC',   // Light Mode: App Background
  100: '#F1F5F9',  // Light Mode: Card Backgrounds | Dark Mode: Text (High Emphasis)
  200: '#E2E8F0',  // Dividers, Borders | Dark Mode: Icons
  300: '#CBD5E1',  // Strong borders
  400: '#94A3B8',  // Disabled States | Dark Mode: Secondary Text
  500: '#64748B',  // Secondary Text
  700: '#334155',  // Dark Mode: Strong borders
  800: '#1E293B',  // Dark Mode: Card Surfaces, Text (Secondary in Light)
  900: '#0F172A',  // Dark Mode: App Background (Slate)
  950: '#020617',  // Dark Mode: App Background (Midnight Navy)
} as const;

// ============================================================================
// SEMANTIC COLORS - Logo Integration (Functional Only, Never Decorative)
// ============================================================================
const SEMANTIC = {
  // Success / Nature - Emerald Green
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#34D399',
  successDarkBg: 'rgba(52, 211, 153, 0.15)',
  
  // Error / History - Rose Red
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#F87171',
  errorDarkBg: 'rgba(248, 113, 113, 0.15)',
  
  // Warning / Food - Amber Orange
  warning: '#F97316',
  warningLight: '#FFEDD5',
  warningDark: '#FB923C',
  warningDarkBg: 'rgba(251, 146, 60, 0.15)',
  
  // Info / Water - Sky Blue
  info: '#0EA5E9',
  infoLight: '#E0F2FE',
  infoDark: '#38BDF8',
  infoDarkBg: 'rgba(56, 189, 248, 0.15)',
} as const;

// ============================================================================
// LIGHT MODE - "Sunlight" Theme
// ============================================================================
/**
 * Light mode color palette
 * Background: Slate 50 (#F8FAFC) - Creates a premium, airy feel
 * Surface: White with subtle shadow
 * Primary Text: Deep Navy (#0A1B47) - Replaces standard black
 * Contrast Ratios: All meet WCAG AA (4.5:1 minimum)
 */
export const lightColors = {
  // Primary Brand Colors
  primary: BRAND.deepNavy,
  accent: BRAND.solarGold,
  active: BRAND.vividBlue,

  // Backgrounds (Slate Scale)
  background: SLATE[50],
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceOverlay: 'rgba(10, 27, 71, 0.05)',

  // Legacy background names (for backward compatibility)
  cardBackground: '#FFFFFF',
  subcategoryCard: SLATE[100],

  // Text Colors (Deep Navy replaces black for brand consistency)
  text: BRAND.deepNavy,
  textPrimary: BRAND.deepNavy,
  textSecondary: SLATE[500],
  textTertiary: SLATE[400],
  textAccent: BRAND.vividBlue,
  textDisabled: SLATE[300],
  textInverse: '#FFFFFF',
  textLink: BRAND.vividBlue,

  // Borders
  border: SLATE[200],
  borderStrong: SLATE[300],
  borderFocus: BRAND.vividBlue,
  divider: SLATE[200],
  subcategoryBorder: SLATE[200],

  // Effects (Shadow uses Navy tint for brand consistency)
  shadow: 'rgba(10, 27, 71, 0.08)',
  shadowStrong: 'rgba(10, 27, 71, 0.12)',
  overlay: 'rgba(15, 23, 42, 0.5)',

  // Semantic Colors (Logo Integration - Functional Only)
  success: SEMANTIC.success,
  successLight: SEMANTIC.successLight,
  warning: SEMANTIC.warning,
  warningLight: SEMANTIC.warningLight,
  error: SEMANTIC.error,
  errorLight: SEMANTIC.errorLight,
  info: SEMANTIC.info,
  infoLight: SEMANTIC.infoLight,
  highlight: '#FEF3C7',

  // States
  disabled: SLATE[400],
  hover: 'rgba(59, 130, 246, 0.08)',
  pressed: 'rgba(59, 130, 246, 0.12)',
  focus: 'rgba(59, 130, 246, 0.12)',

  // Icons
  icon: SLATE[500],
  iconPrimary: BRAND.deepNavy,
  iconSecondary: SLATE[400],
  iconAccent: BRAND.vividBlue,
  iconActive: BRAND.vividBlue,
  iconDisabled: SLATE[300],

  // Tab Bar
  tabIconDefault: SLATE[400],
  tabIconSelected: BRAND.deepNavy,
  tint: BRAND.deepNavy,

  // Input Fields (Minimalist style per design guide)
  inputBackground: SLATE[100],
  inputBorder: 'transparent',
  inputBorderFocus: BRAND.vividBlue,
  inputPlaceholder: SLATE[400],
  inputText: BRAND.deepNavy,

  // Navigation Bar (Glassmorphism)
  navbarBackground: 'rgba(255, 255, 255, 0.9)',
  navbarBorder: SLATE[200],

  // Buttons
  buttonPrimaryBg: BRAND.deepNavy,
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: 'transparent',
  buttonSecondaryBorder: SLATE[200],
  buttonSecondaryText: BRAND.deepNavy,
} as const;

// ============================================================================
// DARK MODE - "Midnight" Theme
// ============================================================================
/**
 * Dark mode color palette
 * Background: #020617 (Darker Navy) - Preserves brand identity better than black
 * Surface: Slate 900 (#0F172A)
 * Primary Text: Slate 100 (#F1F5F9)
 * Primary Action Button: White or Solar Gold for visibility
 * Contrast Ratios: All meet WCAG AA (4.5:1 minimum)
 */
export const darkColors = {
  // Primary Colors (Adjusted for dark mode visibility)
  primary: BRAND.vividBlue,         // Blue for better visibility on dark
  accent: BRAND.solarGold,          // Solar Gold remains the same
  active: '#60A5FA',                // Lighter Blue (Blue 400)
  complementary: BRAND.solarGold,

  // Backgrounds (Midnight Navy preserves brand identity)
  background: SLATE[950],           // #020617 - Darker Navy (not pure black)
  surface: SLATE[900],              // #0F172A
  surfaceElevated: SLATE[800],      // #1E293B
  surfaceOverlay: 'rgba(255, 255, 255, 0.05)',

  // Legacy background names (for backward compatibility)
  cardBackground: SLATE[900],
  subcategoryCard: SLATE[800],

  // Text Colors
  text: SLATE[100],                 // #F1F5F9 - High emphasis
  textPrimary: SLATE[100],
  textSecondary: SLATE[400],        // #94A3B8
  textTertiary: SLATE[500],         // #64748B
  textAccent: '#60A5FA',            // Lighter Blue
  textDisabled: '#475569',
  textInverse: BRAND.deepNavy,
  textLink: '#60A5FA',

  // Borders
  border: SLATE[800],
  borderStrong: SLATE[700],
  borderFocus: BRAND.vividBlue,
  divider: SLATE[800],
  subcategoryBorder: SLATE[800],

  // Effects
  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowStrong: 'rgba(0, 0, 0, 0.6)',
  overlay: 'rgba(2, 6, 23, 0.8)',

  // Semantic Colors (Brighter for dark mode visibility)
  success: SEMANTIC.successDark,
  successLight: SEMANTIC.successDarkBg,
  warning: SEMANTIC.warningDark,
  warningLight: SEMANTIC.warningDarkBg,
  error: SEMANTIC.errorDark,
  errorLight: SEMANTIC.errorDarkBg,
  info: SEMANTIC.infoDark,
  infoLight: SEMANTIC.infoDarkBg,
  highlight: 'rgba(255, 183, 3, 0.15)',

  // States
  disabled: '#475569',
  hover: 'rgba(59, 130, 246, 0.1)',
  pressed: 'rgba(59, 130, 246, 0.15)',
  focus: 'rgba(59, 130, 246, 0.2)',

  // Icons (Brighter for dark mode)
  icon: SLATE[200],                 // #E2E8F0
  iconPrimary: SLATE[100],
  iconSecondary: SLATE[400],
  iconAccent: '#60A5FA',
  iconActive: '#60A5FA',
  iconDisabled: '#475569',

  // Tab Bar (Solar Gold for visibility per design guide)
  tabIconDefault: SLATE[500],
  tabIconSelected: BRAND.solarGold,
  tint: BRAND.solarGold,

  // Input Fields
  inputBackground: SLATE[900],
  inputBorder: 'transparent',
  inputBorderFocus: BRAND.vividBlue,
  inputPlaceholder: SLATE[500],
  inputText: SLATE[100],

  // Navigation Bar (Glassmorphism - Dark variant)
  navbarBackground: 'rgba(15, 23, 42, 0.9)',
  navbarBorder: SLATE[800],

  // Buttons (White/Gold for visibility per design guide)
  buttonPrimaryBg: '#FFFFFF',
  buttonPrimaryText: BRAND.deepNavy,
  buttonSecondaryBg: 'transparent',
  buttonSecondaryBorder: SLATE[700],
  buttonSecondaryText: SLATE[100],
} as const;

// ============================================================================
// MAIN THEME EXPORT
// ============================================================================
/**
 * Color theme object with light and dark modes
 * This is the primary export - use with useTheme() hook
 * @example
 * const { colors } = useTheme();
 * <View style={{ backgroundColor: colors.background }} />
 */
export const Colors = {
  light: lightColors,
  dark: darkColors,
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
/**
 * All available color token keys
 */
export type ColorKey = keyof typeof lightColors;

/**
 * Full theme colors object type
 */
export type ThemeColors = typeof lightColors;

/**
 * Color scheme identifier
 */
export type ColorScheme = 'light' | 'dark';

// ============================================================================
// LEGACY EXPORTS - DEPRECATED
// These exports maintain backward compatibility but should be migrated
// to use the Colors object with useTheme() hook
// ============================================================================

/**
 * @deprecated Use Colors.light with useTheme() hook instead
 * This only provides light mode colors and is not theme-aware
 * @example
 * // Old (deprecated):
 * import { ShopColors } from '@/constants/color';
 * <Text style={{ color: ShopColors.textPrimary }} />
 * 
 * // New (preferred):
 * import { useTheme } from '@/context/ThemeContext';
 * const { colors } = useTheme();
 * <Text style={{ color: colors.textPrimary }} />
 */
export const ShopColors = lightColors;

/**
 * @deprecated Use Colors with useTheme() hook instead
 * Legacy flat color object - not theme-aware
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

/**
 * @deprecated Use colors.background from useTheme() instead
 */
export const background = {
  light: Colors.light.background,
  dark: Colors.dark.background,
};

/**
 * @deprecated Use colors.surface from useTheme() instead
 */
export const card = {
  light: Colors.light.surface,
  dark: Colors.dark.surface,
};

/**
 * @deprecated Use colors.text* from useTheme() instead
 */
export const text = {
  light: Colors.light.text,
  dark: Colors.dark.text,
  link: Colors.light.textLink,
  placeholder: Colors.light.inputPlaceholder,
  warning: Colors.light.warning,
  error: Colors.light.error,
  success: Colors.light.success,
};

// ============================================================================
// UTILITY EXPORTS
// ============================================================================
/**
 * Brand color constants for direct access when needed
 * Prefer using Colors.light/dark through useTheme() for theme-awareness
 */
export const Brand = BRAND;

/**
 * Slate scale for custom component styling
 */
export const Slate = SLATE;

/**
 * Semantic colors for status indicators
 */
export const Semantic = SEMANTIC;