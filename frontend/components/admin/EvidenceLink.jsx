/**
 * EvidenceLink Component
 * Displays evidence links and details for disputes
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const EvidenceLink = ({ label, link, icon = 'link', description }) => {
  const handlePress = async () => {
    if (!link) {
      Alert.alert('No Link', 'No link available for this evidence');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(link);
      if (supported) {
        await Linking.openURL(link);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <MaterialCommunityIcons name={icon} size={20} color={COLORS.primary} />
        <Text style={styles.label}>{label}</Text>
      </View>

      {description && (
        <Text style={styles.description}>{description}</Text>
      )}

      {link ? (
        <TouchableOpacity
          style={styles.linkButton}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="open-in-new"
            size={16}
            color={COLORS.primary}
          />
          <Text style={styles.linkText} numberOfLines={1}>
            {link}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.noLink}>No link provided</Text>
      )}
    </View>
  );
};

const EvidenceSection = ({ dispute }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Evidence & Details</Text>

      <View style={styles.evidenceCard}>
        <EvidenceLink
          label="Submitted Content"
          link={dispute.contentLink}
          icon="instagram"
          description="Influencer's submitted content link"
        />

        <View style={styles.divider} />

        <View style={styles.requirementsContainer}>
          <View style={styles.labelContainer}>
            <MaterialCommunityIcons
              name="clipboard-text"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.label}>Campaign Requirements</Text>
          </View>
          <Text style={styles.requirementsText}>
            {dispute.campaignRequirements}
          </Text>
        </View>

        {dispute.additionalNotes && (
          <>
            <View style={styles.divider} />

            <View style={styles.notesContainer}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons
                  name="note-text"
                  size={20}
                  color={COLORS.warning}
                />
                <Text style={styles.label}>Additional Notes</Text>
              </View>
              <Text style={styles.notesText}>{dispute.additionalNotes}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 8,
    marginLeft: 4,
  },
  evidenceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  description: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
    marginLeft: 28,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.blue[50],
    padding: 12,
    borderRadius: 8,
    marginLeft: 28,
  },
  linkText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    flex: 1,
  },
  noLink: {
    fontSize: 13,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginLeft: 28,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[100],
    marginVertical: 16,
  },
  requirementsContainer: {
    marginBottom: 0,
  },
  requirementsText: {
    fontSize: 13,
    color: COLORS.primaryDark,
    lineHeight: 20,
    marginLeft: 28,
  },
  notesContainer: {
    backgroundColor: COLORS.warning + '10',
    padding: 12,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 20,
    marginLeft: 28,
    fontStyle: 'italic',
  },
});

export { EvidenceLink, EvidenceSection };
export default EvidenceSection;
