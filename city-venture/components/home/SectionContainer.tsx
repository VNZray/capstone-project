import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import { Colors } from '@/constants/color';
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
}) => {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const palette = Colors[scheme];
  const headingColor = isDark ? '#F8F8FF' : '#0A1B47';
  const actionColor = isDark ? '#FFB3A2' : palette.tint;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <ThemedText
          type="sub-title-small"
          weight="bold"
          lightColor={headingColor}
          darkColor={headingColor}
        >
          {title}
        </ThemedText>
        {onPressViewAll ? (
          <Pressable onPress={onPressViewAll}>
            <ThemedText
              type="label-small"
              lightColor={actionColor}
              darkColor={actionColor}
            >
              {actionLabel} {'>'}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
};

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
