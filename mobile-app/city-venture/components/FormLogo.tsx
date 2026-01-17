import logo from '@/assets/logo/logo.png';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

const FormLogo = () => {
  return (
    <View style={styles.logoContainer}>
      <Image source={logo} style={styles.logo} />
      <ThemedText type="card-title-medium" weight="bold">
        City Venture
      </ThemedText>
    </View>
  );
};

export default FormLogo;

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  logoText: {
    fontSize: 18,
    marginLeft: 10,
    fontFamily: 'Poppins-Bold',
  },
});
