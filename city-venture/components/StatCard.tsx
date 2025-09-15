import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Container from './Container';

type StatProps = {
  icon: any;
  label: string;
  value: number;
  card: string;
  scheme?: 'dark' | 'light';
};

const StatCard = ({ icon, label, value, card, scheme }: StatProps) => {
  return (
    <Container
      flex={1}
      radius={16}
      padding={14}
      gap={6}
      direction="row"
      elevation={2}
      style={[styles.statCard, { backgroundColor: card }]}
    >
      <View
        style={[
          styles.statIcon,
          { backgroundColor: scheme === 'dark' ? '#263054' : '#E8F0FF' },
        ]}
      >
        <FontAwesome5 name={icon} size={16} color={colors.secondary} />
      </View>
      <View>
        <ThemedText type="sub-title-small" weight="bold">
          {value}
        </ThemedText>
        <ThemedText type="label-small" style={{ color: '#6A768E' }}>
          {label}
        </ThemedText>
      </View>
    </Container>
  );
};

export default StatCard;

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    flexDirection: 'row',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
