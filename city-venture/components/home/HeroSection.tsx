import React from 'react';
import { ImageBackground, StyleSheet, ImageSourcePropType } from 'react-native';
import Animated, {
  Extrapolate,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

type HeroSectionProps = {
  scrollY: SharedValue<number>;
  heroHeight: number;
  imageSource?: ImageSourcePropType;
  headerScrollThreshold?: number;
};

const DEFAULT_IMAGE = require('@/assets/images/home-hero.png');

const HeroSection: React.FC<HeroSectionProps> = ({
  scrollY,
  heroHeight,
  imageSource = DEFAULT_IMAGE,
  headerScrollThreshold = 80,
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, heroHeight],
          [0, -heroHeight * 0.35],
          Extrapolate.CLAMP
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [-heroHeight, 0, heroHeight],
          [1.2, 1, 1],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  // Animate overlay opacity based on scroll position (same as header background)
  // Goes from 60% (0.6) at top to 100% (1.0) when scrolled past threshold
  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, headerScrollThreshold],
      [0.6, 1],
      Extrapolate.CLAMP
    );

    return { opacity };
  });

  return (
    <Animated.View
      style={[styles.container, { height: heroHeight + 120 }, animatedStyle]}
    >
      <ImageBackground
        source={imageSource}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        {/* Base gradient */}
        <LinearGradient
          colors={['rgba(10, 27, 71, 0.4)', 'rgba(15, 15, 134, 0.3)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Animated solid color overlay that increases opacity on scroll */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: '#0a1b47' },
            overlayStyle,
          ]}
        />
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
});

export default HeroSection;
