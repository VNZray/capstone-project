import { Stack, router, usePathname } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import Button from '@/components/Button';
import { colors } from '@/constants/color';

export default function NotFoundScreen() {
  const pathname = usePathname();

  // Floating illustration animation
  const floatY = useRef(new Animated.Value(0)).current;
  const pinScale = useRef(new Animated.Value(1)).current;
  const pinOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -6, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pinScale, { toValue: 1.12, duration: 700, useNativeDriver: true }),
          Animated.timing(pinOpacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pinScale, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(pinOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
      ])
    );
    float.start();
    pulse.start();
    return () => {
      float.stop();
      pulse.stop();
    };
  }, [floatY, pinOpacity, pinScale]);

  const retry = () => {
    // Replace with same path to re-trigger resolution
    if (pathname) router.replace(pathname as any);
  };

  const Illustration = useMemo(
    () => (
      <Animated.View style={[styles.illustrationWrap, { transform: [{ translateY: floatY }] }]}>
        <LinearGradient
          colors={["#EEF4FF", "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.illustrationCard}
        >
          {/* Decorative travel icons */}
          <View style={styles.illustrationInner}>
            <FontAwesome5 name="route" size={26} color="#7C89B6" style={{ position: 'absolute', left: 18, top: 18, opacity: 0.6 }} />
            <FontAwesome5 name="compass" size={24} color="#7C89B6" style={{ position: 'absolute', right: 20, top: 20, opacity: 0.5 }} />
            <FontAwesome5 name="mountain" size={24} color="#7C89B6" style={{ position: 'absolute', left: 24, bottom: 20, opacity: 0.55 }} />

            {/* Pulsing map pin at center */}
            <Animated.View style={{ alignItems: 'center', justifyContent: 'center', transform: [{ scale: pinScale }], opacity: pinOpacity }}>
              <FontAwesome5 name="map-pin" size={44} color={colors.secondary} />
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>
    ),
    [floatY, pinOpacity, pinScale]
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={["#E8F1FF", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Top bar with brand and close */}
          <View style={styles.topBar}>
            <Image
              source={require('../assets/logo/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessible
              accessibilityLabel="App logo"
            />
            <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close">
              <FontAwesome5 name="times" size={18} color="#5C6B8A" />
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.container}>
            {Illustration}

            <ThemedText type="title-large" weight="extra-bold" align="center" mt={18}>
              Page Not Found
            </ThemedText>

            <ThemedText type="body-small" align="center" mt={8} style={{ color: '#6A768E' }}>
              Oops! The page you’re looking for doesn’t exist or has been moved.
            </ThemedText>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                label="Go Back Home"
                startIcon="home"
                variant="solid"
                color="primary"
                size="large"
                fullWidth
                radius={14}
                elevation={3}
                textSize={16}
                onPress={() => router.replace('/')}
              />
              <Button
                label="Try Again"
                startIcon="redo"
                variant="soft"
                color="secondary"
                size="large"
                fullWidth
                radius={14}
                elevation={1}
                textSize={16}
                onPress={retry}
              />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { width: 32, height: 32 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  illustrationWrap: {
    width: '86%',
    aspectRatio: 1.6,
    borderRadius: 28,
    marginTop: 8,
    overflow: 'hidden',
    ...shadow(3),
  },
  illustrationCard: {
    flex: 1,
    borderRadius: 28,
  },
  illustrationInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    width: '100%',
    marginTop: 18,
    gap: 12,
  },
});

// soft shadow helper to keep styles tidy
function shadow(level: 1 | 2 | 3 | 4 | 5 | 6) {
  switch (level) {
    case 1:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.1,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      } as const;
    case 2:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.15,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      } as const;
    default:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
      } as const;
  }
}
