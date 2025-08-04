import logo from '@/assets/images/logo.png';
import PressableButton from '@/components/PressableButton';
import { ThemedText } from '@/components/ThemedText';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar, CalendarList } from 'react-native-calendars';
import { colors } from '@/utils/Colors';
import { supabase } from '@/utils/supabase';

const RegistrationPage = () => {
  const [firstName, setFirstName] = useState('Rayven');
  const [lastName, setLastName] = useState('Clores');
  const [email, setEmail] = useState('rayven.clores@unc.edu.ph');
  const [password, setPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('123456');
  const [birthdate, setBirthdate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [ethnicity, setEthnicity] = useState<string>('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-Light': require('@/assets/fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Medium': require('@/assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });
  const [gender, setGender] = useState<string>('');
  const [contactNumber, setContactNumber] = useState('09784561234');
  const [nationality, setNationality] = useState('Filipino');
  if (!fontsLoaded) return null;

  // Convert Date to 'YYYY-MM-DD'
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const showDatePicker = () => setDatePickerVisibility(true);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setDatePickerVisibility(false);
    if (selectedDate) setBirthdate(selectedDate);
  };

  const handleTouristRegistration = async () => {
    if (!firstName || !lastName || !email || !ethnicity || !birthdate) {
      alert('Please fill in all required fields.');
      return;
    }

    // 1. Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: {
            display_name: `${firstName} ${lastName}`,
          },
        },
      }
    );

    if (signUpError || !signUpData.user) {
      alert('Account creation failed. Please try again.');
      return;
    }

    const userId = signUpData.user.id;
    console.log('User signed up:', signUpData.user);
    console.log('User ID:', userId);
    // 2. Insert into Tourist table
    const { data, error } = await supabase.from('tourist').insert([
      {
        tourist_id: userId,
        first_name: firstName,
        last_name: lastName,
        profile_picture: null, // you can update this later with file upload logic
        ethnicity,
        gender,
        nationality,
        contact_number: contactNumber,
        email,
        created_at: new Date().toISOString(),
        age: new Date().getFullYear() - birthdate.getFullYear(),
      },
    ]);

    console.log('Inserted data:', data);
    console.log('Insert error:', error);

    if (error) {
      console.error('Error inserting tourist:', error.message);
      alert('Registration failed. Please try again.');
    } else {
      alert('Registration successful!');
      router.replace('/(screens)/');
    }

    // 3. Insert into Profile table with role
    const { data: profileData, error: profileError } = await supabase
      .from('profile')
      .insert([
        {
          id: userId,
          role: 'tourist',
        },
      ]);

    console.log('Inserted data:', profileData);
    console.log('Insert error:', profileError);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={Platform.OS === 'web' ? styles.webContainer : {}}>
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
            {['male', 'female', 'prefer not to say'].map((option) => (
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
            onPress={() => setCalendarVisible(true)}
          >
            <MaterialCommunityIcons name="calendar" size={20} color="#888" />
            <Text style={styles.dateText}>
              {birthdate ? birthdate.toDateString() : 'Select your birthdate'}
            </Text>
          </TouchableOpacity>

          {isDatePickerVisible && (
            <DateTimePicker
              value={birthdate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            placeholder="Enter your contact number"
            value={contactNumber}
            onChangeText={setContactNumber}
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

          <Text style={styles.label}>I am a:</Text>
          <View style={styles.radioGroup}>
            {['tourist', 'local', 'foreign', 'overseas'].map((type) => (
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
        </ScrollView>
      </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    width: '100%'
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
