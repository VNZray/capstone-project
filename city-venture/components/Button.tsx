import { card, colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { moderateScale } from '@/utils/responsive';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';

// Variants
type Variant = 'solid' | 'soft' | 'outlined';
// Sizes
type Size = 'small' | 'medium' | 'large' | 'extraLarge';
// Colors
type Color =
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'error'
  | 'warning'
  | 'neutral'
  | 'transparent'
  | 'white';

type ButtonProps = {
  label?: string;
  children?: React.ReactNode;
  fullWidth?: boolean;
  width?: number | string;
  height?: number | string;
  direction?: 'row' | 'column';
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  gap?: number;
  padding?: number;
  margin?: number;
  radius?: number;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  variant?: Variant;
  size?: Size;
  color?: Color;
  icon?: boolean;
  startIcon?: keyof typeof FontAwesome5.glyphMap;
  endIcon?: keyof typeof FontAwesome5.glyphMap;
  topIcon?: keyof typeof FontAwesome5.glyphMap;
  bottomIcon?: keyof typeof FontAwesome5.glyphMap;
  iconSize?: number;
  textSize?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
};

const Button = ({
  label,
  children,
  fullWidth,
  width,
  height = 'auto',
  direction = 'row',
  align = 'center',
  justify = 'center',
  gap = 8,
  padding,
  margin,
  radius = 8,
  elevation = 0,
  variant = 'solid',
  size = 'medium',
  color = 'primary',
  icon = false,
  startIcon,
  endIcon,
  topIcon,
  bottomIcon,
  iconSize,
  textSize,
  style,
  textStyle,
  onPress,
}: ButtonProps) => {
  const schemeRaw = useColorScheme();
  const scheme: 'light' | 'dark' | null =
    schemeRaw === 'light' || schemeRaw === 'dark' ? schemeRaw : null;
  const { width: windowWidth } = useWindowDimensions();

  const sizeStyle = getSizeStyle(size, icon, windowWidth);
  const colorStyle = getColorStyle(color, variant, scheme);

  // Colors & sizes
  const iconColor = colorStyle?.text?.color ?? '#000';
  const computedIconSize = iconSize ?? sizeStyle.text.fontSize + 4;
  const computedTextSize = textSize ?? sizeStyle.text.fontSize;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          flexDirection: direction,
          alignItems: align,
          justifyContent: justify,
          gap,
          width: fullWidth ? '100%' : width ?? sizeStyle.width,
          height: height ?? sizeStyle.height,
          padding: padding ?? sizeStyle.padding,
          margin,
          borderRadius: radius,
        },
        colorStyle,
        getPlatformElevation(elevation),
        // Consistent pressed state for both platforms
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        {/* Top Icon */}
        {topIcon && (
          <FontAwesome5
            name={topIcon}
            size={computedIconSize}
            color={iconColor}
          />
        )}

        {/* Middle Row: startIcon - label/children - endIcon */}
        <View
          style={{
            flexDirection: direction,
            alignItems: align,
            justifyContent: justify,
            gap,
          }}
        >
          {startIcon && (
            <FontAwesome5
              name={startIcon}
              size={computedIconSize}
              color={iconColor}
            />
          )}
          {!icon &&
            (children != null
              ? React.Children.map(children, (child) =>
                  typeof child === 'string' || typeof child === 'number' ? (
                    <Text
                      style={[
                        styles.text,
                        { fontSize: computedTextSize },
                        colorStyle.text,
                        textStyle,
                      ]}
                    >
                      {child}
                    </Text>
                  ) : (
                    (child as React.ReactNode)
                  )
                )
              : label && (
                  <Text
                    style={[
                      styles.text,
                      { fontSize: computedTextSize },
                      colorStyle.text,
                      textStyle,
                    ]}
                  >
                    {label}
                  </Text>
                ))}
          {endIcon && (
            <FontAwesome5
              name={endIcon}
              size={computedIconSize}
              color={iconColor}
            />
          )}
        </View>

        {/* Bottom Icon */}
        {bottomIcon && (
          <FontAwesome5
            name={bottomIcon}
            size={computedIconSize}
            color={iconColor}
          />
        )}
      </View>
    </Pressable>
  );
};

export default Button;

// ---------- Styles ----------
const styles = StyleSheet.create({
  base: {
    borderWidth: 0,
  },
  text: {
    fontWeight: '600',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});

// ---------- Helpers ----------
function getSizeStyle(size: Size, icon: boolean, screenWidth?: number): any {
  // Base sizes from previous implementation
  const base = {
    small: { h: 36, pad: 8, fs: 12, icon: 36 },
    medium: { h: 44, pad: 12, fs: 14, icon: 44 },
    large: { h: 52, pad: 16, fs: 16, icon: 52 },
    extraLarge: { h: 64, pad: 20, fs: 18, icon: 64 },
  } as const;
  const b = base[size];
  const h = moderateScale(b.h, 0.55, screenWidth);
  const padding = moderateScale(b.pad, 0.5, screenWidth);
  const fontSize = moderateScale(b.fs, 0.4, screenWidth);
  const iconBox = moderateScale(b.icon, 0.55, screenWidth);
  return {
    width: icon ? iconBox : undefined,
    height: iconBox,
    padding,
    text: { fontSize },
  };
}

function getColorStyle(
  color: Color,
  variant: Variant,
  scheme: 'light' | 'dark' | null
): any {
  const palette = {
    primary: colors.primary,
    secondary: colors.secondary,
    info: colors.info,
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
    neutral: colors.tertiary,
    transparent: 'transparent',
    white: scheme === 'dark' ? card.dark : card.light,
  };

  const bg = palette[color];
  switch (variant) {
    case 'solid':
      return {
        backgroundColor: bg,
        borderWidth: 0,
        text: {
          color:
            color === 'white' ? (scheme === 'dark' ? '#fff' : '#000') : '#fff',
        },
      };
    case 'soft':
      return {
        backgroundColor:
          color === 'transparent' ? '#f5f5f5' : addOpacity(bg, 0.15), // not fully transparent
        borderWidth: 0,
        text: {
          color: color === 'white' ? (scheme === 'dark' ? '#fff' : '#000') : bg,
        },
      };
    case 'outlined':
      return {
        backgroundColor: scheme === 'dark' ? '#1c1c1e' : '#fff', // ensure background for shadow
        borderWidth: 1,
        borderColor: bg,
        text: {
          color: color === 'white' ? (scheme === 'dark' ? '#fff' : '#000') : bg,
        },
      };
    default:
      return {};
  }
}

function getPlatformElevation(level: number): ViewStyle {
  if (Platform.OS === 'android') {
    return { elevation: level };
  }

  switch (level) {
    case 1:
      return {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
      };
    case 2:
      return {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      };
    case 3:
      return {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 3 },
      };
    case 4:
      return {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 4 },
      };
    case 5:
      return {
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 5 },
      };
    case 6:
      return {
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 7,
        shadowOffset: { width: 0, height: 6 },
      };
    default:
      return {};
  }
}

// Opacity helper
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
