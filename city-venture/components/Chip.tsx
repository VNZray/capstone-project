import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

export type ChipVariant = 'solid' | 'outlined' | 'soft';
export type ChipColor =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'
  | 'link';
export type ChipSize = 'small' | 'medium' | 'large';

type IconName = React.ComponentProps<typeof FontAwesome5>['name'];

export type ChipProps = {
  label?: string;
  variant?: ChipVariant;
  color?: ChipColor;
  size?: ChipSize;
  elevation?: 1 | 2 | 3 | 4 | 5 | 6;
  disabled?: boolean;
  // Icons
  startIconName?: IconName;
  endIconName?: IconName;
  topIconName?: IconName;
  leftIconName?: IconName; // alias of start
  iconSize?: number; // override auto size
  iconColor?: string; // override auto color
  // Spacing
  padding?: number | string;
  margin?: number | string;
  // Events
  onPress?: () => void;
  onLongPress?: () => void;
  // Styles
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  allowFontScaling?: boolean;
};

const THEME_COLORS: Record<ChipColor, string> = {
  primary: '#0A1B47',
  secondary: '#0077B6',
  neutral: '#DEE3F2',
  error: '#dc3545',
  success: '#198754',
  warning: '#ffc107',
  info: '#0dcaf0',
  link: '#1e90ff',
};

const sizes: Record<ChipSize, { padH: number; padV: number; radius: number; font: number; gap: number; icon: number }>
  = {
    small: { padH: 10, padV: 6, radius: 16, font: 12, gap: 6, icon: 14 },
    medium: { padH: 14, padV: 8, radius: 18, font: 14, gap: 8, icon: 16 },
    large: { padH: 18, padV: 10, radius: 22, font: 16, gap: 10, icon: 18 },
  };

// Diameter for icon-only circular chips
const iconOnlyDiameter: Record<ChipSize, number> = {
  small: 28,
  medium: 34,
  large: 40,
};

function hexToRgb(hex: string) {
  const m = hex.replace('#', '');
  const bigint = parseInt(m.length === 3 ? m.split('').map((c) => c + c).join('') : m, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shade(hex: string, percent: number) {
  // percent: -1..1 (darken..lighten)
  const { r, g, b } = hexToRgb(hex);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent);
  const R = Math.round((t - r) * p) + r;
  const G = Math.round((t - g) * p) + g;
  const B = Math.round((t - b) * p) + b;
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(R)}${toHex(G)}${toHex(B)}`;
}

function getElevation(level: 1 | 2 | 3 | 4 | 5 | 6): ViewStyle {
  const iosShadow: Record<number, ViewStyle> = {
    1: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
    2: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    3: { shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
    4: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    5: { shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
    6: { shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  };
  
  // Enhanced Android elevation with better shadow effects
  const androidElevation: Record<number, ViewStyle> = {
    1: { 
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 1,
    },
    2: { 
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.10,
      shadowRadius: 2,
    },
    3: { 
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 3,
    },
    4: { 
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14,
      shadowRadius: 4,
    },
    5: { 
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.16,
      shadowRadius: 5,
    },
    6: { 
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
    },
  };
  
  return Platform.select<ViewStyle>({ 
    ios: iosShadow[level], 
    android: androidElevation[level], 
    default: androidElevation[level] 
  })!;
}

export default function Chip({
  label,
  variant = 'solid',
  color = 'primary',
  size = 'medium',
  elevation = 0 as any, // allow 0 to mean none
  disabled,
  startIconName,
  endIconName,
  topIconName,
  leftIconName,
  iconSize,
  iconColor,
  padding,
  margin,
  onPress,
  onLongPress,
  style,
  textStyle,
  contentStyle,
  accessibilityLabel,
  allowFontScaling = true,
}: ChipProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const sz = sizes[size];
  const iconSz = iconSize ?? sz.icon;

  const seed = THEME_COLORS[color];

  const tokens = useMemo(() => {
    // Generate surface/background, border, and text/icon colors based on variant and theme.
    // Soft uses tinted background; outlined is transparent bg with stroke; solid is filled.
    const base = seed;
    const surface = isDark ? '#0f1115' : '#ffffff';
    const onSurface = isDark ? '#ECEDEE' : '#0D1B2A';

    let bg: string;
    let border: string;
    let fg: string; // text/icon

    if (variant === 'solid') {
      bg = base;
      fg = isDark ? '#F8FAFC' : '#F8FAFC';
      border = shade(base, isDark ? -0.2 : -0.2);
    } else if (variant === 'outlined') {
      bg = 'transparent';
      fg = base;
      border = isDark ? shade(base, -0.1) : shade(base, -0.1);
    } else {
      // soft
      if (isDark) {
        bg = rgba(base, 0.32); // more opaque background
        fg = '#F8FAFC'; // lighter text for contrast
        border = rgba(base, 0.38);
      } else {
        bg = rgba(base, 0.12);
        fg = base;
        border = rgba(base, 0.2);
      }
    }

    // Disabled state reduces contrast
    if (disabled) {
      const muted = rgba(onSurface, 0.28);
      return {
        bg: variant === 'solid' ? rgba(base, 0.5) : rgba(onSurface, 0.06),
        fg: rgba(onSurface, 0.5),
        border: rgba(onSurface, 0.12),
        surface,
        onSurface,
      };
    }

    return { bg, border, fg, surface, onSurface };
  }, [seed, variant, isDark, disabled]);

  const withTop = !!topIconName;
  const withStart = !!(startIconName || leftIconName);
  const withEnd = !!endIconName;

  const hasLabel = !!(label && label.length > 0);
  const isIconOnly = !hasLabel && (withTop || withStart || withEnd);
  const diameter = iconOnlyDiameter[size];

  const content = (
    <View
      style={[
        styles.content,
        withTop && styles.column,
        !withTop && styles.row,
        { gap: sz.gap },
        contentStyle,
      ]}
    >
      {withTop && (
        <FontAwesome5 name={topIconName as IconName} size={iconSz + 2} color={iconColor ?? tokens.fg} />
      )}
      {!withTop && withStart && (
        <FontAwesome5 name={(startIconName || leftIconName) as IconName} size={iconSz} color={iconColor ?? tokens.fg} />
      )}
      {hasLabel && (
        <Text
          allowFontScaling={allowFontScaling}
          numberOfLines={1}
          style={[styles.text, { color: tokens.fg, fontSize: sz.font }, textStyle]}
        >
          {label}
        </Text>
      )}
      {!withTop && withEnd && (
        <FontAwesome5 name={endIconName as IconName} size={iconSz} color={iconColor ?? tokens.fg} />
      )}
    </View>
  );

  const containerBase: ViewStyle = {
    borderRadius: 999, // pill by default; will be overridden for icon-only
    borderWidth: variant === 'outlined' ? 1 : 0,
    borderColor: tokens.border,
    backgroundColor: tokens.bg,
    paddingHorizontal: sz.padH,
    paddingVertical: sz.padV,
    // Android-specific improvements
    ...Platform.select({
      android: {
        overflow: 'hidden', // Ensure proper clipping for ripple effect
        elevation: elevation && elevation > 0 ? 0 : undefined, // Let parent handle elevation
      },
    }),
  };

  const elevated = elevation && elevation > 0 ? getElevation(elevation as 1 | 2 | 3 | 4 | 5 | 6) : undefined;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={accessibilityLabel ?? label ?? 'Chip'}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.shadowWrapper,
        elevated,
        // pressed state: subtle scale and tint
        pressed && !disabled && Platform.OS !== 'web' && { transform: [{ scale: 0.98 }] },
        { margin: margin as any },
        style,
      ]}
      // Android-specific ripple effect
      android_ripple={
        onPress && !disabled
          ? {
              color: rgba(tokens.fg, 0.15),
              borderless: false,
              radius: isIconOnly ? diameter / 2 : undefined,
            }
          : undefined
      }
    >
      {({ pressed }) => (
        <View
          style={[
            containerBase,
            isIconOnly && {
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              paddingHorizontal: 0,
              paddingVertical: 0,
              alignItems: 'center',
              justifyContent: 'center',
            },
            // pressed overlay for visual feedback
            pressed && !disabled && Platform.OS !== 'android' && // Skip for Android since ripple handles feedback
              (variant === 'solid'
                ? { backgroundColor: shade(tokens.bg, -0.08) }
                : variant === 'outlined'
                ? { backgroundColor: rgba(tokens.fg, 0.06) }
                : { backgroundColor: rgba(seed, isDark ? 0.26 : 0.18) }),
            !isIconOnly && { padding: padding as any },
          ]}
        >
          {content}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    ...Platform.select({
      android: {
        // Better handling of elevation shadows on Android
        backgroundColor: 'transparent',
      },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    minHeight: 0,
    ...Platform.select({
      android: {
        // Ensure proper text alignment on Android
        alignItems: 'center',
      },
    }),
  },
  text: {
    fontWeight: '700',
    ...Platform.select({
      android: {
        // Better text rendering on Android
        textAlignVertical: 'center',
        includeFontPadding: false,
      },
    }),
  },
});