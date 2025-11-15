import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  Extrapolate,
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';

type WelcomeSectionProps = {
  scrollY: SharedValue<number>;
  name?: string;
  subtitle: string;
  style?: ViewStyle;
};

const HELLO_VARIANTS = [
  'Marhay na banggi',
  'Hello',
  'Hola',
  'Bonjour',
  'Konnichiwa',
  'Kia ora',
];

const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  scrollY,
  name,
  subtitle,
  style,
}) => {
  const [helloIndex, setHelloIndex] = useState(0);
  const fade = useSharedValue(1);

  const goNext = useCallback(() => {
    setHelloIndex((prev) => (prev + 1) % HELLO_VARIANTS.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fade.value = withTiming(
        0,
        { duration: 220 },
        (finished) => finished && runOnJS(goNext)()
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [fade, goNext]);

  useEffect(() => {
    fade.value = withTiming(1, { duration: 300 });
  }, [helloIndex, fade]);

  const helloAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [
      {
        translateY: interpolate(fade.value, [0, 1], [10, 0]),
      },
    ],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 80], [1, 0], Extrapolate.CLAMP),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 80],
          [0, -18],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const helloText = HELLO_VARIANTS[helloIndex];
  const displayName = name ?? 'Friend';

  return (
    <Animated.View style={[styles.container, style, containerAnimatedStyle]}>
      <Animated.View style={helloAnimatedStyle}>
        <ThemedText
          type="title-small"
          weight="bold"
          lightColor="#FEFCFF"
          style={styles.greetingText}
        >
          {helloText}, {displayName}!
        </ThemedText>
      </Animated.View>
      <ThemedText
        type="body-small"
        lightColor="rgba(255,255,255,0.9)"
        style={styles.subtitle}
      >
        {subtitle}
      </ThemedText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  greetingText: {
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

export default WelcomeSection;
