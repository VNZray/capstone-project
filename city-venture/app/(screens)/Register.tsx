import Button from '@/components/Button';
import DateInput from '@/components/DateInput';
import Dropdown from '@/components/Dropdown';
import FormLogo from '@/components/FormLogo';
import PageContainer from '@/components/PageContainer';
import FormTextInput from '@/components/TextInput';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme.web';
import { insertData } from '@/query/mainQuery';
import { navigateToHome, navigateToLogin } from '@/routes/mainRoutes';
import api from '@/services/api';
import { Tourist } from '@/types/Tourist';
import { User } from '@/types/User';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const RegistrationPage = () => {
  const colorScheme = useColorScheme();

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('123456');
  const [birthdate, setBirthdate] = useState(new Date());
  const [ethnicity, setEthnicity] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('09784561234');
  const [nationality, setNationality] = useState('Filipino');
  const [provinceId, setProvinceId] = useState<number | null>(20);
  const [municipalityId, setMunicipalityId] = useState<number | null>(24);
  const [barangayId, setBarangayId] = useState<number | null>(6);
  const { login, user } = useAuth(); // from AuthProvider

  const [province, setProvince] = useState<{ id: number; province: string }[]>(
    []
  );
  const [municipality, setMunicipality] = useState<
    { id: number; municipality: string }[]
  >([]);
  const [barangay, setBarangay] = useState<{ id: number; barangay: string }[]>(
    []
  );

  const fetchProvince = async () => {
    try {
      const response = await axios.get(`${api}/address/provinces`);
      if (Array.isArray(response.data)) {
        setProvince(response.data);
      }
    } catch (error) {
      console.error('Error fetching business categories:', error);
    }
  };

  const fetchMunicipality = async (provinceId: number) => {
    try {
      const response = await axios.get(
        `${api}/address/municipalities/${provinceId}`
      );

      if (Array.isArray(response.data)) {
        setMunicipality(response.data);
      }
    } catch (error) {
      console.error('Error fetching business types:', error);
    }
  };

  const fetchBarangay = async (municipalityId: number) => {
    try {
      const response = await axios.get(
        `${api}/address/barangays/${municipalityId}`
      );

      if (Array.isArray(response.data)) {
        setBarangay(response.data);
      }
    } catch (error) {
      console.error('Error fetching business types:', error);
    }
  };

  // Convert Date to 'YYYY-MM-DD'
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  const newUser: User = {
    email: email,
    phone_number: phoneNumber,
    password: password,
    user_role_id: 2,
    is_active: false,
    is_verified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    otp: null,
    barangay_id: barangayId,
  };

  const newTourist: Tourist = {
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    ethnicity: ethnicity,
    gender: gender,
    nationality: nationality,
    origin: origin,
    birthdate: formatDate(birthdate),
    age: (new Date().getFullYear() - birthdate.getFullYear()).toString(),
  };

  // Default fallback IDs kept to reduce friction; prefer user's selections when available
  const newAddress = {
    province_id: provinceId ?? 20,
    municipality_id: municipalityId ?? 24,
    barangay_id: barangayId ?? 6,
  };

  const handleTouristRegistration = async () => {
    try {
      console.log('[Register] Inserting user', newUser);
      console.log('[Register] Inserting address', newAddress);
      console.log('[Register] Inserting tourist (pre)', newTourist);

      // 1) Create base user
      const userRes = await insertData(newUser, 'users');
      const userId = userRes.id;
      console.debug('[Register] Created user', { userId });

      // 3) Create tourist profile
      const touristPayload: any = {
        ...newTourist,
        email,
        user_id: userId,
      };
      console.log('[Register] Inserting tourist (final)', touristPayload);
      const response = await insertData(touristPayload, 'tourist');
      const tourist_id = response.id;
      console.debug('[Register] Created tourist', { tourist_id });

      // 4) Auto-login and navigate home
      console.debug('[Register] Auto-login start', { email });
      await login(email, password);
      console.debug('[Register] Auto-login success');
      navigateToHome();
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;
        console.error('[Register] Registration failed', { status, data });

        if (status === 409) {
          // Duplicate entry (email/user already exists) → try to login instead
          try {
            console.warn('[Register] Duplicate detected, attempting login');
            await login(email, password);
            navigateToHome();
            return;
          } catch (e) {
            console.error('[Register] Auto-login after duplicate failed', e);
            alert('Account already exists. Please sign in.');
            navigateToLogin();
            return;
          }
        }
        alert(data?.error || 'Registration failed. Please try again.');
      } else {
        console.error('[Register] Unexpected error', err);
        alert('Unexpected error occurred.');
      }
    }
  };

  useEffect(() => {
    fetchProvince();
  }, []);

  useEffect(() => {
    if (provinceId) {
      fetchMunicipality(provinceId);
    }
  }, [provinceId]);

  useEffect(() => {
    if (municipalityId) {
      fetchBarangay(municipalityId);
    }
  }, [municipalityId]);

  return (
    <SafeAreaProvider>
      <StatusBar />

      <ScrollView>
        <PageContainer gap={16}>
          <FormLogo />

          <View style={styles.heading}>
            <ThemedText type="title-medium" weight="bold">
              Create Your Account
            </ThemedText>
            <ThemedText type="sub-title-small" weight="medium">
              Discover and connect with the city
            </ThemedText>
          </View>

          <FormTextInput
            label="First Name"
            placeholder="Enter your first name"
            value={firstName}
            onChangeText={setFirstName}
            variant="outlined"
            autoCapitalize="words"
          />

          <FormTextInput
            label="Middle Name"
            placeholder="Enter your middle name"
            value={middleName}
            onChangeText={setMiddleName}
            variant="outlined"
            autoCapitalize="words"
          />

          <FormTextInput
            label="Last Name"
            placeholder="Enter your last name"
            value={lastName}
            onChangeText={setLastName}
            variant="outlined"
            autoCapitalize="words"
          />

          <View>
            <ThemedText type="label-medium" mb={6}>
              Gender
            </ThemedText>
            <View style={styles.radioGroup}>
              {['Male', 'Female', 'Prefer not to say'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    colorScheme === 'light'
                      ? styles.radioButton
                      : styles.darkRadioButton,
                    gender === option && styles.radioSelected,
                  ]}
                  onPress={() => setGender(option)}
                >
                  <ThemedText
                    type="label-small"
                    style={[gender === option && styles.radioTextSelected]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <DateInput
            label="Birthdate"
            placeholder="Select your birthdate"
            variant="outlined"
            style={{ flex: 1 }}
            mode="single"
            showStatusLegend={false}
            requireConfirmation
            selectionVariant="filled"
            value={birthdate}
            disableFuture
            onChange={(d) => {
              if (d) setBirthdate(d);
            }}
          />

          <FormTextInput
            label="Contact Number"
            placeholder="Enter your contact number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            variant="outlined"
          />

          <FormTextInput
            label="Nationality"
            placeholder="Enter your nationality"
            value={nationality}
            onChangeText={setNationality}
            variant="outlined"
            autoCapitalize="words"
          />

          {/* Address Selection Using Dropdowns */}
          <Dropdown
            label="Province"
            placeholder="Select your province"
            items={province.map((p) => ({ id: p.id, label: p.province }))}
            value={provinceId}
            onSelect={(item) => {
              const id = item?.id as number;
              setProvinceId(id);
              // Reset dependent selections
              setMunicipalityId(null);
              setBarangayId(null);
              setMunicipality([]);
              setBarangay([]);
              if (id) fetchMunicipality(id);
            }}
            variant="outlined"
            elevation={2}
            clearable
          />
          <Dropdown
            label="Municipality"
            placeholder={
              provinceId ? 'Select your municipality' : 'Select province first'
            }
            items={municipality.map((m) => ({
              id: m.id,
              label: m.municipality,
            }))}
            value={municipalityId}
            disabled={!provinceId}
            onSelect={(item) => {
              const id = item?.id as number;
              setMunicipalityId(id);
              setBarangayId(null);
              setBarangay([]);
              if (id) fetchBarangay(id);
            }}
            variant="outlined"
            elevation={2}
            clearable
          />
          <Dropdown
            label="Barangay"
            placeholder={
              municipalityId
                ? 'Select your barangay'
                : 'Select municipality first'
            }
            items={barangay.map((b) => ({ id: b.id, label: b.barangay }))}
            value={barangayId}
            disabled={!municipalityId}
            onSelect={(item) => {
              const id = item?.id as number;
              setBarangayId(id);
            }}
            variant="outlined"
            elevation={2}
            clearable
          />

          <View>
            <ThemedText mb={6} type="label-medium">
              I am a:
            </ThemedText>
            <View style={styles.radioGroup}>
              {['Bicolano', 'Non-Bicolano', 'Foreign', 'Local'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    colorScheme === 'light'
                      ? styles.radioButton
                      : styles.darkRadioButton,
                    ethnicity === type && styles.radioSelected,
                  ]}
                  onPress={() => setEthnicity(type)}
                >
                  <ThemedText
                    type="label-small"
                    style={[ethnicity === type && styles.radioTextSelected]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <ThemedText mb={6} type="label-medium">
              Origin:
            </ThemedText>
            <View style={styles.radioGroup}>
              {['Domestic', 'Local', 'Overseas'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    colorScheme === 'light'
                      ? styles.radioButton
                      : styles.darkRadioButton,
                    origin === type && styles.radioSelected,
                  ]}
                  onPress={() => setOrigin(type)}
                >
                  <ThemedText
                    type="label-small"
                    style={[origin === type && styles.radioTextSelected]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Email */}
          <FormTextInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            variant="outlined"
          />

          {/* Password */}
          <FormTextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            variant="outlined"
          />

          {/* Confirm Password */}
          <FormTextInput
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            variant="outlined"
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            <ThemedText type="body-small">
              By signing up, you agree to our
            </ThemedText>
            <ThemedText type="link-small">Terms and Conditions</ThemedText>
            <ThemedText type="body-small">and</ThemedText>
            <ThemedText type="link-small">Privacy Policy</ThemedText>
          </View>

          <Button
            fullWidth
            size="large"
            label="Sign Up"
            color="primary"
            variant="solid"
            onPress={handleTouristRegistration}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
              marginBottom: 32,
            }}
          >
            <ThemedText type="body-medium">Already have an account?</ThemedText>

            <ThemedText type="link-medium" onPress={() => navigateToLogin()}>
              Sign In
            </ThemedText>
          </View>

          {/* Legacy picker modals removed in favor of Dropdown component */}
        </PageContainer>
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default RegistrationPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 60,
  },

  heading: {
    marginBottom: 20,
  },
  subtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  nameInput: {
    flex: 1,
    minWidth: 0,
  },
  // Removed native TextInput styles after migrating to FormTextInput component

  // Removed unused picker/modal styles after Dropdown integration

  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#F9F9F9',
  },

  darkRadioButton: {
    backgroundColor: colors.dark,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2e2e2e',
  },

  radioSelected: {
    backgroundColor: '#0A1B47',
    borderWidth: 0,
  },
  radioText: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'Poppins-Medium',
  },
  radioTextSelected: {
    color: '#fff',
  },
  radioLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginBottom: 6,
    marginTop: 6,
  },
  terms: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#555',
    marginVertical: 14,
    textAlign: 'center',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginTop: 20,
    marginBottom: 50,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    marginBottom: 4,
    marginTop: 10,
  },
  webContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 0,
  },
});
