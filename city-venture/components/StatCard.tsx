import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { moderateScale } from '@/utils/responsive';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Container from './Container';

type StatProps = {
  icon: any;
  label: string;
  value: number;
  card: string;
  scheme?: 'dark' | 'light';
};

const StatCard = ({ icon, label, value, card, scheme }: StatProps) => {
  const { width } = useWindowDimensions();
  const PAD = moderateScale(14, 0.55, width);
  const RADIUS = moderateScale(16, 0.55, width);
  const GAP = moderateScale(6, 0.55, width);
  const ICON_BOX = moderateScale(32, 0.55, width);

  return (
    <Container
      flex={1}
      radius={RADIUS}
      padding={PAD}
      gap={GAP}
      direction="row"
      elevation={2}
      style={[
        styles.statCard,
        { backgroundColor: card, borderRadius: RADIUS, padding: PAD, gap: GAP },
      ]}
    >
      <View
        style={[
          styles.statIcon,
          {
            width: ICON_BOX,
            height: ICON_BOX,
            backgroundColor: scheme === 'dark' ? '#263054' : '#E8F0FF',
            borderRadius: moderateScale(8, 0.55, width),
          },
        ]}
      >
        <FontAwesome5
          name={icon}
          size={moderateScale(16, 0.5, width)}
          color={colors.secondary}
        />
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
