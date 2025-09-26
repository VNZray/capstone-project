import { card } from '@/constants/color';
import React, { ReactNode } from 'react';
import {
  Platform,
  StyleProp,
  StyleSheet,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native';

type Variant = 'solid' | 'soft' | 'outlined';

type ContainerProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 1 | 2 | 3 | 4 | 5 | 6;
  width?: number | string;
  height?: number | string;
  direction?: 'row' | 'column';
  padding?: number | string;
  margin?: number | string;
  gap?: number;
  backgroundColor?: string;
  flex?: number;
  lightColor?: string;
  darkColor?: string;
  variant?: Variant;
  justify?: ViewStyle['justifyContent']; // ✅ new
  align?: ViewStyle['alignItems']; // ✅ new
  radius?: number | string;
  paddingHorizontal?: number;
  paddingVertical?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  display?: 'flex' | 'none';
};

const Container = ({
  display,
  children,
  style,
  elevation = 1,
  width = '100%',
  height,
  direction = 'column',
  padding = 16,
  margin = 0,
  gap = 20,
  flex,
  backgroundColor,
  lightColor = card.light, 
  darkColor = card.dark, 
  variant = 'solid',
  justify,
  align,
  radius = 8,
  paddingHorizontal,
  paddingVertical,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
}: ContainerProps) => {
  const schemeRaw = useColorScheme(); // 👈 detect dark / light mode
  const scheme: 'light' | 'dark' | null =
    schemeRaw === 'light' || schemeRaw === 'dark' ? schemeRaw : null;

  const isDark = scheme === 'dark';
  const bgColor = backgroundColor ?? (isDark ? darkColor : lightColor);
  
  // Hide elevation on Android when background is transparent
  const isTransparent = backgroundColor === 'transparent';
  const effectiveElevation = Platform.OS === 'android' && isTransparent ? 0 : elevation;

  const variantStyle = getVariantStyle(variant, bgColor, isDark);

  return (
    <View
      style={[
        styles.base,
        {
          flex,
          width,
          height,
          flexDirection: direction,
          padding: padding,
          margin,
          gap,
          justifyContent: justify,
          alignItems: align,
          borderRadius: radius,
          paddingHorizontal,
          paddingVertical,
          paddingTop,
          paddingBottom,
          paddingLeft,
          paddingRight,
          display,
        } as ViewStyle,
        variantStyle,
        getPlatformElevation(effectiveElevation),
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default Container;

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    ...Platform.select({
      android: {
        // Android-specific base styles for better visual consistency
        overflow: 'hidden', // Ensure proper clipping for elevation
      },
    }),
  },
});

function getPlatformElevation(level: number): ViewStyle {
  if (Platform.OS === 'android') {
    // Enhanced elevation for Android with better shadows
    const elevationStyles: ViewStyle = {
      elevation: level,
    };
    
    // Add subtle shadow overlay for better depth perception on Android
    if (level > 0) {
      elevationStyles.shadowColor = '#000';
      elevationStyles.shadowOffset = { width: 0, height: level / 2 };
      elevationStyles.shadowOpacity = 0.1 + (level * 0.02);
      elevationStyles.shadowRadius = level * 0.8;
    }
    
    return elevationStyles;
  }

  switch (level) {
    case 1:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.1,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
      };
    case 2:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.15,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      };
    case 3:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 3 },
      };
    case 4:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.25,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 4 },
      };
    case 5:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 5 },
      };
    case 6:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.35,
        shadowRadius: 7,
        shadowOffset: { width: 0, height: 6 },
      };
    default:
      return {};
  }
}

function getVariantStyle(
  variant: Variant,
  bgColor: string,
  isDark: boolean
): ViewStyle {
  const baseStyle: ViewStyle = {};
  
  switch (variant) {
    case 'solid':
      baseStyle.backgroundColor = bgColor;
      break;
    case 'soft':
      baseStyle.backgroundColor = addOpacity(bgColor, isDark ? 0.4 : 0.4);
      break;
    case 'outlined':
      baseStyle.backgroundColor = addOpacity(bgColor, 0.02);
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = addOpacity(bgColor, isDark ? 0.4 : 0.25);
      break;
    default:
      break;
  }

  // Add Android-specific enhancements
  if (Platform.OS === 'android') {
    return {
      ...baseStyle,
      // Better anti-aliasing on Android
      borderStyle: 'solid',
      // Ensure proper rendering of borders and backgrounds
      ...(variant === 'outlined' && {
        borderWidth: StyleSheet.hairlineWidth > 1 ? 1 : StyleSheet.hairlineWidth,
      }),
    };
  }

  return baseStyle;
}

function addOpacity(color: string, opacity: number): string {
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/, `${opacity})`);
  }

  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }

  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
