import React from "react";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import { Grid, Chip, AspectRatio } from "@mui/joy";
import {
  FaMapMarkedAlt,
  FaSearch,
  FaHeart,
  FaClock,
  FaStar,
  FaCompass,
  FaAppStoreIos,
  FaGooglePlay,
} from "react-icons/fa";

const TouristBenefitsSection: React.FC = () => {
  const features = [
    {
      icon: <FaMapMarkedAlt size={28} />,
      title: "Interactive Map",
      description:
        "Explore Naga with our interactive map. Find attractions, restaurants, and hotels near you with real-time navigation.",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      icon: <FaSearch size={28} />,
      title: "Smart Search",
      description:
        "Discover places by category, rating, or distance. Filter results to find exactly what you're looking for.",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      icon: <FaHeart size={28} />,
      title: "Save Favorites",
      description:
        "Create your personal wishlist of places to visit. Never lose track of interesting spots you want to explore.",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
    {
      icon: <FaClock size={28} />,
      title: "Plan Your Trip",
      description:
        "Check opening hours, book services, and plan your itinerary. Get the most out of your visit to Naga.",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      icon: <FaStar size={28} />,
      title: "Real Reviews",
      description:
        "Read authentic reviews from other travelers. Make informed decisions based on real experiences.",
      gradient: "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
    },
    {
      icon: <FaCompass size={28} />,
      title: "Local Insights",
      description:
        "Get insider tips and recommendations. Discover hidden gems that only locals know about.",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    },
  ];

  const appSteps = [
    {
      step: "1",
      title: "Download the App",
      description: "Available on iOS and Android. Quick and easy installation.",
    },
    {
      step: "2",
      title: "Create Your Account",
      description: "Sign up in seconds. Start exploring Naga right away.",
    },
    {
      step: "3",
      title: "Explore & Enjoy",
      description: "Discover attractions, book services, and experience Naga.",
    },
  ];

  return (
    <section
      id="tourist-benefits"
      style={{
        scrollMarginTop: 80,
        padding: "80px 16px",
        background:
          "linear-gradient(180deg, #f7fafc 0%, #ffffff 50%, #f7fafc 100%)",
      }}
    >
      <Container padding="0" align="center">
        <Chip size="lg" color="primary" variant="soft">
          For Tourists
        </Chip>

        <Typography.Header
          size="lg"
          align="center"
          sx={{
            lineHeight: 1.15,
            marginBottom: 1,
            marginTop: 2,
            color: "#0A1B47",
          }}
        >
          Experience Naga{" "}
          <span className="gradient-bicol">Like Never Before</span>
        </Typography.Header>

        <Typography.Body
          size="md"
          align="center"
          sx={{
            maxWidth: 720,
            margin: "8px auto 48px",
            opacity: 0.9,
          }}
        >
          Download the City Venture app and unlock the best of Naga City.
          Everything you need for an unforgettable visit, right in your pocket.
        </Typography.Body>

        <Grid xs={12} sm={11} md={11} lg={10} container spacing={3}>
          {features.map((feature, index) => (
            <Grid key={index} xs={12} sm={6} md={6} lg={4}>
              <Container
                elevation={2}
                hover
                hoverEffect="lift"
                padding="28px"
                radius="20px"
                gap="16px"
                align="flex-start"
                style={{
                  height: "100%",
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <Container
                  padding="16px"
                  radius="16px"
                  style={{
                    background: feature.gradient,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  }}
                >
                  {feature.icon}
                </Container>

                <Container gap="8px" padding="0">
                  <Typography.CardTitle size="sm" color="primary">
                    {feature.title}
                  </Typography.CardTitle>
                  <Typography.Body size="sm" sx={{ opacity: 0.85 }}>
                    {feature.description}
                  </Typography.Body>
                </Container>
              </Container>
            </Grid>
          ))}
        </Grid>

        {/* How to Get Started */}
        <Container
          padding="60px 0 0 0"
          align="center"
          gap="32px"
          style={{ maxWidth: 1000 }}
        >
          <Typography.Header size="md" color="primary" align="center">
            Get Started in 3 Simple Steps
          </Typography.Header>

          <Grid xs={12} container spacing={3}>
            {appSteps.map((step, index) => (
              <Grid key={index} xs={12} sm={4}>
                <Container
                  padding="24px"
                  radius="20px"
                  align="center"
                  gap="12px"
                  style={{
                    background:
                      "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                    border: "2px solid #e9ecef",
                  }}
                >
                  <Container
                    padding="20px"
                    radius="50%"
                    style={{
                      background:
                        "linear-gradient(135deg, #FF6B6B 0%, #FF914D 50%, #28C76F 100%)",
                      color: "#fff",
                      fontSize: 28,
                      fontWeight: 800,
                      width: 70,
                      height: 70,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {step.step}
                  </Container>
                  <Typography.CardTitle size="sm" align="center">
                    {step.title}
                  </Typography.CardTitle>
                  <Typography.Body
                    size="sm"
                    align="center"
                    sx={{ opacity: 0.8 }}
                  >
                    {step.description}
                  </Typography.Body>
                </Container>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Download CTA */}
        <Container
          elevation={3}
          padding="48px"
          radius="24px"
          align="center"
          gap="24px"
          style={{
            marginTop: 64,
            maxWidth: 900,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
          }}
        >
          <Container
            padding="16px"
            radius="16px"
            style={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              display: "inline-flex",
            }}
          >
            <FaMapMarkedAlt size={40} />
          </Container>

          <Typography.Header size="md" align="center" sx={{ color: "#fff" }}>
            Ready to Explore Naga?
          </Typography.Header>

          <Typography.Body
            size="md"
            align="center"
            sx={{ color: "rgba(255,255,255,0.95)", maxWidth: 600 }}
          >
            Download City Venture now and start discovering the best
            attractions, restaurants, and experiences Naga has to offer.
          </Typography.Body>

          <Container
            direction="row"
            gap="16px"
            padding="0"
            style={{ flexWrap: "wrap" }}
            justify="center"
          >
            <button
              type="button"
              className="store-btn-large app-store"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 28px",
                borderRadius: 14,
                border: "2px solid #ffffff",
                background: "#ffffff",
                color: "#000",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <FaAppStoreIos size={24} />
              <span>
                <div style={{ fontSize: 11, opacity: 0.7 }}>
                  Download on the
                </div>
                <div style={{ fontWeight: 700 }}>App Store</div>
              </span>
            </button>

            <button
              type="button"
              className="store-btn-large play-store"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 28px",
                borderRadius: 14,
                border: "2px solid #ffffff",
                background: "#ffffff",
                color: "#000",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <FaGooglePlay size={24} />
              <span>
                <div style={{ fontSize: 11, opacity: 0.7 }}>Get it on</div>
                <div style={{ fontWeight: 700 }}>Google Play</div>
              </span>
            </button>
          </Container>

          <Typography.Body
            size="xs"
            align="center"
            sx={{ color: "rgba(255,255,255,0.8)", marginTop: 1 }}
          >
            Coming soon to iOS and Android
          </Typography.Body>
        </Container>
      </Container>
    </section>
  );
};

export default TouristBenefitsSection;
