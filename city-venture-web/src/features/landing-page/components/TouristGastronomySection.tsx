import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, ChevronRight } from "lucide-react";

interface DishCardProps {
  id: number;
  title: string;
  category: string;
  image: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}

const DishCard: React.FC<DishCardProps> = ({
  title,
  category,
  image,
  desc,
  active,
  onClick,
}) => {
  return (
    <motion.div
      layout
      onClick={onClick}
      style={{
        position: "relative",
        height: "500px",
        borderRadius: "2rem",
        overflow: "hidden",
        cursor: "pointer",
        transition: "flex 0.5s cubic-bezier(0.32, 0.72, 0, 1)",
        flex: active ? 3 : 1,
      }}
      whileHover={!active ? { flex: 1.5 } : undefined}
    >
      {/* Background */}
      <img
        src={image}
        alt={title}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Dark Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#0A1B47",
          opacity: active ? 0.3 : 0.6,
          transition: "opacity 0.5s",
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
        {!active && (
          <div
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
          </div>
        )}

        <motion.div layout="position" style={{ position: "relative" }}>
          {active && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ marginBottom: "16px" }}
            >
              <div
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
                }}
              >
                {category}
              </div>
            </motion.div>
          )}

          <motion.h3
            layout="position"
            style={{
              fontWeight: 900,
              color: "white",
              lineHeight: 1,
              textTransform: "uppercase",
              marginBottom: "8px",
              fontSize: active ? "clamp(2.5rem, 6vw, 4.5rem)" : "1.5rem",
              opacity: active ? 1 : 0.8,
            }}
          >
            {title}
          </motion.h3>

          {active && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "clamp(1rem, 2vw, 1.25rem)",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                maxWidth: "28rem",
                lineHeight: 1.6,
              }}
            >
              "{desc}"
            </motion.p>
          )}
        </motion.div>

        {/* Action Button for Active State */}
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ marginTop: "32px" }}
          >
            <div
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
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.color = "#0A1B47";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "white";
              }}
            >
              <ArrowRight size={20} />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Tourist Gastronomy Section
 * An interactive expanding cards layout showcasing Bicolano cuisine
 */
export const TouristGastronomySection: React.FC = () => {
  const [activeId, setActiveId] = useState(1);

  const dishes = [
    {
      id: 1,
      category: "The Heat",
      title: "Bicol Express",
      image:
        "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      desc: "A fiery symphony of pork, shrimp paste, and coconut milk that defines Bicolano resilience.",
    },
    {
      id: 2,
      category: "The Comfort",
      title: "Kinalas",
      image:
        "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      desc: "Savory noodle soup topped with a unique gravy made from brain and tender meat. A local secret.",
    },
    {
      id: 3,
      category: "The Sweet",
      title: "Pili Nut",
      image:
        "https://images.unsplash.com/photo-1599522100867-b5074cecb2e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      desc: "Indigenous nuts glazed in honey or roasted. The butteriest nut you will ever taste.",
    },
    {
      id: 4,
      category: "The Cream",
      title: "Laing",
      image:
        "https://images.unsplash.com/photo-1600863007661-be3244c00030?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      desc: "Dried taro leaves simmered for hours in coconut cream. Earthy, creamy, and spicy.",
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
        {/* Header */}
        <div
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
            <span
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
            </span>
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

          <div style={{ paddingBottom: "8px" }}>
            <p
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
            </p>
          </div>
        </div>

        {/* Expanding Cards Layout */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            height: "500px",
          }}
        >
          {dishes.map((dish) => (
            <DishCard
              key={dish.id}
              {...dish}
              active={activeId === dish.id}
              onClick={() => setActiveId(dish.id)}
            />
          ))}
        </div>

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
