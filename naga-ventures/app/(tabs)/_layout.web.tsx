import React, { useEffect, useState } from 'react';
import { Link, Slot, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useFonts } from 'expo-font';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import logo from '@/assets/images/web-logo.png';

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { colors } from '@/utils/Colors';
import LoadingScreen from '../(screens)/LoadingScreen';

export default function WebLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const color = colorScheme === 'dark' ? '#fff' : '#000';

  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  const navLinks = [
    { href: '/(tabs)/(home)', label: 'Home' },
    { href: '/(tabs)/maps', label: 'Maps' },
    { href: '/(tabs)/favorite', label: 'Favorites' },
    { href: '/(tabs)/profile/', label: 'Profile' },
  ];

  const activeColor = Colors[colorScheme ?? 'light'].tint;
  const textColor = colorScheme === 'dark' ? '#fff' : '#000';
  const bgColor = colors.primary;

  // ✅ Always render the layout
  return (
    <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
      {!fontsLoaded || isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <header
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: `1px solid ${
                colorScheme === 'dark' ? '#333' : '#ddd'
              }`,
              backgroundColor: 'rgba(0,0,0,0.5)', // translucent black overlay
            }}
          >
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} />
              <Text
                style={{
                  fontSize: 20,
                  marginLeft: 16,
                  fontFamily: 'Poppins-SemiBold',
                  color,
                }}
              >
                Naga Venture
              </Text>
            </View>
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href as any}>
                  <ThemedText type="default">{link.label}</ThemedText>
                </Link>
              ))}
            </nav>
          </header>

          <main style={{ flex: 1, height: '100%', width: '100%' }}>
            <Slot />
          </main>
        </>
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
});
