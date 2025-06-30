import { supabase } from '@/utils/supabase';
import CardContainer from '@/components/CardContainer';
import OverallRating from '@/components/OverallRating';
import ReviewCard from '@/components/ReviewCard';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Business } from '@/types/Business';
import PressableButton from '@/components/PressableButton';
import { Review } from '@/types/Reviews';
import { colors } from '@/utils/Colors';{}
interface AccommodationRatingsProps {
  reviews: Review[];
}

const AccommodationRatings: React.FC<AccommodationRatingsProps> = ({
  reviews,
}) => {
  const { user } = useAuth();
  const [feedbackMessage, setFeedbackMessage] = React.useState('');
  const [feedbackType, setFeedbackType] = React.useState<'success' | 'error' | ''>('');

  return (
    <View style={{ padding: 16, paddingTop: 0 }}>
      <CardContainer style={{ padding: 16 }}>
        {reviews.length > 0 ? (
          <>
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
          </>
        ) : (
          <ThemedText>No reviews available for this accommodation.</ThemedText>
        )}
      </CardContainer>

      {reviews.map((review) => {
        const reviewerName = review.user_id === user?.id ? 'You' : user?.display_name;
        const profileImageUri =
          review.user_id === user?.id
            ? 'https://randomuser.me/api/portraits/men/2.jpg'
            : 'https://randomuser.me/api/portraits/women/1.jpg';

        const reviewDate = new Date(review.created_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        return (
          <View key={review.id} style={{ marginTop: 16 }}>
            <ReviewCard
              profileImageUri={profileImageUri}
              reviewerName={reviewerName}
              reviewDate={reviewDate}
              reviewText={review.comment}
              rating={review.rating}
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  feedbackText: {
    fontSize: 16,
    textAlign: 'center',
  },
  success: {
    color: colors.success,
  },
  error: {
    color: colors.error,
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
