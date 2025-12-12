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

export type TimeRangePickerProps = {
  startTime: Date;
  endTime: Date;
  onStartTimeChange: (time: Date) => void;
  onEndTimeChange: (time: Date) => void;
  startLabel?: string;
  endLabel?: string;
  disabled?: boolean;
};

type ActivePicker = 'start' | 'end' | null;

const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  startLabel = 'Start Time',
  endLabel = 'End Time',
  disabled = false,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [tempTime, setTempTime] = useState(new Date());
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  const surface = isDark ? card.dark : card.light;
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const borderColor = isDark ? '#262B3A' : '#E3E7EF';
  const handleColor = isDark ? '#4B5563' : '#D1D5DB';

  const snapPoints = useMemo(() => ['40%'], []);

  // Open picker for start or end time
  const openPicker = useCallback(
    (type: 'start' | 'end') => {
      if (disabled) return;

      const currentTime = type === 'start' ? startTime : endTime;
      setTempTime(currentTime);
      setActivePicker(type);

      if (Platform.OS === 'ios') {
        bottomSheetRef.current?.present();
      } else {
        setShowAndroidPicker(true);
      }
    },
    [disabled, startTime, endTime]
  );

  // Close picker
  const closePicker = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    setActivePicker(null);
    setShowAndroidPicker(false);
  }, []);

  // Confirm selection (iOS)
  const handleConfirm = useCallback(() => {
    if (activePicker === 'start') {
      onStartTimeChange(tempTime);
    } else if (activePicker === 'end') {
      onEndTimeChange(tempTime);
    }
    closePicker();
  }, [activePicker, tempTime, onStartTimeChange, onEndTimeChange, closePicker]);

  // Handle Android picker change
  const handleAndroidChange = useCallback(
    (event: DateTimePickerEvent, selectedTime?: Date) => {
      setShowAndroidPicker(false);
      if (event.type === 'set' && selectedTime) {
        if (activePicker === 'start') {
          onStartTimeChange(selectedTime);
        } else if (activePicker === 'end') {
          onEndTimeChange(selectedTime);
        }
      }
      setActivePicker(null);
    },
    [activePicker, onStartTimeChange, onEndTimeChange]
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

  // Handle bottom sheet dismiss
  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) {
      setActivePicker(null);
    }
  }, []);

  // Render backdrop
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

  const currentPickerLabel = activePicker === 'start' ? startLabel : endLabel;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Start Time */}
        <View style={styles.pickerWrapper}>
          <ThemedText
            type="label-small"
            style={[styles.label, { color: subTextColor }]}
          >
            {startLabel}
          </ThemedText>
          <Pressable
            style={[
              styles.button,
              { borderColor, backgroundColor: surface },
              disabled && styles.disabledButton,
            ]}
            onPress={() => openPicker('start')}
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
              {format(startTime, 'hh:mm a')}
            </ThemedText>
          </Pressable>
        </View>

        {/* Arrow */}
        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward" size={20} color={subTextColor} />
        </View>

        {/* End Time */}
        <View style={styles.pickerWrapper}>
          <ThemedText
            type="label-small"
            style={[styles.label, { color: subTextColor }]}
          >
            {endLabel}
          </ThemedText>
          <Pressable
            style={[
              styles.button,
              { borderColor, backgroundColor: surface },
              disabled && styles.disabledButton,
            ]}
            onPress={() => openPicker('end')}
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
              {format(endTime, 'hh:mm a')}
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Android DateTimePicker */}
      {Platform.OS === 'android' && showAndroidPicker && activePicker && (
        <DateTimePicker
          value={activePicker === 'start' ? startTime : endTime}
          mode="time"
          display="default"
          onChange={handleAndroidChange}
        />
      )}

      {/* iOS BottomSheet */}
      {Platform.OS === 'ios' && (
        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          enablePanDownToClose
          onChange={handleSheetChange}
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
                {currentPickerLabel}
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

export default TimeRangePicker;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  pickerWrapper: {
    flex: 1,
  },
  label: {
    marginBottom: 8,
  },
  arrowContainer: {
    paddingBottom: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
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
