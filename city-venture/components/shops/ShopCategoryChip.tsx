import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { moderateScale } from '@/utils/responsive';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  ViewStyle,
} from 'react-native';

export type ShopCategoryChipProps = {
  label: string;
  icon?: string;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const ShopCategoryChip: React.FC<ShopCategoryChipProps> = ({
  label,
  icon,
  active = false,
  onPress,
  style,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { width } = useWindowDimensions();
  const type = useTypography();

  const palette = {
    activeBg: colors.secondary,
    inactiveBg: isDark ? '#2A2F36' : '#E8EBF0',
    activeText: '#fff',
    inactiveText: isDark ? '#ECEDEE' : '#11181C',
    activeIcon: '#fff',
    inactiveIcon: colors.secondary,
  };

  const PADDING_H = moderateScale(14, 0.55, width);
  const PADDING_V = moderateScale(10, 0.55, width);
  const RADIUS = moderateScale(20, 0.55, width);
  const ICON_SIZE = moderateScale(16, 0.45, width);
  const GAP = moderateScale(8, 0.5, width);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? palette.activeBg : palette.inactiveBg,
          paddingHorizontal: PADDING_H,
          paddingVertical: PADDING_V,
          borderRadius: RADIUS,
        },
        pressed && { opacity: 0.8 },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      {icon && (
        <FontAwesome5
          name={icon}
          size={ICON_SIZE}
          color={active ? palette.activeIcon : palette.inactiveIcon}
          solid
        />
      )}
      <Text
        style={[
          {
            color: active ? palette.activeText : palette.inactiveText,
            fontSize: type.bodySmall,
            fontWeight: '600',
            marginLeft: icon ? GAP : 0,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
});

export default ShopCategoryChip;
