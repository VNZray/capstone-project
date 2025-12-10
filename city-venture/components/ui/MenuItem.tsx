import { Colors } from '@/constants/color';
import { Pressable, StyleSheet, View, Switch, Platform } from 'react-native';
import { ThemedText } from '../themed-text';
import FontAwesome5 from '@expo/vector-icons/build/FontAwesome5';
import { Ionicons } from '@expo/vector-icons';

const MenuItem = ({
  icon,
  label,
  onPress,
  last,
  color,
  border,
  iconColor,
  iconBg,
  subLabel,
  switch: hasSwitch = false,
  activated = false,
  onSwitchChange,
}: {
  icon?: any;
  label: string;
  onPress?: () => void;
  last?: boolean;
  color?: string;
  border?: string;
  iconColor?: string;
  iconBg?: string;
  subLabel?: string;
  switch?: boolean;
  activated?: boolean;
  onSwitchChange?: (value: boolean) => void;
}) => {
  const textColor = color || Colors.light.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        {
          backgroundColor: pressed ? '#F7FAFC' : 'transparent',
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: border || '#EDF2F7',
        },
      ]}
    >
      <View
        style={[styles.menuIconBox, { backgroundColor: iconBg || '#F3F4F6' }]}
      >
        <Ionicons name={icon} size={20} color={iconColor || '#718096'} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText
          type="body-medium"
          weight="medium"
          style={{ color: textColor }}
        >
          {label}
        </ThemedText>
        {subLabel && (
          <ThemedText
            type="body-small"
            style={{ color: Colors.light.textSecondary, marginTop: 2 }}
          >
            {subLabel}
          </ThemedText>
        )}
      </View>
      {hasSwitch ? (
        <Switch
          value={activated}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#E2E8F0', true: Colors.light.primary }}
          thumbColor={activated ? '#FFFFFF' : '#CBD5E0'}
          ios_backgroundColor="#E2E8F0"
          style={{ transform: [{ scale: Platform.OS === 'ios' ? 0.8 : 1.4 }] }}
        />
      ) : (
        <>
          {onPress && (
            <FontAwesome5 name="chevron-right" size={14} color="#C5A059" />
          )}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
});

export default MenuItem;
