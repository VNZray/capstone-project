import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { router } from 'expo-router';

export default function ReportsHome(){
  return (
    <View style={styles.container}>
      <ThemedText type="title-medium" weight="bold" style={{marginBottom:24}}>Reports</ThemedText>
  <Button label="Submit a Report" fullWidth size="large" variant="solid" startIcon="plus" onPress={()=>router.push('/(tabs)/(profile)/(reports)/submit' as any)} />
      <View style={{height:16}} />
  <Button label="View My Reports" fullWidth size="large" variant="soft" startIcon="list" onPress={()=>router.push('/(tabs)/(profile)/(reports)/my-reports' as any)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:24 }
});
