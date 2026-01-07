import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Download,
  QrCode,
  Ticket,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Button from "@/src/components/Button";
import type { LucideIcon } from "lucide-react";
import sampleMobileImage from "@/src/assets/images/sample-mobile.png";
import {
  phoneVariants,
  phoneFloatAnimation,
  floatingCardVariants,
  downloadButtonVariants,
  sectionHeaderVariants,
  viewportSettings,
  EASE,
} from "../utils/animationVariants";

interface FloatingCardProps {
  icon: LucideIcon;
  text: string;
  className?: string;
  delay?: number;
}

/**
 * FloatingCard Component
 * A floating notification card that orbits around the phone mockup
 */
const FloatingCard: React.FC<FloatingCardProps> = ({
  icon: Icon,
  text,
  className = "",
  delay = 0,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      custom={delay}
      variants={floatingCardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={shouldReduceMotion ? undefined : { 
        scale: 1.05,
        y: -5,
      }}
      transition={{ duration: 0.2 }}
      style={{
        position: "absolute",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        padding: "16px",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
        zIndex: 20,
        willChange: "transform, opacity",
      }}
      className={className}
    >
      <motion.div
        whileHover={{ rotate: 10 }}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "#0A1B47",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#C5A059",
        }}
      >
        <Icon size={18} />
      </motion.div>
      <span
        style={{
          color: "#0A1B47",
          fontWeight: 700,
          fontSize: "14px",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
    </motion.div>
  );
};

/**
 * PhoneMockup Component
 * Displays a phone mockup with the sample mobile app screenshot
 * with floating animation
 */
const PhoneMockup: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={phoneVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      animate={shouldReduceMotion ? undefined : phoneFloatAnimation}
      whileHover={{ scale: 1.02, rotateY: 5 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "relative",
        zIndex: 10,
        width: "320px",
        height: "650px",
        backgroundColor: "#0A1B47",
        borderRadius: "48px",
        border: "12px solid #1a2b5e",
        boxShadow: "0 50px 100px -20px rgba(10, 27, 71, 0.35)",
        overflow: "hidden",
        willChange: "transform",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Phone notch/dynamic island */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "120px",
          height: "32px",
          backgroundColor: "#000",
          borderRadius: "20px",
          zIndex: 50,
        }}
      />

      {/* App Screenshot with subtle zoom on view */}
      <motion.img
        src={sampleMobileImage}
        alt="City Venture Mobile App"
        initial={{ scale: 1.1 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: EASE.smooth }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top",
        }}
      />

      {/* Shine effect overlay */}
      <motion.div
        initial={{ x: "-100%", opacity: 0 }}
        whileInView={{ x: "200%", opacity: 0.3 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
          transform: "skewX(-20deg)",
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
};

/**
 * TouristAppDownloadSection
 * A light-themed section promoting the mobile app download
 * with a phone mockup, floating notification cards, and engaging animations
 */
const TouristAppDownloadSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="app-download"
      style={{
        position: "relative",
        padding: "48px 0",
        overflow: "hidden",
        backgroundColor: "#FAFAFA",
      }}
    >
      {/* Dynamic Light Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* Soft Golden Glow center - animated pulse */}
        <motion.div
          animate={shouldReduceMotion ? undefined : {
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px",
            height: "800px",
            backgroundColor: "rgba(197, 160, 89, 0.2)",
            borderRadius: "50%",
            filter: "blur(120px)",
          }}
        />

        {/* Decorative circles - continuous rotation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "900px",
            height: "900px",
            border: "1px dashed rgba(10, 27, 71, 0.05)",
            borderRadius: "50%",
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "700px",
            height: "700px",
            border: "1px solid rgba(197, 160, 89, 0.2)",
            borderRadius: "50%",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "50%",
            height: "100%",
            background: "linear-gradient(to left, white, transparent)",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "50%",
            height: "100%",
            background: "linear-gradient(to right, white, transparent)",
            opacity: 0.8,
          }}
        />
      </div>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Header Content with staggered animations */}
        <motion.div
          variants={sectionHeaderVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: "64px",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE.smooth }}
            style={{ position: "relative" }}
          >
            <h2
              style={{
                fontSize: "clamp(48px, 12vw, 84px)",
                lineHeight: 0.8,
                fontWeight: 900,
                color: "rgba(10, 27, 71, 0.05)",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                userSelect: "none",
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              EXPLORE
            </h2>
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE.smooth }}
              style={{
                fontSize: "clamp(40px, 5vw, 72px)",
                fontWeight: 900,
                color: "#0A1B47",
                position: "relative",
                zIndex: 10,
                marginBottom: "24px",
              }}
            >
              Naga in your <span style={{ color: "#C5A059" }}>Pocket</span>
            </motion.h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              fontSize: "20px",
              color: "#6B7280",
              maxWidth: "560px",
              margin: "0 auto 40px",
              lineHeight: 1.6,
            }}
          >
            Your digital concierge for events, dining, and adventure.
            <br />
            Real-time updates, offline maps, and exclusive deals.
          </motion.p>

          {/* Download buttons with staggered animation */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "16px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <motion.div
              custom={0}
              variants={downloadButtonVariants}
              whileHover={{ 
                y: -4,
                boxShadow: "0 25px 30px -5px rgba(10, 27, 71, 0.25)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                sx={{
                  height: "64px",
                  padding: "0 32px",
                  backgroundColor: "#0A1B47",
                  color: "white",
                  fontWeight: 700,
                  borderRadius: "9999px",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  boxShadow: "0 20px 25px -5px rgba(10, 27, 71, 0.2)",
                  "&:hover": {
                    backgroundColor: "#1a2b5e",
                  },
                }}
              >
                <div
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    padding: "6px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Download size={20} />
                </div>
                Download App
              </Button>
            </motion.div>
            
            <motion.div
              custom={1}
              variants={downloadButtonVariants}
              whileHover={{ 
                y: -4,
                boxShadow: "0 15px 20px -3px rgba(0,0,0,0.1)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outlined"
                sx={{
                  height: "64px",
                  padding: "0 32px",
                  borderColor: "rgba(10, 27, 71, 0.2)",
                  color: "#0A1B47",
                  fontWeight: 700,
                  borderRadius: "9999px",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  backgroundColor: "white",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                  "&:hover": {
                    backgroundColor: "rgba(10, 27, 71, 0.05)",
                  },
                }}
              >
                <QrCode size={20} /> Scan Code
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Central Floating Device */}
        <div
          style={{
            position: "relative",
            height: "650px",
            width: "100%",
            maxWidth: "1024px",
            margin: "48px auto 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            perspective: "1000px",
          }}
        >
          {/* Main Phone */}
          <PhoneMockup />

          {/* Floating Elements */}
          <FloatingCard
            icon={Ticket}
            text="Tickets Confirmed"
            className="floating-card-1"
            delay={0.2}
          />
          <FloatingCard
            icon={CheckCircle2}
            text="Table Reserved"
            className="floating-card-2"
            delay={0.4}
          />
          <FloatingCard
            icon={Sparkles}
            text="New Experience Found"
            className="floating-card-3"
            delay={0.6}
          />

          {/* Depth Background Phone with parallax effect */}
          <motion.div
            initial={{ opacity: 0, x: -60, rotate: -8 }}
            whileInView={{ opacity: 0.12, x: -48, rotate: -6 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 1, ease: EASE.smooth }}
            style={{
              position: "absolute",
              zIndex: 0,
              width: "310px",
              height: "640px",
              backgroundColor: "#0A1B47",
              borderRadius: "48px",
              transform: "translateY(16px)",
            }}
          />
        </div>
      </div>

      {/* Inline styles for floating card positions (responsive) */}
      <style>{`
        .floating-card-1 {
          top: 15%;
          left: 20%;
          transform: rotate(-6deg);
        }
        .floating-card-2 {
          bottom: 20%;
          right: 15%;
          transform: rotate(6deg);
        }
        .floating-card-3 {
          top: 40%;
          right: 10%;
        }
        
        @media (max-width: 768px) {
          .floating-card-1,
          .floating-card-2,
          .floating-card-3 {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default TouristAppDownloadSection;
