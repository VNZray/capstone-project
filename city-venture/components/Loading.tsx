import logo from '@/assets/logo/logo.png';
import { background } from '@/constants/color';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import { Routes } from '@/routes/mainRoutes';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, useColorScheme, View } from 'react-native';

const LoadingScreen = () => {
  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

  const scheme = useColorScheme();
  const backgroundColor = scheme === 'dark' ? background.dark : background.light;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (fontsLoaded) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      const timer = setTimeout(() => {
        router.replace(Routes.root);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ ...styles.container, backgroundColor }}>
      <Animated.View
        style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        <Image source={logo} style={styles.logo} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
  },
  text: {
    fontSize: 24,
    marginLeft: 10,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default LoadingScreen;
