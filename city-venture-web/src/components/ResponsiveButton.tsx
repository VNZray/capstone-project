
import React from "react";
import ResponsiveText from "./ResponsiveText";
import { colors } from "../utils/Colors";
import "./styles/responsiveButton.css";

interface ResponsiveButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  
  // Variants
  variant?: "solid" | "outlined" | "soft" | "plain";
  
  // Color options
  color?: keyof typeof colors;
  
  // Sizes
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  
  // Layout options
  fullWidth?: boolean;
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  radius?: string;
  
  // Icon options
  icon?: boolean;
  iconOnly?: boolean;
  isRounded?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  topIcon?: React.ReactNode;
  bottomIcon?: React.ReactNode;
  
  // Gradient option
  gradient?: boolean;
  
  // Hover effects
  hover?: boolean;
  hoverEffect?: "lift" | "glow" | "scale" | "highlight" | "shadow-expand";
  hoverDuration?: number;
  
  // Accessibility
  ariaLabel?: string;
  ariaDisabled?: boolean;
  type?: "button" | "submit" | "reset";
  
  // Style overrides
  className?: string;
  style?: React.CSSProperties;
}

const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = "solid",
  color = "primary",
  size = "md",
  fullWidth = false,
  width,
  height,
  padding,
  margin,
  radius,
  startIcon,
  endIcon,
  topIcon,
  bottomIcon,
  iconOnly = false,
  isRounded = false,
  gradient = false,
  hover = true,
  hoverEffect = "lift",
  hoverDuration = 300,
  ariaLabel,
  ariaDisabled,
  type = "button",
  className = "",
  style,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  // Get color value from color utility
  const colorValue = colors[color] || colors.primary;

  // Size configurations (responsive padding and text sizes)
  const sizeConfig = {
    xs: {
      padding: "6px 12px",
      textType: "label-small" as const,
      iconSize: 16,
      gap: 4,
    },
    sm: {
      padding: "8px 16px",
      textType: "label-medium" as const,
      iconSize: 18,
      gap: 6,
    },
    md: {
      padding: "12px 20px",
      textType: "body-small" as const,
      iconSize: 20,
      gap: 8,
    },
    lg: {
      padding: "14px 28px",
      textType: "body-medium" as const,
      iconSize: 22,
      gap: 10,
    },
    xl: {
      padding: "16px 32px",
      textType: "body-large" as const,
      iconSize: 24,
      gap: 12,
    },
  };

  const currentSize = sizeConfig[size];

  // Adjust padding and dimensions for iconOnly buttons
  const finalPadding = iconOnly ? "8px" : (padding || currentSize.padding);
  
  // For iconOnly, calculate square dimensions based on size
  const iconOnlyDimensions = iconOnly ? {
    width: size === "xs" ? "32px" : 
           size === "sm" ? "40px" : 
           size === "md" ? "48px" : 
           size === "lg" ? "56px" : "64px",
    height: size === "xs" ? "32px" : 
            size === "sm" ? "40px" : 
            size === "md" ? "48px" : 
            size === "lg" ? "56px" : "64px",
  } : {};

  // Helper function to darken color for hover
  const darkenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00ff) - amt);
    const B = Math.max(0, (num & 0x0000ff) - amt);
    return `#${(0x1000000 + (R < 256 ? R : 255) * 0x10000 + (G < 256 ? G : 255) * 0x100 + (B < 256 ? B : 255)).toString(16).slice(1)}`;
  };

  // Get button styles based on variant
  const getVariantStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      transition: `all ${hoverDuration}ms ease-in-out`,
      cursor: disabled || loading ? "not-allowed" : "pointer",
    };

    switch (variant) {
      case "solid":
        const hoverBg = darkenColor(colorValue, 10);
        return {
          ...baseStyles,
          backgroundColor: colorValue,
          color: "#ffffff",
          border: "none",
          ...(isHovered &&
            !disabled && {
              backgroundColor: hoverBg,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }),
        };

      case "outlined":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
          color: colorValue,
          border: `2px solid ${colorValue}`,
          ...(isHovered &&
            !disabled && {
              backgroundColor: `${colorValue}15`,
              color: colorValue,
            }),
        };

      case "soft":
        const softBg = `${colorValue}20`; // 20% opacity
        const softHoverBg = darkenColor(colorValue, 5) + "40"; // 25% opacity
        return {
          ...baseStyles,
          backgroundColor: softBg,
          color: colorValue,
          border: "none",
          ...(isHovered &&
            !disabled && {
              backgroundColor: softHoverBg,
            }),
        };

      case "plain":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
          color: colorValue,
          border: "none",
          fontWeight: 600,
          ...(isHovered &&
            !disabled && {
              backgroundColor: `${colorValue}10`,
            }),
        };

      default:
        return baseStyles;
    }
  };

  // Get hover effect styles
  const getHoverEffectStyles = (): React.CSSProperties => {
    if (!isHovered || !hover || disabled) return {};

    switch (hoverEffect) {
      case "lift":
        return {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.12)",
        };
      case "scale":
        return {
          transform: "scale(1.02)",
        };
      case "glow":
        return {
          boxShadow: `0 0 16px ${colorValue}60`,
        };
      case "shadow-expand":
        return {
          boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
          transform: "scale(1.01)",
        };
      default:
        return {};
    }
  };

  // Gradient background
  const gradientStyle = gradient
    ? {
        backgroundImage: `linear-gradient(to right, ${colorValue}, ${darkenColor(colorValue, 15)})`,
      }
    : {};

  // Determine layout direction based on icons
  const hasVerticalIcons = topIcon || bottomIcon;
  const direction = hasVerticalIcons ? "column" : "row";

  const buttonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: direction as "row" | "column",
    gap: `${currentSize.gap}px`,
    width: iconOnlyDimensions.width || (fullWidth ? "100%" : width),
    height: iconOnlyDimensions.height || height,
    padding: finalPadding,
    margin,
    borderRadius: isRounded ? "50%" : (radius || "8px"),
    fontFamily: "Poppins, sans-serif",
    fontWeight: 500,
    border: "none",
    outline: "none",
    opacity: disabled || loading ? 0.6 : 1,
    pointerEvents: disabled || loading ? "none" : "auto",
    position: "relative",
    ...getVariantStyles(),
    ...(gradient && gradientStyle),
    ...(isFocused && {
      outline: `3px solid ${colorValue}60`,
      outlineOffset: "2px",
    }),
    ...(isActive && {
      transform: "scale(0.98)",
    }),
    ...getHoverEffectStyles(),
    ...style,
  };

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const handleMouseDown = () => {
    setIsActive(true);
  };

  const handleMouseUp = () => {
    setIsActive(false);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="button-loader">
          <span className="spinner"></span>
        </div>
      );
    }

    // For iconOnly mode, render only the icon
    if (iconOnly) {
      return (
        <>
          {startIcon && <span className="button-icon start-icon">{startIcon}</span>}
          {topIcon && <span className="button-icon top-icon">{topIcon}</span>}
          {bottomIcon && <span className="button-icon bottom-icon">{bottomIcon}</span>}
          {endIcon && <span className="button-icon end-icon">{endIcon}</span>}
        </>
      );
    }

    // Determine text color based on variant and hover state
    let textColor = colorValue;
    let isResponsive = true;
    
    if (variant === "solid") {
      textColor = "#ffffff";
      isResponsive = true;
    } else if (variant === "outlined") {
      textColor = colorValue;
      isResponsive = false;
      // On hover, keep the same color as the button color
      if (isHovered && !disabled) {
        textColor = colorValue;
      }
    } else if (variant === "plain") {
      isResponsive = false;
    }

    return (
      <>
        {startIcon && <span className="button-icon start-icon">{startIcon}</span>}
        {topIcon && <span className="button-icon top-icon">{topIcon}</span>}
        
        {children && (
          <ResponsiveText responsive={isResponsive}
            type={currentSize.textType}
            weight="semi-bold"
            color={textColor}
            style={{ pointerEvents: "none" }}
          >
            {children}
          </ResponsiveText>
        )}

        {bottomIcon && <span className="button-icon bottom-icon">{bottomIcon}</span>}
        {endIcon && <span className="button-icon end-icon">{endIcon}</span>}
      </>
    );
  };

  return (
    <button
      type={type}
      style={buttonStyle}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-disabled={ariaDisabled || disabled}
      className={`responsive-button ${className}`.trim()}
    >
      {renderContent()}
    </button>
  );
};

export default ResponsiveButton;