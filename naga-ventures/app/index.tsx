import PressableButton from '@/components/PressableButton';
import { ThemedText } from '@/components/ThemedText';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, Text, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import 'react-native-url-polyfill/auto';
import { colors } from '@/utils/Colors';

const index = () => {
  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const imageBackground =
    'https://i0.wp.com/nagayon.com/wp-content/uploads/2024/08/oragon-monument-by-colline.jpg';

  return (
    <PaperProvider>
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
          style={{ flex: 1, justifyContent: 'center', padding: '5%' }}
        >
          <ThemedText
            type="title"
            style={{
              fontSize: 38,
              textAlign: 'left',
              marginTop: 250,
              color: '#fff',
            }}
          >
            Begin Your Journey in the Heart of Naga
          </ThemedText>
          <Text
            style={{
              fontSize: 18,
              fontFamily: 'Poppins-Regular',
              textAlign: 'left',
              color: 'white',
              marginTop: 20,
            }}
          >
            - Where Faith Meets Adventure.
          </Text>
          <View
            style={{
              flexDirection: 'column',
              gap: 16,
              marginTop: 80,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <PressableButton
              TextSize={16}
              width={'100%'}
              height={55}
              type="secondary"
              color={colors.tertiary}
              direction="column"
              Title="Login"
              onPress={() => router.navigate('/(screens)/LoginPage')}
            ></PressableButton>
            <PressableButton
              TextSize={16}
              width={'100%'}
              height={55}
              type="tertiary"
              color={colors.dark}
              direction="column"
              Title="Register"
              onPress={() =>
                router.navigate('/(screens)/RegistrationPage')
              }
            ></PressableButton>
          </View>
        </LinearGradient>
      </ImageBackground>
    </PaperProvider>
  );
};

export default index;
