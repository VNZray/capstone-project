import PressableButton from '@/components/PressableButton';
import { Business } from '@/types/Business';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

type StepBasicsProps = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  onNext: () => void;
  onPrev: () => void;
};

const StepReview: React.FC<StepBasicsProps> = ({ data, onNext, onPrev }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Review Your Business Information</Text>
      <View style={styles.table}>
        {Object.entries(data).map(([key, value]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.cellLabel}>{key.replace(/_/g, ' ')}</Text>
            {key === 'image_url' && typeof value === 'string' && value ? (
              <Image
                source={{ uri: value }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.cellValue}>{value?.toString() || 'N/A'}</Text>
            )}
          </View>
        ))}
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
    </ScrollView>
  );
};

export default StepReview;

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  table: { marginBottom: 24 },
  row: {
    flexDirection: 'column',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  cellLabel: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
    color: '#333',
    marginBottom: 4,
  },
  cellValue: {
    color: '#555',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
  },
});
