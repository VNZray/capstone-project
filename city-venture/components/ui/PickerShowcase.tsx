import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { DateTimePickerExample } from './DateTimePickerExample';
import { ThemedView } from '@/components/themed-view';

/**
 * Component Showcase
 * 
 * Use this screen to test and demonstrate the date/time picker components
 * 
 * To use this showcase:
 * 1. Import this component in your app
 * 2. Navigate to it from your navigation stack
 * 3. Test both pickers with different configurations
 * 
 * Example navigation setup:
 * <Stack.Screen name="picker-showcase" component={PickerShowcase} />
 */

export const PickerShowcase = () => {
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DateTimePickerExample />
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});

export default PickerShowcase;
