import { ShopColors } from '@/constants/color';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

export type ShopCategoryTileProps = {
  label: string;
  icon?: string;
  active?: boolean;
  onPress?: () => void;
};

const { width } = Dimensions.get('window');
const TILE_WIDTH = (width - 48) / 4; // 4 columns with gap

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
        active && styles.activeContainer,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <View style={[styles.iconContainer, active && styles.activeIconContainer]}>
        {icon && (
          <FontAwesome5
            name={icon}
            size={16}
            color={active ? '#FFFFFF' : ShopColors.accent}
            solid
          />
        )}
      </View>
      <Text
        numberOfLines={1}
        style={[styles.label, active && styles.activeLabel]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: TILE_WIDTH,
    height: 80,
    backgroundColor: ShopColors.subcategoryCard,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeContainer: {
    backgroundColor: ShopColors.accent,
    shadowColor: ShopColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    shadowOpacity: 0,
    elevation: 0,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textPrimary,
    textAlign: 'center',
  },
  activeLabel: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default ShopCategoryTile;

