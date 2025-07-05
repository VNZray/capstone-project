import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/(tabs)/(home)" />;
  }

  return (
    <View>
      <Text>Welcome back!</Text>
    </View>
  );
}
