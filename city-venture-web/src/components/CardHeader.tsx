// src/components/Container.tsx
import React from "react";
import "./styles/container.css";
import Text from "./Text";

const themeVars: Record<string, string> = {
  "primary-color": "var(--primary-color)",
  "secondary-color": "var(--secondary-color)",
  "text-color": "var(--text-color)",
  "background-color": "var(--background-color)",
  white: "var(--white)",
  dark: "var(--dark)",
  gray: "var(--gray)",
  yellow: "var(--yellow)",
  orange: "var(--orange)",
  red: "var(--red)",
  "tab-background": "var(--tab-background)",
};

interface CardHeaderProps {
  width?: string;
  height?: string;
  radius?: string;
  padding?: string;
  title?: string;
  margin?: string
  bg?:
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
  color:
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
  style?: React.CSSProperties;
  variant?:
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
}

const CardHeader: React.FC<CardHeaderProps> = ({
  width,
  height = "30px",
  radius = 6,
  padding = "16px",
  title,
  style,
  variant = "header-title",
  bg = "primary-color",
  color,
  margin,
}) => {
  return (
    <div
      style={{
        backgroundColor: themeVars[bg],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        padding,
        width,
        height,
        borderRadius: radius,
        margin: margin,
        ...style,
      }}
    >
      <Text variant={variant} color={color}>
        {title}
      </Text>
    </div>
  );
};

export default CardHeader;
