import React from "react";
import { motion } from "motion/react";

/**
 * Tourist Intro/Manifesto Section
 * A welcoming section that sets the tone for exploring Naga City
 */
export const TouristIntroSection: React.FC = () => {
  return (
    <section
      style={{
        padding: "128px 24px",
        backgroundColor: "#F5F5F7",
      }}
    >
      <div
        style={{
          maxWidth: "56rem",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Welcome Tag */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            color: "#C5A059",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
            marginBottom: "24px",
          }}
        >
          Welcome to Maogma
        </motion.p>

        {/* Main Headline */}
        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: "clamp(2rem, 5vw, 3.75rem)",
            fontWeight: 300,
            color: "#0A1B47",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          More than a destination,{" "}
          <br />
          <span style={{ fontWeight: 700 }}>Naga City</span> is a feeling.
        </motion.h3>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{
            marginTop: "32px",
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: "#6b7280",
            maxWidth: "42rem",
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.7,
          }}
        >
          Immerse yourself in a city that dances to the rhythm of faith, flavor,
          and festivity. Your journey into the heart of Bicol begins here.
        </motion.p>
      </div>
    </section>
  );
};

export default TouristIntroSection;
