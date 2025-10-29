import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type SectionHeaderProps = {
  title: string;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  showViewAll = false,
  onViewAllPress,
  style,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const type = useTypography();

  const palette = {
    text: isDark ? '#ECEDEE' : '#111827',
    link: colors.primary,
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: palette.text, fontSize: type.h3 }]}>
        {title}
      </Text>
      {showViewAll && onViewAllPress && (
        <Pressable
          onPress={onViewAllPress}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.viewAllButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text
            style={[
              styles.viewAllText,
              { color: palette.link, fontSize: type.body },
            ]}
          >
            View All
          </Text>
          <Ionicons name="chevron-forward" size={18} color={palette.link} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontWeight: '700',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontWeight: '600',
  },
});

export default SectionHeader;
