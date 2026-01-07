import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  padding?: string | number;
  gap?: string | number;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  style,
  padding = "clamp(0.75rem, 2vw + 0.25rem, 1rem)",
  gap = "clamp(1rem, 2vw + 0.5rem, 1.25rem)",
  className = "",
  id,
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
      className={className}
      id={id}
    >
      {children}
    </div>
  );
};

export default PageContainer;
