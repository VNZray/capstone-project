import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import { ReviewWithEntityDetails } from '@/types/Feedback';
import BottomSheetModal from '@/components/ui/BottomSheetModal';

interface DeleteConfirmModalProps {
  visible: boolean;
  review: ReviewWithEntityDetails | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  review,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!review) return;

    setDeleting(true);
    try {
      await onConfirm(review.id);
      onClose();
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (!review) return null;

  const content = (
    <View style={styles.content}>
      {/* Warning Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="trash-outline" size={32} color={Colors.light.error} />
      </View>

      {/* Title */}
      <ThemedText type="title-medium" weight="semi-bold" style={styles.title}>
        Delete Review?
      </ThemedText>

      {/* Description */}
      <ThemedText type="body-medium" style={styles.description}>
        Are you sure you want to delete your review for
      </ThemedText>

      <ThemedText type="body-medium" weight="semi-bold">
        {review.entity_name || 'this item'}?
      </ThemedText>

      {/* Description */}
      <ThemedText type="body-medium" style={styles.description}>
        This action cannot be undone.
      </ThemedText>
    </View>
  );

  const actionButton = (
    <View style={styles.actions}>
      <Pressable
        style={styles.cancelButton}
        onPress={onClose}
        disabled={deleting}
      >
        <ThemedText type="body-medium" style={styles.cancelButtonText}>
          Cancel
        </ThemedText>
      </Pressable>
      <Pressable
        style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
        onPress={handleDelete}
        disabled={deleting}
      >
        {deleting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <ThemedText type="body-medium" style={styles.deleteButtonText}>
            Delete
          </ThemedText>
        )}
      </Pressable>
    </View>
  );

  return (
    <BottomSheetModal
      isOpen={visible}
      onClose={onClose}
      headerTitle="Confirm Delete"
      content={content}
      bottomActionButton={actionButton}
      snapPoints={['50%']}
      enableDynamicSizing={false}
      closeButton={true}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.light.textSecondary,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.error,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default DeleteConfirmModal;
