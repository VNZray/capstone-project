// components/BaseModal.tsx
import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import PressableButton from '../../PressableButton';

type BaseModalProps = {
  visible: boolean;
  title: string;
  message: string;
  icon?: React.ReactNode;
  color?: string;
  onClose: () => void;
};

const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  title,
  message,
  icon,
  color = '#333',
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { borderColor: color }]}>
          {icon && <View style={{ marginBottom: 12 }}>{icon}</View>}
          <Text style={[styles.modalTitle, { color }]}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <PressableButton
            type="primary"
            color="#fff"
            Title="Okay"
            onPress={onClose}
            width={150}
          />
        </View>
      </View>
    </Modal>
  );
};

export default BaseModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: 500,
    alignItems: 'center',
    borderWidth: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
});
