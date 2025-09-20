import { useThemeColor } from '@/hooks/use-theme-color';
import { useFonts } from 'expo-font';
import React from 'react';
import { StyleSheet, Text, View, type TextProps, Platform } from 'react-native';

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
      style={[
        {
          color: defaultColor,
          textAlign: align,
          paddingTop: pt,
          paddingRight: pr,
          paddingBottom: pb,
          paddingLeft: pl,
          marginTop: mt,
          marginRight: mr,
          marginBottom: mb,
          marginLeft: ml,
        },
        styles[type],
        isLink,
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
    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
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
      return { fontFamily: 'Poppins-Bold', fontWeight: '900' }; // fallback
    case 'extra-bold':
      return { fontFamily: 'Poppins-ExtraBold' };
    case 'black':
      return { fontFamily: 'Poppins-Black' };
    default:
      return { fontFamily: 'Poppins-Regular' };
  }
}

const styles = StyleSheet.create<Record<TypographyType, any>>({
  // Titles
  'title-large': { fontSize: 32 },
  'title-medium': { fontSize: 28 },
  'title-small': { fontSize: 24 },
  'title-extra-small': { fontSize: 20 },

  // Headers
  'header-large': { fontSize: 32 },
  'header-medium': { fontSize: 28 },
  'header-small': { fontSize: 24 },
  'header-extra-small': { fontSize: 20 },

  // Sub Titles
  'sub-title-large': { fontSize: 22 },
  'sub-title-medium': { fontSize: 20 },
  'sub-title-small': { fontSize: 18 },
  'sub-title-extra-small': { fontSize: 16 },

  // Body
  'body-large': { fontSize: 18 },
  'body-medium': { fontSize: 16 },
  'body-small': { fontSize: 14 },
  'body-extra-small': { fontSize: 12 },

  // Card Titles
  'card-title-large': { fontSize: 20 },
  'card-title-medium': { fontSize: 18 },
  'card-title-small': { fontSize: 16 },
  'card-title-extra-small': { fontSize: 14 },

  // Card Sub Titles
  'card-sub-title-large': { fontSize: 16 },
  'card-sub-title-medium': { fontSize: 14 },
  'card-sub-title-small': { fontSize: 12 },
  'card-sub-title-extra-small': { fontSize: 10 },

  // Labels
  'label-large': { fontSize: 16 },
  'label-medium': { fontSize: 14 },
  'label-small': { fontSize: 12 },
  'label-extra-small': { fontSize: 10 },

  // Links
  'link-large': { fontSize: 18 },
  'link-medium': { fontSize: 16 },
  'link-small': { fontSize: 14 },
  'link-extra-small': { fontSize: 12 },

  // Base link styling
  linkBase: {
    textDecorationLine: 'underline',
  },
});
