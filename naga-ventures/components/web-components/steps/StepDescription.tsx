import PressableButton from '@/components/PressableButton';
import { Business } from '@/types/Business';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type StepDescriptionProps = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  onNext: () => void;
  onPrev: () => void;
};

const StepDescription: React.FC<StepDescriptionProps> = ({
  data,
  setData,
  onNext,
  onPrev,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Business Description</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={data.description}
        onChangeText={(text) =>
          setData((prev) => ({ ...prev, description: text }))
        }
        placeholder="Enter a brief description of your business"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
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

export default StepDescription;

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
  textarea: {
    height: 120,
  },
  buttonContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
