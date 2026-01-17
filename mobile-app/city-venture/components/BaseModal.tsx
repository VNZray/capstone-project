import React, { ReactNode } from 'react';
import { Modal, View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { ThemedText } from './themed-text';
import { Colors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';

type BaseModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  primaryButtonLabel?: string;
  onPrimaryPress?: () => void;
  primaryButtonDisabled?: boolean;
  secondaryButtonLabel?: string;
  onSecondaryPress?: () => void;
  secondaryButtonDisabled?: boolean;
  showCloseButton?: boolean;
  scrollable?: boolean;
};

const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  primaryButtonLabel,
  onPrimaryPress,
  primaryButtonDisabled = false,
  secondaryButtonLabel,
  onSecondaryPress,
  secondaryButtonDisabled = false,
  showCloseButton = true,
  scrollable = true,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText type="label-large" weight="bold">
                {title}
              </ThemedText>
              {subtitle && (
                <ThemedText
                  type="body-small"
                  style={{ color: Colors.light.textSecondary, marginTop: 4 }}
                >
                  {subtitle}
                </ThemedText>
              )}
            </View>
            {showCloseButton && (
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </Pressable>
            )}
          </View>

          {/* Content */}
          {scrollable ? (
            <ScrollView
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.modalBody, styles.modalBodyContent]}>
              {children}
            </View>
          )}

          {/* Footer */}
          {(primaryButtonLabel || secondaryButtonLabel) && (
            <View style={styles.modalFooter}>
              {secondaryButtonLabel && (
                <Button
                  label={secondaryButtonLabel}
                  variant="outlined"
                  onPress={onSecondaryPress || onClose}
                  disabled={secondaryButtonDisabled}
                  style={{ flex: 1 }}
                />
              )}
              {primaryButtonLabel && (
                <Button
                  label={primaryButtonLabel}
                  onPress={onPrimaryPress || onClose}
                  disabled={primaryButtonDisabled}
                  style={{ flex: 1 }}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    gap: 12,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    maxHeight: '70%',
  },
  modalBodyContent: {
    padding: 20,
    gap: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});

export default BaseModal;
