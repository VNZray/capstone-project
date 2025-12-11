import Button from '@/components/Button';
import Container from '@/components/Container';
import FormTextInput from '@/components/TextInput';
import { ThemedText } from '@/components/themed-text';
import BottomSheetModal from '@/components/ui/BottomSheetModal';
import { Colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { getTouristByUserId, updateTourist } from '@/services/TouristService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface ChangeNameProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ChangeName: React.FC<ChangeNameProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [middleName, setMiddleName] = useState(user?.middle_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touristId, setTouristId] = useState<string>(user?.id || '');

  useEffect(() => {
    if (visible) {
      loadCurrentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const loadCurrentData = async () => {
    try {
      if (user?.user_id) {
        const tourist = await getTouristByUserId(user.user_id);
        setTouristId(tourist.id || '');
        setFirstName(tourist.first_name || '');
        setMiddleName(tourist.middle_name || '');
        setLastName(tourist.last_name || '');
      }
    } catch (err) {
      console.error('Error loading tourist data:', err);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await updateTourist(touristId, {
        first_name: firstName.trim(),
        middle_name: middleName.trim() || undefined,
        last_name: lastName.trim(),
      });

      // Update auth context
      await updateUser({
        first_name: firstName.trim(),
        middle_name: middleName.trim() || undefined,
        last_name: lastName.trim(),
      });

      console.log('✅ Name updated successfully');
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update name.';
      setError(message);
      console.error('❌ Error updating name:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheetModal
      isOpen={visible}
      onClose={handleClose}
      headerTitle="Edit Full Name"
      snapPoints={['75%']}
      content={
        <Container backgroundColor="transparent">
          <FormTextInput
            label="First Name"
            placeholder="Enter first name"
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              setError('');
            }}
            variant="outlined"
            errorText={
              error && !firstName.trim() ? 'First name is required' : undefined
            }
            required
          />

          <FormTextInput
            label="Middle Name"
            placeholder="Enter middle name"
            value={middleName}
            onChangeText={(text) => {
              setMiddleName(text);
              setError('');
            }}
            variant="outlined"
          />

          <FormTextInput
            label="Last Name"
            placeholder="Enter last name"
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              setError('');
            }}
            variant="outlined"
            errorText={
              error && !lastName.trim() ? 'Last name is required' : undefined
            }
            required
          />

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle"
                size={16}
                color={Colors.light.error}
              />
              <ThemedText type="label-small" style={styles.errorText}>
                {error}
              </ThemedText>
            </View>
          )}
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

export default ChangeName;

const styles = StyleSheet.create({
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(185, 28, 28, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    color: Colors.light.error,
    marginLeft: 8,
    flex: 1,
  },
});
