import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  padding?: string | number;
  gap?: string | number;
  style?: React.CSSProperties;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, style, padding, gap = "20px" }) => {
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
