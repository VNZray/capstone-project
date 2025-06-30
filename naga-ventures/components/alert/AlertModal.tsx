// components/AlertModal.tsx
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import BaseModal from './BaseModal ';

type AlertType = 'success' | 'error' | 'warning';

type AlertModalProps = {
  visible: boolean;
  type: AlertType;
  message: string;
  title?: string;
  onClose: () => void;
};

const iconMap = {
  success: <FontAwesome name="check-circle" size={48} color="#4BB543" />,
  error: <FontAwesome name="times-circle" size={48} color="#D0342C" />,
  warning: <FontAwesome name="exclamation-circle" size={48} color="#FFB007" />,
};

const colorMap = {
  success: '#4BB543',
  error: '#D0342C',
  warning: '#FFB007',
};

const defaultTitleMap = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
};

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  type,
  message,
  title,
  onClose,
}) => {
  return (
    <BaseModal
      visible={visible}
      title={title || defaultTitleMap[type]}
      message={message}
      color={colorMap[type]}
      icon={iconMap[type]}
      onClose={onClose}    />
  );
};

export default AlertModal;
