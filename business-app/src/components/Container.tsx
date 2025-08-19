// src/components/Container.tsx
import React from "react";
import "./styles/container.css";

interface ContainerProps {
  children: React.ReactNode;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  width?: string;
  height?: string;
  radius?: string;
  padding?: string;
  style?: React.CSSProperties;
  gap?: string;
  background?: string; // new prop
  direction?: "row" | "column";
}

const Container: React.FC<ContainerProps> = ({
  children,
  elevation = 0,
  className = "",
  width,
  height,
  radius,
  padding = "16px",
  style,
  gap = "16px",
  direction = "column",
  background,
}) => {
  const containerStyle: React.CSSProperties = {
    width,
    height,
    padding,
    borderRadius: radius,
    gap,
    backgroundColor: background,
    flexDirection: direction,
    display: "flex",
    ...style,
  };

  return (
    <div
      className={`container elevation-${elevation} ${className}`.trim()}
      style={containerStyle}
    >
      {children}
    </div>
  );
};

export default Container;
