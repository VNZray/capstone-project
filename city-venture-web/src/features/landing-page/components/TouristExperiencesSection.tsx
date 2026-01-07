import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

interface BentoCardProps {
  title: string;
  subtitle: string;
  image: string;
  delay?: number;
  style?: React.CSSProperties;
}

const BentoCard: React.FC<BentoCardProps> = ({
  title,
  subtitle,
  image,
  delay = 0,
  style,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "2rem",
        backgroundColor: "#f3f4f6",
        cursor: "pointer",
        ...style,
      }}
    >
      {/* Background Image with Zoom Effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.7s ease-out",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        />
        {/* Gradient Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(10,27,71,0.8), transparent, transparent)",
            opacity: 0.6,
            transition: "opacity 0.3s",
          }}
        />
      </div>

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
        <div>
          <p
            style={{
              color: "#C5A059",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            {subtitle}
          </p>
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
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Tourist Curated Experiences Section
 * A bento grid layout showcasing various experiences in Naga City
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
        {/* Header */}
        <div
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

            <a
              href="#"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 700,
                color: "#0A1B47",
                textDecoration: "none",
                borderBottom: "1px solid rgba(10,27,71,0.2)",
                paddingBottom: "4px",
                transition: "color 0.2s, border-color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = "#C5A059";
                e.currentTarget.style.borderColor = "#C5A059";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = "#0A1B47";
                e.currentTarget.style.borderColor = "rgba(10,27,71,0.2)";
              }}
            >
              View Full Itinerary <ArrowUpRight size={20} />
            </a>
          </div>
        </div>

        {/* Bento Grid */}
        <div
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
            delay={0.1}
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
            delay={0.2}
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
            delay={0.3}
            style={{
              gridColumn: "3 / 4",
              gridRow: "2 / 3",
            }}
          />
        </div>

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
