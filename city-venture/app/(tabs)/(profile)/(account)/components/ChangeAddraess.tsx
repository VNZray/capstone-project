import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, View, ActivityIndicator } from 'react-native';
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
import { Picker } from '@react-native-picker/picker';
import {
  fetchTouristSpotLocationData,
  fetchMunicipalitiesByProvince,
  fetchBarangaysByMunicipality,
} from '@/services/TouristSpotService';
import { updateUser as updateUserService } from '@/services/UserService';
import { useAuth } from '@/context/AuthContext';
import type { Province, Municipality, Barangay } from '@/types/Address';

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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, updateUser } = useAuth();

  const bg = Colors.light.background;
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const handleColor = isDark ? '#4B5563' : '#D1D5DB';

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

  const snapPoints = useMemo(() => ['90%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
      loadLocationData();
      loadCurrentAddress();
    } else {
      bottomSheetRef.current?.dismiss();
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
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        backgroundStyle={[styles.sheetBackground, { backgroundColor: bg }]}
        handleIndicatorStyle={[
          styles.handleIndicator,
          { backgroundColor: handleColor },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText
            type="body-medium"
            style={{ color: subTextColor, marginTop: 16 }}
          >
            Loading location data...
          </ThemedText>
        </View>
      </BottomSheetModal>
    );
  }

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
          Edit Address
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
              onValueChange={(value) => setSelectedBarangayId(value as number)}
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

export default ChangeAddress;

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
