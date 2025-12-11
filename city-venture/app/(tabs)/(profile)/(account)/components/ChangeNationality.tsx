import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, TextInput } from 'react-native';
import BottomSheetModal from '@/components/ui/BottomSheetModal';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import { ThemedText } from '@/components/themed-text';
import Button from '@/components/Button';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touristId, setTouristId] = useState<string>('');

  const filteredNationalities = !searchQuery.trim()
    ? NATIONALITIES
    : NATIONALITIES.filter((nationality) =>
        nationality.toLowerCase().includes(searchQuery.toLowerCase())
      );

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
        setSelectedNationality(tourist.nationality || '');
        setSearchQuery(tourist.nationality || '');
      }
    } catch (err) {
      console.error('Error loading tourist data:', err);
    }
  };

  const handleClose = () => {
    setError('');
    setSearchQuery('');
    onClose();
  };

  const handleSelectNationality = (nationality: string) => {
    setSelectedNationality(nationality);
    setSearchQuery(nationality);
  };

  const handleSave = async () => {
    const nationality = selectedNationality || searchQuery.trim();

    if (!nationality) {
      setError('Please select or enter a nationality.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await updateTourist(touristId, {
        nationality,
      });

      // Update auth context
      await updateUser({
        nationality,
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
      snapPoints={['75%']}
      content={
        <Container backgroundColor="transparent">
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={subTextColor}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search or type nationality..."
              placeholderTextColor={subTextColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={subTextColor} />
              </Pressable>
            )}
          </View>

          {filteredNationalities.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.nationalityItem,
                selectedNationality === item && styles.nationalityItemSelected,
              ]}
              onPress={() => handleSelectNationality(item)}
            >
              <ThemedText
                type="body-medium"
                weight={selectedNationality === item ? 'semi-bold' : 'normal'}
                style={{
                  color:
                    selectedNationality === item
                      ? Colors.light.primary
                      : textColor,
                }}
              >
                {item}
              </ThemedText>
              {selectedNationality === item && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.light.primary}
                />
              )}
            </Pressable>
          ))}

          {filteredNationalities.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={subTextColor} />
              <ThemedText
                type="body-medium"
                style={{ color: subTextColor, marginTop: 8 }}
              >
                No matching nationalities found
              </ThemedText>
              {searchQuery.trim() && (
                <ThemedText
                  type="body-small"
                  style={{ color: subTextColor, marginTop: 4 }}
                >
                  You can still save &ldquo;{searchQuery.trim()}&rdquo;
                </ThemedText>
              )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  nationalityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E3E7EF',
    backgroundColor: '#FFFFFF',
  },
  nationalityItemSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(185, 28, 28, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: Colors.light.error,
    marginLeft: 8,
    flex: 1,
  },
});
