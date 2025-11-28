import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
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
  imageUri?: string;
  headerVisible?: SharedValue<number>;
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const HeroSection: React.FC<HeroSectionProps> = ({
  scrollY,
  heroHeight,
  imageUri = DEFAULT_IMAGE,
  headerVisible,
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

  // Animate overlay opacity based on header visibility (1 = visible/expanded, 0 = collapsed)
  const overlayStyle = useAnimatedStyle(() => {
    // When header is collapsed (headerVisible = 0), make overlay fully opaque
    const opacity = headerVisible 
      ? interpolate(headerVisible.value, [0, 1], [1, 0.6], Extrapolate.CLAMP)
      : 0.6;
    
    return { opacity };
  });

  return (
    <Animated.View
      style={[styles.container, { height: heroHeight + 120 }, animatedStyle]}
    >
      <ImageBackground
        source={{ uri: imageUri }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(10, 27, 71, 0.9)', 'rgba(15, 15, 134, 0.6)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Solid color overlay that fades in when header collapses */}
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            { backgroundColor: '#0a1b47' },
            overlayStyle
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
