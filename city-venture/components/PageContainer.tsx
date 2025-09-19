import { background } from '@/constants/color';
import React, { ReactNode } from 'react';
import { StyleSheet, useColorScheme, View, ViewStyle } from 'react-native';

type PageContainerProps = {
  children: ReactNode;
  style?: ViewStyle;
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justify?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  gap?: number;
  width?: number | string;
  height?: number | string;
  padding?: number;
};

const PageContainer = ({
  children,
  style,
  direction,
  align,
  justify,
  gap = 20,
  width = '100%',
  height = '100%',
  padding = 16,
}: PageContainerProps) => {
    const colorScheme = useColorScheme();
    const bg = colorScheme === 'dark' ? background.dark : background.light;
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          flexDirection: direction,
          alignItems: align,
          justifyContent: justify,
          gap,
          width:
            typeof width === 'number'
              ? width
              : width.endsWith('%')
              ? (width as `${number}%`)
              : undefined,
          height:
            typeof height === 'number'
              ? height
              : height && typeof height === 'string' && height.endsWith('%')
              ? (height as `${number}%`)
              : undefined,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default PageContainer;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    padding: 20,
    height: '100%',
    width: '100%',
    gap: 20,
  },
});
