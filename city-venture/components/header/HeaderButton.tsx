import { ComponentProps } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import CustomIonIcon from '../ui/CustomIonIcon';

type IonIconName = ComponentProps<typeof CustomIonIcon>['name'];

type HeaderButtonProps = {
  onPress?: () => void;
  isTransparent?: boolean;
  style?: any;
  icon?: IonIconName;
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
      <CustomIonIcon
        name={props.icon || 'arrow-back'}
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
