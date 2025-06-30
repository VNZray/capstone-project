import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import { ThemedText } from './ThemedText';
import PressableButton from './PressableButton';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  rating: number;
  setRating: (value: number) => void;
  reviewText: string;
  setReviewText: (value: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  onSubmit,
  rating,
  setRating,
  reviewText,
  setReviewText,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const getEmoji = (rating: number) => {
    if (rating >= 5) return '😍';
    if (rating >= 4) return '😊';
    if (rating >= 3) return '😐';
    if (rating >= 2) return '😕';
    return '😠';
  };

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [rating]);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ThemedText type="profileTitle" style={styles.title}>
            Share Your Experience
          </ThemedText>
          <Animated.Text
            style={[styles.emoji, { transform: [{ scale: scaleAnim }] }]}
          >
            {getEmoji(rating)}
          </Animated.Text>

          <StarRating
            rating={rating}
            onChange={setRating}
            starSize={30}
            color="#FFB007"
            animationConfig={{ scale: 1.2 }}
            style={{ marginBottom: 20 }}
            enableHalfStar={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Write something about your stay..."
            placeholderTextColor="#999"
            value={reviewText}
            onChangeText={setReviewText}
            multiline
          />

          <View style={styles.modalButtonRow}>
            <PressableButton
              type="cancel"
              Title="Cancel"
              color="#000"
              TextSize={14}
              onPress={onClose}
              style={styles.cancelButton}
            />
            <PressableButton
              type="primary"
              Title="Submit"
              color="#fff"
              TextSize={14}
              onPress={onSubmit}
              style={styles.submitButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
    width: '100%',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  submitButton: {
    flex: 1,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default ReviewModal;
