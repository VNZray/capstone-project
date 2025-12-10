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
import Button from '@/components/Button';
import { updateTourist, getTouristByUserId } from '@/services/TouristService';
import { useAuth } from '@/context/AuthContext';

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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, updateUser } = useAuth();

  const bg = Colors.light.background;
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const handleColor = isDark ? '#4B5563' : '#D1D5DB';

  const [selectedGender, setSelectedGender] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touristId, setTouristId] = useState<string>('');

  const snapPoints = useMemo(() => ['60%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
      loadCurrentData();
    } else {
      bottomSheetRef.current?.dismiss();
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
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableDynamicSizing={false}
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
          Edit Gender
        </ThemedText>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={subTextColor} />
        </Pressable>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText
          type="body-medium"
          style={{ color: subTextColor, marginBottom: 20, textAlign: 'center' }}
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
      </BottomSheetScrollView>

      <View style={styles.buttonContainer}>
        <Button
          label={isLoading ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          disabled={isLoading || !selectedGender}
          variant="solid"
          color="primary"
          size="large"
        />
      </View>
    </BottomSheetModal>
  );
};

export default ChangeGender;

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
