import { useWindowDimensions } from 'react-native';

/**
 * Baseline dimensions taken from a 6.9" device you optimized for (approx 430 logical width).
 */
const BASE_WIDTH = 430; // adjust if actual design width differs
const BASE_HEIGHT = 932; // optional for vertical scaling

export function scale(size: number, currentWidth?: number) {
  const w = currentWidth ?? 360; // fallback typical small phone width
  return Math.round((w / BASE_WIDTH) * size);
}

export function verticalScale(size: number, currentHeight?: number) {
  const h = currentHeight ?? 800; // fallback typical small phone height
  return Math.round((h / BASE_HEIGHT) * size);
}

export function moderateScale(size: number, factor = 0.6, currentWidth?: number) {
  const scaled = scale(size, currentWidth);
  return Math.round(size + (scaled - size) * factor);
}

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    scale: (s: number) => scale(s, width),
    verticalScale: (s: number) => verticalScale(s, height),
    moderateScale: (s: number, f?: number) => moderateScale(s, f, width),
    isSmallPhone: width < 360,
    isPhone: width < 600,
    isTablet: width >= 600 && width < 900,
    isLarge: width >= 900,
  };
}

/** Clamp a size between min & max after scaling */
export function scaled(size: number, opts?: { min?: number; max?: number; factor?: number; width?: number }) {
  const { min, max, factor = 0.65, width } = opts || {};
  let v = moderateScale(size, factor, width);
  if (min != null) v = Math.max(min, v);
  if (max != null) v = Math.min(max, v);
  return v;
}
