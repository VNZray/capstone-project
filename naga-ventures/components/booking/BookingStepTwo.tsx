import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  StyleSheet,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';

type BookingFormStepTwoProps = {
  checkInDate: Date;
  checkOutDate: Date;
  showDatePicker: 'checkIn' | 'checkOut' | null;
  showPickerModal: boolean;
  tempDate: Date;
  paymentMethod: string;
  roomPrice: number;
  setTempDate: (date: Date) => void;
  setCheckInDate: (date: Date) => void;
  setCheckOutDate: (date: Date) => void;
  setShowDatePicker: (type: 'checkIn' | 'checkOut' | null) => void;
  setShowPickerModal: (show: boolean) => void;
  setPaymentMethod: (method: string) => void;
};

const BookingFormStepTwo: React.FC<BookingFormStepTwoProps> = ({
  checkInDate,
  checkOutDate,
  showDatePicker,
  showPickerModal,
  tempDate,
  paymentMethod,
  roomPrice,
  setTempDate,
  setCheckInDate,
  setCheckOutDate,
  setShowDatePicker,
  setShowPickerModal,
  setPaymentMethod,
}) => {
  const getDuration = () => {
    const diff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
  };

  const totalCost = getDuration() * roomPrice;

  return (
    <>
      <ThemedText type="profileTitle" style={styles.formTitle}>
        Booking Payment
      </ThemedText>

      <ThemedText style={styles.subtitle} type="subtitle">
        Check-in & Check-out Dates
      </ThemedText>

      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => {
            setTempDate(checkInDate);
            setShowDatePicker('checkIn');
            setShowPickerModal(true);
          }}
          style={styles.dateInput}
          activeOpacity={0.7}
        >
          <View>
            <Text style={styles.label}>Check-in</Text>
            <Text style={styles.dateText}>
              {checkInDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          <MaterialCommunityIcons
            name="calendar-month"
            size={22}
            color="#777"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setTempDate(checkOutDate);
            setShowDatePicker('checkOut');
            setShowPickerModal(true);
          }}
          style={styles.dateInput}
          activeOpacity={0.7}
        >
          <View>
            <Text style={styles.label}>Check-out</Text>
            <Text style={styles.dateText}>
              {checkOutDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          <MaterialCommunityIcons
            name="calendar-month"
            size={22}
            color="#777"
          />
        </TouchableOpacity>
      </View>

      {showDatePicker && showPickerModal && (
        <Modal transparent animationType="fade">
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                minimumDate={new Date()}
                onChange={(_, selectedDate) => {
                  if (selectedDate) setTempDate(selectedDate);
                }}
              />
              <View style={styles.pickerButtons}>
                <TouchableOpacity
                  onPress={() => {
                    setShowDatePicker(null);
                    setShowPickerModal(false);
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (showDatePicker === 'checkIn')
                      setCheckInDate(tempDate);
                    else setCheckOutDate(tempDate);
                    setShowDatePicker(null);
                    setShowPickerModal(false);
                  }}
                >
                  <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <View style={styles.row}>
        <View style={styles.col}>
          <ThemedText style={styles.subtitle} type="subtitle">
            Total Days
          </ThemedText>
          <TextInput
            value={getDuration().toString()}
            editable={false}
            style={styles.input}
          />
        </View>

        <View style={styles.col}>
          <ThemedText style={styles.subtitle} type="subtitle">
            Price/Day
          </ThemedText>
          <TextInput
            value={`₱${roomPrice}`}
            editable={false}
            style={styles.input}
          />
        </View>
      </View>

      <ThemedText style={styles.subtitle} type="subtitle">
        Total
      </ThemedText>
      <TextInput
        value={`₱${totalCost}`}
        editable={false}
        style={styles.input}
      />

      <ThemedText style={styles.subtitle} type="subtitle">
        Payment Method
      </ThemedText>
      <View style={styles.paymentRow}>
        {[
          { name: 'GCash', icon: require('@/assets/images/gcash.png') },
          { name: 'Paymaya', icon: require('@/assets/images/maya.jpg') },
        ].map((method) => (
          <TouchableOpacity
            key={method.name}
            onPress={() => setPaymentMethod(method.name)}
            style={[
              styles.paymentCard,
              paymentMethod === method.name && styles.paymentCardSelected,
            ]}
            activeOpacity={0.9}
          >
            <View style={styles.cardContent}>
              <Image source={method.icon} style={styles.paymentIconSquare} />
              <Text style={styles.paymentLabel}>{method.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

export default BookingFormStepTwo;

const styles = StyleSheet.create({
  formTitle: {
    paddingTop: 80,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    height: 120,
    backgroundColor: '#0A1B47',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 0,
    marginBottom: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '80%',
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 20,
  },
  cancelText: {
    color: '#888',
    fontSize: 16,
  },
  confirmText: {
    color: '#0A1B47',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentRow: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  paymentCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    paddingVertical: 12,
    paddingHorizontal: 12,
    elevation: 2,
  },
  paymentCardSelected: {
    borderColor: '#0A1B47',
    backgroundColor: '#E9F0FF',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIconSquare: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
