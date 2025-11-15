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
  primary: "#0A1B47",
  secondary: "#0077B6",
  tertiary: "#DEE3F2",
  white: "#ffffff",
  error: "#c70030	",
  success: "#28a745",
  warning: "#ff4545",
  black: "#111111",
  gray: "#6B7280",
  yellow: "#FFB007",
  orange: "#FF5310",
  red: "#AE2438",
  link: '#1e90ff',
  placeholder: '#888',
};

export const text = {
  light: colors.white,
  dark: colors.black,
  link: colors.link,
  placeholder: colors.placeholder,
  warning: colors.warning,
  error: colors.error,
  success: colors.success,
};
