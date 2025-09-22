import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const OnlinePayment = () => {
  const navigation = useNavigation();

  const { amount, payment_method } = useLocalSearchParams();

  useEffect(() => {
    navigation.setOptions({ title: payment_method || 'Online Payment' });
  }, [navigation]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Online Payment Gateway</Text>
      <Text style={styles.amount}>
        Amount Due: ₱{amount ? Number(amount).toLocaleString() : '—'}
      </Text>
      <Text style={styles.info}>This page will use the payment gateway.</Text>
    </View>
  );
};

export default OnlinePayment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  amount: {
    fontSize: 18,
    color: '#0070f3',
    marginBottom: 12,
  },
  info: {
    fontSize: 16,
    color: '#444',
  },
});
