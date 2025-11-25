// src/components/Container.tsx
import React from "react";
import "./styles/container.css";

interface ContainerProps {
  children: React.ReactNode;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  align?:
    | string
    | "flex-start"
    | "center"
    | "flex-end"
    | "stretch"
    | "baseline";
  justify?:
    | string
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around";
  className?: string;
  width?: string;
  height?: string;
  radius?: string;
  padding?: string;
  style?: React.CSSProperties;
  gap?: string;
  background?: string;
  direction?: "row" | "column";
  opacity?: number;
  flex?: number;

  // Hover effects
  hover?: boolean;
  hoverEffect?: "lift" | "glow" | "scale" | "highlight" | "shadow-expand";
  hoverBackground?: string;
  hoverScaleAmount?: number; // 0.95 to 1.1, default 1.05
  hoverDuration?: number; // in ms, default 300

  // Animation
  animation?:
    | "fade-in"
    | "slide-up"
    | "slide-down"
    | "slide-left"
    | "slide-right"
    | "zoom-in"
    | "bounce"
    | "pulse";
  animationDuration?: number; // in ms, default 500
  animationDelay?: number; // in ms, default 0

  // Interaction
  cursor?: "pointer" | "default" | "grab" | "text";
  disabled?: boolean;
  position?: "relative" | "absolute" | "fixed" | "sticky";
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDoubleClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnterProp?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeaveProp?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  id?: string;
}

const Container: React.FC<ContainerProps> = ({
  id,
  children,
  elevation = 0,
  className = "",
  width,
  height,
  radius,
  padding = "clamp(0.75rem, 2vw + 0.25rem, 1rem)",
  style,
  gap = "clamp(0.5rem, 1.5vw + 0.25rem, 1rem)",
  direction = "column",
  background = "transparent",
  opacity = 1,
  align,
  justify,
  hover = false,
  hoverEffect = "lift",
  hoverBackground,
  hoverScaleAmount = 1.02,
  hoverDuration = 300,
  animation,
  animationDuration = 500,
  animationDelay = 0,
  cursor = "default",
  disabled = false,
  onClick,
  onDoubleClick,
  onContextMenu,
  onMouseEnterProp,
  onMouseLeaveProp,
  onKeyDown,
  position = "relative",
  flex,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  // Generate animation CSS
  const getAnimationCSS = (): React.CSSProperties => {
    if (!animation) return {};

    const animationName = `animation-${animation}`;
    return {
      animation: `${animationName} ${animationDuration}ms ease-in-out ${animationDelay}ms forwards`,
    };
  };

  // Get hover styles based on hoverEffect
  const getHoverStyles = (): React.CSSProperties => {
    if (!isHovered || !hover) return {};

    const baseHoverStyles: React.CSSProperties = {
      transition: `all ${hoverDuration}ms ease-in-out`,
      cursor,
    };

    switch (hoverEffect) {
      case "lift":
        return {
          ...baseHoverStyles,
          transform: "translateY(-8px)",
          boxShadow: "0 0px 24px rgba(0, 0, 0, 0.25)",
        };
      case "glow":
        return {
          ...baseHoverStyles,
          boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
        };
      case "scale":
        return {
          ...baseHoverStyles,
          transform: `scale(${hoverScaleAmount})`,
        };
      case "highlight":
        return {
          ...baseHoverStyles,
          backgroundColor: hoverBackground,
        };
      case "shadow-expand":
        return {
          ...baseHoverStyles,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
          transform: "scale(1.02)",
        };
      default:
        return baseHoverStyles;
    }
  };

  const containerStyle: React.CSSProperties = {
    width,
    height,
    padding,
    flex,
    borderRadius: radius,
    gap,
    backgroundColor: background,
    flexDirection: direction,
    display: "flex",
    alignItems: align,
    justifyContent: justify,
    opacity,
    position,
    cursor: disabled ? "not-allowed" : cursor,
    ...(hover &&
      !isHovered && { transition: `all ${hoverDuration}ms ease-in-out` }),
    ...getHoverStyles(),
    ...getAnimationCSS(),
    ...style,
  };

  return (
    <>
      <style>{`
        @keyframes animation-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes animation-slide-up {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes animation-slide-down {
          from { 
            opacity: 0;
            transform: translateY(-30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes animation-slide-left {
          from { 
            opacity: 0;
            transform: translateX(30px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes animation-slide-right {
          from { 
            opacity: 0;
            transform: translateX(-30px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes animation-zoom-in {
          from { 
            opacity: 0;
            transform: scale(0.8);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes animation-bounce {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-10px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-5px); }
        }
        
        @keyframes animation-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      <div
        id={id}
        className={`container elevation-${elevation} ${className}`.trim()}
        style={containerStyle}
        onMouseEnter={(e) => {
          setIsHovered(true);
          onMouseEnterProp?.(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          onMouseLeaveProp?.(e);
        }}
        onClick={!disabled ? onClick : undefined}
        onDoubleClick={!disabled ? onDoubleClick : undefined}
        onContextMenu={!disabled ? onContextMenu : undefined}
        onKeyDown={!disabled ? onKeyDown : undefined}
        tabIndex={onClick || onDoubleClick || onKeyDown ? 0 : undefined}
      >
        {children}
      </div>
    </>
  );
};

export default Container;
