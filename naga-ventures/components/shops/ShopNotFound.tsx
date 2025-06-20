import { ShopColors } from '@/constants/ShopColors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShopNotFoundProps {
  message?: string;
  showGoBackButton?: boolean;
}

const ShopNotFound: React.FC<ShopNotFoundProps> = ({
  message = "Sorry, we couldn't find the shop you're looking for.",
  showGoBackButton = true,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name="sad-outline" size={80} color={ShopColors.textSecondary} />
      <Text style={styles.title}>Shop Not Found</Text>
      <Text style={styles.message}>{message}</Text>
      {showGoBackButton && (
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => router.back()}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: ShopColors.background,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  goBackButton: {
    backgroundColor: ShopColors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  goBackButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
});

export default ShopNotFound;
