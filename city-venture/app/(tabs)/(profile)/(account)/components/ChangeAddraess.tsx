import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import BottomSheetModal from '@/components/ui/BottomSheetModal';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import { ThemedText } from '@/components/themed-text';
import FormTextInput from '@/components/TextInput';
import Button from '@/components/Button';
import { Picker } from '@react-native-picker/picker';
import {
  fetchTouristSpotLocationData,
  fetchMunicipalitiesByProvince,
  fetchBarangaysByMunicipality,
} from '@/services/TouristSpotService';
import { updateUser as updateUserService } from '@/services/UserService';
import { useAuth } from '@/context/AuthContext';
import type { Province, Municipality, Barangay } from '@/types/Address';
import Container from '@/components/Container';

interface ChangeAddressProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ChangeAddress: React.FC<ChangeAddressProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, updateUser } = useAuth();

  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    null
  );
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<
    number | null
  >(null);
  const [selectedBarangayId, setSelectedBarangayId] = useState<number | null>(
    null
  );
  const [addressLine, setAddressLine] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      loadLocationData();
      loadCurrentAddress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const loadLocationData = async () => {
    setIsLoadingData(true);
    try {
      const data = await fetchTouristSpotLocationData();
      setProvinces(data.provinces || []);
    } catch (err) {
      console.error('Error loading location data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadCurrentAddress = () => {
    setSelectedBarangayId(user?.barangay_id || null);
    setAddressLine(user?.address || '');
  };

  const handleProvinceChange = async (provinceId: number) => {
    setSelectedProvinceId(provinceId);
    setSelectedMunicipalityId(null);
    setSelectedBarangayId(null);
    setMunicipalities([]);
    setBarangays([]);

    if (provinceId) {
      try {
        const data = await fetchMunicipalitiesByProvince(provinceId);
        setMunicipalities(data);
      } catch (err) {
        console.error('Error loading municipalities:', err);
      }
    }
  };

  const handleMunicipalityChange = async (municipalityId: number) => {
    setSelectedMunicipalityId(municipalityId);
    setSelectedBarangayId(null);
    setBarangays([]);

    if (municipalityId) {
      try {
        const data = await fetchBarangaysByMunicipality(municipalityId);
        setBarangays(data);
      } catch (err) {
        console.error('Error loading barangays:', err);
      }
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSave = async () => {
    if (!selectedBarangayId) {
      setError('Please select Province, Municipality, and Barangay.');
      return;
    }

    if (!addressLine.trim()) {
      setError('Please enter your street address.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      if (!user?.user_id) {
        throw new Error('User ID is required');
      }

      await updateUserService(user.user_id, {
        barangay_id: selectedBarangayId,
      });

      // Update auth context
      await updateUser({
        barangay_id: selectedBarangayId,
      });

      console.log('✅ Address updated successfully');
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update address.';
      setError(message);
      console.error('❌ Error updating address:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <BottomSheetModal
        isOpen={visible}
        onClose={onClose}
        headerTitle="Edit Address"
        snapPoints={['90%']}
        content={
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <ThemedText
              type="body-medium"
              style={{ color: subTextColor, marginTop: 16 }}
            >
              Loading location data...
            </ThemedText>
          </View>
        }
      />
    );
  }

  return (
    <BottomSheetModal
      isOpen={visible}
      onClose={handleClose}
      headerTitle="Edit Address"
      snapPoints={['90%']}
      content={
        <Container backgroundColor="transparent">
          {/* Province Picker */}
          <View style={styles.pickerContainer}>
            <ThemedText
              type="label-medium"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              Province
            </ThemedText>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedProvinceId}
                onValueChange={(value) => handleProvinceChange(value as number)}
                style={styles.picker}
              >
                <Picker.Item label="Select Province" value={null} />
                {provinces.map((province) => (
                  <Picker.Item
                    key={province.id}
                    label={province.province}
                    value={province.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Municipality Picker */}
          <View style={styles.pickerContainer}>
            <ThemedText
              type="label-medium"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              Municipality
            </ThemedText>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedMunicipalityId}
                onValueChange={(value) =>
                  handleMunicipalityChange(value as number)
                }
                enabled={!!selectedProvinceId}
                style={styles.picker}
              >
                <Picker.Item label="Select Municipality" value={null} />
                {municipalities.map((municipality) => (
                  <Picker.Item
                    key={municipality.id}
                    label={municipality.municipality}
                    value={municipality.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Barangay Picker */}
          <View style={styles.pickerContainer}>
            <ThemedText
              type="label-medium"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              Barangay
            </ThemedText>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedBarangayId}
                onValueChange={(value) =>
                  setSelectedBarangayId(value as number)
                }
                enabled={!!selectedMunicipalityId}
                style={styles.picker}
              >
                <Picker.Item label="Select Barangay" value={null} />
                {barangays.map((barangay) => (
                  <Picker.Item
                    key={barangay.id}
                    label={barangay.barangay}
                    value={barangay.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Street Address */}
          <FormTextInput
            label="Street Address"
            placeholder="House No., Street, Subdivision, etc."
            value={addressLine}
            onChangeText={(text) => {
              setAddressLine(text);
              setError('');
            }}
            variant="outlined"
            multiline
            numberOfLines={3}
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

export default ChangeAddress;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E3E7EF',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
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
