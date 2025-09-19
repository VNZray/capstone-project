import Button from '@/components/Button';
import Container from '@/components/Container';
import FormLogo from '@/components/FormLogo';
import PageContainer from '@/components/PageContainer';
import FormTextInput from '@/components/TextInput';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { navigateToHome } from '@/routes/mainRoutes';
import Entypo from '@expo/vector-icons/Entypo';
import { useFonts } from 'expo-font';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const LoginPage = () => {
  const [email, setEmail] = useState('rayven.clores@unc.edu.ph');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useAuth();
  const [loginError, setLoginError] = useState('');

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
      await login(email, password);
      if (user?.user_role_id === 2 || user?.user_role_id === 3) {
        navigateToHome();
      }
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
      <PageContainer padding={0}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
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
            {/* Credentials */}
            <View style={styles.fieldGroup}>
              <FormTextInput
                label="Email"
                placeholder="Enter email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                variant="outlined"
              />
              <FormTextInput
                label="Password"
                placeholder="Enter password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                variant="outlined"
                autoCapitalize="none"
                rightIcon={showPassword ? 'eye-slash' : 'eye'}
                onPressRightIcon={() => setShowPassword((p) => !p)}
              />
            </View>

            <Link href="./(screens)/ForgotPassword">
              <ThemedText type="link-medium">Forgot Password?</ThemedText>
            </Link>

            {/* Error Message */}
            {loginError ? (
              <Container
                padding={16}
                variant="soft"
                backgroundColor={colors.error}
              >
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
          </ScrollView>
        </KeyboardAvoidingView>
      </PageContainer>
    </SafeAreaProvider>
  );
};

export default LoginPage;

// ✅ Styles
const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    gap: 20,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  fieldGroup: {
    flexDirection: 'column',
    gap: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
