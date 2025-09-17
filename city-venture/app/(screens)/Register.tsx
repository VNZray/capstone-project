import Button from '@/components/Button';
import Container from '@/components/Container';
import FormLogo from '@/components/FormLogo';
import PageContainer from '@/components/PageContainer';
import PressableButton from '@/components/PressableButton';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme.web';
import { insertData } from '@/query/mainQuery';
import { navigateToHome, navigateToLogin } from '@/routes/mainRoutes';
import api from '@/services/api';
import { Tourist } from '@/types/Tourist';
import { User } from '@/types/User';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const RegistrationPage = () => {
  const colorScheme = useColorScheme();

  const [firstName, setFirstName] = useState('Rayven');
  const [lastName, setLastName] = useState('Clores');
  const [email, setEmail] = useState('rayven.clores@unc.edu.ph');
  const [password, setPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('123456');
  const [birthdate, setBirthdate] = useState(new Date());
  const [ethnicity, setEthnicity] = useState<string>('');
  const [category, setCategory] = useState<string>('');
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

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [provinceVisible, setProvinceVisible] = useState(false);
  const [municipalityVisible, setMunicipalityVisible] = useState(false);
  const [barangayVisible, setBarangayVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-Light': require('@/assets/fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Medium': require('@/assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

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
  };

  const newTourist: Tourist = {
    first_name: firstName,
    last_name: lastName,
    ethnicity: ethnicity,
    gender: gender,
    nationality: nationality,
    category: category,
    birthdate: formatDate(birthdate),
    address_id: barangayId,
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

      // 2) Create address (use selected location or fallbacks)
      const addressRes = await insertData(newAddress, 'address');
      const addressId = addressRes.id;
      console.debug('[Register] Created address', { addressId });

      // 3) Create tourist profile
      const touristPayload: any = {
        ...newTourist,
        email, // include email if backend expects unique email in tourist
        address_id: addressId,
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

  if (!fontsLoaded) return null;

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

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <ThemedText type="label-medium" mb={6}>
                First Name
              </ThemedText>
              <TextInput
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={setFirstName}
                style={
                  colorScheme === 'light' ? styles.darkInput : styles.lightInput
                }
                placeholderTextColor="#999"
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="label-medium" mb={6}>
                Last Name
              </ThemedText>
              <TextInput
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={setLastName}
                style={
                  colorScheme === 'light' ? styles.darkInput : styles.lightInput
                }
                placeholderTextColor="#999"
              />
            </View>
          </View>

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

          <View>
            <ThemedText type="label-medium" mb={6}>
              Birthdate
            </ThemedText>
            <TouchableOpacity
              style={
                colorScheme === 'light'
                  ? styles.lightDateInput
                  : styles.darkDateInput
              }
              onPress={() => setCalendarVisible(true)} // always use calendarVisible
            >
              <MaterialCommunityIcons name="calendar" size={20} color="#888" />
              <ThemedText type="label-medium">
                {birthdate ? birthdate.toDateString() : 'Select your birthdate'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View>
            <ThemedText type="label-medium" mb={6}>
              Contact Number
            </ThemedText>
            <TextInput
              placeholder="Enter your contact number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              style={
                colorScheme === 'light' ? styles.darkInput : styles.lightInput
              }
              placeholderTextColor="#999"
            />
          </View>

          <View>
            <ThemedText mb={6} type="label-medium">
              Nationality
            </ThemedText>
            <TextInput
              placeholder="Enter your nationality"
              value={nationality}
              onChangeText={setNationality}
              style={
                colorScheme === 'light' ? styles.darkInput : styles.lightInput
              }
              placeholderTextColor="#999"
            />
          </View>

          {/* Province Picker */}
          <View>
            <ThemedText mb={6} type="label-medium">
              Province
            </ThemedText>
            <TouchableOpacity
              style={
                colorScheme === 'light'
                  ? styles.lightDateInput
                  : styles.darkDateInput
              }
              onPress={() => setProvinceVisible(true)} // always use provinceVisible
            >
              <ThemedText type="label-medium">
                {provinceId !== null
                  ? province.find((prov) => prov.id === provinceId)?.province ||
                    'Select your province'
                  : 'Select your province'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Municipality Picker */}
          <View>
            <ThemedText mb={6} type="label-medium">
              Municipality
            </ThemedText>
            <TouchableOpacity
              style={
                colorScheme === 'light'
                  ? styles.lightDateInput
                  : styles.darkDateInput
              }
              onPress={() => setMunicipalityVisible(true)} // always use municipalityVisible
            >
              <ThemedText type="label-medium">
                {municipalityId !== null
                  ? municipality.find((mun) => mun.id === municipalityId)
                      ?.municipality || 'Select your municipality'
                  : 'Select your municipality'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Barangay Picker */}
          <View>
            <ThemedText mb={6} type="label-medium">
              Barangay
            </ThemedText>
            <TouchableOpacity
              style={
                colorScheme === 'light'
                  ? styles.lightDateInput
                  : styles.darkDateInput
              }
              onPress={() => setBarangayVisible(true)} // always use barangayVisible
            >
              <ThemedText type="label-medium">
                {barangayId !== null
                  ? barangay.find((brgy) => brgy.id === barangayId)?.barangay ||
                    'Select your barangay'
                  : 'Select your barangay'}
              </ThemedText>
            </TouchableOpacity>
          </View>

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
              Category:
            </ThemedText>
            <View style={styles.radioGroup}>
              {['Domestic', 'Overseas'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    colorScheme === 'light'
                      ? styles.radioButton
                      : styles.darkRadioButton,
                    category === type && styles.radioSelected,
                  ]}
                  onPress={() => setCategory(type)}
                >
                  <ThemedText
                    type="label-small"
                    style={[category === type && styles.radioTextSelected]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Email */}
          <View>
            <ThemedText mb={6} type="label-medium">
              Email
            </ThemedText>
            <TextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={
                colorScheme === 'light' ? styles.darkInput : styles.lightInput
              }
              placeholderTextColor="#999"
            />
          </View>

          {/* Password */}
          <View>
            <ThemedText mb={6} type="label-medium">
              Password
            </ThemedText>
            <TextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={
                colorScheme === 'light' ? styles.darkInput : styles.lightInput
              }
              placeholderTextColor="#999"
            />
          </View>

          {/* Confirm Password */}
          <View>
            <ThemedText mb={6} type="label-medium">
              Confirm Password
            </ThemedText>
            <TextInput
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={
                colorScheme === 'light' ? styles.darkInput : styles.lightInput
              }
              placeholderTextColor="#999"
            />
          </View>

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

          {calendarVisible && (
            <Modal
              visible={calendarVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setCalendarVisible(false)}
            >
              <View style={styles.calendarOverlay}>
                <View style={styles.calendarContainer}>
                  <Container
                    padding={16}
                    backgroundColor={colors.primary}
                    width={'100%'}
                    align="center"
                  >
                    <ThemedText
                      lightColor="white"
                      type="card-title-medium"
                      weight="bold"
                    >
                      Birthdate
                    </ThemedText>
                  </Container>
                  <View style={styles.separator} />
                  <DateTimePicker
                    value={birthdate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') setCalendarVisible(false);
                      if (selectedDate) setBirthdate(selectedDate);
                    }}
                    maximumDate={new Date()}
                  />
                  <View style={styles.calendarButtons}>
                    <PressableButton
                      type="primary"
                      title="Confirm"
                      onPress={() => setCalendarVisible(false)}
                      style={{ flex: 1 }}
                      color="#fff"
                      textSize={12}
                    />
                  </View>
                </View>
              </View>
            </Modal>
          )}

          {provinceVisible && (
            <Modal
              visible={provinceVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setProvinceVisible(false)}
            >
              <View style={styles.calendarOverlay}>
                <Container width={'90%'}>
                  <Container
                    align="center"
                    padding={16}
                    backgroundColor={colors.primary}
                    width={'100%'}
                  >
                    <ThemedText
                      lightColor="white"
                      type="card-title-medium"
                      weight="bold"
                    >
                      Select Province
                    </ThemedText>
                  </Container>
                  <View style={styles.separator} />
                  <Picker
                    selectedValue={provinceId}
                    onValueChange={(value) => setProvinceId(value)}
                    style={
                      colorScheme === 'light'
                        ? styles.lightPicker
                        : styles.darkPicker
                    }
                  >
                    <Picker.Item label="Select Province" value={null} />
                    {province.map((prov, index) => (
                      <Picker.Item
                        key={index}
                        label={prov.province}
                        value={prov.id}
                      />
                    ))}
                  </Picker>
                  <View style={styles.calendarButtons}>
                    <PressableButton
                      type="primary"
                      title="Confirm"
                      onPress={() => setProvinceVisible(false)}
                      style={{ flex: 1 }}
                      color="#fff"
                      textSize={12}
                    />
                  </View>
                </Container>
              </View>
            </Modal>
          )}

          {municipalityVisible && (
            <Modal
              visible={municipalityVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setMunicipalityVisible(false)}
            >
              <View style={styles.calendarOverlay}>
                <Container width={'90%'}>
                  <Container
                    align="center"
                    padding={16}
                    backgroundColor={colors.primary}
                    width={'100%'}
                  >
                    <ThemedText
                      lightColor="white"
                      type="card-title-medium"
                      weight="bold"
                    >
                      Select Municipality
                    </ThemedText>
                  </Container>
                  <View style={styles.separator} />
                  <Picker
                    selectedValue={municipalityId}
                    onValueChange={(value) => setMunicipalityId(value)}
                    style={
                      colorScheme === 'light'
                        ? styles.lightPicker
                        : styles.darkPicker
                    }
                    enabled={!!provinceId}
                  >
                    <Picker.Item label="Select Municipality" value={null} />
                    {municipality.map((mun, index) => (
                      <Picker.Item
                        key={index}
                        label={mun.municipality}
                        value={mun.id}
                      />
                    ))}
                  </Picker>
                  <View style={styles.calendarButtons}>
                    <PressableButton
                      type="primary"
                      title="Confirm"
                      onPress={() => setMunicipalityVisible(false)}
                      style={{ flex: 1 }}
                      color="#fff"
                      textSize={12}
                    />
                  </View>
                </Container>
              </View>
            </Modal>
          )}

          {barangayVisible && (
            <Modal
              visible={barangayVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setBarangayVisible(false)}
            >
              <View style={styles.calendarOverlay}>
                <Container width={'90%'}>
                  <Container
                    align="center"
                    padding={16}
                    backgroundColor={colors.primary}
                    width={'100%'}
                  >
                    <ThemedText
                      lightColor="white"
                      type="card-title-medium"
                      weight="bold"
                    >
                      Select Barangay
                    </ThemedText>
                  </Container>
                  <View style={styles.separator} />
                  <Picker
                    selectedValue={barangayId}
                    onValueChange={(value) => setBarangayId(value)}
                    style={
                      colorScheme === 'light'
                        ? styles.lightPicker
                        : styles.darkPicker
                    }
                    enabled={!!municipalityId}
                  >
                    <Picker.Item label="Select Barangay" value={null} />
                    {barangay.map((brgy, index) => (
                      <Picker.Item
                        key={index}
                        label={brgy.barangay}
                        value={brgy.id}
                      />
                    ))}
                  </Picker>
                  <View style={styles.calendarButtons}>
                    <PressableButton
                      type="primary"
                      title="Confirm"
                      onPress={() => setBarangayVisible(false)}
                      style={{ flex: 1 }}
                      color="#fff"
                      textSize={12}
                    />
                  </View>
                </Container>
              </View>
            </Modal>
          )}
        </PageContainer>
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default RegistrationPage;

const styles = StyleSheet.create({
  lightPicker: { marginBottom: 15 },

  darkPicker: { marginBottom: 15 },

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

  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    elevation: 5,
    display: 'flex',
    alignItems: 'center',
  },
  calendarButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },

  separator: {
    height: 1,
    backgroundColor: '#DDD',
    marginBottom: 12,
  },
  lightDateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    gap: 8,
  },

  darkDateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 10,
    gap: 8,
  },

  dateText: {
    fontSize: 14,
    color: '#333',
  },

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
