import {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolate,
  useDerivedValue,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive header heights based on screen size
const getHeaderHeights = () => {
  if (SCREEN_WIDTH < 360) {
    return {
      HEADER_HEIGHT_EXPANDED: 280, // 35% for small devices
      HEADER_HEIGHT_COLLAPSED: 252, // 10% collapse (280 - 28)
      SCROLL_THRESHOLD: 120,
    };
  } else if (SCREEN_WIDTH < 375) {
    return {
      HEADER_HEIGHT_EXPANDED: 292, // 35% for medium devices
      HEADER_HEIGHT_COLLAPSED: 263, // 10% collapse (292 - 29)
      SCROLL_THRESHOLD: 130,
    };
  } else {
    return {
      HEADER_HEIGHT_EXPANDED: 315, // 35% for larger devices
      HEADER_HEIGHT_COLLAPSED: 284, // 10% collapse (315 - 31)
      SCROLL_THRESHOLD: 145,
    };
  }
};

const { HEADER_HEIGHT_EXPANDED, HEADER_HEIGHT_COLLAPSED, SCROLL_THRESHOLD } = getHeaderHeights();
const COLLAPSE_RANGE = HEADER_HEIGHT_EXPANDED - HEADER_HEIGHT_COLLAPSED;

export const useCollapsibleHeader = () => {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const progress = useDerivedValue(() => {
    const raw = scrollY.value / SCROLL_THRESHOLD;
    return Math.min(Math.max(raw, 0), 1);
  });

  // Header container animation
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height =
      HEADER_HEIGHT_EXPANDED - progress.value * COLLAPSE_RANGE;

    return { height };
  });

  // Background image parallax + darkening effect
  const backgroundImageStyle = useAnimatedStyle(() => {
    const translateY = scrollY.value * -0.45;
    const scale = interpolate(
      progress.value,
      [0, 1],
      [1.12, 1],
      Extrapolate.CLAMP
    );

    // Smooth darkening from transparent to SOLID primary navy
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(0,0,0,0)', 'rgba(10, 26, 66, 1)'] // Fully opaque primary navy
    );

    return {
      transform: [
        { translateY },
        { scale },
      ],
      backgroundColor,
    };
  });

  // Background tint (deprecated - darkening now applied directly to image)
  const backgroundTintStyle = useAnimatedStyle(() => {
    return { backgroundColor: 'transparent' };
  });

  // Greeting text animation (fades out first for clean transition)
  const greetingStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 0.5],
      [1, 0],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      progress.value,
      [0, 0.6],
      [0, -26],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Header background color animation (removed - let background image handle darkening)
  const headerBackgroundStyle = useAnimatedStyle(() => {
    // No fade-in of navy gradient - background image darkening handles it all
    return { opacity: 0 };
  });

  // Content margin adjustment (tighter spacing)
  const contentMarginStyle = useAnimatedStyle(() => {
    const marginTop = interpolate(
      progress.value,
      [0, 1],
      [-35, 0], // Tighter overlap effect for better spacing
      Extrapolate.CLAMP
    );

    return { marginTop };
  });

  // Search bar background - solid navy when collapsed
  const searchBarBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(0,0,0,0)', 'rgba(10, 26, 66, 1)'] // Transparent to solid primary navy
    );

    return { backgroundColor };
  });

  return {
    scrollY,
    scrollHandler,
    headerAnimatedStyle,
    backgroundImageStyle,
    backgroundTintStyle,
    greetingStyle,
    headerBackgroundStyle,
    contentMarginStyle,
    searchBarBackgroundStyle,
    HEADER_HEIGHT_EXPANDED,
    HEADER_HEIGHT_COLLAPSED,
    SCROLL_THRESHOLD,
  };
};
