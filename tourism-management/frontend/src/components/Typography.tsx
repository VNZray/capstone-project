import { Typography as JoyTypography } from "@mui/joy";
import type { TypographyProps } from "@mui/joy";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { colors } from "../utils/Colors";

// Type Definitions
type TypographyVariant =
  | "title"
  | "header"
  | "label"
  | "cardTitle"
  | "cardSubTitle"
  | "body";
type TypographySize = "xs" | "sm" | "normal" | "md" | "lg";
type TypographyWeight = "thin" | "normal" | "semibold" | "bold" | "black";
type TypographyStyle = "normal" | "italic" | "underline" | "crossed";
type TypographyAlign = "left" | "center" | "right";
type TypographyColor =
  | "primary"
  | "secondary"
  | "error"
  | "warning"
  | "info"
  | "success"
  | "default";

interface CustomTypographyProps
  extends Omit<
    TypographyProps,
    "color" | "variant" | "size" | "weight" | "style"
  > {
  children: ReactNode;
  variant?: TypographyVariant;
  size?: TypographySize;
  weight?: TypographyWeight;
  style?: TypographyStyle | undefined;
  align?: TypographyAlign;
  color?: TypographyColor;
  className?: string;
}

// Responsive font size mapping
const getFontSize = (
  variant: TypographyVariant,
  size: TypographySize
): CSSProperties => {
  const sizeMap = {
    title: {
      xs: {
        fontSize: "clamp(1.5rem, 4vw, 2rem)", // 24px - 32px
        fontWeight: getFontWeight("semibold"),
      },
      sm: {
        fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)", // 28px - 40px
        fontWeight: getFontWeight("semibold"),
      },
      normal: {
        fontSize: "clamp(2rem, 5vw, 3rem)", // 32px - 48px
        fontWeight: getFontWeight("semibold"),
      },
      md: {
        fontSize: "clamp(2.5rem, 6vw, 3.5rem)", // 40px - 56px
        fontWeight: getFontWeight("semibold"),
      },
      lg: {
        fontSize: "clamp(3rem, 7vw, 4.5rem)", // 48px - 72px
        fontWeight: getFontWeight("semibold"),
      },
    },
    header: {
      xs: {
        fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)", // 18px - 24px
        fontWeight: getFontWeight("semibold"),
      },
      sm: {
        fontSize: "clamp(1.25rem, 3vw, 1.75rem)", // 20px - 28px
        fontWeight: getFontWeight("semibold"),
      },
      normal: {
        fontSize: "clamp(1.5rem, 3.5vw, 2rem)", // 24px - 32px
        fontWeight: getFontWeight("semibold"),
      },
      md: {
        fontSize: "clamp(1.75rem, 4vw, 2.25rem)", // 28px - 36px
        fontWeight: getFontWeight("semibold"),
      },
      lg: {
        fontSize: "clamp(2rem, 4.5vw, 2.75rem)", // 32px - 44px
        fontWeight: getFontWeight("semibold"),
      },
    },
    label: {
      xs: {
        fontSize: "clamp(0.625rem, 1.5vw, 0.75rem)", // 10px - 12px
        fontWeight: getFontWeight("semibold"),
      },
      sm: {
        fontSize: "clamp(0.75rem, 2vw, 0.875rem)", // 12px - 14px
        fontWeight: getFontWeight("semibold"),
      },
      normal: {
        fontSize: "clamp(0.875rem, 2.25vw, 1rem)", // 14px - 16px
        fontWeight: getFontWeight("semibold"),
      },
      md: {
        fontSize: "clamp(1rem, 2.5vw, 1.125rem)", // 16px - 18px
        fontWeight: getFontWeight("semibold"),
      },
      lg: {
        fontSize: "clamp(1.125rem, 3vw, 1.25rem)", // 18px - 20px
        fontWeight: getFontWeight("semibold"),
      },
    },
    cardTitle: {
      xs: {
        fontSize: "clamp(0.875rem, 2vw, 1rem)", // 14px - 16px
        fontWeight: getFontWeight("semibold"),
      },
      sm: {
        fontSize: "clamp(1rem, 2.5vw, 1.25rem)", // 16px - 20px
        fontWeight: getFontWeight("semibold"),
      },
      normal: {
        fontSize: "clamp(1.125rem, 3vw, 1.5rem)", // 18px - 24px
        fontWeight: getFontWeight("semibold"),
      },
      md: {
        fontSize: "clamp(1.25rem, 3.5vw, 1.75rem)", // 20px - 28px
        fontWeight: getFontWeight("semibold"),
      },
      lg: {
        fontSize: "clamp(1.5rem, 4vw, 2rem)", // 24px - 32px
        fontWeight: getFontWeight("semibold"),
      },
    },
    cardSubTitle: {
      xs: { fontSize: "clamp(0.75rem, 1.75vw, 0.875rem)" }, // 12px - 14px
      sm: { fontSize: "clamp(0.8125rem, 2vw, 1rem)" }, // 13px - 16px
      normal: { fontSize: "clamp(0.875rem, 2.25vw, 1.125rem)" }, // 14px - 18px
      md: { fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }, // 16px - 20px
      lg: { fontSize: "clamp(1.125rem, 3vw, 1.5rem)" }, // 18px - 24px
    },
    body: {
      xs: { fontSize: "clamp(0.75rem, 2vw, 0.75rem)" }, // 12px
      sm: { fontSize: "clamp(0.875rem, 2.25vw, 0.875rem)" }, // 14px
      normal: { fontSize: "clamp(1rem, 2.5vw, 1rem)" }, // 16px
      md: { fontSize: "clamp(1.125rem, 3vw, 1.125rem)" }, // 18px
      lg: { fontSize: "clamp(1.25rem, 3.5vw, 1.25rem)" }, // 20px
    },
  };

  return sizeMap[variant][size];
};

// Font weight mapping
const getFontWeight = (weight: TypographyWeight): number => {
  const weightMap = {
    thin: 100,
    normal: 400,
    semibold: 600,
    bold: 700,
    black: 900,
  };
  return weightMap[weight];
};

// Font style mapping
const getFontStyle = (style: TypographyStyle): CSSProperties => {
  const styleMap = {
    normal: {},
    italic: { fontStyle: "italic" },
    underline: { textDecoration: "underline" },
    crossed: { textDecoration: "line-through" },
  };
  return styleMap[style];
};

// Color mapping with dark mode support
const getColor = (
  color: TypographyColor,
  darkMode: boolean = false
): string => {
  const colorMap = {
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
    success: colors.success,
    default: darkMode ? colors.white : colors.black,
  };
  return colorMap[color];
};

// Utility function to calculate luminance of a color
const getLuminance = (color: string): number => {
  // Remove # if present
  const hex = color.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const [rLinear, gLinear, bLinear] = [r, g, b].map((val) =>
    val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  );

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

// Utility function to check if a color is dark
const isDarkColor = (color: string): boolean => {
  if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") {
    return false;
  }

  // Handle rgb/rgba format
  if (color.startsWith("rgb")) {
    const matches = color.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const r = parseInt(matches[0]) / 255;
      const g = parseInt(matches[1]) / 255;
      const b = parseInt(matches[2]) / 255;

      const [rLinear, gLinear, bLinear] = [r, g, b].map((val) =>
        val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      );

      const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
      return luminance < 0.5;
    }
  }

  // Handle hex format
  if (color.startsWith("#")) {
    return getLuminance(color) < 0.5;
  }

  // Default to false for unknown formats
  return false;
};

// Hook to detect parent background color
const useParentBackgroundColor = (
  elementRef: React.RefObject<HTMLElement | null>
): boolean => {
  const [isParentDark, setIsParentDark] = useState(false);

  useEffect(() => {
    if (!elementRef.current) return;

    const detectParentBackground = () => {
      let element = elementRef.current?.parentElement;

      // Traverse up the DOM tree to find a non-transparent background
      while (element) {
        const style = window.getComputedStyle(element);
        const bgColor = style.backgroundColor;

        if (
          bgColor &&
          bgColor !== "transparent" &&
          bgColor !== "rgba(0, 0, 0, 0)"
        ) {
          const isDark = isDarkColor(bgColor);
          setIsParentDark(isDark);
          return;
        }

        element = element.parentElement;
      }

      // Default to light background if no background found
      setIsParentDark(false);
    };

    // Initial detection
    detectParentBackground();

    // Use MutationObserver to detect style changes in real-time
    const observer = new MutationObserver(() => {
      // Use requestAnimationFrame for immediate visual updates
      requestAnimationFrame(() => {
        detectParentBackground();
      });
    });

    // Observe the entire document body for any changes
    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['style', 'class'],
        subtree: true, // Watch all descendants
        childList: false,
      });
    }

    // Also observe direct parent chain for faster response
    let element = elementRef.current?.parentElement;
    while (element && element !== document.body) {
      observer.observe(element, {
        attributes: true,
        attributeFilter: ['style', 'class'],
        subtree: false,
      });
      element = element.parentElement;
    }

    // Listen for CSS transitions/animations completing
    const handleTransitionEnd = () => {
      requestAnimationFrame(detectParentBackground);
    };

    elementRef.current?.parentElement?.addEventListener('transitionend', handleTransitionEnd);
    elementRef.current?.parentElement?.addEventListener('animationend', handleTransitionEnd);

    return () => {
      observer.disconnect();
      elementRef.current?.parentElement?.removeEventListener('transitionend', handleTransitionEnd);
      elementRef.current?.parentElement?.removeEventListener('animationend', handleTransitionEnd);
    };
  }, []);

  return isParentDark;
};

// Base Typography Component
const BaseTypography = ({
  children,
  variant = "body",
  size = "sm",
  weight = "normal",
  style = "normal",
  align = "left",
  color = "default",
  className,
  sx,
  ...props
}: CustomTypographyProps) => {
  const typographyRef = useRef<HTMLSpanElement>(null);
  const isParentDark = useParentBackgroundColor(typographyRef);

  // Use parent background detection for default color, otherwise use specified color
  const shouldAdaptToParent = color === "default";
  const finalColor = shouldAdaptToParent
    ? isParentDark
      ? colors.white
      : colors.black
    : getColor(color, false);

  const customStyles: CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: getFontWeight(weight),
    textAlign: align,
    color: finalColor,
    lineHeight: variant === "title" ? 1.2 : variant === "header" ? 1.3 : 1.5,
    ...getFontSize(variant, size),
    ...getFontStyle(style),
  };

  // Map variant to Joy UI level
  const getLevelFromVariant = (variant: TypographyVariant) => {
    const levelMap = {
      title: "h1",
      header: "h2",
      cardTitle: "h3",
      cardSubTitle: "h4",
      label: "body-sm",
      body: "body-sm",
    };
    return levelMap[variant] as TypographyProps["level"];
  };

  // Allow component prop to override semantic element
  const componentProp = props.component || undefined;

  return (
    <JoyTypography
      ref={typographyRef}
      level={getLevelFromVariant(variant)}
      component={componentProp}
      className={className}
      sx={{
        ...customStyles,
        ...sx,
      }}
      {...props}
    >
      {children}
    </JoyTypography>
  );
};

// Individual Component Variants
const Title = (props: Omit<CustomTypographyProps, "variant">) => (
  <BaseTypography variant="title" weight="bold" {...props} />
);

const Header = (props: Omit<CustomTypographyProps, "variant">) => (
  <BaseTypography variant="header" weight="bold" {...props} />
);

const CardTitle = (props: Omit<CustomTypographyProps, "variant">) => (
  <BaseTypography variant="cardTitle" weight="bold" {...props} />
);

const CardSubTitle = (props: Omit<CustomTypographyProps, "variant">) => (
  <BaseTypography variant="cardSubTitle" {...props} />
);

const Label = (props: Omit<CustomTypographyProps, "variant">) => (
  <BaseTypography variant="label" weight="bold" {...props} />
);

const Body = (props: Omit<CustomTypographyProps, "variant">) => (
  <BaseTypography variant="body" {...props} />
);

export default {
  Title,
  Header,
  CardTitle,
  CardSubTitle,
  Label,
  Body,
  Base: BaseTypography,
};

export type {
  CustomTypographyProps,
  TypographyVariant,
  TypographySize,
  TypographyWeight,
  TypographyStyle,
  TypographyAlign,
  TypographyColor,
};
