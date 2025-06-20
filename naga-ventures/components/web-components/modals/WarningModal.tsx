// components/WarningModal.tsx
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import BaseModal from './BaseModal';

type Props = {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

const WarningModal: React.FC<Props> = ({
  visible,
  title = 'Warning',
  message,
  onClose,
}) => (
  <BaseModal
    visible={visible}
    title={title}
    message={message}
    color="#FFA500"
    icon={<FontAwesome name="exclamation-triangle" size={48} color="#FFA500" />}
    onClose={onClose}
  />
);

export default WarningModal;
