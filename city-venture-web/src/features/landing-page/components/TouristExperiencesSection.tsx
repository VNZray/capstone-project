import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import {
  bentoContainerVariants,
  bentoItemVariants,
  sectionHeaderVariants,
  viewportSettings,
  EASE,
} from "../utils/animationVariants";

interface BentoCardProps {
  title: string;
  subtitle: string;
  image: string;
  index?: number;
  style?: React.CSSProperties;
}

const BentoCard: React.FC<BentoCardProps> = ({
  title,
  subtitle,
  image,
  style,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={bentoItemVariants}
      whileHover={shouldReduceMotion ? undefined : { 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3, ease: EASE.snappy }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "2rem",
        backgroundColor: "#f3f4f6",
        cursor: "pointer",
        willChange: "transform",
        ...style,
      }}
    >
      {/* Background Image with Zoom Effect */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        <motion.img
          src={image}
          alt={title}
          animate={shouldReduceMotion ? undefined : { 
            scale: isHovered ? 1.08 : 1 
          }}
          transition={{ duration: 0.6, ease: EASE.smooth }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            willChange: "transform",
          }}
        />
        {/* Gradient Overlay - enhanced on hover */}
        <motion.div
          animate={{ 
            opacity: isHovered ? 0.75 : 0.5 
          }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(10,27,71,0.9), rgba(10,27,71,0.3), transparent)",
          }}
        />
      </motion.div>

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "flex-start",
        }}
      >
        <motion.div
          animate={{ y: isHovered ? -4 : 0 }}
          transition={{ duration: 0.3, ease: EASE.snappy }}
        >
          <motion.p
            animate={{ 
              color: isHovered ? "#FFD700" : "#C5A059",
              letterSpacing: isHovered ? "0.2em" : "0.15em",
            }}
            transition={{ duration: 0.3 }}
            style={{
              fontWeight: 700,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            {subtitle}
          </motion.p>
          <h3
            style={{
              fontSize: "clamp(1.25rem, 3vw, 1.875rem)",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {title}
          </h3>
        </motion.div>

        {/* Explore indicator - appears on hover */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10,
          }}
          transition={{ duration: 0.25 }}
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#C5A059",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0A1B47",
          }}
        >
          <ArrowUpRight size={18} />
        </motion.div>
      </div>
    </motion.div>
  );
};

/**
 * Tourist Curated Experiences Section
 * A bento grid layout showcasing various experiences in Naga City
 * with staggered reveal animations and smooth hover interactions
 */
export const TouristExperiencesSection: React.FC = () => {
  const experiences = [
    {
      title: "Basilica Minore",
      subtitle: "Faith & Heritage",
      image:
        "https://images.unsplash.com/photo-1548625361-12e756c2d159?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Mt. Isarog Adventures",
      subtitle: "Nature & Eco-Tourism",
      image:
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Local Delicacies",
      subtitle: "Gastronomy",
      image:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "City Nightlife",
      subtitle: "Lifestyle",
      image:
        "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section
      id="guide"
      style={{
        padding: "0px 24px 48px 24px",
        backgroundColor: "#F5F5F7",
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
            flexDirection: "column",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "24px",
            }}
          >
            <div style={{ maxWidth: "36rem" }}>
              <h2
                style={{
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  marginBottom: "16px",
                  lineHeight: 1.1,
                }}
              >
                <span style={{ color: "#0A1B47" }}>Curated</span>{" "}
                <span style={{ color: "#C5A059" }}>Experiences</span>
              </h2>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "1.125rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Every corner of Naga tells a story. From sacred silences to
                thunderous waterfalls.
              </p>
            </div>

            <motion.a
              href="#"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 700,
                color: "#0A1B47",
                textDecoration: "none",
                borderBottom: "1px solid rgba(10,27,71,0.2)",
                paddingBottom: "4px",
              }}
            >
              View Full Itinerary <ArrowUpRight size={20} />
            </motion.a>
          </div>
        </motion.div>

        {/* Bento Grid with staggered animation */}
        <motion.div
          variants={bentoContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            gap: "24px",
            height: "600px",
          }}
        >
          {/* Left Column: Large Vertical Card */}
          <BentoCard
            title={experiences[0].title}
            subtitle={experiences[0].subtitle}
            image={experiences[0].image}
            index={0}
            style={{
              gridColumn: "1 / 2",
              gridRow: "1 / 3",
            }}
          />

          {/* Top Right: Wide Card */}
          <BentoCard
            title={experiences[1].title}
            subtitle={experiences[1].subtitle}
            image={experiences[1].image}
            index={1}
            style={{
              gridColumn: "2 / 4",
              gridRow: "1 / 2",
            }}
          />

          {/* Bottom Right 1: Square Card */}
          <BentoCard
            title={experiences[2].title}
            subtitle={experiences[2].subtitle}
            image={experiences[2].image}
            index={2}
            style={{
              gridColumn: "2 / 3",
              gridRow: "2 / 3",
            }}
          />

          {/* Bottom Right 2: Square Card */}
          <BentoCard
            title={experiences[3].title}
            subtitle={experiences[3].subtitle}
            image={experiences[3].image}
            index={3}
            style={{
              gridColumn: "3 / 4",
              gridRow: "2 / 3",
            }}
          />
        </motion.div>

        {/* Mobile Grid Fallback */}
        <style>{`
          @media (max-width: 768px) {
            #guide > div > div:last-child {
              display: flex !important;
              flex-direction: column !important;
              height: auto !important;
              gap: 16px !important;
            }
            #guide > div > div:last-child > div {
              grid-column: auto !important;
              grid-row: auto !important;
              min-height: 250px !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
};

export default TouristExperiencesSection;
