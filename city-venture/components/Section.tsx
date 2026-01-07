import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { FontAwesome5 } from '@expo/vector-icons';

interface SectionProps {
  icon?: string;
  title: string;
  children: React.ReactNode;
  isDark?: boolean;
}

export default function Section({
  icon,
  title,
  children,
  isDark = false,
}: SectionProps) {
  return (
    <View
      style={[
        styles.section,
        { backgroundColor: isDark ? '#161B22' : '#FFFFFF' },
      ]}
    >
      <View style={styles.sectionHeader}>
        {icon && (
          <View
            style={[
              styles.sectionIconCircle,
              { backgroundColor: colors.primary + '15' },
            ]}
          >
            <FontAwesome5 name={icon} size={16} color={colors.primary} />
          </View>
        )}
        <ThemedText type="card-title-medium" weight="semi-bold">
          {title}
        </ThemedText>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionContent: {
    gap: 16,
  },
});
