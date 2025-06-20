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
  TouchableOpacity,
  View,
} from 'react-native';
import { RadioButton, TextInput } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const width = Dimensions.get('screen').width;

const RegistrationPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [birthdate, setBirthdate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [userType, setUserType] = useState<string>('');

  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-Light': require('@/assets/fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Medium': require('@/assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

  if (!fontsLoaded) return null;

  const showDatePicker = () => setDatePickerVisibility(true);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setDatePickerVisibility(false);
      if (selectedDate) setBirthdate(selectedDate);
    } else {
      // iOS picker stays visible, update date on change
      if (selectedDate) setBirthdate(selectedDate);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <View style={{ padding: '5%', gap: 16 }}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.text}>Naga Venture</Text>
          </View>

          <View>
            <ThemedText type="title">Sign Up</ThemedText>
            <ThemedText type="default">
              Navigate with Ease - Your Ultimate City Directory
            </ThemedText>
          </View>

          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                style={{ borderRadius: 10 }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                style={{ borderRadius: 10 }}
              />
            </View>
          </View>

          <TouchableOpacity onPress={showDatePicker}>
            <TextInput
              label="Birthday"
              value={birthdate.toDateString()}
              editable={false}
              style={{ borderRadius: 10 }}
            />
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

          <ThemedText style={{ fontFamily: 'Poppins-Regular', fontSize: 14 }}>
            Are you a?
          </ThemedText>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
            {['tourist', 'local', 'foreign', 'overseas'].map((type) => (
              <View
                key={type}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <RadioButton
                  value={type}
                  status={userType === type ? 'checked' : 'unchecked'}
                  onPress={() => setUserType(type)}
                />
                <ThemedText
                  style={{ fontSize: 12, fontFamily: 'Poppins-Regular' }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </ThemedText>
              </View>
            ))}
          </View>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={{ borderRadius: 10 }}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ borderRadius: 10 }}
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={{ borderRadius: 10 }}
          />

          <ThemedText
            style={{
              fontSize: 12,
              fontFamily: 'Poppins-Regular',
              textAlign: 'center',
            }}
          >
            By signing up, you accept Naga Ventures{' '}
            <ThemedText type="link" style={{ fontSize: 12 }}>
              Terms of Service
            </ThemedText>{' '}
            and{' '}
            <ThemedText type="link" style={{ fontSize: 12 }}>
              Privacy Policy
            </ThemedText>
            .
          </ThemedText>

          <PressableButton
            TextSize={16}
            width={'100%'}
            height={60}
            type="secondary"
            IconSize={24}
            color={'#fff'}
            direction="column"
            Title="Sign Up"
            onPress={() => router.replace('/(screens)/')}
          />

          <ThemedText
            style={{
              textAlign: 'center',
              fontFamily: 'Poppins-Regular',
              fontSize: 14,
            }}
          >
            Already have an account?{' '}
            <ThemedText
              type="link"
              onPress={() => router.push('/(screens)/LoginPage')}
            >
              Sign In
            </ThemedText>
          </ThemedText>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default RegistrationPage;

const styles = {
  logoContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
  },
  text: {
    fontSize: 18,
    marginLeft: 10,
    fontFamily: 'Poppins-Bold',
  },
};
