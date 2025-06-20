import PressableButton from '@/components/PressableButton';
import { provinces } from '@/constants/location';
import { Business } from '@/types/Business';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type StepLocationProps = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  onNext: () => void;
  onPrev: () => void;
};

const StepLocation: React.FC<StepLocationProps> = ({
  data,
  setData,
  onNext,
  onPrev,
}) => {
  const [cities, setCities] = useState<string[]>([]);
  const [barangays, setBarangays] = useState<string[]>([]);

  useEffect(() => {
    const selectedProvince = provinces.find((p) => p.name === data.province);
    setCities(selectedProvince?.cities.map((c) => c.name) || []);

    const selectedCity = selectedProvince?.cities.find(
      (c) => c.name === data.city
    );
    setBarangays(selectedCity?.barangays || []);

    if (selectedCity) {
      setData((prev) => ({
        ...prev,
        postal_code: selectedCity.postal_code.toString(),
      }));
    }
  }, [data.province, data.city]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Business Address</Text>

      <Text style={styles.label}>Province</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          style={styles.picker}
          selectedValue={data.province}
          onValueChange={(value) =>
            setData((prev) => ({
              ...prev,
              province: value,
              city: '',
              barangay: '',
              postal_code: '',
            }))
          }
        >
          <Picker.Item label="Select Province" value="" />
          {provinces.map((prov) => (
            <Picker.Item key={prov.name} label={prov.name} value={prov.name} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>City</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          style={styles.picker}
          selectedValue={data.city}
          onValueChange={(value) => {
            setData((prev) => ({
              ...prev,
              city: value,
              barangay: '',
              // We'll set postal_code automatically in useEffect
            }));
          }}
          enabled={!!data.province}
        >
          <Picker.Item label="Select City" value="" />
          {cities.map((city) => (
            <Picker.Item key={city} label={city} value={city} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Barangay</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          style={styles.picker}
          selectedValue={data.barangay}
          onValueChange={(value) =>
            setData((prev) => ({ ...prev, barangay: value }))
          }
          enabled={!!data.city}
        >
          <Picker.Item label="Select Barangay" value="" />
          {barangays.map((bgy) => (
            <Picker.Item key={bgy} label={bgy} value={bgy} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Postal Code</Text>
      <TextInput
        style={[styles.input, { backgroundColor: '#eee' }]}
        value={data.postal_code}
        editable={false}
        placeholder="Postal Code"
      />

      <Text style={styles.label}>Longitude</Text>
      <TextInput
        style={styles.input}
        value={data.longitude}
        onChangeText={(text) =>
          setData((prev) => ({ ...prev, longitude: text }))
        }
        placeholder="Enter Longitude"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Latitude</Text>
      <TextInput
        style={styles.input}
        value={data.latitude}
        onChangeText={(text) =>
          setData((prev) => ({ ...prev, latitude: text }))
        }
        placeholder="Enter Latitude"
        keyboardType="decimal-pad"
      />

      <View style={styles.buttonContainer}>
        <PressableButton
          type="cancel"
          color="#fff"
          Title="Prev"
          onPress={onPrev}
          width={200}
        />
        <PressableButton
          type="primary"
          color="#fff"
          Title="Next"
          onPress={onNext}
          width={200}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    marginTop: 12,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginTop: 24,
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 24,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
});

export default StepLocation;
