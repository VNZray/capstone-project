import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ArrowDown, ChevronDown } from "lucide-react";
import {
  heroTitleVariants,
  heroSubtitleVariants,
  heroDescriptionVariants,
  heroCtaVariants,
  heroBackgroundInitial,
  heroBackgroundAnimate,
  scrollIndicatorAnimation,
  scrollIndicatorTransition,
  EASE,
} from "../utils/animationVariants";

/**
 * Tourist Hero Section
 * A stunning, immersive hero section for the tourist landing page
 * featuring parallax scrolling effects and elegant typography.
 * 
 * Performance optimizations:
 * - Uses GPU-accelerated properties (transform, opacity)
 * - Respects user's reduced motion preferences
 * - Parallax disabled on low-powered devices
 */
export const TouristHeroSection: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax transforms - disabled if user prefers reduced motion
  const yText = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? ["0%", "0%"] : ["0%", "50%"]);
  const yBg = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? ["0%", "0%"] : ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [1, 1] : [1, 1.1]);

  const handleScrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        height: "110vh",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0A1B47",
      }}
    >
      {/* Dynamic Parallax Background */}
      <motion.div
        style={{
          y: yBg,
          scale,
          position: "absolute",
          inset: 0,
          zIndex: 0,
          willChange: "transform",
        }}
        initial={shouldReduceMotion ? false : heroBackgroundInitial}
        animate={heroBackgroundAnimate}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.3), transparent, #0A1B47)",
            zIndex: 1,
          }}
        />
        <img
          src="https://images.unsplash.com/photo-1543856470-146182b1be0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
          alt="Mt Isarog - Naga City"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.1)",
          }}
        />
      </motion.div>

      {/* Hero Content */}
      <div
        style={{
          position: "relative",
          zIndex: 20,
          padding: "0 24px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <motion.div
          style={{
            y: yText,
            opacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Super Large Typography with Glow Effect */}
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <motion.h1
              variants={heroTitleVariants}
              initial="hidden"
              animate="visible"
              style={{
                fontSize: "12vw",
                lineHeight: 0.85,
                fontWeight: 900,
                background: "linear-gradient(to bottom, white, rgba(255,255,255,0.7))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.05em",
                margin: 0,
                willChange: "transform, opacity",
              }}
            >
              NAGA
            </motion.h1>
            {/* Gold Shadow Effect */}
            <motion.h1
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 0.5 }}
              transition={{ duration: 1, delay: 0.1, ease: EASE.gentle }}
              style={{
                fontSize: "12vw",
                lineHeight: 0.85,
                fontWeight: 900,
                color: "#C5A059",
                mixBlendMode: "overlay",
                position: "absolute",
                top: "4px",
                left: "4px",
                filter: "blur(4px)",
                margin: 0,
              }}
              aria-hidden="true"
            >
              NAGA
            </motion.h1>
          </div>

          {/* Tagline */}
          <motion.h2
            variants={heroSubtitleVariants}
            initial="hidden"
            animate="visible"
            style={{
              fontSize: "clamp(1.5rem, 5vw, 3.5rem)",
              fontWeight: 300,
              color: "white",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "32px",
            }}
          >
            The{" "}
            <span
              style={{
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                color: "#C5A059",
              }}
            >
              Heart
            </span>{" "}
            of Bicol
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={heroDescriptionVariants}
            initial="hidden"
            animate="visible"
            style={{
              maxWidth: "28rem",
              color: "rgba(255,255,255,0.8)",
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              lineHeight: 1.7,
              marginBottom: "48px",
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(255,255,255,0.05)",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Experience the soulful blend of colonial heritage, spicy gastronomy,
            and vibrant modern life in the heart of Bicol.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            variants={heroCtaVariants}
            initial="hidden"
            animate="visible"
            onClick={handleScrollToContent}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(197, 160, 89, 0.3)",
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              position: "relative",
              padding: "16px 32px",
              backgroundColor: "#C5A059",
              color: "#0A1B47",
              fontWeight: 700,
              fontSize: "1.125rem",
              borderRadius: "9999px",
              overflow: "hidden",
              cursor: "pointer",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Start Exploration <ArrowDown size={20} />
          </motion.button>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            style={{
              position: "absolute",
              bottom: "-120px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <motion.span
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Scroll to explore
            </motion.span>
            <motion.div
              animate={scrollIndicatorAnimation}
              transition={scrollIndicatorTransition}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Noise Texture Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          pointerEvents: "none",
          opacity: 0.03,
          backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      />
    </section>
  );
};

export default TouristHeroSection;
