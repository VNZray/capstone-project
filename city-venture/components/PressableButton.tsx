import { FontAwesome5 } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme as useRNColorScheme,
  ViewStyle,
} from 'react-native';

export function useColorScheme() {
  const scheme = useRNColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}

type PressableButtonProps = {
  direction?: 'row' | 'column';
  type?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'quartary'
    | 'default'
    | 'yellow'
    | 'orange'
    | 'cancel';
  gap?: number;
  color?: string;
  width?: string | number;
  height?: string | number;
  title?: string | React.ReactNode;
  icon?: keyof typeof FontAwesome5.glyphMap;
  iconSize?: number;
  textSize?: number | string;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

const PressableButton = ({
  title,
  icon,
  color,
  direction,
  type = 'default',
  gap = 5,
  iconSize = 16,
  width,
  height,
  textSize = 10,
  onPress,
  onLongPress,
  disabled = false,
  style,
}: PressableButtonProps) => {
  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('@/assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onLongPress={disabled ? undefined : onLongPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        stylesByType[type],
        disabled && styles.disabled,
        {
          flexDirection: direction || 'row',
          gap,
          opacity: pressed ? 0.6 : 1,
          width,
          height,
        },
        style,
      ]}
    >
      {icon && (
        <FontAwesome5
          name={icon}
          size={iconSize}
          color={color}
          style={styles.icon}
        />
      )}
      {title && (
        <Text
          style={[
            styles.text,
            {
              color: disabled ? '#ccc' : color,
              fontSize:
                typeof textSize === 'string' ? parseFloat(textSize) : textSize,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: '#ccc',
  },
  icon: {
    marginRight: 0,
  },
  text: {
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
});

const stylesByType = StyleSheet.create({
  primary: {
    backgroundColor: '#0A1B47',
  },
  secondary: {
    backgroundColor: '#0077B6',
  },
  tertiary: {
    backgroundColor: '#DEE3F2',
  },
  quartary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancel: {
    backgroundColor: '#AE2438',
  },
  yellow: {
    backgroundColor: '#FFB007',
  },
  orange: {
    backgroundColor: '#FF5310',
  },
  default: {},
});

export default PressableButton;
