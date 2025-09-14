import { Button, Typography } from "@mui/joy";
import Container from "../components/Container";
import PageContainer from "../components/PageContainer";
import { useNavigate } from "react-router-dom";
import React from "react";
import {
  FaBed,
  FaStore,
  FaCalendarAlt,
  FaMapMarkedAlt,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaStar,
} from "react-icons/fa";
import { colors } from "../utils/Colors";

export default function LandingPage() {
  const navigate = useNavigate();

  const heroImage = new URL(
    "../assets/images/uma-hotel-residences.jpg",
    import.meta.url
  ).href;
  const logoImage = new URL("../assets/images/logo.png", import.meta.url).href;

  const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }> = ({ icon, title, description }) => (
    <Container
      elevation={2}
      padding="20px"
      radius="16px"
      style={{
        background: "#ffffff",
        boxShadow: "0 10px 20px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.06)",
        minHeight: 180,
      }}
      gap="12px"
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(135deg, #FF914D 0%, #FF6B6B 100%)",
          color: "#fff",
          boxShadow: "0 8px 16px rgba(255, 145, 77, 0.35)",
        }}
      >
        <span style={{ fontSize: 26 }}>{icon}</span>
      </div>
      <Typography level="h3" fontSize="1.125rem" fontWeight="lg">
        {title}
      </Typography>
      <Typography level="body-md" color="neutral">
        {description}
      </Typography>
    </Container>
  );

  return (
    <PageContainer
      style={{ width: "100%", padding: 0, margin: 0, display: "block" }}
    >
      {/* Hero Section */}
      <section
        id="hero"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 20,
          background: `linear-gradient(0deg, rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${heroImage}) center/cover no-repeat`,
        }}
      >
        <Container
          direction="column"
          justify="center"
          align="flex-start"
          padding="48px"
          height="min(100vh, 850px)"
          gap="18px"
          style={{ backgroundColor: "rgba(0,0,0,0.0)" }}
        >
          <Typography
            level="h1"
            textColor={colors.white}
            fontSize="clamp(2rem, 4vw, 3rem)"
            fontWeight={800}
          >
            Grow Your Tourism Business with City Venture
          </Typography>
          <Typography
            level="body-lg"
            textColor={colors.white}
            fontSize="clamp(1rem, 1.5vw, 1.25rem)"
            style={{ maxWidth: 880, opacity: 0.95 }}
          >
            Reach travelers, boost bookings, and showcase your services across
            accommodations, shops, events, and tourist spots — all in one
            trusted platform.
          </Typography>

          <Container
            direction="row"
            gap="12px"
            background="transparent"
            padding="0"
          >
            <Button
              size="lg"
              onClick={() => navigate("/business/login")}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 12,
                fontWeight: 700,
                background: "linear-gradient(135deg, #FF914D 0%, #FF6B6B 100%)",
                boxShadow: "0 10px 24px rgba(255, 145, 77, 0.35)",
                ":hover": { filter: "brightness(0.95)" },
              }}
            >
              Register Your Business
            </Button>
            <Button
              size="lg"
              variant="soft"
              color="neutral"
              onClick={() => {
                const el = document.getElementById("features");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              sx={{ borderRadius: 12, borderColor: "rgba(255,255,255,0.6)" }}
            >
              Explore Features
            </Button>
          </Container>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: "32px 24px" }}>
        <Container
          background="transparent"
          padding="0"
          gap="12px"
          align="center"
        >
          <Typography
            level="h2"
            fontSize="clamp(1.5rem, 3vw, 2rem)"
            fontWeight={800}
            textAlign="center"
          >
            Everything you need to stand out
          </Typography>
          <Typography
            level="body-md"
            color="neutral"
            textAlign="center"
            style={{ maxWidth: 800 }}
          >
            Manage listings, highlight amenities, publish events, and guide
            tourists to the best of your city.
          </Typography>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 20,
              marginTop: 24,
            }}
          >
            <FeatureCard
              icon={<FaBed />}
              title="Accommodations"
              description="Showcase rooms, amenities, and pricing to attract more bookings from travelers."
            />
            <FeatureCard
              icon={<FaStore />}
              title="Shops"
              description="Put your local store on the map and drive foot traffic with curated highlights."
            />
            <FeatureCard
              icon={<FaCalendarAlt />}
              title="Events"
              description="Promote cultural events, festivals, and experiences that bring your community to life."
            />
            <FeatureCard
              icon={<FaMapMarkedAlt />}
              title="Tourist Spots"
              description="Guide visitors to landmarks, parks, and hidden gems that define your destination."
            />
          </div>
        </Container>
      </section>

      {/* Promotional/Testimonial Banner */}
      <section style={{ padding: "8px 16px 32px 16px" }}>
        <Container
          elevation={1}
          radius="20px"
          padding="24px"
          style={{
            background: "linear-gradient(180deg, #FFF7F2 0%, #FFFFFF 100%)",
            border: "1px solid #FFE1D1",
          }}
          gap="16px"
        >
          <Container
            direction="row"
            gap="20px"
            background="transparent"
            padding="0"
            style={{ alignItems: "center", flexWrap: "wrap" }}
          >
            <div style={{ display: "flex", gap: 6, color: "#FF914D" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar key={i} />
              ))}
            </div>
            <Typography
              level="body-md"
              color="neutral"
              style={{ flex: 1, minWidth: 260 }}
            >
              “After joining City Venture, our bookings increased by 35% within
              two months. Tourists now find us easily and love the experience!”
            </Typography>
            <Button
              variant="solid"
              onClick={() => navigate("/business/login")}
              sx={{
                borderRadius: 12,
                background: "linear-gradient(135deg, #FF914D 0%, #FF6B6B 100%)",
              }}
            >
              Start Growing Today
            </Button>
          </Container>
        </Container>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "8px 16px 40px 16px" }}>
        <Container
          elevation={2}
          radius="20px"
          padding="28px"
          style={{
            background: "#0D1B2A",
            color: "#fff",
            boxShadow: "0 16px 40px rgba(13,27,42,0.35)",
          }}
          gap="16px"
          align="center"
        >
          <Typography
            level="h2"
            textColor={colors.white}
            fontSize="clamp(1.25rem, 2.5vw, 1.75rem)"
            fontWeight={800}
            textAlign="center"
          >
            Ready to put your business on the map?
          </Typography>
          <Typography
            level="body-md"
            textAlign="center"
            color="neutral"
            style={{ opacity: 0.9 }}
          >
            Join a growing network of trusted tourism partners.
          </Typography>
          <Container
            direction="row"
            gap="12px"
            background="transparent"
            padding="0"
            style={{ flexWrap: "wrap", justifyContent: "center" }}
          >
            <Button
              size="lg"
              onClick={() => navigate("/business/login")}
              sx={{
                borderRadius: 12,
                px: 3,
                background: "linear-gradient(135deg, #FF914D 0%, #FF6B6B 100%)",
              }}
            >
              Business Login
            </Button>
            <Button
              size="lg"
              variant="outlined"
              color="neutral"
              onClick={() => navigate("/tourism/login")}
              sx={{
                borderRadius: 12,
                color: "#fff",
                borderColor: "rgba(255,255,255,0.6)",
              }}
            >
              Admin Login
            </Button>
          </Container>
        </Container>
      </section>

      {/* Footer */}
      <footer style={{ padding: "24px 16px 40px 16px" }}>
        <Container
          direction="row"
          padding="16px"
          radius="16px"
          style={{
            background: "#F7F8FA",
            border: "1px solid #E8EBF0",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Container
            direction="row"
            align="center"
            gap="10px"
            background="transparent"
            padding="0"
          >
            <img
              src={logoImage}
              alt="City Venture logo"
              style={{ height: 32 }}
            />
            <Typography level="body-sm" color="neutral">
              © {new Date().getFullYear()} City Venture
            </Typography>
          </Container>
          <Typography level="body-sm" color="neutral">
            Contact: hello@cityventure.io
          </Typography>
          <Container
            direction="row"
            gap="12px"
            background="transparent"
            padding="0"
          >
            <a href="#" aria-label="Facebook" style={socialStyle}>
              <FaFacebook />
            </a>
            <a href="#" aria-label="Instagram" style={socialStyle}>
              <FaInstagram />
            </a>
            <a href="#" aria-label="Twitter" style={socialStyle}>
              <FaTwitter />
            </a>
          </Container>
        </Container>
      </footer>
    </PageContainer>
  );
}

const socialStyle: React.CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 36,
  height: 36,
  borderRadius: 12,
  background: "#fff",
  color: "#0D1B2A",
  border: "1px solid #E8EBF0",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};
