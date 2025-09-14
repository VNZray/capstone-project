// src/components/Label.tsx
import React from "react";

interface RowProps {
  children: React.ReactNode;
  align?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline"; // Cross-axis alignment
  justify?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly"; // Main-axis alignment
  gap?: string; // Space between items
  className?: string;
  style?: React.CSSProperties;
  margin?: string
}

const Label: React.FC<RowProps> = ({
  children,
  align = "flex-start",
  justify = "flex-start",
  gap = "6px",
  className = "",
  margin,
  style,
}) => {
  return (
    <div
      className={`row ${className}`.trim()}
      style={{
        display: "flex",
        flexDirection: "row",
        flex: 1,
        alignItems: align,
        justifyContent: justify,
        gap,
        margin,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Label;
