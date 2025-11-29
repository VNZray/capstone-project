import { ShopColors } from '@/constants/color';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type ShopCategoryTileProps = {
  label: string;
  icon?: string;
  active?: boolean;
  onPress?: () => void;
};

const ShopCategoryTile: React.FC<ShopCategoryTileProps> = ({
  label,
  icon,
  active = false,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        active ? styles.activeContainer : styles.inactiveContainer,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      {icon && (
        <View style={styles.iconContainer}>
          <FontAwesome5
            name={icon}
            size={14}
            color={active ? '#FFFFFF' : ShopColors.textSecondary}
            solid
          />
        </View>
      )}
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          active ? styles.activeLabel : styles.inactiveLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
  },
  inactiveContainer: {
    backgroundColor: ShopColors.surface,
    borderColor: ShopColors.border,
  },
  activeContainer: {
    backgroundColor: ShopColors.primary,
    borderColor: ShopColors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  iconContainer: {
    marginRight: 8,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
  },
  inactiveLabel: {
    color: ShopColors.textPrimary,
  },
  activeLabel: {
    color: '#FFFFFF',
  },
});

export default ShopCategoryTile;
