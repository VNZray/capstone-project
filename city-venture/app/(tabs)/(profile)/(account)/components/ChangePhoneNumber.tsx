import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheetModal from '@/components/ui/BottomSheetModal';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import FormTextInput from '@/components/TextInput';
import Button from '@/components/Button';
import { updateUser as updateUserService } from '@/services/UserService';
import { useAuth } from '@/context/AuthContext';
import Container from '@/components/Container';

interface ChangePhoneNumberProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ChangePhoneNumber: React.FC<ChangePhoneNumberProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, updateUser } = useAuth();

  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setPhoneNumber(user?.phone_number || '');
    }
  }, [visible, user?.phone_number]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Philippine mobile number format: 09XXXXXXXXX (11 digits)
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

  const formatPhoneNumber = (text: string): string => {
    // Remove non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    // Limit to 11 digits
    return cleaned.slice(0, 11);
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
    setError('');
  };

  const handleSave = async () => {
    if (!phoneNumber.trim()) {
      setError('Phone number is required.');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid Philippine mobile number (09XXXXXXXXX).');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      if (!user?.user_id) {
        throw new Error('User ID is required');
      }

      await updateUserService(user.user_id, {
        phone_number: phoneNumber,
      });

      // Update auth context
      await updateUser({
        phone_number: phoneNumber,
      });

      console.log('✅ Phone number updated successfully');
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update phone number.';
      setError(message);
      console.error('❌ Error updating phone number:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheetModal
      isOpen={visible}
      onClose={handleClose}
      headerTitle="Edit Phone Number"
      snapPoints={['50%']}
      content={
        <Container backgroundColor="transparent">
          <ThemedText
            type="body-medium"
            style={{
              color: subTextColor,
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            Enter your Philippine mobile number
          </ThemedText>

          <FormTextInput
            label="Phone Number"
            placeholder="09XXXXXXXXX"
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            maxLength={11}
            variant="outlined"
            errorText={error}
          />

          <View style={styles.hintContainer}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={subTextColor}
            />
            <ThemedText
              type="body-extra-small"
              style={{ color: subTextColor, marginLeft: 6 }}
            >
              Format: 09XXXXXXXXX (11 digits)
            </ThemedText>
          </View>
        </Container>
      }
      bottomActionButton={
        <Button
          label={isLoading ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          disabled={isLoading}
          variant="solid"
          color="primary"
          size="large"
        />
      }
    />
  );
};

export default ChangePhoneNumber;

const styles = StyleSheet.create({
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
});
