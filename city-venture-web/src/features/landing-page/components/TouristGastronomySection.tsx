import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronRight } from "lucide-react";
import {
  gastronomyContainerVariants,
  gastronomyCardVariants,
  sectionHeaderVariants,
  viewportSettings,
  EASE,
} from "../utils/animationVariants";

// Import local food highlight images
import bicolExpress from "@/src/assets/foodhighlights/bicol-express.png";
import kinalas from "@/src/assets/foodhighlights/kinalas.png";
import laing from "@/src/assets/foodhighlights/laing.png";
import piliNuts from "@/src/assets/foodhighlights/pili-nuts.png";

interface DishCardProps {
  id: number;
  title: string;
  category: string;
  image: string;
  desc: string;
  active: boolean;
  onClick: () => void;
  index: number;
}

const DishCard: React.FC<DishCardProps> = ({
  title,
  category,
  image,
  desc,
  active,
  onClick,
  index,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      custom={index}
      variants={gastronomyCardVariants}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{ 
        flex: active ? 3 : isHovered && !active ? 1.3 : 1,
      }}
      transition={{
        flex: { duration: 0.5, ease: EASE.snappy },
        layout: { duration: 0.5, ease: EASE.snappy },
      }}
      style={{
        position: "relative",
        height: "500px",
        borderRadius: "2rem",
        overflow: "hidden",
        cursor: "pointer",
        willChange: "flex, transform",
      }}
      whileHover={!active && !shouldReduceMotion ? { scale: 1.02 } : undefined}
    >
      {/* Background with smooth scale */}
      <motion.img
        src={image}
        alt={title}
        animate={{ 
          scale: active || isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.6, ease: EASE.smooth }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          willChange: "transform",
        }}
      />

      {/* Dark Overlay - animated opacity */}
      <motion.div
        animate={{ 
          opacity: active ? 0.25 : 0.55,
        }}
        transition={{ duration: 0.4 }}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#0A1B47",
        }}
      />

      {/* Content Container */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          zIndex: 10,
        }}
      >
        {/* Vertical Text for Inactive State */}
        <AnimatePresence mode="wait">
          {!active && (
            <motion.div
              key="vertical-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                top: "48px",
                left: "50%",
                transform: "translateX(-50%)",
                height: "100%",
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  transform: "rotate(180deg)",
                  writingMode: "vertical-rl",
                  fontSize: "0.875rem",
                }}
              >
                {category}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout="position" style={{ position: "relative" }}>
          {/* Category Badge - animated entrance */}
          <AnimatePresence>
            {active && (
              <motion.div
                key="category-badge"
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.3, ease: EASE.smooth }}
                style={{ marginBottom: "16px" }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "auto" }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    backgroundColor: "#C5A059",
                    color: "#0A1B47",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    borderRadius: "9999px",
                    marginBottom: "8px",
                    overflow: "hidden",
                  }}
                >
                  {category}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title - animated size change */}
          <motion.h3
            layout="position"
            animate={{
              fontSize: active ? "clamp(2.5rem, 6vw, 4.5rem)" : "1.5rem",
              opacity: active ? 1 : 0.85,
            }}
            transition={{ duration: 0.4, ease: EASE.snappy }}
            style={{
              fontWeight: 900,
              color: "white",
              lineHeight: 1,
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            {title}
          </motion.h3>

          {/* Description - animated reveal */}
          <AnimatePresence>
            {active && (
              <motion.p
                key="description"
                initial={{ opacity: 0, height: 0, y: 10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: 10 }}
                transition={{ duration: 0.35, ease: EASE.smooth }}
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "clamp(1rem, 2vw, 1.25rem)",
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  maxWidth: "28rem",
                  lineHeight: 1.6,
                  overflow: "hidden",
                }}
              >
                "{desc}"
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Action Button for Active State */}
        <AnimatePresence>
          {active && (
            <motion.div
              key="action-button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              style={{ marginTop: "32px" }}
            >
              <motion.div
                whileHover={{ 
                  backgroundColor: "white",
                  color: "#0A1B47",
                  scale: 1.1,
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <ArrowRight size={20} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/**
 * Tourist Gastronomy Section
 * An interactive expanding cards layout showcasing Bicolano cuisine
 * with smooth fluid animations and intuitive interactions
 */
export const TouristGastronomySection: React.FC = () => {
  const [activeId, setActiveId] = useState(1);

  const dishes = [
    {
      id: 1,
      category: "The Comfort",
      title: "Kinalas",
      image: kinalas,
      desc: "Savory noodle soup topped with a unique gravy made from brain and tender meat. A local secret.",
    },
    {
      id: 2,
      category: "The Cream",
      title: "Laing",
      image: laing,
      desc: "Dried taro leaves simmered for hours in coconut cream. Earthy, creamy, and spicy.",
    },
    {
      id: 3,
      category: "The Sweet",
      title: "Pili Nut",
      image: piliNuts,
      desc: "Indigenous nuts glazed in honey or roasted. The butteriest nut you will ever taste.",
    },
    {
      id: 4,
      category: "The Heat",
      title: "Bicol Express",
      image: bicolExpress,
      desc: "A fiery symphony of pork, shrimp paste, and coconut milk that defines Bicolano resilience.",
    },
  ];

  return (
    <section
      id="dine"
      style={{
        padding: "96px 24px",
        backgroundColor: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        {/* Header with entrance animation */}
        <motion.div
          variants={sectionHeaderVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "48px",
            gap: "24px",
          }}
        >
          <div style={{ maxWidth: "42rem" }}>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{
                color: "#C5A059",
                fontWeight: 700,
                letterSpacing: "0.15em",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                marginBottom: "16px",
                display: "block",
              }}
            >
              Gastronomy
            </motion.span>
            <h2
              style={{
                fontSize: "clamp(2.5rem, 6vw, 3.75rem)",
                fontWeight: 900,
                color: "#0A1B47",
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Flavors of <br /> the{" "}
              <span style={{ color: "#C5A059" }}>Capital</span>
            </h2>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            style={{ paddingBottom: "8px" }}
          >
            <motion.p
              animate={{ x: [0, 5, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatDelay: 2,
                ease: "easeInOut" 
              }}
              style={{
                color: "#9ca3af",
                fontSize: "0.875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: 0,
              }}
            >
              Click to Explore <ChevronRight size={16} />
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Expanding Cards Layout with staggered entrance */}
        <motion.div
          variants={gastronomyContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          style={{
            display: "flex",
            gap: "16px",
            height: "500px",
          }}
        >
          {dishes.map((dish, index) => (
            <DishCard
              key={dish.id}
              {...dish}
              index={index}
              active={activeId === dish.id}
              onClick={() => setActiveId(dish.id)}
            />
          ))}
        </motion.div>

        {/* Mobile Stack Fallback */}
        <style>{`
          @media (max-width: 768px) {
            #dine > div > div:last-child {
              flex-direction: column !important;
              height: auto !important;
            }
            #dine > div > div:last-child > div {
              flex: none !important;
              height: 300px !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
};

export default TouristGastronomySection;
