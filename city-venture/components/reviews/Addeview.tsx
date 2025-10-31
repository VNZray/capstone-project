import { Modal, StyleSheet, View } from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import Button from '../Button';
import { ThemedText } from '../themed-text';
import { useMemo, useState } from 'react';
import { colors } from '@/constants/color';
import FormTextInput from '../TextInput';

type AddReviewProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (params: {
    rating: number;
    message: string;
  }) => Promise<void> | void;
  title?: string;
  submitting?: boolean;
  error?: string | null;
  defaultRating?: number;
  initialMessage?: string;
  minLength?: number; // default 10
};

const AddReview = ({
  visible,
  onClose,
  onSubmit,
  title = 'Rate Us',
  submitting = false,
  error,
  defaultRating = 0,
  initialMessage = '',
  minLength = 10,
}: AddReviewProps) => {
  const [rating, setRating] = useState<number>(defaultRating);
  const [message, setMessage] = useState<string>(initialMessage);
  const [localError, setLocalError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const msgOk = (message?.trim()?.length || 0) >= minLength;
    const rateOk = rating >= 1 && rating <= 5;
    return msgOk && rateOk && !submitting;
  }, [message, rating, minLength, submitting]);

  const handleSubmit = async () => {
    setLocalError(null);
    if (rating < 1 || rating > 5) {
      setLocalError('Please select a rating between 1 and 5.');
      return;
    }
    if (!message || message.trim().length < minLength) {
      setLocalError(`Please enter at least ${minLength} characters.`);
      return;
    }
    await onSubmit({ rating, message: message.trim() });
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <ThemedText type="label-large" weight="bold">
              {title}
            </ThemedText>
          </View>

          <View style={styles.centeredRow}>
            <StarRating
              rating={rating}
              onChange={setRating}
              starSize={28}
              color={colors.primary}
              maxStars={5}
              enableHalfStar={false}
              style={{ marginBottom: 16 }}
            />
          </View>

          <FormTextInput
            placeholder="Share your experience..."
            value={message}
            onChangeText={setMessage}
            variant='soft'
            numberOfLines={2
            }
            multiline
            maxLength={200}
          />

          {(localError || error) && (
            <ThemedText
              type="label-small"
              style={{ color: '#DC2626', marginTop: 8 }}
            >
              {localError || error}
            </ThemedText>
          )}

          <View style={styles.modalButtonRow}>
            <Button
              label="Cancel"
              variant="soft"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <Button
              label={submitting ? 'Submitting…' : 'Submit'}
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    display: 'flex',
    gap: 12,
    padding: 20,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  centeredRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonRow: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 50,
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

export default AddReview;
