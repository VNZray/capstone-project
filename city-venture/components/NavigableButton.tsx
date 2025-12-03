import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
  StyleProp,
  PressableStateCallbackType,
} from 'react-native';
import { usePreventDoubleNavigation } from '@/hooks/usePreventDoubleNavigation';

type NavigationMethod = 'push' | 'replace' | 'navigate';

/** Type for href - accepts string paths or typed route objects */
type NavigableHref = string | { pathname: string; params?: Record<string, string | undefined> };

interface NavigableButtonProps extends Omit<PressableProps, 'onPress' | 'style'> {
  /**
   * The route to navigate to. Can be a string path or an object with pathname and params.
   * Use Routes constants from '@/routes/mainRoutes' for type safety.
   *
   * @example href={Routes.tabs.home}
   * @example href={Routes.profile.orders.detail('123')}
   */
  href: NavigableHref;
  /**
   * Navigation method to use. Defaults to 'push'.
   * - push: Add to navigation stack (can go back)
   * - replace: Replace current screen (cannot go back)
   * - navigate: Smart navigation (reuses existing screen if available)
   */
  method?: NavigationMethod;
  /**
   * Optional callback fired before navigation starts.
   * Useful for analytics, validation, or cleanup.
   */
  onBeforeNavigate?: () => void;
  /**
   * Optional callback fired after navigation is triggered.
   * Note: Navigation may still be in progress when this fires.
   */
  onAfterNavigate?: () => void;
  /**
   * Children to render inside the button.
   */
  children: React.ReactNode;
  /**
   * Optional style for the pressable container.
   */
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
}

/**
 * A Pressable component that provides safe navigation with double-tap protection.
 * Use this component for navigation buttons to prevent duplicate route pushes.
 *
 * Prefer using `usePreventDoubleNavigation` hook directly for more control.
 * This component is ideal for simple navigation triggers.
 *
 * @example
 * // Using Routes constants (recommended)
 * import { Routes } from '@/routes/mainRoutes';
 *
 * <NavigableButton href={Routes.tabs.home}>
 *   <Text>Go Home</Text>
 * </NavigableButton>
 *
 * @example
 * // With dynamic params
 * <NavigableButton
 *   href={Routes.profile.orders.detail(orderId)}
 *   method="push"
 *   onBeforeNavigate={() => analytics.track('view_order')}
 * >
 *   <Text>View Order</Text>
 * </NavigableButton>
 *
 * @example
 * // Replace navigation (no back)
 * <NavigableButton href={Routes.tabs.home} method="replace">
 *   <Text>Start Over</Text>
 * </NavigableButton>
 */
export function NavigableButton({
  href,
  method = 'push',
  onBeforeNavigate,
  onAfterNavigate,
  children,
  disabled,
  style,
  ...props
}: NavigableButtonProps) {
  const navigation = usePreventDoubleNavigation();

  const handlePress = () => {
    // Block if already navigating
    if (navigation.isNavigating) return;

    // Fire pre-navigation callback
    onBeforeNavigate?.();

    // Perform navigation using the hook's method
    navigation[method](href as string);

    // Fire post-navigation callback
    onAfterNavigate?.();
  };

  return (
    <Pressable
      {...props}
      disabled={disabled || navigation.isNavigating}
      onPress={handlePress}
      style={(state) => [
        styles.container,
        navigation.isNavigating && styles.navigating,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    // Base styles - intentionally minimal to allow full customization
  },
  navigating: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
});

export default NavigableButton;
