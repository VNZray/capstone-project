import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { View } from 'react-native';

const ForgotPassword = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title-medium">Forgot Password</ThemedText>
    </View>
  );
};

export default ForgotPassword;
