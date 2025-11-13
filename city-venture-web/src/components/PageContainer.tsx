import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  padding?: string | number;
  gap?: string | number;
  style?: React.CSSProperties;
}

const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  style, 
  padding = "clamp(0.75rem, 2vw + 0.25rem, 1rem)", 
  gap = "clamp(1rem, 2vw + 0.5rem, 1.25rem)" 
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: padding,
        flex: 1,
        ...style,
        gap: gap,
      }}
    >
      {children}
    </div>
  );
};

export default PageContainer;
