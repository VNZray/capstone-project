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
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { validateLoginForm } from '@/utils/validation';
import { formatErrorMessage } from '@/utils/networkHandler';
import debugLogger from '@/utils/debugLogger';

const LoginPage = () => {
  console.log('[LoginPage] Rendering');
  const [email, setEmail] = useState('tourist@gmail.com');
  const [password, setPassword] = useState('tourist123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [emailError, setEmailError] = useState('');
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigateToHome();
    }
  }, [user]);

  // Clear field-specific errors when user types
  useEffect(() => {
    setEmailError('');
  }, [email]);

  useEffect(() => {
    setPasswordError('');
  }, [password]);

  const handleLogin = async () => {
    // Prevent multiple simultaneous login attempts
    if (isLoading) return;

    // Clear previous errors
    setLoginError('');
    setEmailError('');
    setPasswordError('');

    // Client-side validation
    const validation = validateLoginForm(email.trim(), password);
    if (!validation.isValid) {
      // Determine which field has the error
      if (!email || email.trim().length === 0) {
        setEmailError('Email is required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailError('Please enter a valid email address');
      } else if (!password || password.length === 0) {
        setPasswordError('Password is required');
      } else if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters');
      }
      return;
    }

    setIsLoading(true);

    try {
      debugLogger({
        title: 'Login: Attempting login',
        data: { email: email.trim() },
      });

      await login(email.trim(), password);

      debugLogger({
        title: 'Login: ✅ Login successful',
      });

      // Navigate to home on success
      navigateToHome();
    } catch (error: any) {
      debugLogger({
        title: 'Login: ❌ Login failed',
        error: error?.message || String(error),
      });

      const errorMessage = formatErrorMessage(error);
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  console.log('[LoginPage] About to render JSX');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar />
      {/* Mobile Form Container */}
      <View style={styles.container}>
        {/* Right Side Form */}
        <View style={styles.formContainer}>
          <PageContainer
            padding={0}
            style={{
              width: '100%',
              alignSelf: 'center',
            }}
          >
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Logo */}
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <FormLogo />
                </View>

                {/* Headline */}
                <View style={{ marginBottom: 10 }}>
                  <ThemedText
                    type="title-medium"
                    weight="bold"
                    style={{
                      textAlign: 'left',
                    }}
                  >
                    Sign In
                  </ThemedText>
                  <ThemedText
                    type="sub-title-small"
                    weight="medium"
                    style={{ color: '#666', marginTop: 8 }}
                  >
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
                    required
                    errorText={emailError}
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
                    required
                    errorText={passwordError}
                  />
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Link href="./(screens)/ForgotPassword">
                    <ThemedText type="link-medium">Forgot Password?</ThemedText>
                  </Link>
                </View>

                {/* Error Message */}
                {loginError ? (
                  <Container
                    padding={16}
                    variant="soft"
                    backgroundColor={colors.error}
                  >
                    <ThemedText
                      startIcon={
                        <Entypo name="warning" size={18} color="#fff" />
                      }
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
                  label={isLoading ? 'Signing In...' : 'Sign In'}
                  color="primary"
                  variant="solid"
                  onPress={handleLogin}
                  disabled={isLoading}
                  style={{ marginTop: 10 }}
                />

                {/* Footer */}
                <View style={styles.footer}>
                  <ThemedText type="body-medium">
                    Don&apos;t have an account?
                  </ThemedText>
                  <Link href={'./Register'}>
                    <ThemedText type="link-medium">Sign Up</ThemedText>
                  </Link>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>

            {/* Loading Modal */}
            <Modal visible={isLoading} transparent={true} animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <ThemedText type="body-medium" style={styles.loadingText}>
                    Signing In...
                  </ThemedText>
                </View>
              </View>
            </Modal>
          </PageContainer>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginPage;

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    width: '100%',
  },
  scrollContent: {
    padding: 24,
    gap: 20,
    flexGrow: 1,
    justifyContent: 'center',
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
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    gap: 15,
    minWidth: 150,
  },
  loadingText: {
    marginTop: 8,
    textAlign: 'center',
  },
});
