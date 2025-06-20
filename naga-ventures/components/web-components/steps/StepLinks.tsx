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

const StepLinks: React.FC<StepBasicsProps> = ({
  data,
  setData,
  onNext,
  onPrev,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Business Social Media Links</Text>

      <Text style={styles.label}>Facebook URL</Text>
      <TextInput
        style={styles.input}
        value={data.facebook_url}
        onChangeText={(text) =>
          setData((prev) => ({ ...prev, facebook_url: text }))
        }
        placeholder="https://facebook.com/yourbusiness"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Instagram URL</Text>
      <TextInput
        style={styles.input}
        value={data.instagram_url}
        onChangeText={(text) =>
          setData((prev) => ({ ...prev, instagram_url: text }))
        }
        placeholder="https://instagram.com/yourbusiness"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Twitter URL</Text>
      <TextInput
        style={styles.input}
        value={data.twitter_url}
        onChangeText={(text) =>
          setData((prev) => ({ ...prev, twitter_url: text }))
        }
        placeholder="https://twitter.com/yourbusiness"
        autoCapitalize="none"
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

export default StepLinks;

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
  buttonContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
  },
});
