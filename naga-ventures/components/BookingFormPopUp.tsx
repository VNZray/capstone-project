import PressableButton from "@/components/PressableButton";
import { ThemedText } from "@/components/ThemedText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const screenHeight = Dimensions.get("window").height;

type BookingFormPopupProps = {
  visible: boolean;
  onClose: () => void;
  roomPrice: string;
};

const BookingFormPopup: React.FC<BookingFormPopupProps> = ({
  visible,
  onClose,
  roomPrice,
}) => {
  const [pax, setPax] = useState("");
  const [numChildren, setNumChildren] = useState("");
  const [numAdults, setNumAdults] = useState("");
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const handleBooking = () => {
    console.log({
      pax,
      numChildren,
      numAdults,
      guestNames,
      checkInDate,
      checkOutDate,
      roomPrice,
    });
    onClose();
  };

  const onChangeCheckIn = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    const currentDate = selectedDate || checkInDate;
    setShowCheckInPicker(Platform.OS === "ios");
    setCheckInDate(currentDate);
  };

  const onChangeCheckOut = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    const currentDate = selectedDate || checkOutDate;
    setShowCheckOutPicker(Platform.OS === "ios");
    setCheckOutDate(currentDate);
  };

  const formContent = () => (
    <>
      <ThemedText type="profileTitle" style={styles.formTitle}>
        Booking Form
      </ThemedText>

      <View style={styles.inputGroup}>
        <ThemedText type="default">Pax:</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Total number of guest"
          keyboardType="numeric"
          value={pax}
          onChangeText={(text) => {
            setPax(text);
            const num = parseInt(text) || 0;
            if (num > guestNames.length) {
              setGuestNames([
                ...guestNames,
                ...Array(num - guestNames.length).fill(""),
              ]);
            } else {
              setGuestNames(guestNames.slice(0, num));
            }
          }}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <ThemedText type="default">Number of Children:</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Type here"
            keyboardType="numeric"
            value={numChildren}
            onChangeText={setNumChildren}
          />
        </View>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <ThemedText type="default">Number of Adult:</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Type here"
            keyboardType="numeric"
            value={numAdults}
            onChangeText={setNumAdults}
          />
        </View>
      </View>

      {guestNames.map((name, index) => (
        <View key={index} style={styles.inputGroup}>
          <ThemedText type="default">Guest Name {index + 1}:</ThemedText>
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

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <ThemedText type="default">Check-in date:</ThemedText>
          <PressableButton
            onPress={() => setShowCheckInPicker(true)}
            Title={
              <View style={styles.datePickerButtonContent}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={24}
                  color="#0A1B47"
                />
                <ThemedText type="default">
                  {checkInDate.toLocaleDateString()}
                </ThemedText>
              </View>
            }
            type="default"
            style={styles.datePickerButton}
          />
          {showCheckInPicker && (
            <DateTimePicker
              testID="checkInDatePicker"
              value={checkInDate}
              mode="date"
              display="default"
              onChange={onChangeCheckIn}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={[styles.inputGroup, styles.halfWidth]}>
          <ThemedText type="default">Check-out date:</ThemedText>
          <PressableButton
            onPress={() => setShowCheckOutPicker(true)}
            Title={
              <View style={styles.datePickerButtonContent}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={24}
                  color="#0A1B47"
                />
                <ThemedText type="default">
                  {checkOutDate.toLocaleDateString()}
                </ThemedText>
              </View>
            }
            type="default"
            style={styles.datePickerButton}
          />
          {showCheckOutPicker && (
            <DateTimePicker
              testID="checkOutDatePicker"
              value={checkOutDate}
              mode="date"
              display="default"
              onChange={onChangeCheckOut}
              minimumDate={checkInDate}
            />
          )}
        </View>
      </View>

      <View style={styles.buttonRow}>
        <PressableButton
          Title="Submit"
          type="primary"
          color="#fff"
          height={50}
          TextSize={16}
          onPress={handleBooking}
          style={styles.submitButton}
        />
        <PressableButton
          Title="Close"
          type="secondary"
          color="#0A1B47"
          height={50}
          TextSize={16}
          onPress={onClose}
          style={styles.closeButton}
        />
      </View>
    </>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            {pax ? (
              <ScrollView
                style={[styles.popup, { maxHeight: screenHeight * 0.8 }]}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {formContent()}
              </ScrollView>
            ) : (
              <View style={[styles.popup, { height: screenHeight * 0.56 }]}>
                {formContent()}
              </View>
            )}
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popup: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    width: "90%",
  },
  formTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  halfWidth: {
    width: "48%",
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  datePickerButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  buttonRow: {
    marginTop: 20,
    gap: 10,
  },
  submitButton: {
    width: "100%",
  },
  closeButton: {
    width: "100%",
    backgroundColor: "#f2f2f2",
    marginBottom: 20,
  },
});

export default BookingFormPopup;
