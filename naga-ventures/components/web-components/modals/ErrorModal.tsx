// components/ErrorModal.tsx
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import BaseModal from './BaseModal';

type Props = {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

const ErrorModal: React.FC<Props> = ({
  visible,
  title = 'Error',
  message,
  onClose,
}) => (
  <BaseModal
    visible={visible}
    title={title}
    message={message}
    color="#D0342C"
    icon={<FontAwesome name="times-circle" size={48} color="#D0342C" />}
    onClose={onClose}
  />
);

export default ErrorModal;
