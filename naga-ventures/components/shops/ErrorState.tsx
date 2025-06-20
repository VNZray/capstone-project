import { ShopColors } from '@/constants/ShopColors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  showIcon?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
  retryText = 'Try Again',
  showIcon = true,
}) => {
  return (
    <View style={styles.container}>
      {showIcon && (
        <View style={styles.iconContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={ShopColors.textSecondary}
          />
        </View>
      )}

      <Text style={styles.message}>{message}</Text>

      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Ionicons
            name="refresh-outline"
            size={20}
            color={ShopColors.primary}
            style={styles.retryIcon}
          />
          <Text style={styles.retryText}>{retryText}</Text>
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
    paddingHorizontal: 32,
    paddingVertical: 40,
    minHeight: 200,
  },
  iconContainer: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ShopColors.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ShopColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.primary,
  },
});
