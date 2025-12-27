/**
 * Policies Section Component
 * Displays business policies including cancellation, refund, and house rules
 */

import Container from '@/components/Container';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import type { BusinessPolicies } from '@/types/BusinessPolicies';
import { formatTimeFor12Hour } from '@/types/BusinessPolicies';
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

interface PoliciesSectionProps {
  policies: BusinessPolicies | null;
  loading?: boolean;
}

const PoliciesSection = ({ policies, loading }: PoliciesSectionProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const iconColor = isDark ? '#60A5FA' : '#0077B6';
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const cardBg = isDark ? '#1a1f2e' : '#f8f9fa';
  const borderColor = isDark ? '#262B3A' : '#E3E7EF';

  if (loading) {
    return (
      <Container elevation={2} style={styles.container}>
        <View style={styles.header}>
          <FontAwesome5 name="scroll" size={20} color={iconColor} />
          <ThemedText type="card-title-small" weight="semi-bold">
            Policies & House Rules
          </ThemedText>
        </View>
        <ThemedText type="body-small" style={{ color: subTextColor }}>
          Loading policies...
        </ThemedText>
      </Container>
    );
  }

  if (!policies) {
    return null;
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Check if there are any policies to display
  const hasHouseRules =
    policies.check_in_time ||
    policies.check_out_time ||
    policies.quiet_hours_start ||
    !policies.pets_allowed ||
    !policies.smoking_allowed ||
    !policies.parties_allowed ||
    policies.additional_rules?.length;

  const hasPolicies =
    policies.cancellation_policy ||
    policies.refund_policy ||
    policies.payment_policy ||
    policies.damage_policy;

  if (!hasHouseRules && !hasPolicies) {
    return null;
  }

  return (
    <Container elevation={2} style={styles.container}>
      <View style={styles.header}>
        <FontAwesome5 name="scroll" size={20} color={iconColor} />
        <ThemedText type="card-title-small" weight="semi-bold">
          Policies & House Rules
        </ThemedText>
      </View>

      {/* Check-in/Check-out Times */}
      {(policies.check_in_time || policies.check_out_time) && (
        <View
          style={[styles.timeCard, { backgroundColor: cardBg, borderColor }]}
        >
          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <Ionicons name="enter-outline" size={20} color={colors.success} />
              <View>
                <ThemedText type="label-small" style={{ color: subTextColor }}>
                  Check-in
                </ThemedText>
                <ThemedText type="body-medium" weight="semi-bold">
                  {policies.check_in_time
                    ? formatTimeFor12Hour(policies.check_in_time)
                    : 'Flexible'}
                </ThemedText>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: borderColor }]} />
            <View style={styles.timeItem}>
              <Ionicons name="exit-outline" size={20} color={colors.error} />
              <View>
                <ThemedText type="label-small" style={{ color: subTextColor }}>
                  Check-out
                </ThemedText>
                <ThemedText type="body-medium" weight="semi-bold">
                  {policies.check_out_time
                    ? formatTimeFor12Hour(policies.check_out_time)
                    : 'Flexible'}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Quick Rules Grid */}
      <View style={styles.rulesGrid}>
        <RuleChip
          icon="paw"
          label="Pets"
          allowed={policies.pets_allowed}
          isDark={isDark}
        />
        <RuleChip
          icon="smoking-ban"
          iconType="fontawesome"
          label="Smoking"
          allowed={policies.smoking_allowed}
          isDark={isDark}
        />
        <RuleChip
          icon="party-popper"
          iconType="material"
          label="Parties"
          allowed={policies.parties_allowed}
          isDark={isDark}
        />
        <RuleChip
          icon="human-child"
          iconType="material"
          label="Children"
          allowed={policies.children_allowed}
          isDark={isDark}
        />
      </View>

      {/* Quiet Hours */}
      {(policies.quiet_hours_start || policies.quiet_hours_end) && (
        <View style={[styles.infoRow, { borderColor }]}>
          <Ionicons name="moon" size={18} color={iconColor} />
          <View style={{ flex: 1 }}>
            <ThemedText type="body-small" weight="semi-bold">
              Quiet Hours
            </ThemedText>
            <ThemedText type="label-small" style={{ color: subTextColor }}>
              {formatTimeFor12Hour(policies.quiet_hours_start)} -{' '}
              {formatTimeFor12Hour(policies.quiet_hours_end)}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Guest Limits */}
      {(policies.max_guests_per_room || policies.minimum_age_requirement) && (
        <View style={[styles.infoRow, { borderColor }]}>
          <Ionicons name="people" size={18} color={iconColor} />
          <View style={{ flex: 1 }}>
            <ThemedText type="body-small" weight="semi-bold">
              Guest Requirements
            </ThemedText>
            <ThemedText type="label-small" style={{ color: subTextColor }}>
              {policies.max_guests_per_room
                ? `Max ${policies.max_guests_per_room} guests per room`
                : ''}
              {policies.max_guests_per_room && policies.minimum_age_requirement
                ? ' • '
                : ''}
              {policies.minimum_age_requirement
                ? `Minimum age: ${policies.minimum_age_requirement}`
                : ''}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Additional Rules */}
      {policies.additional_rules && policies.additional_rules.length > 0 && (
        <View style={styles.additionalRules}>
          <ThemedText
            type="label-small"
            weight="semi-bold"
            style={{ color: subTextColor, marginBottom: 8 }}
          >
            Additional Rules
          </ThemedText>
          {policies.additional_rules.map((rule, index) => (
            <View key={index} style={styles.ruleItem}>
              <FontAwesome5
                name="check-circle"
                size={14}
                color={colors.success}
              />
              <ThemedText type="body-small" style={{ flex: 1 }}>
                {rule}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Expandable Policy Sections */}
      {policies.cancellation_policy && (
        <PolicyAccordion
          title="Cancellation Policy"
          icon="ban"
          content={policies.cancellation_policy}
          expanded={expandedSection === 'cancellation'}
          onToggle={() => toggleSection('cancellation')}
          isDark={isDark}
        />
      )}

      {policies.refund_policy && (
        <PolicyAccordion
          title="Refund Policy"
          icon="undo"
          content={policies.refund_policy}
          expanded={expandedSection === 'refund'}
          onToggle={() => toggleSection('refund')}
          isDark={isDark}
        />
      )}

      {policies.payment_policy && (
        <PolicyAccordion
          title="Payment Policy"
          icon="credit-card"
          content={policies.payment_policy}
          expanded={expandedSection === 'payment'}
          onToggle={() => toggleSection('payment')}
          isDark={isDark}
        />
      )}

      {policies.damage_policy && (
        <PolicyAccordion
          title="Damage & Security Deposit"
          icon="shield-alt"
          content={policies.damage_policy}
          expanded={expandedSection === 'damage'}
          onToggle={() => toggleSection('damage')}
          isDark={isDark}
        />
      )}
    </Container>
  );
};

// Rule Chip Component
interface RuleChipProps {
  icon: string;
  iconType?: 'ionicons' | 'fontawesome' | 'material';
  label: string;
  allowed: boolean;
  isDark: boolean;
}

const RuleChip = ({
  icon,
  iconType = 'ionicons',
  label,
  allowed,
  isDark,
}: RuleChipProps) => {
  const bgColor = allowed
    ? isDark
      ? 'rgba(16, 185, 129, 0.15)'
      : 'rgba(16, 185, 129, 0.1)'
    : isDark
    ? 'rgba(239, 68, 68, 0.15)'
    : 'rgba(239, 68, 68, 0.1)';
  const iconColor = allowed ? colors.success : colors.error;

  const IconComponent =
    iconType === 'fontawesome'
      ? FontAwesome5
      : iconType === 'material'
      ? MaterialCommunityIcons
      : Ionicons;

  return (
    <View style={[styles.ruleChip, { backgroundColor: bgColor }]}>
      <IconComponent name={icon as any} size={16} color={iconColor} />
      <ThemedText type="label-small" style={{ marginLeft: 6 }}>
        {label}
      </ThemedText>
      <FontAwesome5
        name={allowed ? 'check' : 'times'}
        size={10}
        color={iconColor}
        style={{ marginLeft: 4 }}
      />
    </View>
  );
};

// Policy Accordion Component
interface PolicyAccordionProps {
  title: string;
  icon: string;
  content: string;
  expanded: boolean;
  onToggle: () => void;
  isDark: boolean;
}

const PolicyAccordion = ({
  title,
  icon,
  content,
  expanded,
  onToggle,
  isDark,
}: PolicyAccordionProps) => {
  const iconColor = isDark ? '#60A5FA' : '#0077B6';
  const borderColor = isDark ? '#262B3A' : '#E3E7EF';

  return (
    <View style={[styles.accordion, { borderColor }]}>
      <Pressable onPress={onToggle} style={styles.accordionHeader}>
        <FontAwesome5 name={icon} size={16} color={iconColor} />
        <ThemedText
          type="body-small"
          weight="semi-bold"
          style={{ flex: 1, marginLeft: 10 }}
        >
          {title}
        </ThemedText>
        <FontAwesome5
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={12}
          color={iconColor}
        />
      </Pressable>
      {expanded && (
        <View style={styles.accordionContent}>
          <ThemedText type="body-small" style={{ lineHeight: 20 }}>
            {content}
          </ThemedText>
        </View>
      )}
    </View>
  );
};

export default PoliciesSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    gap: 16,
    ...Platform.select({
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  divider: {
    width: 1,
    height: 40,
  },
  rulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ruleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  additionalRules: {
    paddingTop: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  accordion: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  accordionContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
});
