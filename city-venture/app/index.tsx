import Button from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { Routes } from '@/routes/mainRoutes';
import { useAuth } from '@/context/AuthContext';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ImageBackground, View } from 'react-native';
import 'react-native-url-polyfill/auto';

const Main = () => {
  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
  });

  const { user, loading } = useAuth();

  // Don't auto-redirect - let users choose to sign in, sign up, or continue as guest
  // The welcome screen is the entry point for all users

  if (!fontsLoaded) {
    return null;
  }

  // Show mobile welcome screen for mobile users
  const imageBackground =
    'https://i0.wp.com/nagayon.com/wp-content/uploads/2024/08/oragon-monument-by-colline.jpg';

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={{ uri: imageBackground }}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.0)', // Top (transparent)
            'rgba(10, 27, 71, 0.8)', // Middle
            '#0A1B47', // Bottom (solid)
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1, justifyContent: 'space-between', padding: '5%' }}
        >
          <View style={{ marginTop: 350 }}>
            <ThemedText
              style={{ color: 'white' }}
              type="title-large"
              weight="extra-bold"
            >
              Begin Your Journey in the Heart of Naga
            </ThemedText>
            <ThemedText type="body-large" pt={20} style={{ color: 'white' }}>
              - Where Faith Meets Adventure.
            </ThemedText>
          </View>
          <View
            style={{
              flexDirection: 'column',
              gap: 16,
              marginBottom: 100,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Button
              style={{ width: '100%' }}
              size="large"
              label="Sign In"
              color="secondary"
              variant="solid"
              onPress={() => router.push(Routes.auth.login)}
            />

            <Button
              style={{ width: '100%' }}
              size="large"
              label="Sign Up"
              variant="soft"
              color="neutral"
              onPress={() => router.push(Routes.auth.register)}
            />

            <Button
              style={{ width: '100%' }}
              label="Test"
              size="large"
              onPress={() => router.push(Routes.test.test)}
              color="success"
            />
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

export default Main;
