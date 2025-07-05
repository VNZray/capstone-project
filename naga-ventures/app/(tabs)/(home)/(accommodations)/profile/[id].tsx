import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Link, useLocalSearchParams, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
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
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase';
import ReviewModal from '@/components/ReviewModal';
import PressableButton from '@/components/PressableButton';
import { Review } from '@/types/Reviews';

const { width, height } = Dimensions.get('window');

const AccommodationProfile = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('details');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const activeBackground = '#0A1B47';
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>(
    ''
  );
  const [averageAccommodationReviews, setAverageAccommodationReviews] = useState(0);

  const { businesses, rooms } = useBusiness();
  const business = businesses.find((b) => b.id.toString() === id?.toString());

  const room = rooms.find((r) => r.business_id.toString() === id?.toString());

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
    fetchBusinessReviews();
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

  const fetchBusinessReviews = async () => {
    setLoading(true);
    console.log('Fetching reviews for business ID:', business?.id);
    const { data, error } = await supabase
      .from('review_and_rating')
      .select('*')
      .eq('reviewable_type', 'accommodation')
      .eq('reviewable_id', business?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error.message);
    } else {
      console.log('Fetched reviews:', data);
      setReviews(data || []);
    }

    if (data && data.length > 0) {
      const total = data.reduce((sum, review) => sum + review.rating, 0);
      const avg = total / data.length;
      setAverageAccommodationReviews(avg);
    } else {
      setAverageAccommodationReviews(0);
    }
    setLoading(false);
  };

  // // Check if user has already reviewed this accommodation
  // const reviewChecker = async () => {
  //   const { data: existingReview, error: fetchError } = await supabase
  //     .from('Reviews')
  //     .select('*')
  //     .eq('reviewable_type', 'accommodation')
  //     .eq('reviewable_id', business?.id)
  //     .eq('user_id', user?.id)
  //     .single();

  //   if (existingReview) {
  //     setFeedbackMessage('You have already submitted a review for this accommodation.');
  //     setFeedbackType('error');
  //     clearFeedbackAfterDelay();
  //     return;
  //   } else {
  //     handleAddReview()
  //   }

  //   if (fetchError && fetchError.code !== 'PGRST116') {
  //     console.error('Error checking for existing review:', fetchError.message);
  //     setFeedbackMessage('An error occurred while checking your previous review.');
  //     setFeedbackType('error');
  //     clearFeedbackAfterDelay();
  //     return;
  //   }

  // }

  const handleAddReview = async () => {
    if (!user || newReview.trim() === '') {
      setFeedbackMessage('Please enter a valid review.');
      setFeedbackType('error');
      clearFeedbackAfterDelay();
      return;
    }
    const safeRating = Math.min(5, Math.max(1, rating));

    const { error } = await supabase.from('review_and_rating').insert([
      {
        user_id: user.id,
        reviewable_type: 'accommodation',
        reviewable_id: business?.id,
        rating: safeRating,
        comment: newReview.trim(),
      },
    ]);

    if (error) {
      console.error('Error submitting review:', error);
      setFeedbackMessage('Failed to submit review.');
      setFeedbackType('error');
    } else {
      setFeedbackMessage('Review submitted successfully!');
      setFeedbackType('success');
      setNewReview('');
      setRating(5);
      setModalVisible(false);
      fetchBusinessReviews();
    }

    clearFeedbackAfterDelay();
  };

  const clearFeedbackAfterDelay = () => {
    setTimeout(() => {
      setFeedbackMessage('');
      setFeedbackType('');
    }, 3000);
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
    <View style={{ flex: 1 }}>
      <FlatList
        data={[]}
        keyExtractor={() => 'header'}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {statusBar()}
            <Image
              source={{
                uri:
                  business.image_url || 'https://via.placeholder.com/400x300',
              }}
              style={styles.image}
              resizeMode="cover"
            />

            <View style={styles.content}>
              <View style={styles.header}>
                <View>
                  <ThemedText type="profileTitle">
                    {business.business_name}
                  </ThemedText>
                  <ThemedText type="default2">
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={16}
                      color="#FFB007"
                    />{' '}
                    {`${business.barangay}, ${business.city}, ${business.province}` ||
                      'Address'}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText type="default">
                    <MaterialCommunityIcons
                      name="star"
                      size={20}
                      color="#FFB007"
                    />{' '}
                    {averageAccommodationReviews.toFixed(1) || '0.0'}
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
              {activeTab === 'details' && <Details business={business} />}
              {activeTab === 'rooms' && <Rooms business={business} />}
              {activeTab === 'ratings' && <Ratings reviews={reviews} />}
            </View>

            <ReviewModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onSubmit={handleAddReview}
              rating={rating}
              setRating={setRating}
              reviewText={newReview}
              setReviewText={setNewReview}
            />
          </>
        }
      />

      {user && activeTab === 'ratings' ? (
        <View
          style={[
            styles.buttonContainer,
            Platform.OS === 'android' && { marginBottom: 46 },
          ]}
        >
          <PressableButton
            Title="Leave a Review"
            type="primary"
            color="#fff"
            height={50}
            TextSize={16}
            onPress={() => setModalVisible(true)}
          />
        </View>
      ) : (
        <></>
      )}
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
