import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ReportsHome() {
  const scheme = useColorScheme();
  const bg = scheme === 'dark' ? '#0F1222' : '#F5F7FB';
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <ThemedText
        type="title-medium"
        weight="bold"
        style={{ marginBottom: 24 }}
      >
        Reports
      </ThemedText>
      <Button
        label="Submit a Report"
        fullWidth
        size="large"
        variant="solid"
        startIcon="plus"
        onPress={() => router.push('/(tabs)/(profile)/(reports)/submit' as any)}
      />
      <View style={{ height: 16 }} />
      <Button
        label="View My Reports"
        fullWidth
        size="large"
        variant="outlined"
        color="info"
        startIcon="list"
        onPress={() =>
          router.push('/(tabs)/(profile)/(reports)/my-reports' as any)
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
});
