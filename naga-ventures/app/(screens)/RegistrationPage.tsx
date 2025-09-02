import logo from '@/assets/images/logo.png';
import PressableButton from '@/components/PressableButton';
import { ThemedText } from '@/components/ThemedText';
import { insertData } from '@/Controller/Query';
import api from '@/services/api';
import { colors } from '@/utils/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const RegistrationPage = () => {
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
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [municipalityId, setMunicipalityId] = useState<number | null>(null);
  const [barangayId, setBarangayId] = useState<number | null>(null);

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

  const newTourist = {
    first_name: firstName,
    last_name: lastName,
    ethnicity: ethnicity,
    gender: gender,
    nationality: nationality,
    phone_number: phoneNumber,
    category: category,
    email: email,
    birthday: formatDate(birthdate),
    created_at: new Date().toISOString(),
    province_id: provinceId,
    municipality_id: municipalityId,
    barangay_id: barangayId,
    age: new Date().getFullYear() - birthdate.getFullYear(),
  };

  const handleTouristRegistration = async () => {
    try {
      // Create Owner
      const response = await insertData(newTourist, 'tourist');
      const tourist_id = response.id;

      alert(`Account created! Owner ID: ${tourist_id}`);

      // Create User linked to Owner
      const userResponse = await axios.post(`${api}/users`, {
        email: email.trim(),
        phone_number: phoneNumber.trim(),
        password: password.trim(),
        role: 'Tourist',
        tourist_id: tourist_id,
      });

      const userId = userResponse.data?.id;
      router.replace('/login');

      alert(`User created! User ID: ${userId}`);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
      } else {
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

  // const handleTouristRegistration = async () => {
  //   if (!firstName || !lastName || !email || !ethnicity || !birthdate) {
  //     alert('Please fill in all required fields.');
  //     return;
  //   }

  //   // 1. Sign up the user
  //   const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
  //     {
  //       email,
  //       password,
  //       options: {
  //         data: {
  //           display_name: `${firstName} ${lastName}`,
  //         },
  //       },
  //     }
  //   );

  //   if (signUpError || !signUpData.user) {
  //     alert('Account creation failed. Please try again.');
  //     return;
  //   }

  //   const userId = signUpData.user.id;
  //   console.log('User signed up:', signUpData.user);
  //   console.log('User ID:', userId);
  //   // 2. Insert into Tourist table
  //   const { data, error } = await supabase.from('tourist').insert([
  //     {
  //       tourist_id: userId,
  //       first_name: firstName,
  //       last_name: lastName,
  //       profile_picture: null, // you can update this later with file upload logic
  //       ethnicity,
  //       gender,
  //       nationality,
  //       contact_number: phoneNumber,
  //       email,
  //       created_at: new Date().toISOString(),
  //       age: new Date().getFullYear() - birthdate.getFullYear(),
  //     },
  //   ]);

  //   console.log('Inserted data:', data);
  //   console.log('Insert error:', error);

  //   if (error) {
  //     console.error('Error inserting tourist:', error.message);
  //     alert('Registration failed. Please try again.');
  //   } else {
  //     alert('Registration successful!');
  //     router.replace('/(screens)/');
  //   }

  //   // 3. Insert into Profile table with role
  //   const { data: profileData, error: profileError } = await supabase
  //     .from('profile')
  //     .insert([
  //       {
  //         id: userId,
  //         role: 'tourist',
  //       },
  //     ]);

  //   console.log('Inserted data:', profileData);
  //   console.log('Insert error:', profileError);
  // };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={Platform.OS === 'web' ? styles.webContainer : {}}>
        <StatusBar />

        <ScrollView style={styles.card}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.logoText}>Naga Venture</Text>
          </View>

          <View style={styles.heading}>
            <ThemedText type="title">Create Your Account</ThemedText>
            <ThemedText type="default" style={styles.subtext}>
              Discover and connect with the city
            </ThemedText>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <Text style={styles.label}>Gender</Text>
          <View style={styles.radioGroup}>
            {['Male', 'Female', 'Prefer not to say'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.radioButton,
                  gender === option && styles.radioSelected,
                ]}
                onPress={() => setGender(option)}
              >
                <Text
                  style={[
                    styles.radioText,
                    gender === option && styles.radioTextSelected,
                  ]}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Birthdate</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setCalendarVisible(true)} // always use calendarVisible
          >
            <MaterialCommunityIcons name="calendar" size={20} color="#888" />
            <Text style={styles.dateText}>
              {birthdate ? birthdate.toDateString() : 'Select your birthdate'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            placeholder="Enter your contact number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Nationality</Text>
          <TextInput
            placeholder="Enter your nationality"
            value={nationality}
            onChangeText={setNationality}
            style={styles.input}
            placeholderTextColor="#999"
          />

          {/* Province Picker */}
          <Text style={styles.label}>Province</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setProvinceVisible(true)} // always use provinceVisible
          >
            <Text>
              {provinceId !== null
                ? province.find((prov) => prov.id === provinceId)?.province ||
                  'Select your province'
                : 'Select your province'}
            </Text>
          </TouchableOpacity>

          {/* Municipality Picker */}
          <Text style={styles.label}>Municipality</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setMunicipalityVisible(true)} // always use municipalityVisible
          >
            <Text>
              {municipalityId !== null
                ? municipality.find((mun) => mun.id === municipalityId)
                    ?.municipality || 'Select your municipality'
                : 'Select your municipality'}
            </Text>
          </TouchableOpacity>

          {/* Barangay Picker */}
          <Text style={styles.label}>Barangay</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setBarangayVisible(true)} // always use barangayVisible
          >
            <Text>
              {barangayId !== null
                ? barangay.find((brgy) => brgy.id === barangayId)?.barangay ||
                  'Select your barangay'
                : 'Select your barangay'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>I am a:</Text>
          <View style={styles.radioGroup}>
            {['Bicolano', 'Non-Bicolano', 'Foreign', 'Local'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.radioButton,
                  ethnicity === type && styles.radioSelected,
                ]}
                onPress={() => setEthnicity(type)}
              >
                <Text
                  style={[
                    styles.radioText,
                    ethnicity === type && styles.radioTextSelected,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Category:</Text>
          <View style={styles.radioGroup}>
            {['Domestic', 'Overseas'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.radioButton,
                  category === type && styles.radioSelected,
                ]}
                onPress={() => setCategory(type)}
              >
                <Text
                  style={[
                    styles.radioText,
                    category === type && styles.radioTextSelected,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            placeholderTextColor="#999"
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#999"
          />

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#999"
          />

          <ThemedText style={styles.terms}>
            By signing up, you agree to our{' '}
            <ThemedText type="link">Terms</ThemedText> and{' '}
            <ThemedText type="link">Privacy Policy</ThemedText>.
          </ThemedText>

          <PressableButton
            TextSize={16}
            width={'100%'}
            height={54}
            type="primary"
            Title="Sign Up"
            color="#fff"
            onPress={handleTouristRegistration}
          />

          <ThemedText style={styles.footerText}>
            Already have an account?{' '}
            <ThemedText
              type="link"
              onPress={() => router.push('/(screens)/LoginPage')}
            >
              Sign In
            </ThemedText>
          </ThemedText>

          {calendarVisible && (
            <Modal
              visible={calendarVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setCalendarVisible(false)}
            >
              <View style={styles.calendarOverlay}>
                <View style={styles.calendarContainer}>
                  <Text style={styles.modalTitle}>Select Your Birthdate</Text>
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
                      Title="Confirm"
                      onPress={() => setCalendarVisible(false)}
                      style={{ flex: 1 }}
                      color="#fff"
                      TextSize={12}
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
                <View style={styles.pickerContainer}>
                  <Text style={styles.modalTitle}>Select Province</Text>
                  <View style={styles.separator} />
                  <Picker
                    selectedValue={provinceId}
                    onValueChange={(value) => setProvinceId(value)}
                    style={styles.picker}
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
                      Title="Confirm"
                      onPress={() => setProvinceVisible(false)}
                      style={{ flex: 1 }}
                      color="#fff"
                      TextSize={12}
                    />
                  </View>
                </View>
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
                <View style={styles.pickerContainer}>
                  <Text style={styles.modalTitle}>Select Municipality</Text>
                  <View style={styles.separator} />
                  <Picker
                    selectedValue={municipalityId}
                    onValueChange={(value) => setMunicipalityId(value)}
                    style={styles.picker}
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
                      Title="Confirm"
                      onPress={() => setMunicipalityVisible(false)}
                      style={{ flex: 1 }}
                      color="#fff"
                      TextSize={12}
                    />
                  </View>
                </View>
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
                <View style={styles.pickerContainer}>
                  <Text style={styles.modalTitle}>Select Barangay</Text>
                  <View style={styles.separator} />
                  <Picker
                    selectedValue={barangayId}
                    onValueChange={(value) => setBarangayId(value)}
                    style={styles.picker}
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
                      Title="Confirm"
                      onPress={() => setBarangayVisible(false)}
                      style={{ flex: 1 }}
                      color="#fff"
                      TextSize={12}
                    />
                  </View>
                </View>
              </View>
            </Modal>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default RegistrationPage;

const styles = StyleSheet.create({
  pickerContainer: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    width: '90%',
    elevation: 5,
    display: 'flex',
  },
  picker: { backgroundColor: '#eee', marginBottom: 15 },

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
  },
  logoText: {
    fontSize: 18,
    marginLeft: 10,
    fontFamily: 'Poppins-Bold',
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
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#0A1B47',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
  },
  separator: {
    height: 1,
    backgroundColor: '#DDD',
    marginBottom: 12,
  },
  dateInput: {
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
  dateText: {
    fontSize: 14,
    color: '#333',
  },

  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  radioButton: {
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  radioSelected: {
    backgroundColor: '#0A1B47',
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
