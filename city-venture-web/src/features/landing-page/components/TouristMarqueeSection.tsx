import React from "react";
import { motion, useReducedMotion } from "motion/react";

interface MarqueeItemProps {
  children: React.ReactNode;
  speed?: number;
}

const MarqueeItem: React.FC<MarqueeItemProps> = ({ children, speed = 20 }) => {
  const shouldReduceMotion = useReducedMotion();

  // For reduced motion: still animate but much slower, or use CSS animation
  // which some screen readers handle better
  const animationSpeed = shouldReduceMotion ? speed * 3 : speed;

  return (
    <div
      style={{
        display: "flex",
        overflow: "hidden",
        whiteSpace: "nowrap",
        padding: "14px 0",
        backgroundColor: "#C5A059",
        color: "#0A1B47",
      }}
    >
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{ 
          duration: animationSpeed, 
          repeat: Infinity, 
          ease: "linear",
          repeatType: "loop",
        }}
        style={{
          display: "flex",
          gap: "32px",
          fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          willChange: "transform",
        }}
      >
        {children}
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  );
};

/**
 * Tourist Marquee Section
 * An animated scrolling marquee showcasing Naga City highlights
 * with smooth, performance-optimized animation
 */
export const TouristMarqueeSection: React.FC = () => {
  const marqueeItems = (
    <>
      <span style={{ margin: "0 16px" }}>Pilgrim City</span>
      <span style={{ margin: "0 8px" }}>•</span>
      <span style={{ margin: "0 16px", color: "white" }}>Maogma</span>
      <span style={{ margin: "0 8px" }}>•</span>
      <span style={{ margin: "0 16px" }}>Adventure</span>
      <span style={{ margin: "0 8px" }}>•</span>
      <span style={{ margin: "0 16px", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
        Bicol Express
      </span>
      <span style={{ margin: "0 8px" }}>•</span>
      <span style={{ margin: "0 16px" }}>Mt. Isarog</span>
      <span style={{ margin: "0 8px" }}>•</span>
    </>
  );

  return (
    <section
      style={{
        position: "relative",
        zIndex: 30,
        marginTop: "-40px",
        transform: "rotate(1deg)",
        backgroundColor: "#C5A059",
      }}
    >
      <MarqueeItem speed={30}>{marqueeItems}</MarqueeItem>
    </section>
  );
};

export default TouristMarqueeSection;
