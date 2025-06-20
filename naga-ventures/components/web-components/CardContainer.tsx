import React from 'react';
import {
  DimensionValue,
  StyleProp,
  StyleSheet,
  ViewStyle,
  useColorScheme as useRNColorScheme,
} from 'react-native';

import { ThemedView } from '@/components/ThemedView';

export function useColorScheme() {
  const scheme = useRNColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}

type CardContainerProps = {
  children?: React.ReactNode;
  elevation?: number;
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

const getShadowStyle = (elevation: number): ViewStyle => {
  if (elevation === 0) {
    return {
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
    };
  }

  const shadowStyles: Record<number, ViewStyle> = {
    1: {
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
    },
    2: {
      shadowOpacity: 0.15,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    3: {
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    4: {
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    5: {
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },
  };

  return shadowStyles[elevation] ?? shadowStyles[1];
};

const CardContainer: React.FC<CardContainerProps> = ({
  children,
  elevation = 1,
  width,
  height,
  radius = 10,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const shadowStyle = getShadowStyle(elevation);

  return (
    <ThemedView
      style={[
        {
          width,
          height,
          borderRadius: radius,
        } as ViewStyle,
        styles.card,
        shadowStyle,
        style,
      ]}
    >
      {children}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
});

export default CardContainer;
