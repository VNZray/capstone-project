import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Link, useLocalSearchParams, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import TabSwitcher from '@/components/TabSwitcherComponent';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';

import Details from './details';
import Ratings from './ratings';
import Rooms from './rooms';

import { useBusiness } from '@/context/BusinessContext';

const { width, height } = Dimensions.get('window');

const AccommodationProfile = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('details');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const activeBackground = '#0A1B47';

  const { businesses } = useBusiness();
  const business = businesses.find(
    (b) => b.id.toString() === id?.toString()
  );

  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (business?.business_name) {
      navigation.setOptions({
        headerTitle: business.business_name,
      });
    }
  }, [navigation, business?.business_name]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  const statusBar = () => {
    if (Platform.OS === 'ios') {
      return (
        <StatusBar style="light" translucent backgroundColor="transparent" />
      );
    } else {
      return null;
    }
  };

  if (!business) {
    return (
      <View style={styles.notFoundContainer}>
        <ThemedText type="profileTitle">Accommodation not found.</ThemedText>
        <ThemedText type="subtitle2" style={{ textAlign: 'center' }}>
          Please go back and select a valid accommodation.
        </ThemedText>
        <Link href={'/(home)/'}>
          <ThemedText type="link">Go Home</ThemedText>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView style={{ overflow: 'visible' }} nestedScrollEnabled={true}>
      {statusBar()}
      <Image
        source={{ uri: business.image_url || 'https://via.placeholder.com/400x300' }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <ThemedText type="profileTitle">{business.business_name}</ThemedText>
            <ThemedText type="default2">
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color="#FFB007"
              />{' '}
              { `${business.barangay}, ${business.city}, ${business.province}` || 'Address'}
            </ThemedText>
          </View>
          <View>
            <ThemedText type="default">
              <MaterialCommunityIcons name="star" size={20} color="#FFB007" />{' '}
              5.0
            </ThemedText>
          </View>
        </View>

        <TabSwitcher
          tabs={[
            { key: 'details', label: 'Details' },
            { key: 'rooms', label: 'Rooms' },
            { key: 'ratings', label: 'Ratings' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          color={isDarkMode ? '#fff' : '#000'}
          active={activeBackground}
        />
      </View>

      <View style={styles.tabContent}>
        {activeTab === 'details' && (
          <Details business={business} />
        )}
        {activeTab === 'rooms' && (
          <Rooms business={business} />
        )}
        {activeTab === 'ratings' && (
          <Ratings accommodationId={Array.isArray(id) ? id[0] : id} />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  image: {
    width: width * 1,
    height: height * 0.4,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tabContent: {
    marginBottom: 100,
    overflow: 'visible',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default AccommodationProfile;
