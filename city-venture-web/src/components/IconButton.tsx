import React from "react";
import ResponsiveButton from "./ResponsiveButton";
import { colors } from "../utils/Colors";

interface IconButtonProps {
  // Icon
  icon: React.ReactNode;
  
  // Styling
  color?: keyof typeof colors;
  variant?: "solid" | "outlined" | "soft" | "plain";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  
  // Shape
  isRounded?: boolean;
  
  // Interaction
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  
  // Hover effects
  hover?: boolean;
  hoverEffect?: "lift" | "glow" | "scale" | "highlight" | "shadow-expand";
  hoverDuration?: number;
  
  // Accessibility
  ariaLabel: string;
  ariaDisabled?: boolean;
  type?: "button" | "submit" | "reset";
  
  // Style overrides
  className?: string;
  style?: React.CSSProperties;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  color = "primary",
  variant = "solid",
  size = "md",
  isRounded = false,
  onClick,
  disabled = false,
  loading = false,
  hover = true,
  hoverEffect = "lift",
  hoverDuration = 300,
  ariaLabel,
  ariaDisabled,
  type = "button",
  className = "",
  style,
}) => {
  return (
    <ResponsiveButton
      iconOnly={true}
      isRounded={isRounded}
      startIcon={icon}
      color={color}
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      hover={hover}
      hoverEffect={hoverEffect}
      hoverDuration={hoverDuration}
      ariaLabel={ariaLabel}
      ariaDisabled={ariaDisabled}
      type={type}
      className={className}
      style={style}
    />
  );
};

export default IconButton;
