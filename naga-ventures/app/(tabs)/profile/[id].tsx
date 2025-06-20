import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

const Profile = () => {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';
  const { user } = useAuth();
  useEffect(() => {
    if (!user) {
      router.replace('/(screens)/LoginPage');
    }
  }, [user]);

  if (!user) return null;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText type="title">Hello {user.display_name}</ThemedText>
      <Pressable onPress={() => router.dismissTo('/LoginPage')}>
        <Text style={{ fontSize: 16, color: color }}>Log Out</Text>
      </Pressable>
    </View>
  );
};

export default Profile;
