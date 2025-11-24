import Button from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { navigateToLogin, navigateToRegister } from '@/routes/mainRoutes';
import { useAuth } from '@/context/AuthContext';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ImageBackground,
  View,
  Platform,
  useWindowDimensions,
} from 'react-native';
import 'react-native-url-polyfill/auto';

const Main = () => {
  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
  });

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = width >= 768;

  // Redirect to landing page for web/desktop users
  useEffect(() => {
    if (fontsLoaded && isWeb && isDesktop) {
      router.replace('/landing');
    }
  }, [fontsLoaded, isWeb, isDesktop]);

  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)/(home)');
    }
  }, [user, loading]);

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
              fullWidth
              size="large"
              label="Sign In"
              color="secondary"
              variant="solid"
              onPress={() => navigateToLogin()}
            />

            <Button
              fullWidth
              size="large"
              label="Sign Up"
              color="neutral"
              onPress={() => navigateToRegister()}
            />
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

export default Main;
