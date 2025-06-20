// Component for adding new reviews to tourist spots
// Includes form inputs and in-memory storage functionality

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { Review, useTouristSpots } from "@/context/TouristSpotContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface ReviewFormProps {
  spotId: string;
  spotName: string;
  onSubmitSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ spotId, spotName, onSubmitSuccess }) => {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const { addReview } = useTouristSpots();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <View style={{ padding: 24, alignItems: 'center' }}>
        <ThemedText type="default2">Please log in to write a review.</ThemedText>
      </View>
    );
  }

  // Generate a profile image URL for the user
  const getUserAvatar = () => `https://i.pravatar.cc/150?img=${user.id}`;

  // Handle rating selection
  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!reviewText.trim() || rating === 0) {
      Alert.alert("Error", "Please fill in all fields and select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new review object
      const newReview: Review = {
        id: Date.now(), // Use timestamp as unique ID
        spotId,
        userId: user.id,
        reviewerName: user.name,
        reviewText: reviewText.trim(),
        rating,
        reviewDate: new Date().toISOString().split('T')[0],
        profileImageUri: getUserAvatar(),
      };

      // Add review to in-memory store
      addReview(newReview);

      // Reset form
      setReviewText("");
      setRating(0);
      onSubmitSuccess?.();
      
    } catch (error) {
      Alert.alert("Error", "Failed to save review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView>
        <ThemedView style={styles.formContainer}>
          {/* Rating Selection */}
          <View style={styles.ratingContainer}>
            <ThemedText type="default2" style={styles.label}>Rating</ThemedText>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRatingPress(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={30}
                    color={star <= rating ? "#FFD700" : Colors[colorScheme].text}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Review Text Input */}
          <View style={styles.inputContainer}>
            <ThemedText type="default2" style={styles.label}>Your Review</ThemedText>
            <TextInput
              style={[
                styles.textArea,
                { color: Colors[colorScheme].text }
              ]}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Share your experience..."
              placeholderTextColor={Colors[colorScheme].text + "80"}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <ThemedText style={styles.submitButtonText}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    width: "100%",
    paddingTop: 0,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
  },
  ratingContainer: {
    width: "100%",
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  starButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: "#0A1B47",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ReviewForm; 