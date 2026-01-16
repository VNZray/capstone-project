import React from "react";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { AspectRatio, Chip, Grid } from "@mui/joy";
import Grid1 from "@/src/assets/gridimages/grid1.jpg";
import Grid2 from "@/src/assets/gridimages/grid2.jpg";
import Grid3 from "@/src/assets/gridimages/grid3.jpg";
import Grid4 from "@/src/assets/gridimages/grid4.jpg";
import Grid5 from "@/src/assets/gridimages/grid5.jpg";
import Section from "@/src/components/ui/Section";
import { Heart } from "lucide-react";
import { LandingPageButton } from "./Button";

interface GridItem {
  src: string;
  title: string;
  subtitle: string;
}

interface HeroSectionProps {
  gridItems: GridItem[];
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
      align="center"
      justify="center"
      height="auto"
      minHeight={"100vh"}
      maxHeight={"auto"}
      id="hero"
    >
      <Grid xs={12} sm={12} md={11} lg={10} xl={10} container spacing={12}>
        <Grid xs={12} sm={12} md={6} lg={6} xl={6}>
          <Container
            height="100%"
            padding="0"
            direction="column"
            justify="center"
          >
            <Chip size="lg" startDecorator={<Heart size={16} color="red" />}>
              Discover Naga City
            </Chip>

            <Typography.Title
              size="lg"
              color="primary"
              weight="black"
              sx={{ lineHeight: 1.1, marginBottom: 2 }}
            >
              Begin your journey in the{" "}
              <span className="gradient-bicol">Heart of Bicol</span>
            </Typography.Title>

            <Typography.CardSubTitle
              size="sm"
              sx={{ opacity: 0.8, fontStyle: "italic" }}
            >
              — Where Faith Meets Adventure
            </Typography.CardSubTitle>

            <Typography.Body size="md" sx={{ opacity: 0.9, marginBottom: 3 }}>
              Iconic attractions, vibrant culture, and hidden gems — curated in
              one place. From the devotion of Peñafrancia to the flavors of
              kinalas and the trails of Mt. Isarog, experience the city's spirit
              up close.
            </Typography.Body>

            <Container padding="0" direction="row">
              <LandingPageButton
                onClick={() => {
                  const el = document.getElementById("how-it-works");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Get Started
              </LandingPageButton>

              <Button sx={{ borderRadius: 12 }} size="lg" variant="outlined">
                Learn More
              </Button>
            </Container>

            {/* Stats Section */}
            <Container
              direction="row"
              gap="32px"
              padding="32px 0 0 0"
              background="transparent"
              style={{ flexWrap: "wrap" }}
            >
              <div style={{ textAlign: "center" }}>
                <Typography.Header size="md" color="primary">
                  2000+
                </Typography.Header>
                <Typography.Body size="sm">Our Explorers</Typography.Body>
              </div>
              <div style={{ textAlign: "center" }}>
                <Typography.Header size="md" color="primary">
                  100+
                </Typography.Header>
                <Typography.Body size="sm">Destinations</Typography.Body>
              </div>
              <div style={{ textAlign: "center" }}>
                <Typography.Header size="md" color="primary">
                  20+
                </Typography.Header>
                <Typography.Body size="sm">Years Experience</Typography.Body>
              </div>
            </Container>
          </Container>
        </Grid>

        <Grid xs={12} sm={12} md={6} lg={6} xl={6}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
              width: "100%",
            }}
          >
            {/* Large card - Cathedral (spans 2 rows) */}
            {displayItems[0] && (
              <div
                style={{
                  gridRow: "span 2",
                  position: "relative",
                  cursor: "pointer",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <AspectRatio
                  ratio="3/4"
                  sx={{
                    borderRadius: "16px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={displayItems[1].src}
                    alt={displayItems[0].title}
                    style={{ objectFit: "cover" }}
                  />
                </AspectRatio>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "24px",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                    color: "white",
                  }}
                >
                  <Typography.CardTitle
                    size="md"
                    sx={{ color: "white", marginBottom: "4px" }}
                  >
                    {displayItems[0].title}
                  </Typography.CardTitle>
                  <Typography.Body
                    size="sm"
                    sx={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    {displayItems[0].subtitle}
                  </Typography.Body>
                </div>
              </div>
            )}

            {/* Kunalao - Top right */}
            {displayItems[1] && (
              <div
                style={{
                  position: "relative",
                  cursor: "pointer",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <AspectRatio
                  ratio="16/9"
                  sx={{
                    borderRadius: "16px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={displayItems[1].src}
                    alt={displayItems[1].title}
                    style={{ objectFit: "cover" }}
                  />
                </AspectRatio>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "16px",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                    color: "white",
                  }}
                >
                  <Typography.CardTitle
                    size="sm"
                    sx={{ color: "white", marginBottom: "4px" }}
                  >
                    {displayItems[1].title}
                  </Typography.CardTitle>
                  <Typography.Body
                    size="xs"
                    sx={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    {displayItems[1].subtitle}
                  </Typography.Body>
                </div>
              </div>
            )}

            {/* Plaza Rizal - Middle right */}
            {displayItems[2] && (
              <div
                style={{
                  position: "relative",
                  cursor: "pointer",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <AspectRatio
                  ratio="16/9"
                  sx={{
                    borderRadius: "16px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={displayItems[2].src}
                    alt={displayItems[2].title}
                    style={{ objectFit: "cover" }}
                  />
                </AspectRatio>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "16px",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                    color: "white",
                  }}
                >
                  <Typography.CardTitle
                    size="sm"
                    sx={{ color: "white", marginBottom: "4px" }}
                  >
                    {displayItems[2].title}
                  </Typography.CardTitle>
                  <Typography.Body
                    size="xs"
                    sx={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    {displayItems[2].subtitle}
                  </Typography.Body>
                </div>
              </div>
            )}

            {/* Peñafrancia Festival - Bottom left */}
            {displayItems[3] && (
              <div
                style={{
                  position: "relative",
                  cursor: "pointer",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <AspectRatio
                  ratio="4/3"
                  sx={{
                    borderRadius: "16px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={displayItems[3].src}
                    alt={displayItems[3].title}
                    style={{ objectFit: "cover" }}
                  />
                </AspectRatio>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "16px",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                    color: "white",
                  }}
                >
                  <Typography.CardTitle
                    size="sm"
                    sx={{ color: "white", marginBottom: "4px" }}
                  >
                    {displayItems[3].title}
                  </Typography.CardTitle>
                  <Typography.Body
                    size="xs"
                    sx={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    {displayItems[3].subtitle}
                  </Typography.Body>
                </div>
              </div>
            )}

            {/* Mt. Isarog - Bottom right */}
            {displayItems[4] && (
              <div
                style={{
                  position: "relative",
                  cursor: "pointer",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <AspectRatio
                  ratio="4/3"
                  sx={{
                    borderRadius: "16px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={displayItems[4].src}
                    alt={displayItems[4].title}
                    style={{ objectFit: "cover" }}
                  />
                </AspectRatio>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "16px",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                    color: "white",
                  }}
                >
                  <Typography.CardTitle
                    size="sm"
                    sx={{ color: "white", marginBottom: "4px" }}
                  >
                    {displayItems[4].title}
                  </Typography.CardTitle>
                  <Typography.Body
                    size="xs"
                    sx={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    {displayItems[4].subtitle}
                  </Typography.Body>
                </div>
              </div>
            )}
          </div>
        </Grid>
      </Grid>
    </Section>
  );
};

export default HeroSection;
