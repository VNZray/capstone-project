import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { useFonts } from 'expo-font';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | 'default'
    | 'default2'
    | 'title'
    | 'defaultSemiBold'
    | 'subtitle'
    | 'subtitle2'
    | 'link'
    | 'profileTitle'
    | 'cardTitle'
    | 'cardSubTitle'
    | 'cardBoldSubTitle'
    | 'tabText'
    | 'headerTitle';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'default2' ? styles.default2 : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'headerTitle' ? styles.headerTitle : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'subtitle2' ? styles.subtitle2 : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'cardTitle' ? styles.cardTitle : undefined,
        type === 'cardSubTitle' ? styles.cardSubTitle : undefined,
        type === 'cardBoldSubTitle' ? styles.cardBoldSubTitle : undefined,
        type === 'tabText' ? styles.tabText : undefined,
        type === 'profileTitle' ? styles.profileTitle : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  default2: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  defaultSemiBold: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
  },
  profileTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  cardSubTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  cardBoldSubTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
  },
  subtitle2: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  link: {
    fontSize: 14,
    color: '#0a7ea4',
    fontFamily: 'Poppins-SemiBold',
  },
});
