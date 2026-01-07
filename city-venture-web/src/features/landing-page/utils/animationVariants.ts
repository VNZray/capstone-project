/**
 * Animation Variants and Utilities for Tourist Landing Page
 * 
 * Performance-conscious animation constants using GPU-accelerated properties
 * (transform, opacity) for smooth 60fps animations on all devices.
 */
import type { Variants, Easing, Transition } from "motion/react";

// Custom easing curves for professional feel
export const EASE = {
  // Smooth deceleration - great for entrances
  smooth: [0.22, 1, 0.36, 1] as Easing,
  // Quick and snappy - great for interactions
  snappy: [0.32, 0.72, 0, 1] as Easing,
  // Gentle ease out
  gentle: [0.16, 1, 0.3, 1] as Easing,
  // Bounce effect
  bounce: [0.68, -0.55, 0.265, 1.55] as Easing,
};

// Transition presets for consistent timing
export const TRANSITIONS = {
  fast: { duration: 0.2, ease: EASE.snappy } as Transition,
  normal: { duration: 0.4, ease: EASE.smooth } as Transition,
  slow: { duration: 0.6, ease: EASE.smooth } as Transition,
  entrance: { duration: 0.8, ease: EASE.gentle } as Transition,
  spring: { type: "spring" as const, stiffness: 200, damping: 20 } as Transition,
  springBounce: { type: "spring" as const, stiffness: 300, damping: 15 } as Transition,
};

// Stagger configuration
export const STAGGER = {
  fast: 0.08,
  normal: 0.12,
  slow: 0.2,
};

/**
 * Hero Section Variants
 */
export const heroTitleVariants: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1, ease: EASE.gentle },
  },
};

export const heroSubtitleVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.15, ease: EASE.smooth },
  },
};

export const heroDescriptionVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.3, ease: EASE.smooth },
  },
};

export const heroCtaVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, delay: 0.5, ease: EASE.smooth },
  },
};

export const heroBackgroundInitial = { scale: 1.15, opacity: 0 };

export const heroBackgroundAnimate = {
  scale: 1,
  opacity: 1,
  transition: { duration: 1.5, ease: "easeOut" as const },
};

/**
 * Scroll Indicator Animation
 */
export const scrollIndicatorAnimation = {
  y: [0, 8, 0],
  opacity: [0.6, 1, 0.6],
};

export const scrollIndicatorTransition = {
  duration: 1.8,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

/**
 * Bento Grid (Experiences Section) Variants
 */
export const bentoContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER.normal,
      delayChildren: 0.1,
    },
  },
};

export const bentoItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: EASE.smooth,
    },
  },
};

// Hover animations for bento cards
export const bentoHoverVariants: Variants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -6,
    transition: { duration: 0.3, ease: EASE.snappy },
  },
};

// Image zoom on hover
export const imageZoomVariants: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.08,
    transition: { duration: 0.5, ease: EASE.smooth },
  },
};

/**
 * Gastronomy Section (Expanding Cards) Variants
 */
export const gastronomyContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER.slow,
      delayChildren: 0.2,
    },
  },
};

export const gastronomyCardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: 60,
    scale: 0.9,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: EASE.smooth,
    },
  },
};

export const cardContentVariants: Variants = {
  collapsed: { 
    opacity: 0,
    height: 0,
    transition: { duration: 0.3 },
  },
  expanded: { 
    opacity: 1,
    height: "auto",
    transition: { duration: 0.4, delay: 0.15 },
  },
};

/**
 * Events Section Variants
 */
export const eventsContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

export const eventRowVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    x: -20,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    x: 0,
    transition: {
      duration: 0.5,
      ease: EASE.smooth,
    },
  },
};

export const dateBadgeVariants: Variants = {
  hidden: { scale: 0, rotate: -90 },
  visible: { 
    scale: 1, 
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
};

/**
 * App Download Section Variants
 */
export const phoneVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 80, 
    rotateY: -20,
    scale: 0.9,
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    rotateY: 0,
    scale: 1,
    transition: {
      duration: 1,
      ease: EASE.gentle,
    },
  },
};

export const phoneFloatAnimation = {
  y: [0, -12, 0],
};

export const phoneFloatTransition = {
  duration: 4,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

export const downloadButtonVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: EASE.smooth,
    },
  },
};

export const floatingCardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      type: "spring",
      stiffness: 150,
    },
  },
};

export const featureListVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

export const featureItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: EASE.smooth },
  },
};

/**
 * Intro Section Variants
 */
export const introVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  },
  welcome: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE.smooth },
    },
  },
  headline: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: EASE.gentle },
    },
  },
  description: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE.smooth },
    },
  },
};

/**
 * Section Header Variants
 */
export const sectionHeaderVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE.smooth },
  },
};

/**
 * Button Hover Animations
 */
export const buttonHoverScale = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.98 },
};

export const arrowBounceAnimation = {
  x: [0, 4, 0],
};

export const arrowBounceTransition = {
  duration: 1.2,
  repeat: Infinity,
  repeatDelay: 2,
  ease: "easeInOut" as const,
};

/**
 * Performance viewport settings
 * Using margin to trigger animations before element is fully in view
 */
export const viewportSettings = {
  once: true,
  margin: "-80px",
};

export const viewportSettingsEager = {
  once: true,
  margin: "-150px",
};
