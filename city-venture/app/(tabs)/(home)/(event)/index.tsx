import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';

const Event = () => {
  const colors = Colors.light;
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText type="title-medium">Events</ThemedText>
      <ThemedText>Coming Soon</ThemedText>
    </View>
  );
};

export default Event;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
