import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors, card } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { format } from 'date-fns';
import Button from '@/components/Button';

export type TimePickerProps = {
  value: Date;
  onChange: (time: Date) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  minTime?: Date;
  maxTime?: Date;
};

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select time',
  disabled = false,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [showPicker, setShowPicker] = useState(false);
  const [tempTime, setTempTime] = useState(value);

  const surface = isDark ? card.dark : card.light;
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const borderColor = isDark ? '#262B3A' : '#E3E7EF';
  const handleColor = isDark ? '#4B5563' : '#D1D5DB';

  const snapPoints = useMemo(() => ['40%'], []);

  // Sync temp time when value changes
  useEffect(() => {
    setTempTime(value);
  }, [value]);

  // Open picker
  const openPicker = useCallback(() => {
    if (disabled) return;
    setTempTime(value);

    if (Platform.OS === 'ios') {
      bottomSheetRef.current?.present();
    } else {
      setShowPicker(true);
    }
  }, [disabled, value]);

  // Close iOS bottom sheet
  const closePicker = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  // Confirm selection (iOS)
  const handleConfirm = useCallback(() => {
    onChange(tempTime);
    closePicker();
  }, [tempTime, onChange, closePicker]);

  // Handle Android picker change
  const handleAndroidChange = useCallback(
    (event: DateTimePickerEvent, selectedTime?: Date) => {
      setShowPicker(false);
      if (event.type === 'set' && selectedTime) {
        onChange(selectedTime);
      }
    },
    [onChange]
  );

  // Handle iOS picker change
  const handleIOSChange = useCallback(
    (_event: DateTimePickerEvent, selectedTime?: Date) => {
      if (selectedTime) {
        setTempTime(selectedTime);
      }
    },
    []
  );

  // Render backdrop for bottom sheet
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

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText
          type="label-small"
          style={[styles.label, { color: subTextColor }]}
        >
          {label}
        </ThemedText>
      )}

      <Pressable
        style={[
          styles.button,
          { borderColor, backgroundColor: surface },
          disabled && styles.disabledButton,
        ]}
        onPress={openPicker}
        disabled={disabled}
      >
        <Ionicons
          name="time-outline"
          size={20}
          color={disabled ? subTextColor : Colors.light.primary}
        />
        <ThemedText
          type="body-medium"
          weight="medium"
          style={{ color: disabled ? subTextColor : textColor }}
        >
          {value ? format(value, 'hh:mm a') : placeholder}
        </ThemedText>
      </Pressable>

      {/* Android DateTimePicker (inline modal) */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={value}
          mode="time"
          display="default"
          onChange={handleAndroidChange}
        />
      )}

      {/* iOS BottomSheet with DateTimePicker */}
      {Platform.OS === 'ios' && (
        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          enablePanDownToClose
          backgroundStyle={[
            styles.sheetBackground,
            { backgroundColor: surface },
          ]}
          handleIndicatorStyle={[
            styles.handleIndicator,
            { backgroundColor: handleColor },
          ]}
        >
          <BottomSheetView style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <ThemedText
                type="card-title-medium"
                weight="bold"
                style={{ color: textColor }}
              >
                {label || 'Select Time'}
              </ThemedText>
            </View>

            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={tempTime}
                mode="time"
                display="spinner"
                onChange={handleIOSChange}
                textColor={textColor}
              />
            </View>

            <View style={styles.actions}>
              <Button
                label="Cancel"
                variant="outlined"
                color="neutral"
                size="medium"
                onPress={closePicker}
                style={{ flex: 1 }}
              />
              <Button
                label="Confirm"
                variant="solid"
                color="primary"
                size="medium"
                onPress={handleConfirm}
                style={{ flex: 1 }}
              />
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      )}
    </View>
  );
};

export default TimePicker;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  disabledButton: {
    opacity: 0.5,
  },
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
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E7EF',
    marginBottom: 8,
  },
  pickerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
