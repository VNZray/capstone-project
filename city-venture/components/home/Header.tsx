import React, { memo } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolate,
  SharedValue,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const HEADER_BASE_HEIGHT = 92;

export type HeaderProps = {
  scrollY: SharedValue<number>;
  heroHeight: number;
  searchValue: string;
  onChangeSearch: (text: string) => void;
  placeholder?: string;
  onPressBell?: () => void;
  onPressCart?: () => void;
  backgroundColor?: string;
  translucentColor?: string;
  iconBackground?: string;
  style?: StyleProp<ViewStyle>;
};

const Header: React.FC<HeaderProps> = ({
  scrollY,
  heroHeight,
  searchValue,
  onChangeSearch,
  placeholder = 'Search services, guides...',
  onPressBell,
  onPressCart,
  backgroundColor = '#F86B4F',
  translucentColor = 'rgba(16,16,24,0)',
  iconBackground = 'rgba(0,0,0,0.4)',
  style,
}) => {
  const { top } = useSafeAreaInsets();

  const backgroundColorTransition = useDerivedValue(() =>
    interpolateColor(
      scrollY.value,
      [0, heroHeight * 0.6],
      [translucentColor, backgroundColor]
    )
  );

  const backgroundStyle = useAnimatedStyle(() => {
    const shadowProgress = interpolate(
      scrollY.value,
      [heroHeight * 0.35, heroHeight * 0.6],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      backgroundColor: backgroundColorTransition.value,
      shadowOpacity: 0.25 * shadowProgress,
      shadowRadius: 12 * shadowProgress,
      shadowOffset: {
        width: 0,
        height: 6 * shadowProgress,
      },
      elevation: 12 * shadowProgress,
      borderBottomWidth:
        shadowProgress > 0 ? StyleSheet.hairlineWidth : 0,
      borderBottomColor: 'rgba(255,255,255,0.2)',
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: top + 10,
          minHeight: HEADER_BASE_HEIGHT + top,
          zIndex: 100,
        },
        style,
        backgroundStyle,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.searchField}>
          <Feather name="search" size={18} color="#F2F3F8" />
          <TextInput
            value={searchValue}
            placeholder={placeholder}
            placeholderTextColor="rgba(242,243,248,0.6)"
            onChangeText={onChangeSearch}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.searchInput as TextStyle}
          />
        </View>
        <View style={styles.iconStack}>
          <CircleButton
            icon="bell"
            onPress={onPressBell}
            backgroundColor={iconBackground}
          />
          <CircleButton
            icon="shopping-bag"
            onPress={onPressCart}
            backgroundColor={iconBackground}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const CircleButton = memo(
  ({
    icon,
    onPress,
    backgroundColor,
  }: {
    icon: React.ComponentProps<typeof Feather>['name'];
    onPress?: () => void;
    backgroundColor: string;
  }) => (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.iconButton,
        { backgroundColor, borderColor: 'rgba(255,255,255,0.3)' },
      ]}
    >
      <Feather name={icon} size={18} color="#fff" />
    </Pressable>
  )
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11,13,20,0.9)',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    marginLeft: 8,
  },
  iconStack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});

export default Header;
