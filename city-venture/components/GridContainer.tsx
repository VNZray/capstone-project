import { moderateScale } from '@/utils/responsive';
import React, { ReactNode, useMemo } from 'react';
import { StyleProp, useWindowDimensions, View, ViewStyle } from 'react-native';

export type GridContainerProps = {
  children: ReactNode;
  minItemWidth?: number; // desired minimum width per item (baseline at 430px width)
  gap?: number;
  style?: StyleProp<ViewStyle>;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
};

/**
 * Responsive grid that calculates number of columns based on available width and desired min item width.
 * Falls back to 1 column on very small screens. Uses row wrapping.
 */
export const GridContainer: React.FC<GridContainerProps> = ({
  children,
  minItemWidth = 180,
  gap = 12,
  style,
  align = 'flex-start',
  justify = 'flex-start',
}) => {
  const { width } = useWindowDimensions();
  const scaledGap = moderateScale(gap, 0.5, width);
  const scaledMin = moderateScale(minItemWidth, 0.5, width);

  const { itemStyle, containerStyle } = useMemo(() => {
    const horizontalPadding = scaledGap; // simple internal padding
    const available = width - horizontalPadding * 2;
    let cols = Math.floor(available / scaledMin);
    if (cols < 1) cols = 1;
    if (cols > 4 && width < 900) cols = 4; // cap columns on mid devices
    const actualItemWidth = (available - scaledGap * (cols - 1)) / cols;
    return {
      itemStyle: { width: actualItemWidth, marginBottom: scaledGap, marginRight: scaledGap },
      containerStyle: {
        paddingHorizontal: horizontalPadding,
      },
    };
  }, [width, scaledGap, scaledMin]);

  const items = React.Children.toArray(children);
  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', alignItems: align, justifyContent: justify }, containerStyle, style]}>
      {items.map((child, idx) => (
        <View key={idx} style={[itemStyle, (idx + 1) % 1 === 0 && { marginRight: 0 }]}>
          {child}
        </View>
      ))}
    </View>
  );
};

export default GridContainer;
