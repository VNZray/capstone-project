import PressableButton from '@/components/PressableButton';
import { Business } from '@/types/Business';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type StepBasicsProps = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  onNext: () => void;
  onPrev: () => void;
};

const StepPricing: React.FC<StepBasicsProps> = ({
  data,
  setData,
  onNext,
  onPrev,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Minimum Price (₱)</Text>
      <TextInput
        style={styles.input}
        value={data.min_price}
        onChangeText={(text) =>
          setData((prev) => ({ ...prev, min_price: text }))
        }
        placeholder="e.g. 100"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Maximum Price (₱)</Text>
      <TextInput
        style={styles.input}
        value={data.max_price}
        onChangeText={(text) =>
          setData((prev) => ({ ...prev, max_price: text }))
        }
        placeholder="e.g. 500"
        keyboardType="numeric"
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

export default StepPricing;

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
  buttonContainer: {
    marginTop: 24,
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 24,
  },
});
