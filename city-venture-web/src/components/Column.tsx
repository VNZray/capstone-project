// src/components/Column.tsx
import React, { useContext } from "react";
import { ContainerContext } from "@/src/context/ContainerContext";

interface ColumnProps {
  children: React.ReactNode;
  size?: 1 | 2 | 3 | 4 | 5 | 6; // 6-unit system
  className?: string;
  style?: React.CSSProperties;
  backgroundColor?: string;
  gap?: string;
  padding?: string;
  direction?: "row" | "column";
  align?: "flex-start" | "center" | "flex-end" | "stretch";
  justifyContent?: string
}

const Column: React.FC<ColumnProps> = ({
  children,
  size = 1,
  className = "",
  style,
  backgroundColor,
  justifyContent,
  gap,
  padding,
  direction = "column",
  align = "flex-start",
}) => {
  const parentColumns = useContext(ContainerContext) || 6;
  const span = Math.ceil((size / 6) * parentColumns);

  return (
    <div
      className={`column ${className}`.trim()}
      style={{
        display: "flex",
        flexDirection: direction,
        alignItems: align,
        justifyContent,
        gap,
        padding,
        backgroundColor,
        gridColumn: `span ${span}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Column;
