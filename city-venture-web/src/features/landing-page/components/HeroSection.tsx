import React from "react";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { AspectRatio } from "@mui/joy";
import { FaHeart } from "react-icons/fa";
import placeholder from "@/src/assets/images/placeholder-image.png";

interface GridItem {
  src: string;
  title: string;
  subtitle: string;
}

interface HeroSectionProps {
  gridItems: GridItem[];
}

// Tile class pattern for mosaic grid
function tileClassFor(index: number): string {
  const pattern = [
    "span-c2 span-r2",
    "span-r3",
    "span-c2 span-r2",
    "",
    "span-c3 span-r2",
    "span-r2",
    "",
    "",
    "span-c2 span-r2",
  ];
  return pattern[index % pattern.length];
}

const HeroSection: React.FC<HeroSectionProps> = ({ gridItems }) => {
  return (
    <section
      id="hero"
      className="main-hero"
      style={{padding: 16}}
    >
      <div className="hero-inner">
        {/* Left column: Welcome and actions */}
        <div className="hero-left">
          <span className="hero-eyebrow">
            <FaHeart className="heart" aria-hidden="true" /> Explore Naga City
          </span>
          
          <Typography.Title
            size="lg"
            color="primary"
            weight="black"
            sx={{ lineHeight: 1.1, marginBottom: 2 }}
          >
            Begin your journey in the{" "}
            <span className="gradient-bicol">Heart of Bicol</span>
          </Typography.Title>

          <div className="hero-quote">— Where Faith Meets Adventure</div>

          <Typography.Body size="md"
            sx={{ maxWidth: 620, opacity: 0.9, marginBottom: 3 }}
          >
            Iconic attractions, vibrant culture, and hidden gems — curated in
            one place. From the devotion of Peñafrancia to the flavors of
            kinalas and the trails of Mt. Isarog, experience the city's spirit
            up close.
          </Typography.Body>

          <Container
            direction="row"
            gap="12px"
            padding="0"
            style={{ flexWrap: "wrap" }}
            className="hero-actions"
            background="transparent"
          >
            <Button
              size="lg"
              colorScheme="primary"
              onClick={() => {
                const el = document.getElementById("how-it-works");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              sx={{
                borderRadius: 12,
                px: 3,
                color: "#ffffff",
                background:
                  "linear-gradient(135deg, #FF6B6B 0%, #FF914D 50%, #28C76F 100%)",
                boxShadow: "0 10px 26px rgba(0,0,0,0.12)",
                border: "none",
                textTransform: "none",
                fontWeight: 700,
                transition:
                  "transform 160ms ease, box-shadow 160ms ease, filter 160ms ease",
                "&:hover": {
                  filter: "brightness(1.02)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.14)",
                },
              }}
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outlined"
              colorScheme="gray"
              onClick={() => {
                const el = document.getElementById("how-it-works");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              sx={{ borderRadius: 12 }}
            >
              Learn More
            </Button>
          </Container>
        </div>

        {/* Right column: Dynamic attractions grid */}
        <div className="hero-right">
          <div className="attractions-grid">
            {gridItems.map((item, i) => (
              <button
                key={`${item.title}-${i}`}
                type="button"
                className={`tile ${tileClassFor(i)}`}
                title={item.title}
                aria-label={`${item.title} — ${item.subtitle}`}
              >
                <AspectRatio
                  ratio="4/3"
                  sx={{
                    width: "100%",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={placeholder}
                    alt={item.title}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </AspectRatio>
                <div className="tile-label" aria-hidden>
                  <div className="tile-title">{item.title}</div>
                  <div className="tile-sub">{item.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
