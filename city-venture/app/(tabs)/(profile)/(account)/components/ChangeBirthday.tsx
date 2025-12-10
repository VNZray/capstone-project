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
import SingleDateCalendar from '@/components/calendar/SingleDateCalendar';
import { updateTourist, getTouristByUserId } from '@/services/TouristService';
import { useAuth } from '@/context/AuthContext';
import { format, subYears } from 'date-fns';

interface ChangeBirthdayProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ChangeBirthday: React.FC<ChangeBirthdayProps> = ({
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

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touristId, setTouristId] = useState<string>('');

  const snapPoints = useMemo(() => ['85%'], []);

  // Set min and max dates (18-100 years old)
  const maxDate = subYears(new Date(), 18);
  const minDate = subYears(new Date(), 100);

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
        if (tourist.birthdate) {
          setSelectedDate(new Date(tourist.birthdate));
        }
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

  const calculateAge = (birthdate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthdate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleSave = async () => {
    if (!selectedDate) {
      setError('Please select your birthdate.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const age = calculateAge(selectedDate);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      await updateTourist(touristId, {
        birthdate: formattedDate,
        age: age.toString(),
      });

      // Update auth context (age is stored as string in user context)
      await updateUser({
        birthdate: formattedDate,
      });

      console.log('✅ Birthday updated successfully');
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update birthday.';
      setError(message);
      console.error('❌ Error updating birthday:', err);
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
          Edit Birthday
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
          style={{ color: subTextColor, marginBottom: 16, textAlign: 'center' }}
        >
          Select your date of birth. You must be at least 18 years old.
        </ThemedText>

        <SingleDateCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          minDate={minDate}
          maxDate={maxDate}
          initialMonth={selectedDate || maxDate}
        />

        {selectedDate && (
          <View style={styles.selectedDateContainer}>
            <ThemedText
              type="body-medium"
              weight="semi-bold"
              style={{ color: textColor }}
            >
              Selected: {format(selectedDate, 'MMMM dd, yyyy')}
            </ThemedText>
            <ThemedText type="body-small" style={{ color: subTextColor }}>
              Age: {calculateAge(selectedDate)} years old
            </ThemedText>
          </View>
        )}

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
          disabled={isLoading || !selectedDate}
          variant="solid"
          color="primary"
          size="large"
        />
      </View>
    </BottomSheetModal>
  );
};

export default ChangeBirthday;

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
  selectedDateContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
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
