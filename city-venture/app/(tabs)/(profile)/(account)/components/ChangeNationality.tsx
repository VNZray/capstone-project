import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheetModal from '@/components/ui/BottomSheetModal';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import { ThemedText } from '@/components/themed-text';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import { updateTourist, getTouristByUserId } from '@/services/TouristService';
import { useAuth } from '@/context/AuthContext';
import Container from '@/components/Container';

interface ChangeNationalityProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const NATIONALITIES = [
  'Filipino',
  'American',
  'Chinese',
  'Japanese',
  'Korean',
  'Indian',
  'Australian',
  'British',
  'Canadian',
  'German',
  'French',
  'Spanish',
  'Italian',
  'Russian',
  'Brazilian',
  'Mexican',
  'Indonesian',
  'Malaysian',
  'Singaporean',
  'Thai',
  'Vietnamese',
].sort();

// Convert to dropdown items format
const NATIONALITY_ITEMS = NATIONALITIES.map((nationality) => ({
  id: nationality,
  label: nationality,
}));

const ChangeNationality: React.FC<ChangeNationalityProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, updateUser } = useAuth();

  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const cardBg = isDark ? '#1E293B' : '#F8FAFC';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const [selectedNationality, setSelectedNationality] = useState<string | null>(
    null
  );
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
        setSelectedNationality(tourist.nationality || null);
      }
    } catch (err) {
      console.error('Error loading tourist data:', err);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleNationalitySelect = (item: { id: string | number } | null) => {
    setSelectedNationality(item?.id as string | null);
    setError('');
  };

  const handleSave = async () => {
    if (!selectedNationality) {
      setError('Please select a nationality.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await updateTourist(touristId, {
        nationality: selectedNationality,
      });

      // Update auth context
      await updateUser({
        nationality: selectedNationality,
      });

      console.log('✅ Nationality updated successfully');
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update nationality.';
      setError(message);
      console.error('❌ Error updating nationality:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheetModal
      isOpen={visible}
      onClose={handleClose}
      headerTitle="Edit Nationality"
      snapPoints={['55%']}
      content={
        <Container backgroundColor="transparent">
          {/* Current Nationality Display */}
          {user?.nationality && (
            <View
              style={[
                styles.currentValueContainer,
                { backgroundColor: cardBg, borderColor },
              ]}
            >
              <View style={styles.currentValueIcon}>
                <Ionicons name="globe" size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.currentValueContent}>
                <ThemedText
                  type="label-small"
                  style={{ color: subTextColor, marginBottom: 2 }}
                >
                  Current Nationality
                </ThemedText>
                <ThemedText
                  type="body-medium"
                  weight="semi-bold"
                  style={{ color: textColor }}
                >
                  {user.nationality}
                </ThemedText>
              </View>
            </View>
          )}

          {/* Nationality Dropdown */}
          <Dropdown
            label="Nationality"
            placeholder="Search and select nationality..."
            items={NATIONALITY_ITEMS}
            value={selectedNationality}
            onSelect={handleNationalitySelect}
            searchable
            searchPlaceholder="Search nationalities..."
            variant="outlined"
            elevation={2}
            clearable
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

export default ChangeNationality;

const styles = StyleSheet.create({
  currentValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  currentValueIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentValueContent: {
    flex: 1,
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
