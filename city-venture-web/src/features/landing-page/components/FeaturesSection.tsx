import React from "react";
import { useNavigate } from "react-router-dom";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { FaMobileAlt, FaCheckCircle } from "react-icons/fa";
import { AspectRatio, Grid } from "@mui/joy";
import dashboard_preview from "@/src/assets/images/dashboard_preview.png";

interface FeaturesSectionProps {
  mobilePreview?: string;
  dashboardPreview?: string;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  mobilePreview,
  dashboardPreview,
}) => {
  const navigate = useNavigate();

  const touristFeatures = [
    "Interactive Map",
    "All-in-one access to information in the app",
    "User-friendly, intuitive interface designed for all citizens",
  ];

  const businessFeatures = [
    "Get listed on City Venture and be discoverable in our mobile app",
    "Access to Booking/Reservation System",
    "Content Management Tools for listings and updates",
  ];

  return (
    <section id="why-choose-us" style={{ padding: "16px" }}>
      <Container
        align="center"
        padding="0"
        gap="80px"
      >
        <Grid xs={12} sm={11} md={11} lg={9} container spacing={4}>
          <Grid xs={12} sm={12} md={12} lg={6}>
            {/* Mobile app showcase */}
            <Container
              elevation={2}
              padding="0"
              gap="0"
              radius="18px"
              style={{ overflow: "hidden" }}
            >
              <Container
                padding="14px"
                direction="row"
                align="center"
                gap="8px"
                style={{ borderBottom: "1px solid #F0F3F8" }}
              >
                <FaMobileAlt />
                <Typography.Label size="sm">
                  Mobile App Preview
                </Typography.Label>
              </Container>
              <AspectRatio ratio="16/9">
                <img
                  src={
                    mobilePreview ||
                    "https://cdn.dribbble.com/userupload/44244484/file/08ed1664e91d12793bdc96d92ed8bca5.png?resize=400x0"
                  }
                />
              </AspectRatio>
            </Container>
          </Grid>

          <Grid xs={12} sm={12} md={12} lg={6}>
            {/* Tourist features content */}
            <Container padding="0" gap="16px">
              <Typography.Label
                size="xs"
                sx={{ color: "#FF914D", letterSpacing: 1 }}
              >
                FOR TOURISTS
              </Typography.Label>
              <Typography.Header size="md">
                Discover Naga with our mobile app
              </Typography.Header>
              <Typography.Body size="md" sx={{ opacity: 0.9 }}>
                Explore attractions, events, and local favorites. Plan with an
                interactive map and curated lists.
              </Typography.Body>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "grid",
                  gap: 8,
                }}
              >
                {touristFeatures.map((feature, i) => (
                  <li
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        color: "#28C76F",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <FaCheckCircle />
                    </span>
                    <Typography.Body size="sm">{feature}</Typography.Body>
                  </li>
                ))}
              </ul>
              <div className="store-buttons" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="store-btn app-store"
                  title="Download on the App Store"
                  aria-label="Download on the App Store"
                >
                  <span className="store-badge"></span>
                  <span className="store-text">
                    <strong>App Store</strong>
                    <small>Coming soon</small>
                  </span>
                </button>
                <button
                  type="button"
                  className="store-btn play-store"
                  title="Get it on Google Play"
                  aria-label="Get it on Google Play"
                >
                  <span className="store-badge">▶</span>
                  <span className="store-text">
                    <strong>Google Play</strong>
                    <small>Coming soon</small>
                  </span>
                </button>
              </div>
            </Container>
          </Grid>
        </Grid>

        <Grid xs={12} sm={11} md={11} lg={9} container spacing={4}>
          <Grid xs={12} sm={12} md={12} lg={6}>
            {/* Tourist features content */}
            <Container padding="0" gap="16px">
              <Typography.Label
                size="xs"
                sx={{
                  letterSpacing: 1,
                  background:
                    "linear-gradient(90deg, #FF6B6B 0%, #FF914D 45%, #28C76F 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  fontWeight: 700,
                }}
              >
                FOR BUSINESS OWNERS
              </Typography.Label>
              <Typography.Header size="md">
                Benefits of registering your business
              </Typography.Header>
              <Typography.Body size="md" sx={{ opacity: 0.9 }}>
                Get discovered by visitors and manage your presence with
                built-in tools.
              </Typography.Body>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "grid",
                  gap: 8,
                }}
              >
                {businessFeatures.map((feature, i) => (
                  <li
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        color: "#28C76F",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <FaCheckCircle />
                    </span>
                    <Typography.Body size="sm">{feature}</Typography.Body>
                  </li>
                ))}
              </ul>
              <Container
                direction="row"
                gap="12px"
                padding="0"
                style={{ marginTop: 12, flexWrap: "wrap" }}
              >
                <Button
                  size="lg"
                  colorScheme="primary"
                  onClick={() => navigate("/business/signup")}
                  sx={{
                    borderRadius: 12,
                    px: 3,
                    background:
                      "linear-gradient(135deg, #FF6B6B 0%, #FF914D 50%, #28C76F 100%)",
                    color: "#fff",
                  }}
                >
                  Join Now
                </Button>
                <Button
                  size="lg"
                  variant="outlined"
                  colorScheme="gray"
                  onClick={() => navigate("/login")}
                  sx={{ borderRadius: 12 }}
                >
                  Login
                </Button>
              </Container>
            </Container>
          </Grid>

          <Grid xs={12} sm={12} md={12} lg={6}>
            {/* Dashboard preview */}
            <Container
              elevation={2}
              padding="0"
              radius="16px"
              gap="0"
              style={{ overflow: "hidden" }}
            >
              <Container
                padding="14px"
                style={{ borderBottom: "1px solid #F0F3F8" }}
              >
                <Typography.Label size="sm">Dashboard Preview</Typography.Label>
              </Container>
              <AspectRatio ratio={"16/9"}>
                <img src={dashboardPreview || dashboard_preview} />
              </AspectRatio>
            </Container>
          </Grid>
        </Grid>
      </Container>
    </section>
  );
};

export default FeaturesSection;
