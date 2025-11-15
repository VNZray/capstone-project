import { useThemeColor } from '@/hooks/use-theme-color';
import { useFonts } from 'expo-font';
import React from 'react';
import {
  Platform,
  View,
  type TextProps,
} from 'react-native';
import { Text } from './ui/text';
import { Heading } from './ui/heading';

export type HeadingSize = '5xl' | '4xl' | '3xl' | '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type TextSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export type ThemedTextBaseProps = Omit<TextProps, 'style'> & {
  lightColor?: string;
  darkColor?: string;
  align?: TextAlign;
  children?: React.ReactNode;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikeThrough?: boolean;
  isTruncated?: boolean;
  className?: string;
  style?: any;

  // icons
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  topIcon?: React.ReactNode;
  bottomIcon?: React.ReactNode;
};

export type ThemedHeadingProps = ThemedTextBaseProps & {
  size?: HeadingSize;
};

export type ThemedBodyProps = ThemedTextBaseProps & {
  size?: TextSize;
};

// Map old font weights to bold prop
type LegacyFontWeight = 'normal' | 'medium' | 'semi-bold' | 'bold' | 'bolder' | 'extra-bold' | 'black';

// Legacy typography types for backward compatibility
type LegacyTypographyType =
  | `title-${'extra-small' | 'small' | 'medium' | 'large'}`
  | `header-${'extra-small' | 'small' | 'medium' | 'large'}`
  | `sub-title-${'extra-small' | 'small' | 'medium' | 'large'}`
  | `body-${'extra-small' | 'small' | 'medium' | 'large'}`
  | `card-title-${'extra-small' | 'small' | 'medium' | 'large'}`
  | `card-sub-title-${'extra-small' | 'small' | 'medium' | 'large'}`
  | `label-${'extra-small' | 'small' | 'medium' | 'large'}`
  | `link-${'extra-small' | 'small' | 'medium' | 'large'}`;

// Legacy props for backward compatibility
export type LegacyThemedTextProps = ThemedTextBaseProps & {
  type?: LegacyTypographyType;
  weight?: LegacyFontWeight;
};

// Helper to map legacy types to new sizes
function mapLegacyTypeToSize(type?: LegacyTypographyType): { isHeading: boolean; size: TextSize | HeadingSize } {
  if (!type) return { isHeading: false, size: 'md' };

  // Check if it's a heading type
  const isHeading = type.startsWith('title-') || type.startsWith('header-') || type.startsWith('sub-title-');

  // Map sizes
  if (type.includes('large')) return { isHeading, size: 'xl' };
  if (type.includes('medium')) return { isHeading, size: 'lg' };
  if (type.includes('small') && !type.includes('extra')) return { isHeading, size: 'md' };
  if (type.includes('extra-small')) return { isHeading, size: 'sm' };

  return { isHeading, size: 'md' };
}

// Helper to map legacy weight to bold prop
function mapLegacyWeightToBold(weight?: LegacyFontWeight): boolean {
  if (!weight || weight === 'normal') return false;
  return true; // medium, semi-bold, bold, etc. all map to bold
}

// Heading component
const ThemedHeading = React.forwardRef<any, ThemedHeadingProps>(
  function ThemedHeading(
    {
      lightColor,
      darkColor,
      size = 'lg',
      align = 'left',
      bold = true,
      italic = false,
      underline = false,
      strikeThrough = false,
      isTruncated = false,
      className,
      startIcon,
      endIcon,
      topIcon,
      bottomIcon,
      children,
      ...rest
    },
    ref
  ) {
    const themeColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      'text'
    );

    const [fontsLoaded] = useFonts({
      'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
      'Poppins-Medium': require('@/assets/fonts/Poppins/Poppins-Medium.ttf'),
      'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
      'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
      'Poppins-ExtraBold': require('@/assets/fonts/Poppins/Poppins-ExtraBold.ttf'),
      'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    });

    if (!fontsLoaded) {
      return null;
    }

    const headingElement = (
      <Heading
        ref={ref}
        size={size}
        bold={bold}
        italic={italic}
        underline={underline}
        strikeThrough={strikeThrough}
        isTruncated={isTruncated}
        className={className}
        style={[
          {
            color: themeColor,
            textAlign: align,
            fontFamily: bold ? 'Poppins-Bold' : 'Poppins-SemiBold',
          },
          Platform.OS === 'android' && {
            textAlignVertical: 'center',
            includeFontPadding: false,
          },
        ]}
        {...rest}
      >
        {children}
      </Heading>
    );

    // If top/bottom icon → vertical layout
    if (topIcon || bottomIcon) {
      return (
        <View style={{ alignItems: 'center' }}>
          {topIcon ? <View style={{ marginBottom: 4 }}>{topIcon}</View> : null}
          {headingElement}
          {bottomIcon ? <View style={{ marginTop: 4 }}>{bottomIcon}</View> : null}
        </View>
      );
    }

    // If start/end icon → horizontal layout
    if (startIcon || endIcon) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {startIcon ? <View style={{ marginRight: 6 }}>{startIcon}</View> : null}
          {headingElement}
          {endIcon ? <View style={{ marginLeft: 6 }}>{endIcon}</View> : null}
        </View>
      );
    }

    return headingElement;
  }
);

// Body component (default Text)
const ThemedBody = React.forwardRef<any, ThemedBodyProps>(
  function ThemedBody(
    {
      lightColor,
      darkColor,
      size = 'md',
      align = 'left',
      bold = false,
      italic = false,
      underline = false,
      strikeThrough = false,
      isTruncated = false,
      className,
      startIcon,
      endIcon,
      topIcon,
      bottomIcon,
      children,
      ...rest
    },
    ref
  ) {
    const themeColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      'text'
    );

    const [fontsLoaded] = useFonts({
      'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
      'Poppins-Medium': require('@/assets/fonts/Poppins/Poppins-Medium.ttf'),
      'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
      'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
      'Poppins-ExtraBold': require('@/assets/fonts/Poppins/Poppins-ExtraBold.ttf'),
      'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    });

    if (!fontsLoaded) {
      return null;
    }

    const textElement = (
      <Text
        ref={ref}
        size={size}
        bold={bold}
        italic={italic}
        underline={underline}
        strikeThrough={strikeThrough}
        isTruncated={isTruncated}
        className={className}
        style={[
          {
            color: themeColor,
            textAlign: align,
            fontFamily: bold ? 'Poppins-Bold' : 'Poppins-Regular',
          },
          Platform.OS === 'android' && {
            textAlignVertical: 'center',
            includeFontPadding: false,
          },
        ]}
        {...rest}
      >
        {children}
      </Text>
    );

    // If top/bottom icon → vertical layout
    if (topIcon || bottomIcon) {
      return (
        <View style={{ alignItems: 'center' }}>
          {topIcon ? <View style={{ marginBottom: 4 }}>{topIcon}</View> : null}
          {textElement}
          {bottomIcon ? <View style={{ marginTop: 4 }}>{bottomIcon}</View> : null}
        </View>
      );
    }

    // If start/end icon → horizontal layout
    if (startIcon || endIcon) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {startIcon ? <View style={{ marginRight: 6 }}>{startIcon}</View> : null}
          {textElement}
          {endIcon ? <View style={{ marginLeft: 6 }}>{endIcon}</View> : null}
        </View>
      );
    }

    return textElement;
  }
);

// Main ThemedText export with compound components
export const ThemedText = Object.assign(
  React.forwardRef<any, ThemedBodyProps | LegacyThemedTextProps>(
    function ThemedText(props: ThemedBodyProps | LegacyThemedTextProps, ref) {
      // Check if using legacy API
      const legacyProps = props as LegacyThemedTextProps;
      if (legacyProps.type || legacyProps.weight) {
        const { type, weight, ...restProps } = legacyProps;
        const { isHeading, size } = mapLegacyTypeToSize(type);
        const bold = mapLegacyWeightToBold(weight);

        if (isHeading) {
          return (
            <ThemedHeading
              ref={ref}
              size={size as HeadingSize}
              bold={bold}
              {...restProps}
            />
          );
        }

        return (
          <ThemedBody
            ref={ref}
            size={size as TextSize}
            bold={bold}
            {...restProps}
          />
        );
      }

      // Use new API
      return <ThemedBody ref={ref} {...(props as ThemedBodyProps)} />;
    }
  ),
  {
    Heading: ThemedHeading,
    Body: ThemedBody,
  }
);

// Default export
export default ThemedText;
