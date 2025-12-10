import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import { ThemedText } from '@/components/themed-text';
import FormTextInput from '@/components/TextInput';
import Button from '@/components/Button';
import { updateTourist, getTouristByUserId } from '@/services/TouristService';
import { useAuth } from '@/context/AuthContext';
import Container from '@/components/Container';

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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, updateUser } = useAuth();

  const bg = Colors.light.background;
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const handleColor = isDark ? '#4B5563' : '#D1D5DB';

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touristId, setTouristId] = useState<string>('');

  const snapPoints = useMemo(() => ['75%'], []);

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
        setFirstName(tourist.first_name || '');
        setMiddleName(tourist.middle_name || '');
        setLastName(tourist.last_name || '');
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

      <BottomSheetView>
        <View style={styles.modalHeader}>
          <ThemedText
            type="card-title-medium"
            weight="semi-bold"
            style={{ color: textColor }}
          >
            Edit Full Name
          </ThemedText>
        </View>

        <Container
          padding={0}
          backgroundColor="transparent"
          direction="column"
          justify="space-between"
          align="center"
          gap={0}
        >
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
                error && !firstName.trim()
                  ? 'First name is required'
                  : undefined
              }
            />

            <FormTextInput
              label="Middle Name (Optional)"
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
        </Container>
        <Container backgroundColor="transparent">
          <Button
            label={isLoading ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={isLoading}
            variant="solid"
            color="primary"
            size="large"
          />
        </Container>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default ChangeName;

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
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  modalContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
