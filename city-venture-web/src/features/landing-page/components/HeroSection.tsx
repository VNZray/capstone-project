import React from "react";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { AspectRatio } from "@mui/joy";
import { FaHeart } from "react-icons/fa";
import Grid1 from "@/src/assets/gridimages/grid1.jpg";
import Grid2 from "@/src/assets/gridimages/grid2.jpg";
import Grid3 from "@/src/assets/gridimages/grid3.jpg";
import Grid4 from "@/src/assets/gridimages/grid4.jpg";
import Grid5 from "@/src/assets/gridimages/grid5.jpg";
import Section from "@/src/components/ui/Section";
import { section } from "@/src/utils/Colors";
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
  // Default grid images if no items provided
  const defaultGridImages = [
    { src: Grid1, title: "Peñafrancia Basilica", subtitle: "Faith & Devotion" },
    { src: Grid2, title: "Mt. Isarog", subtitle: "Adventure Awaits" },
    { src: Grid3, title: "Naga River", subtitle: "Natural Beauty" },
    { src: Grid4, title: "Local Cuisine", subtitle: "Taste of Bicol" },
    { src: Grid5, title: "Cultural Heritage", subtitle: "Rich Traditions" },
  ];

  const displayItems = gridItems.length > 0 ? gridItems : defaultGridImages;

  return (
    <Section
      padding="150px 20px"
      id="hero"
      height="auto"
      background={section.bg3}
      align="center"
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

          <Typography.Body
            size="md"
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
            {displayItems.map((item, i) => (
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
                  <img src={placeholder} alt={item.title} />
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
    </Section>
  );
};

export default HeroSection;
