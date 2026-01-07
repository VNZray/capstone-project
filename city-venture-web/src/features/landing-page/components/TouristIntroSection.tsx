import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  introVariants,
  viewportSettings,
  EASE,
} from "../utils/animationVariants";

/**
 * Tourist Intro/Manifesto Section
 * A welcoming section that sets the tone for exploring Naga City
 * with elegant staggered text animations
 */
export const TouristIntroSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      style={{
        padding: "128px 24px",
        backgroundColor: "#F5F5F7",
      }}
    >
      <motion.div
        variants={introVariants.container}
        initial="hidden"
        whileInView="visible"
        viewport={viewportSettings}
        style={{
          maxWidth: "56rem",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Welcome Tag with fade-in */}
        <motion.p
          variants={introVariants.welcome}
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

        {/* Main Headline with staggered word reveal */}
        <motion.h3
          variants={introVariants.headline}
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
          <motion.span 
            style={{ fontWeight: 700, display: "inline-block" }}
            whileHover={shouldReduceMotion ? undefined : { 
              color: "#C5A059",
              scale: 1.02,
            }}
            transition={{ duration: 0.2 }}
          >
            Naga City
          </motion.span>{" "}
          is a feeling.
        </motion.h3>

        {/* Description with delayed fade */}
        <motion.p
          variants={introVariants.description}
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

        {/* Decorative animated line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE.smooth }}
          style={{
            marginTop: "48px",
            height: "2px",
            width: "80px",
            backgroundColor: "#C5A059",
            marginLeft: "auto",
            marginRight: "auto",
            transformOrigin: "center",
          }}
        />
      </motion.div>
    </section>
  );
};

export default TouristIntroSection;
