import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { ScrollView, Text, View } from 'react-native';

const WebHomePage = () => {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <Image
          source={require('@/assets/images/gcash.png')}
          style={{ width: '100%', height: 500 }}
        />
        <View></View>
        <Text>Content goes here</Text>
      </ScrollView>
    </View>
  );
};

export default WebHomePage;
