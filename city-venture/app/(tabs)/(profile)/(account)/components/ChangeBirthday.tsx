import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import { ThemedText } from '@/components/themed-text';
import Button from '@/components/Button';
import SingleDateCalendar from '@/components/calendar/SingleDateCalendar';
import { updateTourist, getTouristByUserId } from '@/services/TouristService';
import { useAuth } from '@/context/AuthContext';
import { format, subYears } from 'date-fns';
import BottomSheetModal from '@/components/ui/BottomSheetModal';
import Container from '@/components/Container';

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
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, updateUser } = useAuth();

  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touristId, setTouristId] = useState<string>(user?.id || '');

  // Set min and max dates (16-100 years old)
  const maxDate = subYears(new Date(), 16);
  const minDate = subYears(new Date(), 100);

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
        if (tourist.birthdate) {
          setSelectedDate(new Date(tourist.birthdate));
        }
      }
    } catch (err) {
      console.error('Error loading tourist data:', err);
    }
  };

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
      isOpen={visible}
      onClose={handleClose}
      headerTitle="Edit Birthdate"
      snapPoints={['75%']}
      content={
        <Container backgroundColor="transparent">
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
        </Container>
      }
      bottomActionButton={
        <Button
          label={isLoading ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          disabled={isLoading || !selectedDate}
          variant="solid"
          color="primary"
          size="large"
        />
      }
    />
  );
};

export default ChangeBirthday;

const styles = StyleSheet.create({
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
