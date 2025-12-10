/**
 * Refund Request Modal
 * 
 * Modal for requesting refunds or cancellations for orders.
 * Handles eligibility checking, reason selection, and submission.
 * 
 * Usage:
 * <RefundRequestModal
 *   visible={showModal}
 *   orderId={selectedOrderId}
 *   onClose={() => setShowModal(false)}
 *   onSuccess={(result) => handleRefundSuccess(result)}
 * />
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as RefundService from '@/services/RefundService';
import type { RefundEligibility, RefundReason, RefundRequest } from '@/services/RefundService';

interface RefundRequestModalProps {
  visible: boolean;
  orderId: string;
  onClose: () => void;
  onSuccess: (result: RefundRequest | { success: boolean; message: string }) => void;
}

type ModalState = 'loading' | 'eligible' | 'not_eligible' | 'reason_selection' | 'submitting' | 'success' | 'error';

const RefundRequestModal: React.FC<RefundRequestModalProps> = ({
  visible,
  orderId,
  onClose,
  onSuccess,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // State
  const [modalState, setModalState] = useState<ModalState>('loading');
  const [eligibility, setEligibility] = useState<RefundEligibility | null>(null);
  const [selectedReason, setSelectedReason] = useState<RefundReason>('changed_mind');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successResult, setSuccessResult] = useState<RefundRequest | null>(null);

  // Colors
  const palette = {
    background: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
    inputBg: isDark ? '#2A2F36' : '#F9FAFB',
    overlay: 'rgba(0, 0, 0, 0.5)',
  };

  const checkEligibility = async () => {
    setModalState('loading');
    setErrorMessage('');
    
    try {
      const result = await RefundService.checkOrderRefundEligibility(orderId);
      setEligibility(result);
      
      if (result.eligible || result.canCancel) {
        setModalState('reason_selection');
      } else {
        setModalState('not_eligible');
      }
    } catch (error: any) {
      console.error('[RefundRequestModal] Eligibility check failed:', error);
      setErrorMessage(error.message || 'Failed to check refund eligibility');
      setModalState('error');
    }
  };

  // Check eligibility when modal opens
  useEffect(() => {
    if (visible && orderId) {
      checkEligibility();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, orderId]);

  const handleSubmit = async () => {
    if (!eligibility) return;

    setModalState('submitting');
    setErrorMessage('');

    try {
      let result: RefundRequest | { success: boolean; message: string };

      if (eligibility.eligible) {
        // Request refund for paid orders
        result = await RefundService.requestOrderRefund(orderId, {
          reason: selectedReason,
          notes: notes.trim() || undefined,
        });
      } else if (eligibility.canCancel) {
        // Cancel cash on pickup order
        const cancelResult = await RefundService.cancelCashOnPickupOrder(
          orderId,
          selectedReason,
          notes.trim() || undefined
        );
        result = {
          success: cancelResult.success,
          message: cancelResult.message,
        } as any;
      } else {
        throw new Error('Order is not eligible for refund or cancellation');
      }

      setSuccessResult(result as RefundRequest);
      setModalState('success');
      onSuccess(result);
    } catch (error: any) {
      console.error('[RefundRequestModal] Submit failed:', error);
      
      if (error.requiresCustomerService) {
        setErrorMessage('This order requires customer service assistance. Please contact support.');
      } else {
        setErrorMessage(error.message || 'Failed to process request');
      }
      setModalState('error');
    }
  };

  const handleClose = () => {
    // Reset state
    setModalState('loading');
    setEligibility(null);
    setSelectedReason('changed_mind');
    setNotes('');
    setErrorMessage('');
    setSuccessResult(null);
    onClose();
  };

  const reasons = RefundService.getAvailableRefundReasons();

  // Render content based on state
  const renderContent = () => {
    switch (modalState) {
      case 'loading':
        return (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: palette.subText }]}>
              Checking eligibility...
            </Text>
          </View>
        );

      case 'not_eligible':
        return (
          <View style={styles.centerContent}>
            <Ionicons name="alert-circle" size={64} color={colors.warning} />
            <Text style={[styles.title, { color: palette.text }]}>
              Not Eligible
            </Text>
            <Text style={[styles.message, { color: palette.subText }]}>
              {eligibility?.reason || 'This order cannot be refunded or cancelled at this time.'}
            </Text>
            {eligibility?.requiresCustomerService && (
              <View style={styles.customerServiceBox}>
                <Ionicons name="headset" size={24} color={colors.primary} />
                <Text style={[styles.customerServiceText, { color: palette.text }]}>
                  Please contact customer service for assistance with this order.
                </Text>
              </View>
            )}
            <Pressable
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleClose}
            >
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        );

      case 'reason_selection':
        const actionLabel = eligibility?.eligible ? 'Request Refund' : 'Cancel Order';
        const actionDescription = eligibility?.eligible
          ? `You will receive a refund of ₱${eligibility?.amount?.toFixed(2) || '0.00'}`
          : 'Your order will be cancelled';

        return (
          <ScrollView style={styles.scrollContent}>
            <Text style={[styles.title, { color: palette.text }]}>
              {actionLabel}
            </Text>
            <Text style={[styles.message, { color: palette.subText }]}>
              {actionDescription}
            </Text>

            {/* Reason Selection */}
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              Select a reason
            </Text>
            {reasons.map((reason) => (
              <Pressable
                key={reason.value}
                style={[
                  styles.reasonOption,
                  {
                    backgroundColor: selectedReason === reason.value 
                      ? colors.primary + '20' 
                      : palette.inputBg,
                    borderColor: selectedReason === reason.value 
                      ? colors.primary 
                      : palette.border,
                  },
                ]}
                onPress={() => setSelectedReason(reason.value)}
              >
                <View style={styles.radioOuter}>
                  {selectedReason === reason.value && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <Text style={[styles.reasonText, { color: palette.text }]}>
                  {reason.label}
                </Text>
              </Pressable>
            ))}

            {/* Notes Input */}
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              Additional notes (optional)
            </Text>
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.text,
                },
              ]}
              placeholder="Tell us more about your reason..."
              placeholderTextColor={palette.subText}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Warning for refunds */}
            {eligibility?.eligible && (
              <View style={[styles.warningBox, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="information-circle" size={20} color={colors.warning} />
                <Text style={[styles.warningText, { color: palette.text }]}>
                  Refunds typically take 1-7 business days to process, depending on your payment method.
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.cancelButton, { borderColor: palette.border }]}
                onPress={handleClose}
              >
                <Text style={[styles.cancelButtonText, { color: palette.text }]}>
                  Go Back
                </Text>
              </Pressable>
              <Pressable
                style={[styles.submitButton, { backgroundColor: colors.error }]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>{actionLabel}</Text>
              </Pressable>
            </View>
          </ScrollView>
        );

      case 'submitting':
        return (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: palette.subText }]}>
              Processing your request...
            </Text>
          </View>
        );

      case 'success':
        return (
          <View style={styles.centerContent}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            <Text style={[styles.title, { color: palette.text }]}>
              Request Submitted
            </Text>
            <Text style={[styles.message, { color: palette.subText }]}>
              {successResult?.message || 'Your request has been submitted successfully.'}
            </Text>
            {successResult?.status && (
              <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.statusText, { color: colors.success }]}>
                  Status: {RefundService.getRefundStatusLabel(successResult.status)}
                </Text>
              </View>
            )}
            <Pressable
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleClose}
            >
              <Text style={styles.buttonText}>Done</Text>
            </Pressable>
          </View>
        );

      case 'error':
        return (
          <View style={styles.centerContent}>
            <Ionicons name="close-circle" size={64} color={colors.error} />
            <Text style={[styles.title, { color: palette.text }]}>
              Request Failed
            </Text>
            <Text style={[styles.message, { color: palette.subText }]}>
              {errorMessage}
            </Text>
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.cancelButton, { borderColor: palette.border }]}
                onPress={handleClose}
              >
                <Text style={[styles.cancelButtonText, { color: palette.text }]}>
                  Close
                </Text>
              </Pressable>
              <Pressable
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={checkEligibility}
              >
                <Text style={styles.buttonText}>Try Again</Text>
              </Pressable>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={[styles.overlay, { backgroundColor: palette.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: palette.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: palette.border }]}>
            <Text style={[styles.headerTitle, { color: palette.text }]}>
              {eligibility?.canCancel ? 'Cancel Order' : 'Request Refund'}
            </Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={palette.text} />
            </Pressable>
          </View>

          {/* Content */}
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: 250,
  },
  scrollContent: {
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reasonText: {
    fontSize: 14,
    flex: 1,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  customerServiceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
    marginTop: 16,
    gap: 12,
  },
  customerServiceText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RefundRequestModal;
