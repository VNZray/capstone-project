import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { DateTimeRangePicker, DateAvailabilityInfo } from './DateTimeRangePicker';
import { TimeRangePicker } from './TimeRangePicker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays } from 'date-fns';

/**
 * Example usage of DateTimeRangePicker and TimeRangePicker components
 * 
 * This demonstrates how to:
 * 1. Use the DateTimeRangePicker with room availability data
 * 2. Use the TimeRangePicker for time-only selection
 * 3. Fetch and display availability information
 */

export const DateTimePickerExample = () => {
  const theme = Colors.light;
  
  // Date & Time Range Picker state
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date>(addDays(new Date(), 2));
  const [checkInTime, setCheckInTime] = useState<Date>(new Date());
  const [checkOutTime, setCheckOutTime] = useState<Date>(new Date());
  
  // Time Range Picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  
  // Availability data
  const [availabilityData, setAvailabilityData] = useState<DateAvailabilityInfo[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Mock function to fetch room availability
  // Replace this with your actual API call
  const fetchRoomAvailability = async (roomId: string, businessId: string) => {
    setLoadingAvailability(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock availability data - replace with actual API response
      const mockData: DateAvailabilityInfo[] = [];
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = addDays(today, i);
        const random = Math.random();
        
        let status: 'available' | 'reserved' | 'occupied';
        let availableRooms: number;
        
        if (random < 0.6) {
          status = 'available';
          availableRooms = Math.floor(Math.random() * 5) + 3; // 3-7 rooms
        } else if (random < 0.85) {
          status = 'reserved';
          availableRooms = Math.floor(Math.random() * 3) + 1; // 1-3 rooms
        } else {
          status = 'occupied';
          availableRooms = 0;
        }
        
        mockData.push({
          date,
          status,
          availableRooms,
          totalRooms: 8,
        });
      }
      
      setAvailabilityData(mockData);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Fetch availability when component mounts
  useEffect(() => {
    // Replace with actual room and business IDs
    const roomId = 'room-123';
    const businessId = 'business-456';
    fetchRoomAvailability(roomId, businessId);
  }, []);

  const handleDateTimeConfirm = (
    startDate: Date,
    endDate: Date,
    startTime: Date,
    endTime: Date
  ) => {
    setCheckInDate(startDate);
    setCheckOutDate(endDate);
    setCheckInTime(startTime);
    setCheckOutTime(endTime);
    
    console.log('Date & Time Range Selected:', {
      checkIn: { date: startDate, time: startTime },
      checkOut: { date: endDate, time: endTime },
    });
    
    // Here you can make API calls to check final availability or create booking
  };

  const handleTimeConfirm = (start: Date, end: Date) => {
    setStartTime(start);
    setEndTime(end);
    
    console.log('Time Range Selected:', {
      start: format(start, 'hh:mm a'),
      end: format(end, 'hh:mm a'),
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText type="header-medium" weight="bold" style={styles.title}>
          Date & Time Pickers
        </ThemedText>

        {/* Date & Time Range Picker Example */}
        <View style={styles.section}>
          <ThemedText type="card-title-medium" weight="bold" style={styles.sectionTitle}>
            Accommodation Booking
          </ThemedText>
          <ThemedText type="body-small" style={{ color: theme.textSecondary, marginBottom: 16 }}>
            Select check-in and check-out dates with room availability
          </ThemedText>

          {/* Selected dates display */}
          <View style={[styles.card, { borderColor: theme.border }]}>
            <View style={styles.cardRow}>
              <View style={styles.cardColumn}>
                <View style={styles.iconLabel}>
                  <Ionicons name="calendar" size={18} color={theme.primary} />
                  <ThemedText type="label-small" style={{ color: theme.textSecondary }}>
                    Check-in
                  </ThemedText>
                </View>
                <ThemedText type="body-medium" weight="semi-bold">
                  {format(checkInDate, 'MMM dd, yyyy')}
                </ThemedText>
                <ThemedText type="body-small" style={{ color: theme.textSecondary }}>
                  {format(checkInTime, 'hh:mm a')}
                </ThemedText>
              </View>

              <Ionicons name="arrow-forward" size={20} color={theme.textSecondary} />

              <View style={styles.cardColumn}>
                <View style={styles.iconLabel}>
                  <Ionicons name="calendar" size={18} color={theme.primary} />
                  <ThemedText type="label-small" style={{ color: theme.textSecondary }}>
                    Check-out
                  </ThemedText>
                </View>
                <ThemedText type="body-medium" weight="semi-bold">
                  {format(checkOutDate, 'MMM dd, yyyy')}
                </ThemedText>
                <ThemedText type="body-small" style={{ color: theme.textSecondary }}>
                  {format(checkOutTime, 'hh:mm a')}
                </ThemedText>
              </View>
            </View>

            <Pressable
              style={[styles.changeButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowDateTimePicker(true)}
            >
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
              <ThemedText type="body-small" weight="semi-bold" style={{ color: '#FFFFFF' }}>
                Change Dates & Times
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Time Range Picker Example */}
        <View style={styles.section}>
          <ThemedText type="card-title-medium" weight="bold" style={styles.sectionTitle}>
            Service Booking
          </ThemedText>
          <ThemedText type="body-small" style={{ color: theme.textSecondary, marginBottom: 16 }}>
            Select time range for service appointment
          </ThemedText>

          {/* Selected times display */}
          <View style={[styles.card, { borderColor: theme.border }]}>
            <View style={styles.timeDisplay}>
              <View style={styles.timeItem}>
                <Ionicons name="play-circle" size={24} color={theme.success} />
                <View>
                  <ThemedText type="label-small" style={{ color: theme.textSecondary }}>
                    Start Time
                  </ThemedText>
                  <ThemedText type="card-title-small" weight="bold">
                    {format(startTime, 'hh:mm a')}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.durationBadge}>
                <Ionicons name="time" size={16} color={theme.primary} />
                <ThemedText type="body-extra-small" weight="semi-bold" style={{ color: theme.primary }}>
                  {Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))}m
                </ThemedText>
              </View>

              <View style={styles.timeItem}>
                <Ionicons name="stop-circle" size={24} color={theme.error} />
                <View>
                  <ThemedText type="label-small" style={{ color: theme.textSecondary }}>
                    End Time
                  </ThemedText>
                  <ThemedText type="card-title-small" weight="bold">
                    {format(endTime, 'hh:mm a')}
                  </ThemedText>
                </View>
              </View>
            </View>

            <Pressable
              style={[styles.changeButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={18} color="#FFFFFF" />
              <ThemedText type="body-small" weight="semi-bold" style={{ color: '#FFFFFF' }}>
                Change Time
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Usage Instructions */}
        <View style={[styles.infoCard, { backgroundColor: theme.surfaceOverlay }]}>
          <Ionicons name="information-circle" size={24} color={theme.info} />
          <View style={{ flex: 1 }}>
            <ThemedText type="body-small" weight="semi-bold" style={{ marginBottom: 4 }}>
              How to Use
            </ThemedText>
            <ThemedText type="body-extra-small" style={{ color: theme.textSecondary }}>
              • Tap on dates in the calendar to select check-in and check-out dates
            </ThemedText>
            <ThemedText type="body-extra-small" style={{ color: theme.textSecondary }}>
              • Color indicators show room availability (green: available, yellow: reserved, red: occupied)
            </ThemedText>
            <ThemedText type="body-extra-small" style={{ color: theme.textSecondary }}>
              • Select time using the time picker buttons
            </ThemedText>
            <ThemedText type="body-extra-small" style={{ color: theme.textSecondary }}>
              • Use quick duration buttons for fast time selection
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Date & Time Range Picker Modal */}
      <DateTimeRangePicker
        visible={showDateTimePicker}
        onClose={() => setShowDateTimePicker(false)}
        onConfirm={handleDateTimeConfirm}
        initialStartDate={checkInDate}
        initialEndDate={checkOutDate}
        initialStartTime={checkInTime}
        initialEndTime={checkOutTime}
        availabilityData={availabilityData}
        loading={loadingAvailability}
        minDate={new Date()}
        maxDate={addDays(new Date(), 90)}
      />

      {/* Time Range Picker Modal */}
      <TimeRangePicker
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onConfirm={handleTimeConfirm}
        initialStartTime={startTime}
        initialEndTime={endTime}
        minDuration={30}
        maxDuration={480}
        title="Select Service Time"
        stepMinutes={15}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: Colors.light.surface,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardColumn: {
    flex: 1,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.surfaceOverlay,
    borderRadius: 20,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
});
