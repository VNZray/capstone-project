import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, style }) => {
  return (
    <div style={{ padding: 20, ...style }} className="container">
      {children}
    </div>
  );
};

export default PageContainer;
