import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import BottomSheetModal from '@/components/ui/BottomSheetModal';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import { ThemedText } from '@/components/themed-text';
import FormTextInput from '@/components/TextInput';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import axios from 'axios';
import api from '@/services/api';
import { updateUser as updateUserService } from '@/services/UserService';
import { useAuth } from '@/context/AuthContext';
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
  const cardBg = isDark ? '#1E293B' : '#F8FAFC';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  // Get current address from user context
  const currentAddress = [
    user?.barangay_name,
    user?.municipality_name,
    user?.province_name,
  ]
    .filter(Boolean)
    .join(', ');

  // Location data
  const [provinces, setProvinces] = useState<
    { id: number; province: string }[]
  >([]);
  const [municipalities, setMunicipalities] = useState<
    { id: number; municipality: string }[]
  >([]);
  const [barangays, setBarangays] = useState<
    { id: number; barangay: string }[]
  >([]);

  // Selected values
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

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState('');

  // Fetch provinces
  const fetchProvinces = async () => {
    try {
      const response = await axios.get(`${api}/address/provinces`);
      if (Array.isArray(response.data)) {
        setProvinces(response.data);
      }
    } catch (err) {
      console.error('Error fetching provinces:', err);
    }
  };

  // Fetch municipalities by province
  const fetchMunicipalities = async (provinceId: number) => {
    try {
      const response = await axios.get(
        `${api}/address/municipalities/${provinceId}`
      );
      if (Array.isArray(response.data)) {
        setMunicipalities(response.data);
      }
    } catch (err) {
      console.error('Error fetching municipalities:', err);
    }
  };

  // Fetch barangays by municipality
  const fetchBarangays = async (municipalityId: number) => {
    try {
      const response = await axios.get(
        `${api}/address/barangays/${municipalityId}`
      );
      if (Array.isArray(response.data)) {
        setBarangays(response.data);
      }
    } catch (err) {
      console.error('Error fetching barangays:', err);
    }
  };

  useEffect(() => {
    if (visible) {
      setIsLoadingData(true);
      fetchProvinces().finally(() => setIsLoadingData(false));
      loadCurrentAddress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Load municipalities when province changes
  useEffect(() => {
    if (selectedProvinceId) {
      fetchMunicipalities(selectedProvinceId);
    }
  }, [selectedProvinceId]);

  // Load barangays when municipality changes
  useEffect(() => {
    if (selectedMunicipalityId) {
      fetchBarangays(selectedMunicipalityId);
    }
  }, [selectedMunicipalityId]);

  const loadCurrentAddress = () => {
    setSelectedBarangayId(user?.barangay_id || null);
    setAddressLine(user?.address || '');
  };

  const handleProvinceSelect = (item: { id: string | number } | null) => {
    const id = item?.id as number | null;
    setSelectedProvinceId(id);
    setSelectedMunicipalityId(null);
    setSelectedBarangayId(null);
    setMunicipalities([]);
    setBarangays([]);
    setError('');
  };

  const handleMunicipalitySelect = (item: { id: string | number } | null) => {
    const id = item?.id as number | null;
    setSelectedMunicipalityId(id);
    setSelectedBarangayId(null);
    setBarangays([]);
    setError('');
  };

  const handleBarangaySelect = (item: { id: string | number } | null) => {
    const id = item?.id as number | null;
    setSelectedBarangayId(id);
    setError('');
  };

  const handleClose = () => {
    setError('');
    // Reset state
    setSelectedProvinceId(null);
    setSelectedMunicipalityId(null);
    setSelectedBarangayId(null);
    setMunicipalities([]);
    setBarangays([]);
    onClose();
  };

  const handleSave = async () => {
    if (!selectedBarangayId) {
      setError('Please select Province, Municipality, and Barangay.');
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
        snapPoints={['70%']}
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
      snapPoints={['80%']}
      content={
        <Container backgroundColor="transparent">
          {/* Current Address Display */}
          {currentAddress && (
            <View
              style={[
                styles.currentAddressContainer,
                { backgroundColor: cardBg, borderColor },
              ]}
            >
              <View style={styles.currentAddressIcon}>
                <Ionicons
                  name="location"
                  size={20}
                  color={Colors.light.primary}
                />
              </View>
              <View style={styles.currentAddressContent}>
                <ThemedText
                  type="label-small"
                  style={{ color: subTextColor, marginBottom: 2 }}
                >
                  Current Address
                </ThemedText>
                <ThemedText
                  type="body-medium"
                  weight="semi-bold"
                  style={{ color: textColor }}
                >
                  {currentAddress}
                </ThemedText>
              </View>
            </View>
          )}

          {!currentAddress && (
            <View
              style={[
                styles.currentAddressContainer,
                { backgroundColor: cardBg, borderColor },
              ]}
            >
              <View style={styles.currentAddressIcon}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={subTextColor}
                />
              </View>
              <View style={styles.currentAddressContent}>
                <ThemedText type="body-medium" style={{ color: subTextColor }}>
                  No address set yet
                </ThemedText>
              </View>
            </View>
          )}

          {/* Province Dropdown */}
          <Dropdown
            label="Province"
            placeholder="Select your province"
            items={provinces.map((p) => ({ id: p.id, label: p.province }))}
            value={selectedProvinceId}
            onSelect={handleProvinceSelect}
            variant="outlined"
            elevation={2}
            clearable
            required
          />

          {/* Municipality Dropdown */}
          <Dropdown
            label="Municipality/City"
            placeholder={
              selectedProvinceId
                ? 'Select your municipality'
                : 'Select province first'
            }
            items={municipalities.map((m) => ({
              id: m.id,
              label: m.municipality,
            }))}
            value={selectedMunicipalityId}
            disabled={!selectedProvinceId}
            onSelect={handleMunicipalitySelect}
            variant="outlined"
            elevation={2}
            clearable
            required
          />

          {/* Barangay Dropdown */}
          <Dropdown
            label="Barangay"
            placeholder={
              selectedMunicipalityId
                ? 'Select your barangay'
                : 'Select municipality first'
            }
            items={barangays.map((b) => ({ id: b.id, label: b.barangay }))}
            value={selectedBarangayId}
            disabled={!selectedMunicipalityId}
            onSelect={handleBarangaySelect}
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

export default ChangeAddress;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  currentAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  currentAddressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentAddressContent: {
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
