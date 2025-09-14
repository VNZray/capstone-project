import { colors } from '@/constants/color';
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
  | 'transparent';

type ButtonProps = {
  label?: string;
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
  elevation?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: Variant;
  size?: Size;
  color?: Color;
  icon?: boolean;
  startIcon?: keyof typeof FontAwesome5.glyphMap;
  endIcon?: keyof typeof FontAwesome5.glyphMap;
  topIcon?: keyof typeof FontAwesome5.glyphMap;
  bottomIcon?: keyof typeof FontAwesome5.glyphMap;
  iconSize?: number; // 👈 new
  textSize?: number; // 👈 new
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  key?: string | number;
  onPress?: () => void;
};

const Button = ({
  key,
  label,
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
  elevation = 1,
  variant = 'solid',
  size = 'medium',
  color = 'primary',
  icon = false,
  startIcon,
  endIcon,
  topIcon,
  bottomIcon,
  iconSize,
  textSize, // 👈 grab prop
  style,
  textStyle,
  onPress,
}: ButtonProps) => {
  const sizeStyle = getSizeStyle(size, icon);
  const colorStyle = getColorStyle(color, variant);

  // Colors & sizes
  const iconColor = colorStyle?.text?.color ?? '#000';
  const computedIconSize = iconSize ?? sizeStyle.text.fontSize + 4; // override if passed
  const computedTextSize = textSize ?? sizeStyle.text.fontSize; // override if passed

  return (
    <Pressable
      key={key}
      onPress={onPress}
      android_ripple={{
        color: addOpacity(colorStyle?.backgroundColor ?? '#000', 0.15),
        borderless: false,
      }}
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
        // 👇 pressed state for iOS and Android fallback
        pressed && {
          opacity: 0.85,
        },
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

        {/* Middle Row: startIcon - label - endIcon */}
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
          {!icon && label && (
            <Text
              style={[
                styles.text,
                { fontSize: computedTextSize }, // 👈 override font size
                colorStyle.text,
                textStyle,
              ]}
            >
              {label}
            </Text>
          )}
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
    overflow: 'hidden',
  },
  text: {
    fontWeight: '600',
  },
});

// ---------- Helpers ----------
function getSizeStyle(size: Size, icon: boolean): any {
  switch (size) {
    case 'small':
      return {
        width: icon ? 36 : undefined,
        height: 36,
        padding: 8,
        text: { fontSize: 12 },
      };
    case 'medium':
      return {
        width: icon ? 44 : undefined,
        height: 44,
        padding: 12,
        text: { fontSize: 14 },
      };
    case 'large':
      return {
        width: icon ? 52 : undefined,
        height: 52,
        padding: 16,
        text: { fontSize: 16 },
      };
    case 'extraLarge':
      return {
        width: icon ? 64 : undefined,
        height: 64,
        padding: 20,
        text: { fontSize: 18 },
      };
    default:
      return {};
  }
}

function getColorStyle(color: Color, variant: Variant): any {
  const palette = {
    primary: colors.primary,
    secondary: colors.secondary,
    info: colors.info,
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
    neutral: colors.tertiary,
    transparent: 'transparent',
  };

  const bg = palette[color];
  switch (variant) {
    case 'solid':
      return {
        backgroundColor: bg,
        borderWidth: 0,
        text: {
          color:
            color === 'neutral' || color === 'transparent' ? '#000' : '#fff',
        },
      };
    case 'soft':
      return {
        backgroundColor:
          color === 'transparent' ? 'transparent' : addOpacity(bg, 0.15),
        borderWidth: 0,
        text: { color: color === 'transparent' ? '#000' : bg },
      };
    case 'outlined':
      return {
        backgroundColor: 'transparent',
        borderWidth: color === 'transparent' ? 0 : 1,
        borderColor: color === 'transparent' ? 'transparent' : bg,
        text: { color: color === 'transparent' ? '#000' : bg },
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
