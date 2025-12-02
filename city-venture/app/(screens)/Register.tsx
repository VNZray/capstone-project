import Button from '@/components/Button';
import FormLogo from '@/components/FormLogo';
import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { insertData } from '@/query/mainQuery';
import { navigateToHome, navigateToLogin } from '@/routes/mainRoutes';
import { Tourist } from '@/types/Tourist';
import { User } from '@/types/User';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, View, Animated } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import PersonalDetails from './register/PersonalDetails';
import Address from './register/Address';
import ContactDetails from './register/ContactDetails';
import Verification from './register/Verification';
import CreatePassword from './register/CreatePassword';
import { useColorScheme } from '@/hooks/use-color-scheme';

const RegistrationPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Animate step transitions
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Scroll to top on step change
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentStep]);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    firstName: 'Rayven',
    middleName: '',
    lastName: 'Clores',
    gender: 'Male',
    birthdate: new Date('2003-09-28'),
    phoneNumber: '09876543210',
    nationality: 'Filipino',
    provinceId: 20 as number | null,
    municipalityId: 24 as number | null,
    barangayId: 6 as number | null,
    ethnicity: 'Bicolano',
    origin: 'Local',
    // Step 2: Contact & Verification
    email: 'rclores666@gmail.com',
    verificationType: 'email' as 'email' | 'phone',
    // Step 3: Password
    password: 'RayvenClores22-17782',
    confirmPassword: 'RayvenClores22-17782',
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  // Generate 6-digit OTP
  const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otp);
    return otp;
  };

  // Send OTP (static for now)
  const handleSendOTP = () => {
    const otp = generateOTP();
    console.log(`[OTP] Generated: ${otp}`);

    // TODO: Implement actual email/SMS sending
    if (formData.verificationType === 'email') {
      console.log(`[OTP] Sending to email: ${formData.email}`);
      Alert.alert(
        'Verification Code Sent',
        `A 6-digit code has been sent to ${formData.email}`,
        [{ text: 'OK', onPress: () => setCurrentStep(4) }]
      );
    } else {
      console.log(`[OTP] Sending to phone: ${formData.phoneNumber}`);
      Alert.alert(
        'Verification Code Sent',
        `A 6-digit code has been sent to ${formData.phoneNumber}`,
        [{ text: 'OK', onPress: () => setCurrentStep(4) }]
      );
    }
  };

  // Verify OTP
  const handleVerifyOTP = (enteredOTP: string) => {
    if (enteredOTP === generatedOTP) {
      Alert.alert('Success', 'Verification successful!', [
        { text: 'OK', onPress: () => setCurrentStep(5) },
      ]);
    } else {
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    }
  };

  // Convert Date to 'YYYY-MM-DD'
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // Complete registration
  const handleCompleteRegistration = async () => {
    try {
      const newUser: User = {
        email: formData.email,
        phone_number: formData.phoneNumber,
        password: formData.password,
        user_role_id: 9,
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        otp: null,
        barangay_id: formData.barangayId ?? 6,
      };

      const newTourist: Tourist = {
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        ethnicity: formData.ethnicity,
        gender: formData.gender,
        nationality: formData.nationality,
        origin: formData.origin,
        birthdate: formatDate(formData.birthdate),
        age: (
          new Date().getFullYear() - formData.birthdate.getFullYear()
        ).toString(),
      };

      console.log('[Register] Creating user', newUser);

      // 1) Create base user
      const userRes = await insertData(newUser, 'users');
      const userId = userRes?.id || userRes?.data?.id || userRes?.insertId;

      console.debug('[Register] User created:', userId);

      if (!userId) {
        throw new Error('Failed to retrieve User ID from response.');
      }

      // 2) Create tourist profile
      const touristPayload: any = {
        ...newTourist,
        user_id: userId,
      };

      console.log('[Register] Creating tourist profile', touristPayload);

      const response = await insertData(touristPayload, 'tourist');
      const tourist_id =
        response?.id || response?.data?.id || response?.insertId;

      if (!tourist_id) {
        throw new Error('Tourist profile creation failed.');
      }

      console.debug('[Register] Tourist created:', tourist_id);

      Alert.alert('Success', 'Your account has been created successfully!', [
        {
          text: 'OK',
          onPress: async () => {
            await login(formData.email, formData.password);
            navigateToHome();
          },
        },
      ]);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;
        console.error('[Register] Registration failed', { status, data });

        if (status === 409) {
          Alert.alert('Error', 'Account already exists. Please sign in.');
          navigateToLogin();
          return;
        }
        Alert.alert(
          'Error',
          data?.error || 'Registration failed. Please try again.'
        );
      } else {
        console.error('[Register] Unexpected error', err);
        Alert.alert('Error', err.message || 'Unexpected error occurred.');
      }
    }
  };

  const canProceedStep1 = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.gender !== '' &&
      formData.nationality.trim() !== ''
    );
  };

  const canProceedStep2 = () => {
    return (
      formData.provinceId !== null &&
      formData.municipalityId !== null &&
      formData.barangayId !== null &&
      formData.ethnicity !== '' &&
      formData.origin !== ''
    );
  };

  const canProceedStep3 = () => {
    return formData.email.trim() !== '' && formData.phoneNumber.trim() !== '';
  };

  const canProceedStep5 = () => {
    return (
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword &&
      /[A-Z]/.test(formData.password) &&
      /[a-z]/.test(formData.password) &&
      /[0-9]/.test(formData.password)
    );
  };

  const stepTitles = [
    'Personal Details',
    'Address & Demographics',
    'Contact Information',
    'Verify Account',
    'Create Password',
  ];

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: isDark ? '#0D1117' : '#F8FAFC' },
        ]}
      >
        <StatusBar style={isDark ? 'light' : 'dark'} />

        {/* Progress Bar - Top Fixed Position */}
        <View
          style={[
            styles.progressBarContainer,
            { backgroundColor: isDark ? '#161B22' : '#FFFFFF' },
          ]}
        >
          <View style={styles.progressHeader}>
            <ThemedText
              type="label-small"
              weight="semi-bold"
              style={{ color: colors.primary }}
            >
              {stepTitles[currentStep - 1]}
            </ThemedText>
            <ThemedText
              type="label-small"
              style={{ color: isDark ? '#8B92A6' : '#64748B' }}
            >
              Step {currentStep} of 5
            </ThemedText>
          </View>
          <View
            style={[
              styles.progressBarBackground,
              { backgroundColor: isDark ? '#1F2937' : '#E5E7EB' },
            ]}
          >
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${(currentStep / 5) * 100}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.formContainer}>
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <PageContainer
              gap={24}
              style={{ width: '100%', alignSelf: 'center' }}
            >
              {/* Animated Step Content */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
              >
                <View
                  style={[
                    styles.contentCard,
                    { backgroundColor: isDark ? '#161B22' : '#FFFFFF' },
                  ]}
                >
                  {/* Step Title & Description */}
                  <View style={styles.stepHeader}>
                    <ThemedText type="title-small" weight="semi-bold">
                      {stepTitles[currentStep - 1]}
                    </ThemedText>
                    <ThemedText
                      type="body-small"
                      style={{
                        color: isDark ? '#8B92A6' : '#64748B',
                        marginTop: 4,
                      }}
                    >
                      {
                        [
                          'Tell us about yourself',
                          'Where are you from?',
                          'How can we reach you?',
                          'Confirm your identity',
                          'Secure your account',
                        ][currentStep - 1]
                      }
                    </ThemedText>
                  </View>

                  {currentStep === 1 && (
                    <PersonalDetails
                      data={formData}
                      onUpdate={updateFormData}
                    />
                  )}

                  {currentStep === 2 && (
                    <Address data={formData} onUpdate={updateFormData} />
                  )}

                  {currentStep === 3 && (
                    <ContactDetails
                      data={formData}
                      onUpdate={updateFormData}
                      onSendOTP={handleSendOTP}
                    />
                  )}

                  {currentStep === 4 && (
                    <Verification
                      generatedOTP={generatedOTP}
                      verificationType={formData.verificationType}
                      contactInfo={
                        formData.verificationType === 'email'
                          ? formData.email
                          : formData.phoneNumber
                      }
                      onVerify={handleVerifyOTP}
                      onResend={handleSendOTP}
                    />
                  )}

                  {currentStep === 5 && (
                    <CreatePassword data={formData} onUpdate={updateFormData} />
                  )}
                </View>
              </Animated.View>

              {/* Enhanced Navigation Buttons */}
              {currentStep !== 3 && currentStep !== 4 && (
                <View style={styles.buttonContainer}>
                  {currentStep > 1 && currentStep !== 4 && (
                    <Button
                      size="large"
                      label="Back"
                      color="secondary"
                      variant="outlined"
                      onPress={() => setCurrentStep((prev) => prev - 1)}
                      style={{ flex: 1 }}
                      endIcon={'arrow-left'}
                    />
                  )}

                  {currentStep < 5 ? (
                    <Button
                      size="large"
                      label="Continue"
                      color="primary"
                      variant="solid"
                      onPress={() => setCurrentStep((prev) => prev + 1)}
                      disabled={
                        (currentStep === 1 && !canProceedStep1()) ||
                        (currentStep === 2 && !canProceedStep2())
                      }
                      style={{ flex: currentStep === 1 ? 1 : 1 }}
                      startIcon="arrow-right"
                    />
                  ) : (
                    <Button
                      size="large"
                      label="Create Account"
                      color="primary"
                      variant="solid"
                      onPress={handleCompleteRegistration}
                      disabled={!canProceedStep5()}
                      style={{ flex: 1 }}
                      endIcon="check-circle"
                    />
                  )}
                </View>
              )}

              {/* Help Text */}
              {(currentStep === 1 || currentStep === 2) && (
                <View style={styles.helpSection}>
                  <ThemedText
                    type="body-small"
                    style={{
                      flex: 1,
                      color: isDark ? '#8B92A6' : '#64748B',
                      textAlign: 'center',
                    }}
                  >
                    {currentStep === 1
                      ? '🔒 Your information is secure and will only be used for account verification'
                      : '📍 We use this information to provide personalized recommendations'}
                  </ThemedText>
                </View>
              )}

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 6,
                  marginBottom: 32,
                }}
              >
                <ThemedText type="body-medium">
                  Already have an account?
                </ThemedText>

                <ThemedText
                  type="link-medium"
                  onPress={() => navigateToLogin()}
                >
                  Sign In
                </ThemedText>
              </View>
            </PageContainer>
          </ScrollView>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default RegistrationPage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  heading: {
    marginBottom: 16,
    alignItems: 'center',
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  contentCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  stepHeader: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.info + '10',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
});
