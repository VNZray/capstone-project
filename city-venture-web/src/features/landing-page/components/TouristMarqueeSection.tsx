import React from "react";
import { motion } from "motion/react";

interface MarqueeItemProps {
  children: React.ReactNode;
  speed?: number;
}

const MarqueeItem: React.FC<MarqueeItemProps> = ({ children, speed = 20 }) => {
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
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        style={{
          display: "flex",
          gap: "32px",
          fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
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
