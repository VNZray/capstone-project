import logo from '@/assets/images/logo.png';
import PressableButton from '@/components/PressableButton';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, SafeAreaView, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [loginError, setLoginError] = useState('');

  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';

  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-Light': require('@/assets/fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Medium': require('@/assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError('Email and password are required.');
      return;
    }

    try {
      setLoginError(''); // clear any previous error
      await login(email, password);
      router.replace('/(tabs)/(home)');
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(
        error?.message ||
          error?.error_description ||
          'Incorrect email or password.'
      );
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  if (Platform.OS === 'web') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={Platform.OS === 'web' ? styles.webContainer : {}}>
          <View
            style={{
              display: 'flex',
              padding: Platform.OS === 'web' ? 40 : '5%',
              flexDirection: 'column',
              gap: 16,
              maxWidth: 400,
              marginHorizontal: 'auto',
            }}
          >
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} />
              <Text
                style={{
                  fontSize: 18,
                  marginLeft: 10,
                  fontFamily: 'Poppins-Bold',
                  color: color,
                }}
              >
                Naga Venture
              </Text>
            </View>

            <View>
              <ThemedText type="title">Sign In</ThemedText>
              <ThemedText type="default">
                Navigate with Ease - Your Ultimate City Directory
              </ThemedText>
            </View>

            <View style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <TextInput
                mode="outlined"
                style={{ borderRadius: 10 }}
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                underlineStyle={{ borderRadius: 10 }}
              />

              <TextInput
                mode="outlined"
                style={{ borderRadius: 10 }}
                label="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                underlineStyle={{ borderRadius: 10 }}
              />

              <Link href="/(screens)/ForgotPassword">
                <ThemedText type="link">Forgot Password?</ThemedText>
              </Link>
            </View>

            <PressableButton
              TextSize={16}
              width={'100%'}
              height={60}
              type="primary"
              IconSize={24}
              color={'#DEE3F2'}
              direction="column"
              Title="Login"
              onPress={handleLogin}
            />

            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 10,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
              }}
            >
              <ThemedText type="default2">
                Don&#39;t Have an Account?
              </ThemedText>

              <Link href={'/(screens)/RegistrationPage'}>
                <ThemedText type="link">Sign Up</ThemedText>
              </Link>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <View
          style={{
            display: 'flex',
            padding: '5%',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} />
            <Text
              style={{
                fontSize: 18,
                marginLeft: 10,
                fontFamily: 'Poppins-Bold',
                color: color,
              }}
            >
              Naga Venture
            </Text>
          </View>

          <View>
            <ThemedText type="title">Sign In</ThemedText>
            <ThemedText type="default">
              Navigate with Ease - Your Ultimate City Directory
            </ThemedText>
          </View>

          <View style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextInput
              style={{ borderRadius: 10 }}
              label="Email"
              value={email}
              onChangeText={setEmail}
              underlineStyle={{ borderRadius: 10 }}
            />

            <TextInput
              style={{ borderRadius: 10 }}
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              underlineStyle={{ borderRadius: 10 }}
            />

            <Link href="/(screens)/ForgotPassword">
              <ThemedText type="link">Forgot Password?</ThemedText>
            </Link>
          </View>

          <PressableButton
            TextSize={16}
            width={'100%'}
            height={60}
            type="secondary"
            IconSize={24}
            color={'#DEE3F2'}
            direction="column"
            Title="Login"
            onPress={handleLogin}
          ></PressableButton>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 10,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <ThemedText type="default2">Don&#39;t Have an Account?</ThemedText>

            <Link href={'/(screens)/RegistrationPage'}>
              <ThemedText
                type="link"
                onPress={() =>
                  router.push('/(screens)/RegistrationPage')
                }
              >
                Sign Up
              </ThemedText>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default LoginPage;

const styles = {
  webContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 0,
  },
  logoContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
  },
};
