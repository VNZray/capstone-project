// src/components/Text.tsx
import React from "react";
import "@/global.css";

type TextVariant =
  | "title"
  | "sub-title"
  | "paragraph"
  | "card-title"
  | "card-sub-title"
  | "normal"
  | "bold"
  | "medium"
  | "label"
  | "header-title"
  | "header-email"
  | "header-name";

type ColorVariant =
  | "primary-color"
  | "secondary-color"
  | "text-color"
  | "background-color"
  | "white"
  | "dark"
  | "gray"
  | "yellow"
  | "orange"
  | "red"
  | "tab-background";

interface TextProps {
  variant?: TextVariant;
  color?: ColorVariant;
  className?: string;
  children: React.ReactNode;
    style?: React.CSSProperties;
  
}

const Text: React.FC<TextProps> = ({
  variant = "normal",
  color = "text-color",
  className = "",
  children,
  style
}) => {
  return (
    <span
      className={`text ${variant} ${className}`.trim()}
      style={{ color: `var(--${color})`, ...style } }
    >
      {children}
    </span>
  );
};

export default Text;
