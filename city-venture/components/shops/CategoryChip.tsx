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
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export type CategoryChipProps = {
  icon: string;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons' | 'FontAwesome5';
  label: string;
  isSelected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const CategoryChip: React.FC<CategoryChipProps> = ({
  icon,
  iconFamily = 'Ionicons',
  label,
  isSelected = false,
  onPress,
  style,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const type = useTypography();

  const palette = {
    bg: isSelected
      ? colors.primary
      : isDark
      ? 'rgba(255,255,255,0.1)'
      : '#F5F7FA',
    text: isSelected ? '#fff' : isDark ? '#ECEDEE' : '#374151',
    icon: isSelected ? '#fff' : colors.primary,
    border: isSelected
      ? colors.primary
      : isDark
      ? 'rgba(255,255,255,0.15)'
      : '#E5E7EB',
  };

  const renderIcon = () => {
    const iconProps = {
      name: icon as any,
      size: 22,
      color: palette.icon,
    };

    switch (iconFamily) {
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons {...iconProps} />;
      case 'FontAwesome5':
        return <FontAwesome5 {...iconProps} />;
      default:
        return <Ionicons {...iconProps} />;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      <View style={styles.iconContainer}>{renderIcon()}</View>
      <Text
        style={[styles.label, { color: palette.text, fontSize: type.caption }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginRight: 10,
    minWidth: 80,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconContainer: {
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CategoryChip;
