import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AppRatingService, {
  type AppRating,
} from '@/services/system/AppRatingService';
import { router } from 'expo-router';

const RateApp = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState<AppRating | null>(null);

  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';
  const inputBg = isDark ? '#111827' : '#F9FAFB';

  useEffect(() => {
    loadExistingRating();
  }, []);

  const loadExistingRating = async () => {
    if (!user?.user_id && !user?.id) {
      setLoading(false);
      return;
    }

    try {
      const userId = user?.user_id || user?.id || '';
      const existingData = await AppRatingService.getRatingByUserId(userId);

      if (existingData) {
        setExistingRating(existingData);
        setRating(existingData.rating);
        setFeedback(existingData.feedback || '');
      }
    } catch (error) {
      console.error('Failed to load existing rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStarPress = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert(
        'Rating Required',
        'Please select a star rating before submitting.'
      );
      return;
    }

    if (!user?.user_id && !user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setSubmitting(true);

    try {
      const userId = user?.user_id || user?.id || '';

      if (existingRating) {
        await AppRatingService.updateRating(existingRating.id!, {
          rating,
          feedback: feedback.trim() || undefined,
        });

        Alert.alert(
          'Thank You!',
          'Your rating has been updated successfully.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        await AppRatingService.submitRating({
          rating,
          feedback: feedback.trim() || undefined,
          user_id: userId,
        });

        Alert.alert(
          'Thank You!',
          'We appreciate your feedback and will use it to improve the app.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Failed to submit rating:', error);
      Alert.alert(
        'Error',
        'Failed to submit your rating. Please try again later.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText
            type="body-medium"
            style={{ color: subTextColor, marginTop: 12 }}
          >
            Loading...
          </ThemedText>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer padding={0} gap={0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={[styles.headerCard, { backgroundColor: cardBg }]}>
          <View style={styles.iconWrapper}>
            <Ionicons name="star" size={48} color={Colors.light.primary} />
          </View>
          <ThemedText
            type="card-title-medium"
            weight="semi-bold"
            style={{ color: textColor, marginTop: 16, textAlign: 'center' }}
          >
            {existingRating ? 'Update Your Rating' : 'Rate Our App'}
          </ThemedText>
          <ThemedText
            type="body-medium"
            style={{
              color: subTextColor,
              textAlign: 'center',
              marginTop: 8,
              paddingHorizontal: 16,
            }}
          >
            Your feedback helps us improve and provide a better experience for
            all users.
          </ThemedText>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <ThemedText
            type="body-large"
            weight="semi-bold"
            style={{ color: textColor, marginBottom: 16 }}
          >
            How would you rate your experience?
          </ThemedText>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => handleStarPress(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={rating >= star ? 'star' : 'star-outline'}
                  size={48}
                  color={rating >= star ? Colors.light.warning : subTextColor}
                />
              </Pressable>
            ))}
          </View>

          {rating > 0 && (
            <ThemedText
              type="body-medium"
              weight="medium"
              style={{
                color: Colors.light.primary,
                textAlign: 'center',
                marginTop: 16,
              }}
            >
              {rating === 1 && 'We can do better'}
              {rating === 2 && 'Needs improvement'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Great!'}
              {rating === 5 && 'Excellent!'}
            </ThemedText>
          )}
        </View>

        {/* Feedback Section */}
        <View style={styles.section}>
          <ThemedText
            type="body-large"
            weight="semi-bold"
            style={{ color: textColor, marginBottom: 8 }}
          >
            Tell us more (optional)
          </ThemedText>
          <ThemedText
            type="body-small"
            style={{ color: subTextColor, marginBottom: 12 }}
          >
            Share your thoughts on what we&apos;re doing well or how we can
            improve.
          </ThemedText>

          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: inputBg,
                borderColor: borderColor,
                color: textColor,
              },
            ]}
            placeholder="Your feedback..."
            placeholderTextColor={subTextColor}
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <ThemedText
            type="body-small"
            style={{ color: subTextColor, marginTop: 4, textAlign: 'right' }}
          >
            {feedback.length}/500
          </ThemedText>
        </View>

        {/* Submit Button */}
        <View style={styles.section}>
          <Pressable
            style={[
              styles.submitButton,
              {
                backgroundColor:
                  rating === 0 || submitting
                    ? subTextColor
                    : Colors.light.primary,
              },
            ]}
            onPress={handleSubmit}
            disabled={rating === 0 || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <ThemedText
                  type="body-medium"
                  weight="semi-bold"
                  style={{ color: '#FFFFFF' }}
                >
                  {existingRating ? 'Update Rating' : 'Submit Rating'}
                </ThemedText>
              </>
            )}
          </Pressable>
        </View>

        {/* Info Card */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF' },
          ]}
        >
          <Ionicons
            name="information-circle"
            size={20}
            color={Colors.light.info}
            style={{ marginRight: 8 }}
          />
          <ThemedText
            type="body-small"
            style={{
              color: isDark ? '#93C5FD' : '#1E40AF',
              flex: 1,
              lineHeight: 20,
            }}
          >
            Your rating and feedback are anonymous and will only be used to
            improve the app experience.
          </ThemedText>
        </View>
      </ScrollView>
    </PageContainer>
  );
};

export default RateApp;

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  headerCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  starButton: {
    padding: 4,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
