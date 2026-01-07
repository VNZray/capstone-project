import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';

interface LoginPromptModalProps {
  visible: boolean;
  onClose: () => void;
  actionName?: string;
  title?: string;
  message?: string;
}

/**
 * LoginPromptModal - Modal that prompts users to log in
 * Used for guest mode when users attempt protected actions
 */
export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
  visible,
  onClose,
  actionName = 'perform this action',
  title = 'Login Required',
  message,
}) => {
  const router = useRouter();

  const handleLogin = () => {
    onClose();
    router.push('/(auth)/login');
  };

  const handleSignUp = () => {
    onClose();
    router.push('/(auth)/register');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.container}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.light.text} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name="lock-closed"
              size={48}
              color={Colors.light.primary}
            />
          </View>

          {/* Title */}
          <ThemedText type="title-medium" weight="bold" style={styles.title}>
            {title}
          </ThemedText>

          {/* Message */}
          <ThemedText
            type="body-medium"
            style={[styles.message, { color: Colors.light.textSecondary }]}
          >
            {message ||
              `You need to be logged in to ${actionName}. Sign in to continue or create a new account.`}
          </ThemedText>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              label="Log In"
              variant="solid"
              color="primary"
              size="large"
              radius={12}
              onPress={handleLogin}
            />
            <Button
              label="Create Account"
              variant="outlined"
              color="primary"
              size="large"
              radius={12}
              onPress={handleSignUp}
              style={styles.signUpButton}
            />
          </View>

          {/* Browse as Guest */}
          <TouchableOpacity onPress={onClose} style={styles.guestButton}>
            <ThemedText
              type="label-medium"
              style={{ color: Colors.light.primary }}
            >
              Continue Browsing as Guest
            </ThemedText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.light.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  signUpButton: {
    marginTop: 0,
  },
  guestButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});

export default LoginPromptModal;
