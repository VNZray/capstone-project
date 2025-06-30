import PressableButton from '@/components/PressableButton';
import { ThemedText } from '@/components/ThemedText';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Room } from '@/types/Business';

type BookingFormPopupProps = {
  visible: boolean;
  onClose: () => void;
  room: Room;
  fromDate: string;
  toDate: string;
};

const BookingFormPopup: React.FC<BookingFormPopupProps> = ({
  visible,
  onClose,
  room,
  fromDate,
  toDate
}) => {
  const [step, setStep] = useState(1);
  const [pax, setPax] = useState('');
  const [numChildren, setNumChildren] = useState('');
  const [numAdults, setNumAdults] = useState('');
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [travelerTypes, setTravelerTypes] = useState<string[]>([]);
  const [travelerCounts, setTravelerCounts] = useState<Record<string, string>>({
    Foreign: '',
    Overseas: '',
    Domestic: '',
    Local: '',
  });
  const [tripPurpose, setTripPurpose] = useState('Leisure');
  const [checkInDate, setCheckInDate] = useState(new Date(fromDate));
  const [checkOutDate, setCheckOutDate] = useState(new Date(toDate));
  const [showDatePicker, setShowDatePicker] = useState<
    'checkIn' | 'checkOut' | null
  >(null);
  const [paymentMethod, setPaymentMethod] = useState('GCash');
  const [tempDate, setTempDate] = useState(new Date());
  const [showPickerModal, setShowPickerModal] = useState(false);

  const handlePaxChange = (text: string) => {
    setPax(text);
    const num = parseInt(text) || 0;
    if (num > guestNames.length) {
      setGuestNames([
        ...guestNames,
        ...Array(num - guestNames.length).fill(''),
      ]);
    } else {
      setGuestNames(guestNames.slice(0, num));
    }
  };

  const getDuration = () => {
    const diff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
  };

  const totalCost = getDuration() * Number(room.room_price);

  const handleSubmit = () => {
    console.log({
      pax,
      numChildren,
      numAdults,
      guestNames,
      travelerCounts,
      tripPurpose,
      checkInDate,
      checkOutDate,
      totalCost,
      paymentMethod,
    });
    onClose();
  };

  const resetForm = () => {
    setStep(1);
    setPax('');
    setNumChildren('');
    setNumAdults('');
    setGuestNames([]);
    setTravelerTypes([]);
    setTravelerCounts({
      Foreign: '',
      Overseas: '',
      Domestic: '',
      Local: '',
    });
    setTripPurpose('');
    setCheckInDate(new Date());
    setCheckOutDate(new Date());
    setPaymentMethod('GCash');
    setTempDate(new Date());
    setShowDatePicker(null);
    setShowPickerModal(false);
  };

  const renderStepOne = () => (
    <>
      <ThemedText type="profileTitle" style={styles.formTitle}>
        Guest Information
      </ThemedText>
      <ScrollView style={styles.bookingFormContainer}>
        <ThemedText style={styles.subtitle} type="subtitle">
          Pax:
        </ThemedText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Pax"
          value={pax}
          onChangeText={handlePaxChange}
        />
        {guestNames.map((name, index) => (
          <View key={index}>
            <ThemedText style={styles.subtitle} type="subtitle">
              Guest Names:
            </ThemedText>
            <TextInput
              style={styles.input}
              placeholder={`Guest Name ${index + 1}`}
              value={name}
              onChangeText={(text) => {
                const updated = [...guestNames];
                updated[index] = text;
                setGuestNames(updated);
              }}
            />
          </View>
        ))}

        <ThemedText style={styles.subtitle} type="subtitle">
          Number of Children:
        </ThemedText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Number of Children"
          value={numChildren}
          onChangeText={setNumChildren}
        />
        <ThemedText style={styles.subtitle} type="subtitle">
          Number of Adults:
        </ThemedText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Number of Adults"
          value={numAdults}
          onChangeText={setNumAdults}
        />

        <ThemedText style={styles.subtitle} type="subtitle">
          Traveler Type:
        </ThemedText>
        {['Foreign', 'Overseas', 'Domestic', 'Local'].map((type) => (
          <TouchableOpacity
            key={type}
            style={styles.checkboxRow}
            onPress={() => {
              setTravelerTypes((prev) =>
                prev.includes(type)
                  ? prev.filter((t) => t !== type)
                  : [...prev, type]
              );
            }}
          >
            <View
              style={[
                styles.checkbox,
                travelerTypes.includes(type) && styles.checked,
              ]}
            />
            <Text>{type}</Text>
          </TouchableOpacity>
        ))}

        {travelerTypes.map((type) => (
          <TextInput
            key={type}
            style={styles.input}
            keyboardType="numeric"
            placeholder={`Number of ${type}`}
            value={travelerCounts[type]}
            onChangeText={(val) =>
              setTravelerCounts({ ...travelerCounts, [type]: val })
            }
          />
        ))}

        <ThemedText style={styles.subtitle} type="subtitle">
          Trip Purpose:
        </ThemedText>
        {['Leisure', 'Business', 'Education', 'Other'].map((purpose) => (
          <TouchableOpacity
            key={purpose}
            onPress={() => setTripPurpose(purpose)}
            style={styles.radioRow}
          >
            <View
              style={[
                styles.radioOuter,
                tripPurpose === purpose && styles.radioSelected,
              ]}
            >
              {tripPurpose === purpose && <View style={styles.radioInner} />}
            </View>
            <Text>{purpose}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );

  const renderStepTwo = () => (
    <>
      <ThemedText type="profileTitle" style={styles.formTitle}>
        Booking Payment
      </ThemedText>
      <ScrollView style={styles.bookingFormContainer}>
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
              value={`₱${room.room_price}`}
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
      </ScrollView>
    </>
  );

  return (
    <Modal
      animationType="fade"
      visible={visible}
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        {step === 1 ? renderStepOne() : renderStepTwo()}
        <View style={styles.buttonContainer}>
          {step === 1 ? (
            <>
              <PressableButton
                Title="Cancel"
                type="tertiary"
                TextSize={12}
                style={{ flex: 1 }}
                onPress={() => {
                  resetForm();
                  onClose();
                }}
              />

              <PressableButton
                Title="Next"
                type="primary"
                color="white"
                TextSize={12}
                style={{ flex: 1 }}
                onPress={() => setStep(2)}
              />
            </>
          ) : (
            <>
              <PressableButton
                Title="Back"
                type="tertiary"
                TextSize={12}
                style={{ flex: 1 }}
                onPress={() => setStep(1)}
              />
              <PressableButton
                Title="Submit"
                type="primary"
                color="white"
                TextSize={12}
                style={{ flex: 1 }}
                onPress={handleSubmit}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

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
  bookingFormContainer: {
    flex: 1,
    paddingHorizontal: 20,
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#FFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  checked: {
    backgroundColor: '#0A1B47',
    borderColor: '#0A1B47',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0A1B47',
  },
  radioSelected: {
    borderColor: '#0A1B47',
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
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  calendarIcon: {
    fontSize: 18,
    color: '#777',
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
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
    backgroundSize: 'cover',
  },

  paymentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default BookingFormPopup;
