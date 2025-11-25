import { StyleSheet, View } from 'react-native';
import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/themed-text';

const Event = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText type="title-medium">Events Coming Soon</ThemedText>
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