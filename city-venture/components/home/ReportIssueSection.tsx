import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  onViewReports?: () => void;
  onReportIssue?: () => void;
};

const ReportIssueSection: React.FC<Props> = ({
  onViewReports,
  onReportIssue,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F2043', '#081226']} // Deep navy blue gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.content}>
          {/* Badge */}
          <View style={styles.badge}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={12}
              color="#FFD700"
            />
            <ThemedText type="label-small" style={styles.badgeText}>
              COMMUNITY FEEDBACK
            </ThemedText>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <ThemedText type="sub-title-medium" style={styles.titleWhite}>
              Help Us
            </ThemedText>
            <ThemedText type="sub-title-medium" style={styles.titleGold}>
              Improve
            </ThemedText>
          </View>

          {/* Description */}
          <ThemedText type="body-small" style={styles.description}>
            Track ongoing fixes or report a problem to help us build a better
            experience.
          </ThemedText>

          {/* Actions */}
          <View style={styles.actionRow}>
            <Pressable style={styles.button} onPress={onReportIssue}>
              <MaterialCommunityIcons
                name="message-alert-outline"
                size={16}
                color="#0F2043"
              />
              <ThemedText
                type="label-small"
                weight="bold"
                style={styles.buttonText}
              >
                Report Issue
              </ThemedText>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={onViewReports}>
              <ThemedText
                type="label-small"
                weight="semi-bold"
                style={styles.secondaryButtonText}
              >
                View Reports
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Right Side Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="heart-pulse"
              size={32}
              color="#D4AF37"
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: -24,
    marginLeft: -24,
  },
  card: {
    padding: 24,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 200,
  },
  content: {
    flex: 1,
    zIndex: 2,
    justifyContent: 'space-between',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
    marginBottom: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  titleContainer: {
    marginBottom: 4,
  },
  titleWhite: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  titleGold: {
    color: '#D4AF37', // Gold color
    fontSize: 22,
    lineHeight: 28,
    fontStyle: 'italic',
    fontWeight: '700',
    fontFamily: 'serif',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    lineHeight: 20,
    maxWidth: '85%',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#0F2043',
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  secondaryButtonText: {
    color: '#D4AF37',
    textDecorationLine: 'underline',
  },
  iconContainer: {
    position: 'relative',
    right: 0,
    top: 0,
    bottom: 0,
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default ReportIssueSection;
