import { ShopColors } from '@/constants/ShopColors';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ShopNotFound: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Shop Not Found</Text>
    <Text style={styles.message}>
      We looked everywhere but could not find this business listing. It may have been removed
      or is still under review.
    </Text>
    <TouchableOpacity style={styles.button} onPress={() => router.back()}>
      <Text style={styles.buttonText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: ShopColors.accent,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default ShopNotFound;
