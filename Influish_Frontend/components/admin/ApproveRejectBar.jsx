/**
 * ApproveRejectBar Component
 * Action bar for approving or rejecting withdrawal requests
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const ApproveRejectBar = ({ onApprove, onReject, disabled = false }) => {
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = () => {
    Alert.alert(
      'Approve Withdrawal',
      'Are you sure you want to approve this withdrawal request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: () => onApprove(),
        },
      ]
    );
  };

  const handleReject = () => {
    if (rejectionReason.trim().length < 10) {
      Alert.alert('Error', 'Please provide a detailed reason (minimum 10 characters)');
      return;
    }

    setRejectModalVisible(false);
    onReject(rejectionReason);
    setRejectionReason('');
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.rejectButton, disabled && styles.disabledButton]}
          onPress={() => setRejectModalVisible(true)}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.white} />
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.approveButton, disabled && styles.disabledButton]}
          onPress={handleApprove}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.white} />
          <Text style={styles.approveText}>Approve</Text>
        </TouchableOpacity>
      </View>

      {/* Reject Reason Modal */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rejection Reason</Text>
              <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Please provide a clear reason for rejecting this withdrawal request:
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={COLORS.gray}
            />

            <Text style={styles.charCount}>
              {rejectionReason.length} / 10 characters minimum
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setRejectModalVisible(false);
                  setRejectionReason('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  rejectionReason.trim().length < 10 && styles.disabledButton,
                ]}
                onPress={handleReject}
                disabled={rejectionReason.trim().length < 10}
              >
                <Text style={styles.submitButtonText}>Submit Rejection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  rejectText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  approveText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    backgroundColor: COLORS.blue[50],
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: COLORS.primaryDark,
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  charCount: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ApproveRejectBar;
