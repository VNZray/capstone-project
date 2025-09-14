import logo from '@/assets/images/logo.png';
import PressableButton from '@/components/PressableButton';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { colors } from '@/utils/Colors';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const LoginPage = () => {
  const [email, setEmail] = useState('ray@gmail.com');
  const [password, setPassword] = useState('12345678');
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
      setLoginError('');
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

  if (!fontsLoaded) return null;

  return (
    <View style={styles.formWrapper}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} />
        <Text
          style={{
            fontSize: 18,
            marginLeft: 10,
            fontFamily: 'Poppins-Bold',
            color,
          }}
        >
          Naga Venture
        </Text>
      </View>

      {/* Headline */}
      <View>
        <ThemedText type="title">Sign In</ThemedText>
        <ThemedText type="default">
          Navigate with Ease - Your Ultimate City Directory
        </ThemedText>
      </View>

      {/* Form */}
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Link href="/(screens)/ForgotPassword">
          <ThemedText type="link">Forgot Password?</ThemedText>
        </Link>
      </View>

      {/* Error Message */}
      {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

      {/* Login Button */}
      <PressableButton
        TextSize={16}
        height={60}
        type="primary"
        IconSize={24}
        color={colors.tertiary}
        direction="column"
        Title="Login"
        onPress={handleLogin}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <ThemedText type="default2">Don't have an account?</ThemedText>
        <Link href={'/(screens)/RegistrationPage'}>
          <ThemedText type="link">Sign Up</ThemedText>
        </Link>
      </View>
    </View>
  );
};

export default LoginPage;

// ✅ Styles
const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 0,
  },
  formWrapper: {
    padding: Platform.OS === 'web' ? 40 : 16,
    flexDirection: 'column',
    gap: 16,
    marginHorizontal: 'auto',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
  },
  inputGroup: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
    color: '#000',
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
