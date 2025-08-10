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
}

const Container: React.FC<ContainerProps> = ({
  children,
  elevation = 0,
  className = "",
  width,
  height,
  radius,
  padding = "16px",
}) => {
  return (
    <div
      className={`container elevation-${elevation} ${className}`.trim()}
      style={{
        padding,
        width,
        height,
        borderRadius: radius,
      }}
    >
      {children}
    </div>
  );
};

export default Container;
