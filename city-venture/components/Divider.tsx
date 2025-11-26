import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface DividerProps {
  /**
   * Margin spacing around the divider
   * @default 16
   */
  margin?: number;
  
  /**
   * Thickness of the divider line
   * @default 1
   */
  thickness?: number;
  
  /**
   * Custom color for the divider
   * If not provided, uses theme-based colors
   */
  color?: string;
  
  /**
   * Orientation of the divider
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Opacity of the divider
   * @default 0.12
   */
  opacity?: number;
}

export default function Divider({
  margin = 16,
  thickness = 1,
  color,
  orientation = 'horizontal',
  opacity = 0.12,
}: DividerProps) {
  const colorScheme = useColorScheme();
  
  const defaultColor = colorScheme === 'dark' ? '#E5E7EB' : '#0A1B47';
  const dividerColor = color || defaultColor;
  
  const isHorizontal = orientation === 'horizontal';
  
  return (
    <View
      style={[
        styles.divider,
        isHorizontal ? styles.horizontal : styles.vertical,
        {
          [isHorizontal ? 'marginVertical' : 'marginHorizontal']: margin,
          [isHorizontal ? 'height' : 'width']: thickness,
          backgroundColor: dividerColor,
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    alignSelf: 'stretch',
  },
  horizontal: {
    width: '100%',
  },
  vertical: {
    height: '100%',
  },
});
