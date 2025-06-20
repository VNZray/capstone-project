import { ShopColors } from '@/constants/ShopColors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ReviewSubmittedModalProps {
  visible: boolean;
  onClose: () => void;
  shopName: string;
}

const ReviewSubmittedModal: React.FC<ReviewSubmittedModalProps> = ({
  visible,
  onClose,
  shopName,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle-outline" size={80} color={ShopColors.success} />
          </View>

          <Text style={styles.titleText}>Review Submitted!</Text>
          <Text style={styles.messageText}>
            Thank you for sharing your experience about{' '}
            <Text style={styles.shopNameText}>{shopName}</Text>. Your feedback helps others make great choices!
          </Text>

          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: ShopColors.cardBackground,
    borderRadius: 20,
    padding: 30, // Generous padding
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  iconContainer: {
    marginBottom: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: ShopColors.success + '20', // Light success background
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  shopNameText: {
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.accent,
  },
  doneButton: {
    backgroundColor: ShopColors.accent,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
});

export default ReviewSubmittedModal;