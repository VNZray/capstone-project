import { reviews as initialReviews } from '@/Controller/AccommodationData';
import { users } from '@/Controller/User';
import CardContainer from '@/components/CardContainer';
import OverallRating from '@/components/OverallRating';
import ReviewCard from '@/components/ReviewCard';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import { Button, Modal, StyleSheet, TextInput, View } from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import Icon from 'react-native-vector-icons/MaterialIcons'; // or FontAwesome, Ionicons, etc.

type User = {
  id: number;
  name: string;
  email: string;
};

interface AccommodationRatingsProps {
  accommodationId: string;
}

const AccommodationRatings: React.FC<AccommodationRatingsProps> = ({
  accommodationId,
}) => {
  const accId = Number(accommodationId);
  const { user } = useAuth();

  const [reviews, setReviews] = useState(
    initialReviews.filter((review) => review.accommodationId === accId)
  );
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>(
    ''
  );

  const handleAddReview = () => {
    if (!user || newReview.trim() === '') {
      setFeedbackMessage('Please enter a valid review.');
      setFeedbackType('error');
      clearFeedbackAfterDelay();
      return;
    }

    const safeRating = Math.min(5, Math.max(1, rating));

    const newReviewObj = {
      id: reviews.length + 5,
      userId: Number(user.id),
      accommodationId: accId,
      roomId: null,
      rating: safeRating,
      date: new Date().toISOString().split('T')[0],
      message: newReview.trim(),
    };

    setReviews([newReviewObj, ...reviews]);
    setNewReview('');
    setRating(5);
    setModalVisible(false);

    setFeedbackMessage('Review submitted successfully!');
    setFeedbackType('success');
    clearFeedbackAfterDelay();

    console.log('New review added:', newReviewObj);
  };

  const clearFeedbackAfterDelay = () => {
    setTimeout(() => {
      setFeedbackMessage('');
      setFeedbackType('');
    }, 3000);
  };

  return (
    <View style={{ padding: 16, paddingTop: 0 }}>
      {reviews.length > 0 ? (
        <>
          <CardContainer style={{ padding: 16 }}>
            <OverallRating reviews={reviews} />
            {feedbackMessage !== '' && (
              <View style={[styles.feedbackContainer, { marginTop: 16 }]}>
                {feedbackType === 'success' && (
                  <Icon
                    name="check-circle"
                    size={20}
                    color="green"
                    style={styles.icon}
                  />
                )}
                <ThemedText
                  style={[
                    styles.feedbackText,
                    feedbackType === 'success' ? styles.success : styles.error,
                  ]}
                >
                  {feedbackMessage}
                </ThemedText>
              </View>
            )}

            {user ? (
              <>
                <View style={{ marginTop: 16 }}>
                  <Button
                    title="Leave a Review"
                    onPress={() => setModalVisible(true)}
                  />
                </View>

                <Modal
                  visible={modalVisible}
                  animationType="fade"
                  transparent={true}
                  onRequestClose={() => setModalVisible(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                      <View
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <ThemedText type="default" style={styles.label}>
                          Leave a review:
                        </ThemedText>

                        <StarRating
                          rating={rating}
                          onChange={setRating}
                          starSize={28}
                          color="#FFD700"
                          maxStars={5}
                          enableHalfStar={true}
                          style={{ marginBottom: 16 }}
                        />
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="Write a review..."
                        value={newReview}
                        onChangeText={setNewReview}
                        multiline
                      />
                      <View style={styles.modalButtonRow}>
                        <Button
                          title="Cancel"
                          onPress={() => setModalVisible(false)}
                        />
                        <Button
                          title="Submit Review"
                          onPress={handleAddReview}
                        />
                      </View>
                    </View>
                  </View>
                </Modal>
              </>
            ) : (
              <ThemedText>Please log in to leave a review.</ThemedText>
            )}
          </CardContainer>

          {reviews.map((review) => {
            const reviewer = users.find((u) => u.id === review.userId);
            const reviewerName = reviewer?.name || 'Unknown User';

            const profileImageUri =
              review.userId === 1
                ? 'https://randomuser.me/api/portraits/women/1.jpg'
                : 'https://randomuser.me/api/portraits/men/2.jpg';

            const reviewDate = new Date(review.date).toLocaleDateString(
              undefined,
              {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }
            );

            return (
              <View key={review.id} style={{ marginTop: 16 }}>
                <ReviewCard
                  profileImageUri={profileImageUri}
                  reviewerName={reviewerName}
                  reviewDate={reviewDate}
                  reviewText={review.message}
                  rating={review.rating}
                />
              </View>
            );
          })}
        </>
      ) : (
        <ThemedText>No reviews available for this accommodation.</ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  label: {
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feedbackText: {
    fontSize: 16,
    textAlign: 'center',
  },
  success: {
    color: 'green',
  },
  error: {
    color: 'red',
  },
  feedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
});

export default AccommodationRatings;
