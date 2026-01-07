import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown } from "lucide-react";

/**
 * Tourist Hero Section
 * A stunning, immersive hero section for the tourist landing page
 * featuring parallax scrolling effects and elegant typography.
 */
export const TouristHeroSection: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
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
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
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
              }}
            >
              NAGA
            </motion.h1>
            {/* Gold Shadow Effect */}
            <motion.h1
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: "12vw",
                lineHeight: 0.85,
                fontWeight: 900,
                color: "#C5A059",
                mixBlendMode: "overlay",
                position: "absolute",
                top: "4px",
                left: "4px",
                opacity: 0.5,
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
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
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
            onClick={handleScrollToContent}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
