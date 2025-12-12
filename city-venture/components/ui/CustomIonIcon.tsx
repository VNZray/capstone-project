import { Ionicons } from '@expo/vector-icons';
import React from 'react';

type IonIconName = React.ComponentProps<typeof Ionicons>['name'];

interface CustomIonIconProps {
  name: IonIconName;
  size?: number;
  color?: string;
  style?: any;
}

const CustomIonIcon: React.FC<CustomIonIconProps> = ({
  name,
  size = 24,
  color = '#000',
  style,
}) => {
  return <Ionicons name={name} size={size} color={color} style={style} />;
};

export default CustomIonIcon;
