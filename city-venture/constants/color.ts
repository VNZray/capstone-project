/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F5F7FB',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F1222',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const background = {
  light: '#F5F7FB',
  dark: '#0F1222',
};

export const card = {
  light: '#FFFFFF',
  dark: '#161A2E',
}

export const colors = {
  light: Colors.light.background,
  dark: Colors.dark.background,
  primary: '#0A1B47',
  secondary: '#0077B6',
  tertiary: '#DEE3F2',
  background: '#fff',
  error: '#dc3545',
  success: '#198754',
  warning: '#ffc107',
  info: '#0dcaf0',
  link: '#1e90ff',
  placeholder: '#888',
};

export const text = {
  light: '#fff',
  dark: '#111',
  link: '#1e90ff',
  placeholder: '#888',
  warning: '#ffcc00',
  error: '#e57373',
  success: '#28a745',
};