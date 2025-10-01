import { moderateScale } from '@/utils/responsive';
import { useWindowDimensions } from 'react-native';

// Base (design) font sizes
const BASE_TOKENS = {
  display: 32,
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  micro: 10,
};

export type TypographyKey = keyof typeof BASE_TOKENS;

export function scaleFont(size: number, width?: number) {
  return moderateScale(size, 0.45, width);
}

export function useTypography() {
  const { width } = useWindowDimensions();
  const tokens: Record<TypographyKey, number> = Object.entries(BASE_TOKENS).reduce(
    (acc, [k, v]) => {
      (acc as any)[k] = scaleFont(v, width);
      return acc;
    },
    {} as Record<TypographyKey, number>
  );
  return tokens;
}

export const typography = BASE_TOKENS; // unscaled baseline (can be used for static mapping)
