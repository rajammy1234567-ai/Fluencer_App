/**
 * AdminDecisionBar Component
 * Action bar with three decision buttons for disputes
 * - Approve Influencer (green)
 * - Approve Brand (blue)
 * - Reject Dispute (red)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const AdminDecisionBar = ({
  onApproveInfluencer,
  onApproveBrand,
  onRejectDispute,
  disabled = false,
}) => {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState('');
  const [actionType, setActionType] = useState(null); // 'influencer', 'brand', 'reject'

  const handleApproveInfluencer = () => {
    Alert.alert(
      'Approve Influencer',
      'This will release the pending wallet amount to the influencer. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            setActionType('influencer');
            setShowReasonModal(true);
          },
        },
      ]
    );
  };

  const handleApproveBrand = () => {
    Alert.alert(
      'Approve Brand',
      'This will refund the payment to the brand. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            setActionType('brand');
            setShowReasonModal(true);
          },
        },
      ]
    );
  };

  const handleRejectDispute = () => {
    setActionType('reject');
    setShowReasonModal(true);
  };

  const handleSubmit = () => {
    if (reason.trim().length < 10) {
      Alert.alert('Invalid Reason', 'Reason must be at least 10 characters');
      return;
    }

    setShowReasonModal(false);

    setTimeout(() => {
      if (actionType === 'influencer') {
        onApproveInfluencer(reason);
      } else if (actionType === 'brand') {
        onApproveBrand(reason);
      } else if (actionType === 'reject') {
        onRejectDispute(reason);
      }

      // Reset
      setReason('');
      setActionType(null);
    }, 300);
  };

  const handleCancel = () => {
    setShowReasonModal(false);
    setReason('');
    setActionType(null);
  };

  const getModalTitle = () => {
    if (actionType === 'influencer') return 'Approve Influencer - Reason';
    if (actionType === 'brand') return 'Approve Brand - Reason';
    if (actionType === 'reject') return 'Reject Dispute - Reason';
    return 'Enter Reason';
  };

  const getModalColor = () => {
    if (actionType === 'influencer') return COLORS.success;
    if (actionType === 'brand') return COLORS.primary;
    if (actionType === 'reject') return COLORS.error;
    return COLORS.gray;
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.approveInfluencerButton,
              disabled && styles.disabledButton,
            ]}
            onPress={handleApproveInfluencer}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="account-check"
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.buttonText}>Approve Influencer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.approveBrandButton,
              disabled && styles.disabledButton,
            ]}
            onPress={handleApproveBrand}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="office-building-check"
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.buttonText}>Approve Brand</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.rejectButton,
            disabled && styles.disabledButton,
          ]}
          onPress={handleRejectDispute}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="close-circle"
            size={20}
            color={COLORS.white}
          />
          <Text style={styles.buttonText}>Reject Dispute</Text>
        </TouchableOpacity>
      </View>

      {/* Reason Modal */}
      <Modal
        visible={showReasonModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, { backgroundColor: getModalColor() }]}>
              <Text style={styles.modalTitle}>{getModalTitle()}</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.instructionText}>
                Please provide a detailed reason for your decision (minimum 10
                characters):
              </Text>

              <TextInput
                style={styles.reasonInput}
                placeholder="Enter your reason..."
                placeholderTextColor={COLORS.gray}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus
              />

              <Text style={styles.charCount}>
                {reason.length} / 10 characters minimum
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: getModalColor() },
                    reason.trim().length < 10 && styles.disabledSubmit,
                  ]}
                  onPress={handleSubmit}
                  disabled={reason.trim().length < 10}
                  activeOpacity={0.7}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
  },
  approveInfluencerButton: {
    backgroundColor: COLORS.success,
  },
  approveBrandButton: {
    backgroundColor: COLORS.primary,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  modalBody: {
    padding: 20,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
    lineHeight: 20,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.primaryDark,
    minHeight: 100,
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'right',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  disabledSubmit: {
    opacity: 0.5,
  },
});

export default AdminDecisionBar;
