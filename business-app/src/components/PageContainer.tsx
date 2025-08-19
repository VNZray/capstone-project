import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, style }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 20,
        flex: 1,
        ...style,
        gap: 20,
      }}
    >
      {children}
    </div>
  );
};

export default PageContainer;
