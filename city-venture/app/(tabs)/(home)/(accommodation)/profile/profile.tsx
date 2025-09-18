import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, View } from 'react-native';

import Tabs from '@/components/Tabs';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

import Container from '@/components/Container';
import { background } from '@/constants/color';
import { useAccommodation } from '@/context/AccommodationContext';
import { useAuth } from '@/context/AuthContext';
import { Tab } from '@/types/Tab';
import Details from './details';
import Ratings from './ratings';
import Rooms from './rooms';

const { width, height } = Dimensions.get('window');

const AccommodationProfile = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<string>('details');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const activeBackground = '#0A1B47';
  const { user } = useAuth();
  const { accommodationDetails } = useAccommodation();

  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>(
    ''
  );
  const bg = colorScheme === 'dark' ? background.dark : background.light;

  useEffect(() => {
    if (accommodationDetails?.business_name && accommodationDetails?.id) {
      navigation.setOptions({
        headerTitle: accommodationDetails.business_name,
      });
    }
  }, [
    navigation,
    accommodationDetails?.business_name,
    accommodationDetails?.id,
  ]);

  const [averageAccommodationReviews, setAverageAccommodationReviews] =
    useState(0);

  const TABS: Tab[] = [
    { key: 'details', label: 'Details', icon: '' },
    { key: 'rooms', label: 'Rooms', icon: '' },
    { key: 'ratings', label: 'Ratings', icon: '' },
  ];

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab.key);
    console.log('Filtering for:', tab.key);
  };

  if (!accommodationDetails) {
    return (
      <View style={styles.notFoundContainer}>
        <ThemedText type="title-large">Accommodation not found.</ThemedText>
        <ThemedText type="sub-title-large" style={{ textAlign: 'center' }}>
          Please go back and select a valid accommodation.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={[]}
        keyExtractor={() => 'header'}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            <Image
              source={{
                uri:
                  accommodationDetails?.business_image ||
                  'https://via.placeholder.com/400x300',
              }}
              style={styles.image}
              resizeMode="cover"
            />

            <Container padding={16} backgroundColor={bg}>
              <Container
                padding={0}
                backgroundColor="transparent"
                direction="row"
                justify="space-between"
                style={{ marginBottom: 16 }}
              >
                <View>
                  <ThemedText type="card-title-small" weight="bold">
                    {accommodationDetails?.business_name}
                  </ThemedText>
                  <ThemedText type="body-small">
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={16}
                      color="#FFB007"
                    />
                    {accommodationDetails?.address}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText type="body-small">
                    <MaterialCommunityIcons
                      name="star"
                      size={20}
                      color="#FFB007"
                    />{' '}
                    {averageAccommodationReviews.toFixed(1) || '0.0'}
                  </ThemedText>
                </View>
              </Container>

              <Tabs tabs={TABS} onTabChange={handleTabChange} />
            </Container>

            <View style={styles.tabContent}>
              {activeTab === 'details' && <Details />}
              {activeTab === 'rooms' && <Rooms />}
              {activeTab === 'ratings' && <Ratings />}
            </View>
          </>
        }
      />
    </View>
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
    marginBottom: 150,
    overflow: 'visible',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 16,
    backgroundColor: 'transparent',
    marginBottom: 80,
  },
});

export default AccommodationProfile;
