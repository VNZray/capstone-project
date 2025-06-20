import PressableButton from '@/components/PressableButton';
import { Business } from '@/types/Business';
import * as DocumentPicker from 'expo-document-picker';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type StepPermitsProps = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  onNext: () => void;
  onPrev: () => void;
};

const StepPermits: React.FC<StepPermitsProps> = ({
  data,
  setData,
  onNext,
  onPrev,
}) => {
  const pickPermitFile = async (type: 'business' | 'mayor') => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result?.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (type === 'business') {
        setData((prev) => ({ ...prev, business_permit: uri }));
      } else {
        setData((prev) => ({ ...prev, mayors_permit: uri }));
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Upload Business Permit or Mayor's Permit
      </Text>

      <Text style={styles.label}>Business Permit (Required)</Text>
      <View style={styles.uploadRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={data.business_permit}
          placeholder="No file selected"
          editable={false}
        />
        <Pressable
          onPress={() => pickPermitFile('business')}
          style={styles.uploadButton}
        >
          <Text style={styles.uploadText}>Choose File</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Mayor's Permit URL (Optional)</Text>
      <View style={styles.uploadRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={data.mayors_permit}
          placeholder="No file selected"
          editable={false}
        />
        <Pressable
          onPress={() => pickPermitFile('mayor')}
          style={styles.uploadButton}
        >
          <Text style={styles.uploadText}>Choose File</Text>
        </Pressable>
      </View>

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

export default StepPermits;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#0A1B47',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  uploadText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  buttonContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
  },
});
