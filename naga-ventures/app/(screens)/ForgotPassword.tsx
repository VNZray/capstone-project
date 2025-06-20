import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { View } from 'react-native';

const ForgotPassword = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">Forgot Password</ThemedText>
    </View>
  );
};

export default ForgotPassword;
