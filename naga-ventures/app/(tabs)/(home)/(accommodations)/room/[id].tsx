import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
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
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Room } from '@/types/Business';
import BookingFormPopup from '@/components/booking/BookingFormPopUp';
import PressableButton from '@/components/PressableButton';
import TabSwitcher from '@/components/TabSwitcherComponent';
import { supabase } from '@/utils/supabase';
import Details from './details';
import Photos from './photos';
import Ratings from './ratings';
import { Review } from '@/types/Reviews';
import { useAuth } from '@/context/AuthContext';
import ReviewModal from '@/components/ReviewModal';

const { width, height } = Dimensions.get('window');

const RoomProfile = () => {
  const { id, fromDate, toDate } = useLocalSearchParams();

  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('details');
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';
  const activeBackground = '#0A1B47';
  const [isBookingFormVisible, setBookingFormVisible] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const roomId = id?.toString();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>(
    ''
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('@/assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    fetchRoom();
    fetchReviews();
  }, [roomId]);

  const fetchRoom = async () => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('Room')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      console.error('Error fetching room:', error);
      setRoom(null);
    } else {
      setRoom(data);
      navigation.setOptions({ headerTitle: `Room ${data.room_number}` });
    }

    setLoading(false); // ✅ This is what ends the loading state
  };

  const fetchReviews = async () => {
    setLoading(true);

    console.log('Fetching reviews for business ID:', roomId);

    const { data, error } = await supabase
      .from('Reviews')
      .select('*')
      .eq('reviewable_type', 'room')
      .eq('reviewable_id', roomId)
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
      setAverageRating(avg);
    } else {
      setAverageRating(0);
    }

    setLoading(false);
  };

  // // Check if user has already reviewed this room
  // const reviewChecker = async () => {
  //   const { data: existingReview, error: fetchError } = await supabase
  //     .from('Reviews')
  //     .select('*')
  //     .eq('reviewable_type', 'room')
  //     .eq('reviewable_id', roomId)
  //     .eq('user_id', user?.id)
  //     .single();

  //   if (existingReview) {
  //     setFeedbackMessage('You have already submitted a review for this room.');
  //     setFeedbackType('error');
  //     clearFeedbackAfterDelay();
  //     return;
  //   } else {
  //     handleAddReview();
  //   }

  //   if (fetchError && fetchError.code !== 'PGRST116') {
  //     console.error('Error checking for existing review:', fetchError.message);
  //     setFeedbackMessage(
  //       'An error occurred while checking your previous review.'
  //     );
  //     setFeedbackType('error');
  //     clearFeedbackAfterDelay();
  //     return;
  //   }
  // };

  const handleAddReview = async () => {
    if (!user || newReview.trim() === '') {
      setFeedbackMessage('Please enter a valid review.');
      setFeedbackType('error');
      clearFeedbackAfterDelay();
      return;
    }
    const safeRating = Math.min(5, Math.max(1, rating));

    const { error } = await supabase.from('Reviews').insert([
      {
        user_id: user.id,
        reviewable_type: 'room',
        reviewable_id: roomId,
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
      fetchReviews();
    }

    clearFeedbackAfterDelay();
  };

  const clearFeedbackAfterDelay = () => {
    setTimeout(() => {
      setFeedbackMessage('');
      setFeedbackType('');
    }, 3000);
  };

  const renderTabContent = () => {
    if (!room) return null;

    switch (activeTab) {
      case 'details':
        return <Details room={room} />;
      case 'photos':
        return <Photos room={room} />;
      case 'ratings':
        return <Ratings reviews={reviews} />;
      default:
        return null;
    }
  };

  const statusBar =
    Platform.OS === 'ios' ? (
      <StatusBar style="light" translucent backgroundColor="transparent" />
    ) : null;

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.centered}>
        <ThemedText type="profileTitle">Room not found.</ThemedText>
        <ThemedText type="subtitle2" style={{ textAlign: 'center' }}>
          Please go back and select a valid Room.
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
            {statusBar}
            <Image
              source={{ uri: room.room_image }}
              style={styles.image}
              resizeMode="cover"
            />

            <View style={{ padding: 16 }}>
              <View style={styles.header}>
                <View>
                  <ThemedText type="profileTitle">
                    Room {room.room_number}
                  </ThemedText>
                  <ThemedText type="default2">
                    <MaterialCommunityIcons
                      name="star"
                      size={16}
                      color="#FFB007"
                    />{' '}
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </ThemedText>
                </View>
                <View>
                  <ThemedText type="default">₱ {room.room_price}</ThemedText>
                  <ThemedText type="default2">Per Night</ThemedText>
                </View>
              </View>

              <TabSwitcher
                tabs={[
                  { key: 'details', label: 'Details' },
                  { key: 'photos', label: 'Photos' },
                  { key: 'ratings', label: 'Ratings' },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                color={color}
                active={activeBackground}
              />
            </View>

            <View style={styles.tabContent}>{renderTabContent()}</View>

            <BookingFormPopup
              visible={isBookingFormVisible}
              onClose={() => setBookingFormVisible(false)}
              room={room}
              fromDate={fromDate ? String(fromDate) : ''}
              toDate={toDate ? String(toDate) : ''}
            />

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

      {activeTab !== 'ratings' && (
        <View
          style={[
            styles.buttonContainer,
            Platform.OS === 'android' && { marginBottom: 46 },
          ]}
        >
          <PressableButton
            Title="Book Now"
            type="primary"
            color="#fff"
            height={50}
            TextSize={16}
            onPress={() => setBookingFormVisible(true)}
            style={{ flex: 1 }}
          />
        </View>
      )}

      {user && activeTab === 'ratings' && (
        <View style={styles.buttonContainer}>
          <PressableButton
            Title="Leave a Review"
            type="primary"
            color="#fff"
            height={50}
            TextSize={16}
            onPress={() => setModalVisible(true)}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  image: {
    width: width,
    height: height * 0.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tabContent: {
    paddingTop: 0,
    padding: 16,
    marginBottom: 150,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default RoomProfile;
