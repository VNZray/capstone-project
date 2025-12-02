import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/color';
import BaseModal from '@/components/BaseModal';
import {
  format,
  setHours,
  setMinutes,
  isBefore,
  isAfter,
  addMinutes,
} from 'date-fns';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type TimeRangePickerProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (startTime: Date, endTime: Date) => void;
  initialStartTime?: Date;
  initialEndTime?: Date;
  minDuration?: number; // in minutes
  maxDuration?: number; // in minutes
  title?: string;
  stepMinutes?: number; // Time picker step in minutes (e.g., 15, 30)
};

export const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  visible,
  onClose,
  onConfirm,
  initialStartTime,
  initialEndTime,
  minDuration = 30, // 30 minutes minimum
  maxDuration = 1440, // 24 hours maximum
  title = 'Select Time Range',
  stepMinutes = 15,
}) => {
  const theme = Colors.light;

  const [startTime, setStartTime] = useState<Date>(
    initialStartTime || new Date()
  );
  const [endTime, setEndTime] = useState<Date>(
    initialEndTime || addMinutes(new Date(), minDuration)
  );

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (visible) {
      const start = initialStartTime || new Date();
      const end = initialEndTime || addMinutes(start, minDuration);
      setStartTime(start);
      setEndTime(end);
      setError('');
    }
  }, [visible, initialStartTime, initialEndTime, minDuration]);

  const validateTimeRange = (start: Date, end: Date): string => {
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    if (durationMinutes < minDuration) {
      return `Duration must be at least ${minDuration} minutes`;
    }

    if (durationMinutes > maxDuration) {
      return `Duration cannot exceed ${maxDuration / 60} hours`;
    }

    if (isAfter(start, end) || start.getTime() === end.getTime()) {
      return 'End time must be after start time';
    }

    return '';
  };

  const handleStartTimeChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date
  ) => {
    setShowStartTimePicker(Platform.OS === 'ios');

    if (selectedTime) {
      setStartTime(selectedTime);

      // Auto-adjust end time if needed
      const newError = validateTimeRange(selectedTime, endTime);
      if (newError) {
        const newEndTime = addMinutes(selectedTime, minDuration);
        setEndTime(newEndTime);
        setError('');
      } else {
        setError('');
      }
    }
  };

  const handleEndTimeChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date
  ) => {
    setShowEndTimePicker(Platform.OS === 'ios');

    if (selectedTime) {
      const newError = validateTimeRange(startTime, selectedTime);
      if (newError) {
        setError(newError);
      } else {
        setEndTime(selectedTime);
        setError('');
      }
    }
  };

  const calculateDuration = (): string => {
    const durationMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  const handleConfirm = () => {
    const validationError = validateTimeRange(startTime, endTime);
    if (validationError) {
      setError(validationError);
      return;
    }

    onConfirm(startTime, endTime);
    onClose();
  };

  const renderQuickDurations = () => {
    const durations = [
      { label: '30m', minutes: 30 },
      { label: '1h', minutes: 60 },
      { label: '2h', minutes: 120 },
      { label: '4h', minutes: 240 },
      { label: '8h', minutes: 480 },
    ].filter((d) => d.minutes >= minDuration && d.minutes <= maxDuration);

    return (
      <View style={styles.quickDurations}>
        <ThemedText
          type="label-small"
          style={{ color: theme.textSecondary, marginBottom: 8 }}
        >
          Quick Duration
        </ThemedText>
        <View style={styles.quickDurationButtons}>
          {durations.map((duration) => (
            <Pressable
              key={duration.minutes}
              style={[
                styles.quickDurationButton,
                { borderColor: theme.border },
              ]}
              onPress={() => {
                const newEndTime = addMinutes(startTime, duration.minutes);
                setEndTime(newEndTime);
                setError('');
              }}
            >
              <ThemedText
                type="body-small"
                weight="medium"
                style={{ color: theme.primary }}
              >
                {duration.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  return (
    <>
      <BaseModal
        visible={visible}
        onClose={onClose}
        title={title}
        primaryButtonLabel="Confirm"
        onPrimaryPress={handleConfirm}
        primaryButtonDisabled={!!error}
        secondaryButtonLabel="Cancel"
        onSecondaryPress={onClose}
        scrollable={true}
      >
        {/* Duration display */}
        <View
          style={[
            styles.durationDisplay,
            { backgroundColor: theme.surfaceOverlay },
          ]}
        >
          <Ionicons name="time" size={24} color={theme.primary} />
          <View style={styles.durationInfo}>
            <ThemedText
              type="label-small"
              style={{ color: theme.textSecondary }}
            >
              Duration
            </ThemedText>
            <ThemedText type="card-title-small" weight="bold">
              {calculateDuration()}
            </ThemedText>
          </View>
        </View>

        {/* Time selection */}
        <View style={styles.timeSection}>
          {/* Start time */}
          <View style={styles.timePickerContainer}>
            <View style={styles.timeLabel}>
              <Ionicons
                name="play-circle-outline"
                size={20}
                color={theme.success}
              />
              <ThemedText type="label-medium" weight="semi-bold">
                Start Time
              </ThemedText>
            </View>

            <Pressable
              style={[styles.timeButton, { borderColor: theme.border }]}
              onPress={() => setShowStartTimePicker(true)}
            >
              <ThemedText type="card-title-small" weight="bold">
                {format(startTime, 'hh:mm a')}
              </ThemedText>
              <Ionicons
                name="chevron-down"
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
          </View>

          {/* Divider with arrow */}
          <View style={styles.timeDivider}>
            <View
              style={[styles.dividerLine, { backgroundColor: theme.border }]}
            />
            <Ionicons name="arrow-down" size={20} color={theme.textSecondary} />
            <View
              style={[styles.dividerLine, { backgroundColor: theme.border }]}
            />
          </View>

          {/* End time */}
          <View style={styles.timePickerContainer}>
            <View style={styles.timeLabel}>
              <Ionicons
                name="stop-circle-outline"
                size={20}
                color={theme.error}
              />
              <ThemedText type="label-medium" weight="semi-bold">
                End Time
              </ThemedText>
            </View>

            <Pressable
              style={[styles.timeButton, { borderColor: theme.border }]}
              onPress={() => setShowEndTimePicker(true)}
            >
              <ThemedText type="card-title-small" weight="bold">
                {format(endTime, 'hh:mm a')}
              </ThemedText>
              <Ionicons
                name="chevron-down"
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        {/* Quick duration buttons */}
        {renderQuickDurations()}

        {/* Error message */}
        {error ? (
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: theme.errorLight },
            ]}
          >
            <Ionicons name="warning" size={16} color={theme.error} />
            <ThemedText
              type="body-small"
              style={{ color: theme.error, flex: 1 }}
            >
              {error}
            </ThemedText>
          </View>
        ) : null}
      </BaseModal>

      {/* Time pickers as separate modals */}
      {showStartTimePicker && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowStartTimePicker(false)}
        >
          <View style={styles.timePickerOverlay}>
            <Pressable
              style={styles.timePickerBackdrop}
              onPress={() => setShowStartTimePicker(false)}
            />
            {Platform.OS === 'ios' ? (
              <View style={styles.iosTimePickerContainer}>
                <View style={styles.iosPickerHeader}>
                  <Pressable onPress={() => setShowStartTimePicker(false)}>
                    <ThemedText
                      type="body-medium"
                      weight="semi-bold"
                      style={{ color: theme.primary }}
                    >
                      Done
                    </ThemedText>
                  </Pressable>
                </View>
                {/* @ts-ignore - mode prop type issue */}
                <DateTimePicker
                  value={startTime}
                  display="spinner"
                  onChange={handleStartTimeChange}
                  minuteInterval={stepMinutes}
                />
              </View>
            ) : (
              /* @ts-ignore - mode prop type issue */
              <DateTimePicker
                value={startTime}
                display="default"
                onChange={handleStartTimeChange}
                minuteInterval={stepMinutes}
              />
            )}
          </View>
        </Modal>
      )}

      {showEndTimePicker && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowEndTimePicker(false)}
        >
          <View style={styles.timePickerOverlay}>
            <Pressable
              style={styles.timePickerBackdrop}
              onPress={() => setShowEndTimePicker(false)}
            />
            {Platform.OS === 'ios' ? (
              <View style={styles.iosTimePickerContainer}>
                <View style={styles.iosPickerHeader}>
                  <Pressable onPress={() => setShowEndTimePicker(false)}>
                    <ThemedText
                      type="body-medium"
                      weight="semi-bold"
                      style={{ color: theme.primary }}
                    >
                      Done
                    </ThemedText>
                  </Pressable>
                </View>
                {/* @ts-ignore - mode prop type issue */}
                <DateTimePicker
                  value={endTime}
                  display="spinner"
                  onChange={handleEndTimeChange}
                  minuteInterval={stepMinutes}
                />
              </View>
            ) : (
              /* @ts-ignore - mode prop type issue */
              <DateTimePicker
                value={endTime}
                display="default"
                onChange={handleEndTimeChange}
                minuteInterval={stepMinutes}
              />
            )}
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  durationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  durationInfo: {
    flex: 1,
  },
  timeSection: {
    marginBottom: 20,
  },
  timePickerContainer: {
    marginBottom: 16,
  },
  timeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: Colors.light.surface,
  },
  timeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  quickDurations: {
    marginBottom: 20,
  },
  quickDurationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickDurationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: Colors.light.surface,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  timePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  timePickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  iosTimePickerContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
});
