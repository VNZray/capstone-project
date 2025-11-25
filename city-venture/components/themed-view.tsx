import { View, type ViewProps, useColorScheme } from 'react-native';

import { Colors } from '@/constants/color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const backgroundColor = lightColor && darkColor
    ? (colorScheme === 'light' ? lightColor : darkColor)
    : lightColor || darkColor || colors.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
