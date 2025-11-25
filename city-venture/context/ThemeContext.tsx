import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, ColorScheme } from '@/constants/color';

const THEME_STORAGE_KEY = '@city_venture_theme_preference';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  /** Current active color scheme ('light' or 'dark') */
  colorScheme: ColorScheme;
  /** User's theme preference ('light', 'dark', or 'system') */
  themeMode: ThemeMode;
  /** Current theme colors based on active color scheme */
  colors: typeof Colors.light | typeof Colors.dark;
  /** Toggle between light and dark (cycles through system -> light -> dark) */
  toggleTheme: () => void;
  /** Set a specific theme mode */
  setThemeMode: (mode: ThemeMode) => void;
  /** Whether dark mode is active */
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useRNColorScheme() ?? 'light';
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isReady, setIsReady] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsReady(true);
    }
  };

  const saveThemePreference = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Determine the active color scheme based on theme mode
  const colorScheme: ColorScheme = themeMode === 'system' ? systemColorScheme : themeMode;
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    saveThemePreference(mode);
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = 
      themeMode === 'system' ? 'light' :
      themeMode === 'light' ? 'dark' : 'system';
    setThemeMode(nextMode);
  };

  // Don't render until theme is loaded
  if (!isReady) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        themeMode,
        colors,
        toggleTheme,
        setThemeMode,
        isDark,
      }}
    >
      {/* Automatically manage StatusBar based on theme */}
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * @returns Theme context with colors, theme mode, and toggle functions
 * @example
 * const { colors, isDark, toggleTheme } = useTheme();
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook to get a specific color from the current theme
 * @param colorKey - Key of the color to retrieve
 * @returns The color value for the current theme
 * @example
 * const backgroundColor = useThemeColor('background');
 * const textColor = useThemeColor('text');
 */
export function useThemeColor<K extends keyof typeof Colors.light>(colorKey: K): string {
  const { colors } = useTheme();
  return colors[colorKey];
}
