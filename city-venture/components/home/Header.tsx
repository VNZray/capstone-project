import React, { memo } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
  useColorScheme,
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
import { colors } from '@/constants/color';

export const HEADER_BASE_HEIGHT = 88;

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
  backgroundColor,
  translucentColor,
  iconBackground,
  style,
}) => {
  const { top } = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  const resolvedBackground = backgroundColor ?? (isDark ? '#0C1024' : colors.primary);
  const resolvedTranslucent = translucentColor ?? (isDark ? 'rgba(12,16,36,0)' : 'rgba(10,27,71,0)');
  const resolvedIconBackground = iconBackground ?? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.16)');
  const strokeColor = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.28)';
  const searchBackground = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.14)';
  const inputColor = isDark ? '#EEF2FF' : '#F6F8FF';
  const placeholderColor = isDark ? 'rgba(238,242,255,0.65)' : 'rgba(246,248,255,0.78)';
  const iconColor = isDark ? '#F2F3F8' : '#FDFDFE';

  const backgroundColorTransition = useDerivedValue(() =>
    interpolateColor(
      scrollY.value,
      [0, heroHeight * 0.6],
      [resolvedTranslucent, resolvedBackground]
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
      borderBottomColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(10,27,71,0.08)',
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
      <View style={styles.contentContainer}>
        <View style={styles.row}>
          <View
            style={[
              styles.searchField,
              {
                backgroundColor: searchBackground,
                borderColor: strokeColor,
              },
            ]}
          >
            <Feather name="search" size={18} color={iconColor} />
            <TextInput
              value={searchValue}
              placeholder={placeholder}
              placeholderTextColor={placeholderColor}
              onChangeText={onChangeSearch}
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.searchInput as TextStyle, { color: inputColor }]}
            />
          </View>
          <View style={styles.iconStack}>
            <CircleButton
              icon="bell"
              onPress={onPressBell}
              backgroundColor={resolvedIconBackground}
              borderColor={strokeColor}
              iconColor={iconColor}
            />
            <CircleButton
              icon="shopping-bag"
              onPress={onPressCart}
              backgroundColor={resolvedIconBackground}
              borderColor={strokeColor}
              iconColor={iconColor}
            />
          </View>
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
    borderColor,
    iconColor,
  }: {
    icon: React.ComponentProps<typeof Feather>['name'];
    onPress?: () => void;
    backgroundColor: string;
    borderColor: string;
    iconColor: string;
  }) => (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.iconButton,
        { backgroundColor, borderColor },
      ]}
    >
      <Feather name={icon} size={18} color={iconColor} />
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
  contentContainer: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
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
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  iconStack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});

export default Header;
