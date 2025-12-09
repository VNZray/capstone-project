/**
 * Customer Service Prompt
 * 
 * Shows a prompt directing users to customer service when self-service
 * refund/cancellation is not available (e.g., accepted orders).
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CustomerServicePromptProps {
  reason?: string;
  onClose?: () => void;
  showContactButton?: boolean;
}

const CustomerServicePrompt: React.FC<CustomerServicePromptProps> = ({
  reason = 'This order has been accepted by the business and cannot be cancelled or refunded through the app.',
  onClose,
  showContactButton = true,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const palette = {
    background: isDark ? '#2A2F36' : '#FFF9E6',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: colors.warning,
  };

  const handleContactSupport = () => {
    // Open email client with support email
    // You can customize this to open a support page, chat, or phone
    Linking.openURL('mailto:support@cityventure.app?subject=Order%20Assistance%20Request');
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background, borderColor: palette.border }]}>
      <View style={styles.iconContainer}>
        <Ionicons name="headset" size={32} color={colors.warning} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: palette.text }]}>
          Customer Service Required
        </Text>
        <Text style={[styles.message, { color: palette.subText }]}>
          {reason}
        </Text>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={18} color={colors.info} />
          <Text style={[styles.infoText, { color: palette.subText }]}>
            Please contact our customer service team for assistance with this order. 
            They will help you resolve your issue as quickly as possible.
          </Text>
        </View>

        {showContactButton && (
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.contactButton, { backgroundColor: colors.primary }]}
              onPress={handleContactSupport}
            >
              <Ionicons name="mail" size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>Contact Support</Text>
            </Pressable>

            {onClose && (
              <Pressable
                style={[styles.closeButton, { borderColor: palette.border }]}
                onPress={onClose}
              >
                <Text style={[styles.closeButtonText, { color: palette.text }]}>
                  Close
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CustomerServicePrompt;
