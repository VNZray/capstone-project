import React, { useState } from "react";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Section from "@/src/components/ui/Section";
import { AspectRatio, Grid } from "@mui/joy";
import { FaArrowRight, FaHeart } from "react-icons/fa";

interface WhyVisitItem {
  src: string;
  title: string;
  subtitle: string;
  description: string;
}

const WhyVisitSection: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const attractions: WhyVisitItem[] = [
    {
      src: new URL("../assets/gridimages/grid1.jpg", import.meta.url).href,
      title: "Immerse in Culture",
      subtitle: "Rich Heritage",
      description:
        "Discover centuries of devotion at the Peñafrancia Basilica and explore the historic heart of Naga City.",
    },
    {
      src: new URL("../assets/gridimages/grid2.jpg", import.meta.url).href,
      title: "Find the Best Local Eats",
      subtitle: "Culinary Delights",
      description:
        "Savor authentic Bicolano flavors from kinalas to bicol express at local favorites throughout the city.",
    },
    {
      src: new URL("../assets/gridimages/grid5.jpg", import.meta.url).href,
      title: "Discover Nature & Adventure",
      subtitle: "Outdoor Escapes",
      description:
        "Trek Mt. Isarog's trails, kayak serene rivers, and explore natural wonders just beyond the city.",
    },
  ];

  return (
    <Section
      minHeight={"auto"}
      maxHeight={"auto"}
      height="auto"
      id="why-visit"
      padding="80px 20px"
      align="center"
      justify="center"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, #FAFBFC 0%, #F0F4F8 100%)",
      }}
    >
      <Container
        padding="0"
        align="center"
        gap="32px"
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Badge */}
        <Container
          padding="10px 20px"
          radius="999px"
          direction="row"
          style={{
            background:
              "linear-gradient(135deg, #FF6B6B15, #FF914D15, #28C76F15)",
            border: "1px solid #FF914D30",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            alignSelf: "center",
          }}
        >
          <FaHeart color="#FF6B6B" size={14} />
          <Typography.Label
            size="xs"
            sx={{ color: "#FF914D", letterSpacing: 1.5 }}
          >
            DISCOVER NAGA
          </Typography.Label>
        </Container>

        <Typography.Header size="md" color="primary" align="center">
          Why Visit Naga City?
        </Typography.Header>

        <Typography.Body
          size="md"
          align="center"
          sx={{ maxWidth: 700, opacity: 0.9 }}
        >
          Don't just visit—explore. Our platform connects you to the heartbeat
          of the city, uncovering experiences that make every moment memorable.
        </Typography.Body>

        <Grid xs={12} sm={11} md={11} lg={9} container spacing={3}>
          {/* Masonry Grid Layout */}
          {attractions.map((item, index) => (
            <Grid key={index} xs={12} sm={12} md={6} lg={4} spacing={2}>
              <Container
                elevation={hoveredCard === index ? 4 : 2}
                hover
                hoverEffect="lift"
                padding="0"
                gap="0"
                radius="18px"
                onMouseEnterProp={() => setHoveredCard(index)}
                onMouseLeaveProp={() => setHoveredCard(null)}
                style={{
                  overflow: "hidden",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform:
                    hoveredCard === index
                      ? "translateY(-8px) scale(1.02)"
                      : "translateY(0) scale(1)",
                  cursor: "pointer",
                }}
              >
                <div style={{ position: "relative", overflow: "hidden" }}>
                  <AspectRatio ratio="16/9">
                    <img
                      src={item.src}
                      alt={item.title}
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                        transition:
                          "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform:
                          hoveredCard === index ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </AspectRatio>
                  {/* Gradient Overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        hoveredCard === index
                          ? "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)"
                          : "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)",
                      transition: "background 0.4s ease",
                    }}
                  />
                  {/* Hover Icon */}
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      background: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 12,
                      opacity: hoveredCard === index ? 1 : 0,
                      transform:
                        hoveredCard === index
                          ? "scale(1) rotate(0deg)"
                          : "scale(0.5) rotate(-90deg)",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    <FaArrowRight color="#FF914D" size={16} />
                  </div>
                </div>

                <Container padding="24px" gap="10px" background="white">
                  {/* Animated Badge */}
                  <Typography.Label
                    size="xs"
                    sx={{
                      color: "#FF914D",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      fontWeight: 700,
                      transition: "transform 0.3s ease",
                      display: "inline-block",
                      transform:
                        hoveredCard === index
                          ? "translateX(4px)"
                          : "translateX(0)",
                    }}
                  >
                    {item.subtitle}
                  </Typography.Label>

                  <Typography.CardTitle
                    size="sm"
                    color="primary"
                    sx={{
                      transition: "color 0.3s ease",
                      color: hoveredCard === index ? "#FF914D" : "inherit",
                    }}
                  >
                    {item.title}
                  </Typography.CardTitle>

                  <Typography.Body
                    size="sm"
                    sx={{ opacity: 0.85, lineHeight: 1.6 }}
                  >
                    {item.description}
                  </Typography.Body>

                  {/* Animated Learn More Link */}
                  <Container
                    direction="row"
                    padding="8px 0 0 0"
                    gap="8px"
                    align="center"
                    style={{
                      opacity: hoveredCard === index ? 1 : 0,
                      transform:
                        hoveredCard === index
                          ? "translateY(0)"
                          : "translateY(10px)",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <Typography.Label
                      size="xs"
                      sx={{
                        color: "#FF914D",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Explore More
                    </Typography.Label>
                    <FaArrowRight color="#FF914D" size={12} />
                  </Container>
                </Container>
              </Container>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Section>
  );
};

export default WhyVisitSection;
