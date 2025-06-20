import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

type PieOccupancyChartProps = {
  occupancy: number; // in percentage
  size?: number;
  strokeWidth?: number;
  color?: string;
};

const PieOccupancyChart: React.FC<PieOccupancyChartProps> = ({
  occupancy,
  size = 64,
  strokeWidth = 10,
  color = '#4CAF50',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (occupancy / 100) * circumference;

  return (
    <View>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e0e0e0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
    </View>
  );
};

export default PieOccupancyChart;
