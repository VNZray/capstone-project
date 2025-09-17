import Button from '@/components/Button';
import Container from '@/components/Container';
import FormLogo from '@/components/FormLogo';
import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { navigateToHome } from '@/routes/mainRoutes';
import Entypo from '@expo/vector-icons/Entypo';
import { useFonts } from 'expo-font';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { StatusBar, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const LoginPage = () => {
  const [email, setEmail] = useState('rayven.clores@unc.edu.ph');
  const [password, setPassword] = useState('123456');
  const { login } = useAuth();
  const [loginError, setLoginError] = useState('');

  const colorScheme = useColorScheme();

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
      navigateToHome();
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
    <SafeAreaProvider>
      <StatusBar />
      <PageContainer>
        {/* Logo */}
        <FormLogo />
        {/* Headline */}
        <View>
          <ThemedText type="title-medium" weight="bold">
            Sign In
          </ThemedText>
          <ThemedText type="sub-title-small" weight="medium">
            Navigate with Ease - Your Ultimate City Directory
          </ThemedText>
        </View>

        {/* Form */}
        <View style={styles.inputGroup}>
          <TextInput
            style={
              colorScheme === 'light' ? styles.darkInput : styles.lightInput
            }
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={
              colorScheme === 'light' ? styles.darkInput : styles.lightInput
            }
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Link href="./(screens)/ForgotPassword">
            <ThemedText type="link-medium">Forgot Password?</ThemedText>
          </Link>
        </View>

        {/* Error Message */}
        {loginError ? (
          <Container padding={16} variant="soft" backgroundColor={colors.error}>
            <ThemedText
              startIcon={<Entypo name="warning" size={18} color="#fff" />}
              lightColor="#fff"
              type="body-medium"
            >
              {loginError}
            </ThemedText>
          </Container>
        ) : null}

        {/* Login Button */}
        <Button
          fullWidth
          size="large"
          label="Sign In"
          color="primary"
          variant="solid"
          onPress={handleLogin}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText type="body-medium">Don't have an account?</ThemedText>
          <Link href={'./Register'}>
            <ThemedText type="link-medium">Sign Up</ThemedText>
          </Link>
        </View>
      </PageContainer>
    </SafeAreaProvider>
  );
};

export default LoginPage;

// ✅ Styles
const styles = StyleSheet.create({
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
  darkInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
    color: '#000',
  },

  lightInput: {
    borderWidth: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
    color: '#fff',
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
