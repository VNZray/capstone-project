import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import { ThemedText } from '@/components/themed-text';
import FormTextInput from '@/components/TextInput';
import Button from '@/components/Button';
import { updateUser as updateUserService } from '@/services/UserService';
import { useAuth } from '@/context/AuthContext';

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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, updateUser } = useAuth();

  const bg = Colors.light.background;
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const handleColor = isDark ? '#4B5563' : '#D1D5DB';

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const snapPoints = useMemo(() => ['50%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
      setPhoneNumber(user?.phone_number || '');
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible, user?.phone_number]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    []
  );

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
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableDynamicSizing={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={[styles.sheetBackground, { backgroundColor: bg }]}
      handleIndicatorStyle={[
        styles.handleIndicator,
        { backgroundColor: handleColor },
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.modalHeader}>
        <ThemedText
          type="card-title-medium"
          weight="semi-bold"
          style={{ color: textColor }}
        >
          Edit Phone Number
        </ThemedText>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={subTextColor} />
        </Pressable>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedText
          type="body-medium"
          style={{ color: subTextColor, marginBottom: 20, textAlign: 'center' }}
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
      </BottomSheetScrollView>

      <View style={styles.buttonContainer}>
        <Button
          label={isLoading ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          disabled={isLoading}
          variant="solid"
          color="primary"
          size="large"
        />
      </View>
    </BottomSheetModal>
  );
};

export default ChangePhoneNumber;

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
});
