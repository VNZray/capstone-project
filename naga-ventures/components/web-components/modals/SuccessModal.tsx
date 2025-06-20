// components/SuccessModal.tsx
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import BaseModal from './BaseModal';

type Props = {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

const SuccessModal: React.FC<Props> = ({
  visible,
  title = 'Success',
  message,
  onClose,
}) => (
  <BaseModal
    visible={visible}
    title={title}
    message={message}
    color="#4BB543"
    icon={<FontAwesome name="check-circle" size={48} color="#4BB543" />}
    onClose={onClose}
  />
);

export default SuccessModal;
