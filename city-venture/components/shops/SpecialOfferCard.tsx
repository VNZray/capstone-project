import { moderateScale } from '@/utils/responsive';
import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';

export type SpecialOfferCardProps = {
  image: string | ImageSourcePropType;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const SpecialOfferCard: React.FC<SpecialOfferCardProps> = ({
  image,
  onPress,
  style,
}) => {
  const { width } = useWindowDimensions();

  const RADIUS = moderateScale(14, 0.55, width);
  const CARD_WIDTH = moderateScale(140, 0.55, width);
  const CARD_HEIGHT = moderateScale(200, 0.55, width);

  const imageSource = typeof image === 'string' ? { uri: image } : image;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.wrapper,
        getElevation(2),
        { borderRadius: RADIUS },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      <View
        style={[
          styles.container,
          {
            borderRadius: RADIUS,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            overflow: 'hidden',
          },
        ]}
      >
        {/* Image */}
        <Image
          source={imageSource}
          style={{
            width: '100%',
            height: '100%',
          }}
          resizeMode="cover"
        />

        {/* Subtle Overlay for better touch affordance */}
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
            },
          ]}
        />
      </View>
    </Pressable>
  );
};

function getElevation(level: number): ViewStyle | undefined {
  if (!level) return undefined;
  if (Platform.OS === 'android') return { elevation: level } as ViewStyle;
  const map: Record<number, ViewStyle> = {
    1: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
    },
    2: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 2 },
    },
    3: {
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 3 },
    },
    4: {
      shadowColor: '#000',
      shadowOpacity: 0.14,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 4 },
    },
    5: {
      shadowColor: '#000',
      shadowOpacity: 0.16,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 5 },
    },
    6: {
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 7,
      shadowOffset: { width: 0, height: 6 },
    },
  };
  return map[level];
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'visible',
  },
  container: {
    borderWidth: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default SpecialOfferCard;
