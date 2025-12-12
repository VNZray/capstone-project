import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '../ui/icon-symbol';

type IconMapping = Record<
  SymbolViewProps['name'],
  ComponentProps<typeof MaterialIcons>['name']
>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'map.fill': 'map',
  'heart.fill': 'favorite',
  'person.crop.circle': 'account-circle',
} as IconMapping;

type HeaderButtonProps = {
  onPress?: () => void;
  isTransparent?: boolean;
  style?: any;
  icon?: IconSymbolName;
  iconColor?: string;
};

const HeaderButton = (props: HeaderButtonProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={props.onPress}
      style={[
        styles.backButton,
        {
          backgroundColor: props.isTransparent
            ? 'rgba(255,255,255,0.2)'
            : 'rgba(255,255,255,0.2)',
        },
      ]}
    >
      <IconSymbol
        name={props.icon!}
        color={props.iconColor ? props.iconColor : '#FFFFFF'}
        size={24}
      />
    </TouchableOpacity>
  );
};

export default HeaderButton;

const styles = StyleSheet.create({
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  transparentHeader: {
    padding: 16,
    backgroundColor: 'transparent',
  },
});
