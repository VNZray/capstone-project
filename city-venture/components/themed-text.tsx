import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { Platform, StyleSheet, Text, View, type TextProps, useWindowDimensions } from 'react-native';
import { scaled } from '@/utils/responsive';

export type TypographyType =
  | `title-${'extra-small' | 'small' | 'medium' | 'large'}`
  | `header-${'extra-small' | 'small' | 'medium' | 'large'}`
  | `sub-title-${'extra-small' | 'small' | 'medium' | 'large'}`
  | `body-${'extra-small' | 'small' | 'medium' | 'large'}`
  | `card-title-${'extra-small' | 'small' | 'medium' | 'large'}`
  | `card-sub-title-${'extra-small' | 'small' | 'medium' | 'large'}`
  | `label-${'extra-small' | 'small' | 'medium' | 'large'}`
  | `link-${'extra-small' | 'small' | 'medium' | 'large'}`;

export type FontWeight =
  | 'normal'
  | 'medium'
  | 'semi-bold'
  | 'bold'
  | 'bolder'
  | 'extra-bold'
  | 'black';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: TypographyType;
  weight?: FontWeight;
  align?: TextAlign;
  children?: React.ReactNode;

  // spacing props
  pt?: number;
  pr?: number;
  pb?: number;
  pl?: number;
  mt?: number;
  mr?: number;
  mb?: number;
  ml?: number;

  // icons
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  topIcon?: React.ReactNode;
  bottomIcon?: React.ReactNode;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'body-medium',
  weight = 'normal',
  align = 'left',

  // spacing defaults
  pt = 0,
  pr = 0,
  pb = 0,
  pl = 0,
  mt = 0,
  mr = 0,
  mb = 0,
  ml = 0,

  // icons
  startIcon,
  endIcon,
  topIcon,
  bottomIcon,

  children,

  ...rest
}: ThemedTextProps) {
  const isLink = type.startsWith('link-');
  const defaultColor = isLink
    ? '#1e90ff'
    : useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const { width } = useWindowDimensions();

  const responsiveSpacing = {
    pt: scaled(pt, { min: 0, max: pt * 1.5, width }),
    pr: scaled(pr, { min: 0, max: pr * 1.5, width }),
    pb: scaled(pb, { min: 0, max: pb * 1.5, width }),
    pl: scaled(pl, { min: 0, max: pl * 1.5, width }),
    mt: scaled(mt, { min: 0, max: mt * 1.5, width }),
    mr: scaled(mr, { min: 0, max: mr * 1.5, width }),
    mb: scaled(mb, { min: 0, max: mb * 1.5, width }),
    ml: scaled(ml, { min: 0, max: ml * 1.5, width }),
  };

  const textElement = (
    <Text
      style={[
        {
          color: defaultColor,
          textAlign: align,
          paddingTop: responsiveSpacing.pt,
          paddingRight: responsiveSpacing.pr,
          paddingBottom: responsiveSpacing.pb,
          paddingLeft: responsiveSpacing.pl,
          marginTop: responsiveSpacing.mt,
          marginRight: responsiveSpacing.mr,
          marginBottom: responsiveSpacing.mb,
          marginLeft: responsiveSpacing.ml,
        },
        getResponsiveStyle(type, width),
        getFontWeightStyle(weight),
        // Android-specific text improvements
        Platform.OS === 'android' && {
          textAlignVertical: 'center',
          includeFontPadding: false,
        },
        style,
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
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' , }}>
      {startIcon ? <View style={{ marginRight: 6 }}>{startIcon}</View> : null}
      {textElement}
      {endIcon ? <View style={{ marginLeft: 6 }}>{endIcon}</View> : null}
    </View>
  );
}

function getFontWeightStyle(weight: FontWeight) {
  switch (weight) {
    case 'medium':
      return { fontFamily: 'Poppins-Medium' };
    case 'semi-bold':
      return { fontFamily: 'Poppins-SemiBold' };
    case 'bold':
      return { fontFamily: 'Poppins-Bold' };
    case 'bolder':
      return { fontFamily: 'Poppins-Bold', fontWeight: '900' as const }; // fallback
    case 'extra-bold':
      return { fontFamily: 'Poppins-ExtraBold' };
    case 'black':
      return { fontFamily: 'Poppins-Black' };
    default:
      return { fontFamily: 'Poppins-Regular' };
  }
}

const fontSizeMap: Record<TypographyType, { base: number; min: number; max: number }> = {
  // Titles
  'title-large': { base: 32, min: 24, max: 40 },
  'title-medium': { base: 28, min: 22, max: 34 },
  'title-small': { base: 24, min: 20, max: 28 },
  'title-extra-small': { base: 20, min: 18, max: 24 },

  // Headers
  'header-large': { base: 32, min: 24, max: 40 },
  'header-medium': { base: 28, min: 22, max: 34 },
  'header-small': { base: 24, min: 20, max: 28 },
  'header-extra-small': { base: 20, min: 18, max: 24 },

  // Sub Titles
  'sub-title-large': { base: 22, min: 18, max: 26 },
  'sub-title-medium': { base: 20, min: 17, max: 24 },
  'sub-title-small': { base: 18, min: 16, max: 22 },
  'sub-title-extra-small': { base: 16, min: 14, max: 18 },

  // Body
  'body-large': { base: 18, min: 16, max: 20 },
  'body-medium': { base: 16, min: 14, max: 18 },
  'body-small': { base: 14, min: 12, max: 16 },
  'body-extra-small': { base: 12, min: 10, max: 14 },

  // Card Titles
  'card-title-large': { base: 20, min: 18, max: 24 },
  'card-title-medium': { base: 18, min: 16, max: 20 },
  'card-title-small': { base: 16, min: 14, max: 18 },
  'card-title-extra-small': { base: 14, min: 12, max: 16 },

  // Card Sub Titles
  'card-sub-title-large': { base: 16, min: 14, max: 18 },
  'card-sub-title-medium': { base: 14, min: 12, max: 16 },
  'card-sub-title-small': { base: 12, min: 11, max: 14 },
  'card-sub-title-extra-small': { base: 10, min: 9, max: 12 },

  // Labels
  'label-large': { base: 16, min: 14, max: 18 },
  'label-medium': { base: 14, min: 12, max: 16 },
  'label-small': { base: 12, min: 11, max: 14 },
  'label-extra-small': { base: 10, min: 9, max: 12 },

  // Links
  'link-large': { base: 18, min: 16, max: 20 },
  'link-medium': { base: 16, min: 14, max: 18 },
  'link-small': { base: 14, min: 12, max: 16 },
  'link-extra-small': { base: 12, min: 10, max: 14 },
};

function getResponsiveStyle(type: TypographyType, width: number) {
  const config = fontSizeMap[type] ?? fontSizeMap['body-medium'];
  const fontSize = scaled(config.base, { min: config.min, max: config.max, factor: 0.5, width });
  return { fontSize };
}
