import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import BottomSheetModal from '@/components/ui/BottomSheetModal';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import { ThemedText } from '@/components/themed-text';
import Button from '@/components/Button';
import { updateTourist, getTouristByUserId } from '@/services/TouristService';
import { useAuth } from '@/context/AuthContext';
import Container from '@/components/Container';

interface ChangeGenderProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const GENDERS = [
  { value: 'male', label: 'Male', icon: 'male' },
  { value: 'female', label: 'Female', icon: 'female' },
  { value: 'other', label: 'Other', icon: 'male-female' },
  {
    value: 'prefer_not_to_say',
    label: 'Prefer not to say',
    icon: 'remove-circle-outline',
  },
] as const;

const ChangeGender: React.FC<ChangeGenderProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, updateUser } = useAuth();

  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';

  const [selectedGender, setSelectedGender] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touristId, setTouristId] = useState<string>('');

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
        setSelectedGender(tourist.gender?.toLowerCase() || '');
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
    if (!selectedGender) {
      setError('Please select a gender.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await updateTourist(touristId, {
        gender: selectedGender,
      });

      // Update auth context
      await updateUser({
        gender: selectedGender,
      });

      console.log('✅ Gender updated successfully');
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update gender.';
      setError(message);
      console.error('❌ Error updating gender:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheetModal
      isOpen={visible}
      onClose={handleClose}
      headerTitle="Edit Gender"
      snapPoints={['60%']}
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
            Select your gender
          </ThemedText>

          <View style={styles.optionsContainer}>
            {GENDERS.map((gender) => (
              <Pressable
                key={gender.value}
                style={[
                  styles.optionCard,
                  selectedGender === gender.value && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedGender(gender.value)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    selectedGender === gender.value &&
                      styles.iconContainerSelected,
                  ]}
                >
                  <Ionicons
                    name={gender.icon as any}
                    size={24}
                    color={
                      selectedGender === gender.value
                        ? '#FFFFFF'
                        : Colors.light.primary
                    }
                  />
                </View>
                <ThemedText
                  type="body-medium"
                  weight={
                    selectedGender === gender.value ? 'semi-bold' : 'normal'
                  }
                  style={{
                    color:
                      selectedGender === gender.value
                        ? Colors.light.primary
                        : textColor,
                  }}
                >
                  {gender.label}
                </ThemedText>
                {selectedGender === gender.value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors.light.primary}
                    style={styles.checkIcon}
                  />
                )}
              </Pressable>
            ))}
          </View>

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
          disabled={isLoading || !selectedGender}
          variant="solid"
          color="primary"
          size="large"
        />
      }
    />
  );
};

export default ChangeGender;

const styles = StyleSheet.create({
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E3E7EF',
    backgroundColor: '#FFFFFF',
  },
  optionCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerSelected: {
    backgroundColor: Colors.light.primary,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
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
