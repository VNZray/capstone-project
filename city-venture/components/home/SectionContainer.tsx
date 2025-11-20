import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';

type SectionContainerProps = {
  title: string;
  children: React.ReactNode;
  onPressViewAll?: () => void;
  actionLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const SectionContainer: React.FC<SectionContainerProps> = ({
  title,
  children,
  onPressViewAll,
  actionLabel = 'View All',
  style,
}) => (
  <View style={[styles.container, style]}>
    <View style={styles.headerRow}>
      <ThemedText
        type="sub-title-small"
        weight="bold"
        lightColor="#F8F8FF"
      >
        {title}
      </ThemedText>
      {onPressViewAll ? (
        <Pressable onPress={onPressViewAll}>
          <ThemedText type="label-small" lightColor="#FFB3A2">
            {actionLabel} →
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});

export default SectionContainer;
