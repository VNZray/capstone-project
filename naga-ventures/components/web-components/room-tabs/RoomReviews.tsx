import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const ReviewTab = () => {
  return (
    <View style={styles.section}>
      <ThemedText type="title" darkColor="#000">
        Available Soon...
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A1B47',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default ReviewTab;
