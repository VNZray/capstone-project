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
      HEADER_HEIGHT_EXPANDED: 320,
      HEADER_HEIGHT_COLLAPSED: 120,
      SCROLL_THRESHOLD: 200,
    };
  } else if (SCREEN_WIDTH < 375) {
    return {
      HEADER_HEIGHT_EXPANDED: 330,
      HEADER_HEIGHT_COLLAPSED: 130,
      SCROLL_THRESHOLD: 210,
    };
  } else {
    return {
      HEADER_HEIGHT_EXPANDED: 340,
      HEADER_HEIGHT_COLLAPSED: 140,
      SCROLL_THRESHOLD: 220,
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
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(13, 35, 87, 1)', 'rgba(5, 18, 56, 1)']
    );

    return { backgroundColor };
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

  // Header background color animation (solid navy backing the header)
  const headerBackgroundStyle = useAnimatedStyle(() => {
    return { opacity: 1 };
  });

  // Content margin adjustment (tighter spacing but preserve rounded corners)
  const contentMarginStyle = useAnimatedStyle(() => {
    const marginTop = interpolate(
      progress.value,
      [0, 1],
      [-16, 0], // Allow slight overlap, lock flush when collapsed
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
    greetingStyle,
    headerBackgroundStyle,
    contentMarginStyle,
    searchBarBackgroundStyle,
    HEADER_HEIGHT_EXPANDED,
    HEADER_HEIGHT_COLLAPSED,
    SCROLL_THRESHOLD,
  };
};
