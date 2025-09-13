import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

const Profile = () => {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';
  const { user } = useAuth();

  const handleLogin = () => {
    router.replace('/LoginPage');
  };

  const handleLogout = () => {
    router.dismissTo('/LoginPage');
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {user ? (
        <>
          <ThemedText type="title">Hello {user.first_name}</ThemedText>
          <Pressable onPress={handleLogout} style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 16, color: color }}>Log Out</Text>
          </Pressable>
        </>
      ) : (
        <>
          <ThemedText type="title">Guest User</ThemedText>
          <Text style={{ fontSize: 16, color: color, marginVertical: 8 }}>
            You are not logged in.
          </Text>
          <Pressable onPress={handleLogin}>
            <Text style={{ fontSize: 16, color: color }}>Sign In</Text>
          </Pressable>
        </>
      )}
    </View>
  );
};

export default Profile;
