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
  padding?: string | number;
  icon?: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({
  children,
  color,
  direction = "row",
  variant = "default",
  gap = 5,
  width,
  height,
  fontSize = 10,
  onClick,
  padding,
  disabled = false,
  icon,
  style,
}) => {

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
        padding,

        color: disabled ? "#ccc" : color,
        fontSize:
          typeof fontSize === "string" ? parseFloat(fontSize) : fontSize,
        ...style,
      }}
    >
      {icon && <span className="sidebar-icon">{icon}</span>}
      {children && <span className="button-text">{children}</span>}
    </button>
  );
};

export default Button;
