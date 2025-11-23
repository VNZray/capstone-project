import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { colors, colorScheme } = useTheme();
  const backgroundColor = lightColor && darkColor
    ? (colorScheme === 'light' ? lightColor : darkColor)
    : lightColor || darkColor || colors.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
