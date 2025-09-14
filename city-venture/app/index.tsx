import PressableButton from '@/components/PressableButton';
import { ThemedText } from '@/components/themed-text';
import { colors, text } from '@/constants/color';
import { navigateToLogin, navigateToRegister } from '@/routes/mainRoutes';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, Text, View } from 'react-native';
import 'react-native-url-polyfill/auto';

const Main = () => {
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
              textSize={16}
              width={'100%'}
              height={55}
              type="secondary"
              color={colors.tertiary}
              direction="column"
              title="Login"
              onPress={() => navigateToLogin()}
            ></PressableButton>
            <PressableButton
              textSize={16}
              width={'100%'}
              height={55}
              type="tertiary"
              color={text.dark}
              direction="column"
              title="Register"
              onPress={() => navigateToRegister()}
            ></PressableButton>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

export default Main;
