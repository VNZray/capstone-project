import React from "react";
import * as FaIcons from "react-icons/fa";
import "./styles/Buttons.css";

type ButtonProps = {
  direction?: "row" | "column";
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "quartary"
    | "default"
    | "yellow"
    | "orange"
    | "cancel";
  gap?: number;
  color?: string;
  width?: string | number;
  height?: string | number;
  children?: React.ReactNode; // use children instead of Title prop
  iconName?: keyof typeof FaIcons;
  iconSize?: number;
  fontSize?: number | string;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
};

const Button: React.FC<ButtonProps> = ({
  children,
  iconName,
  color,
  direction = "row",
  variant = "default",
  gap = 5,
  iconSize = 16,
  width,
  height,
  fontSize = 10,
  onClick,
  disabled = false,
  style,
}) => {
  const IconComponent = iconName && (FaIcons[iconName] as React.ElementType);

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`pressable-button ${variant} ${disabled ? "disabled" : ""}`}
      style={{
        flexDirection: direction,
        gap,
        width,
        height,
        color: disabled ? "#ccc" : color,
        fontSize: typeof fontSize === "string" ? parseFloat(fontSize) : fontSize,
        ...style,
      }}
    >
      {IconComponent && <IconComponent size={iconSize} />}
      {children && <span className="button-text">{children}</span>}
    </button>
  );
};

export default Button;
