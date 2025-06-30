// components/BaseModal.tsx
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  icon: React.ReactNode;
  color: string;
  onClose: () => void;
};

const BaseModal: React.FC<Props> = ({
  visible,
  title,
  message,
  icon,
  color,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, { borderColor: color }]}>
              <View style={styles.iconContainer}>{icon}</View>
              <Text style={[styles.title, { color }]}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              <Pressable onPress={onClose} style={[styles.button, { backgroundColor: color }]}>
                <Text style={styles.buttonText}>OK</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default BaseModal;
