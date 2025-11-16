import { background } from '@/constants/color';
import React, { ReactNode } from 'react';
import { Platform, StyleSheet, useColorScheme, View, ViewStyle, useWindowDimensions } from 'react-native';
import { scaled } from '@/utils/responsive';

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
    const windowDimensions = useWindowDimensions();

    const responsiveGap = scaled(gap, { min: gap * 0.7, max: gap * 1.3, width: windowDimensions.width });
    const responsivePadding = scaled(padding, { min: padding * 0.7, max: padding * 1.3, width: windowDimensions.width });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          flexDirection: direction,
          alignItems: align,
          justifyContent: justify,
          gap: responsiveGap,
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
          padding: responsivePadding,
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
    height: '100%',
    width: '100%',
    ...Platform.select({
      android: {
        // Android-specific improvements for better scrolling and performance
        flex: 1,
        backgroundColor: 'transparent', // Let background color be handled by parent
      },
    }),
  },
});
