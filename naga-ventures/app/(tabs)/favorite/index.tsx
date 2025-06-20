import { useColorScheme } from '@/hooks/useColorScheme';
import { Text, View } from 'react-native';

const Favorite = () => {
    const colorScheme = useColorScheme();
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, color: colorScheme === 'dark' ? '#fff' : '#000', fontWeight: 'bold' }}>Favorites</Text>
    </View>
  )
}

export default Favorite