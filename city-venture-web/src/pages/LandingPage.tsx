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
import heroImage from "@/src/assets/images/uma-hotel-residences.jpg";
import {
  FaUserPlus,
  FaListAlt,
  FaChartLine,
  FaMapMarkerAlt,
  FaLock,
  FaShieldAlt,
  FaThumbsUp,
} from "react-icons/fa";

export default function LandingPage() {
  const navigate = useNavigate();

  const logoImage = new URL("../assets/images/logo.png", import.meta.url).href;
  const testimonialImage = new URL(
    "../assets/images/placeholder-image.png",
    import.meta.url
  ).href;
  const placeholderImage = testimonialImage;

  return (
    <PageContainer
      style={{
        width: "100%",
        padding: 0,
        margin: 0,
        display: "block",
        overflowX: "hidden",
      }}
    >
      {/* Hero Section (center-aligned like reference) */}
      <section
        id="hero"
        style={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(0deg, rgba(0,0,0,0.7), rgba(0,0,0,0.4)), url(${heroImage}) center/cover no-repeat`,
        }}
      >
        <Container
          direction="column"
          justify="center"
          align="center"
          padding="64px"
          height="min(90vh, 820px)"
          gap="18px"
          background="transparent"
        >
          <Typography
            level="h1"
            textColor={colors.white}
            fontSize="clamp(2rem, 4vw, 3rem)"
            fontWeight={800}
            textAlign="center"
          >
            Showcase Your Business. Reach More Tourists.
          </Typography>
          <Typography
            level="body-lg"
            textColor={colors.white}
            fontSize="clamp(1rem, 1.5vw, 1.25rem)"
            style={{ maxWidth: 900, opacity: 0.95 }}
            textAlign="center"
          >
            List accommodations, shops, events, and tourist spots in minutes.
            Join City Venture and connect with travelers today.
          </Typography>

          <Container
            direction="row"
            gap="12px"
            padding="0"
            background="transparent"
            width="20rem"
          >
            <Button
              fullWidth
              size="lg"
              sx={{
                borderRadius: 12,
              }}
              onClick={() => navigate("/business/login")}
            >
              Get Started
            </Button>

            <Button
              fullWidth
              size="lg"
              variant="soft"
              color="neutral"
              onClick={() => {
                const el = document.getElementById("why-choose-us");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              sx={{
                borderRadius: 12,
              }}
            >
              Explore
            </Button>
          </Container>
        </Container>
      </section>

      {/* Why Choosing Us */}
      <section
        id="why-choose-us"
        style={{ padding: "20px 20px", backgroundColor: "#ffffff", minHeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Container padding="0" gap="0" style={{ flex: 1 }} >
          <Typography
            textAlign="center"
            level="h2"
            fontSize="clamp(1.5rem, 3vw, 2rem)"
            fontWeight={800}
            style={{ padding: "20px" }}
          >
            Why Choosing Us?
          </Typography>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
              alignItems: "center",
              padding: "20px",
            }}
          >
            {[
              {
                title: "Wider Visibility",
                desc: "Be seen by locals and travelers across the city.",
              },
              {
                title: "Affordable & Flexible",
                desc: "Get started free, upgrade as you grow.",
              },
              {
                title: "Easy Management",
                desc: "List, update, and track results in minutes.",
              },
            ].map((i, idx) => (
              <Container
                key={idx}
                direction="column"
                gap="10px"
                padding="20px"
                elevation={2}
              >
                <Typography level="title-md">{i.title}</Typography>
                <Typography level="body-sm" color="neutral">
                  {i.desc}
                </Typography>
                <a
                  href="#features"
                  style={{
                    color: "#FF914D",
                    textDecoration: "none",
                    fontSize: 12,
                  }}
                >
                  More info →
                </a>
              </Container>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Services (card row like reference) */}
      <section
        id="features"
        style={{ padding: "24px 16px", backgroundColor: colors.offWhite2 }}
      >
        <Container
          background="transparent"
          padding="20px"
          gap="12px"
          align="center"
        >
          <Typography
            level="h2"
            fontSize="clamp(1.5rem, 3vw, 2rem)"
            fontWeight={800}
            textAlign="center"
          >
            Featured Services
          </Typography>
          <Typography
            level="body-md"
            color="neutral"
            textAlign="center"
            style={{ maxWidth: 800 }}
          >
            Promote your listings and attract more tourists with City Venture.
          </Typography>
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "row",
              gap: 18,
              marginTop: 24,
              width: "100%",
            }}
          >
            {[
              {
                title: "Accommodations",
                icon: <FaBed />,
                img: placeholderImage,
              },
              {
                title: "Shops",
                icon: <FaStore />,
                img: placeholderImage,
              },
              {
                title: "Events",
                icon: <FaCalendarAlt />,
                img: placeholderImage,
              },
              {
                title: "Tourist Spots",
                icon: <FaMapMarkedAlt />,
                img: placeholderImage,
              },
            ].map((c, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  background: "#ffffff",
                  border: "1px solid #E8EBF0",
                  borderRadius: 18,
                  boxShadow: "0 14px 28px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ height: 280, overflow: "hidden" }}>
                  <img
                    src={c.img}
                    alt={c.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div
                  style={{
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography level="title-md">{c.title}</Typography>
                    <div style={{ display: "flex", gap: 2, color: "#FFD166" }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar key={i} size={12} />
                      ))}
                    </div>
                  </div>
                  <Typography level="body-xs" color="neutral">
                    Highlight features, amenities and photos to stand out.
                  </Typography>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 6,
                    }}
                  >
                    <Button
                      size="sm"
                      onClick={() => navigate("/business/login")}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        style={{ padding: "8px 16px 24px 16px", backgroundColor: "#ffffff" }}
      >
        <Container
          background="transparent"
          padding="20px"
          gap="12px"
          align="center"
        >
          <Typography
            level="h2"
            fontSize="clamp(1.5rem, 3vw, 2rem)"
            fontWeight={800}
            textAlign="center"
          >
            How it works
          </Typography>
          <Container direction="row" gap="20px" width="100%">
            {[
              {
                icon: <FaUserPlus />,
                title: "Register",
                desc: "Create your free business account.",
              },
              {
                icon: <FaListAlt />,
                title: "Get Listed",
                desc: "Add details, photos, and amenities.",
              },
              {
                icon: <FaMapMarkerAlt />,
                title: "Attract Tourists",
                desc: "Appear in searches and maps.",
              },
              {
                icon: <FaChartLine />,
                title: "Grow Business",
                desc: "Increase bookings and visits.",
              },
            ].map((s, i) => (
              <Container
                key={i}
                elevation={2}
                style={{
                  flex: 1,
                }}
                padding="20px"
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    background:
                      i % 2 === 0
                        ? "linear-gradient(135deg, #2F80ED, #56CCF2)"
                        : "linear-gradient(135deg, #7ED957, #28C76F)",
                  }}
                >
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                </div>
                <Typography level="title-md">{s.title}</Typography>
                <Typography level="body-sm" color="neutral">
                  {s.desc}
                </Typography>
              </Container>
            ))}
          </Container>
        </Container>
      </section>

      {/* Promotional/Testimonial Banner */}
      <section style={{ padding: "8px 16px 32px 16px" }}>
        <div
          style={{
            position: "relative",
            borderRadius: 20,
            overflow: "hidden",
            background: `linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${testimonialImage}) center/cover no-repeat`,
          }}
        >
          <Container
            direction="row"
            gap="20px"
            background="transparent"
            padding="24px"
            style={{ alignItems: "center", flexWrap: "wrap", color: "#fff" }}
          >
            <div style={{ display: "flex", gap: 6, color: "#FFD166" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar key={i} />
              ))}
            </div>
            <Typography level="body-md" style={{ flex: 1, minWidth: 260 }}>
              “City Venture made it easy to put our business on the map. We saw
              more tourists within weeks!”
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
        </div>
      </section>

      {/* Materials-like Section (image collage) */}
      <section style={{ padding: "100px 20px", backgroundColor: colors.offWhite2 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            alignItems: "center",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Typography
              level="body-xs"
              style={{ color: "#FF914D", letterSpacing: 1 }}
            >
              RESOURCES
            </Typography>
            <Typography
              level="h2"
              fontWeight={800}
              fontSize="clamp(1.25rem, 2.5vw, 1.75rem)"
            >
              Powerful Tools For Growing Your Business
            </Typography>
            <Typography level="body-sm" color="neutral">
              From analytics to easy content updates, City Venture gives you the
              tools to showcase your best.
            </Typography>
            <a
              href="#how-it-works"
              style={{ color: "#FF914D", textDecoration: "none", fontSize: 14 }}
            >
              More info →
            </a>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            {[
              placeholderImage,
              placeholderImage,
              placeholderImage,
              placeholderImage,
            ].map((img, i) => (
              <div
                key={i}
              >
                <img
                  src={img}
                  alt={`Gallery ${i + 1}`}
                  style={{ width: "100%", height: 300, objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credibility Icons */}
      <section style={{ padding: "100px 20px", backgroundColor: "#fff" }}>
        <Container
          direction="row"
          gap="20px"
          padding="20px"
          justify="space-around"
        >
          {[
            {
              icon: <FaLock />,
              title: "Secure",
              desc: "Data privacy and protection",
            },
            {
              icon: <FaShieldAlt />,
              title: "Trusted",
              desc: "Verified partners",
            },
            {
              icon: <FaThumbsUp />,
              title: "Easy to Use",
              desc: "Designed for results",
            },
          ].map((c, idx) => (
            <Container
              key={idx}
              direction="row"
              elevation={2}
              style={{ flex: 1 }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  background: "#F1F5FB",
                  color: "#0D1B2A",
                }}
              >
                <span style={{ fontSize: 18 }}>{c.icon}</span>
              </div>
              <div>
                <Typography level="title-sm">{c.title}</Typography>
                <Typography level="body-xs" color="neutral">
                  {c.desc}
                </Typography>
              </div>
            </Container>
          ))}
        </Container>
      </section>

      {/* Testimonials - card row like reference */}
      <section style={{ padding: "100px 20px", backgroundColor: colors.offWhite2 }}>
        <Typography
          level="body-xs"
          style={{ color: "#FF914D", letterSpacing: 1, textAlign: "center" }}
        >
          TESTIMONIALS
        </Typography>
        <Typography
          level="h2"
          textAlign="center"
          fontWeight={800}
          fontSize="clamp(1.25rem, 2.5vw, 1.75rem)"
        >
          Our Client Reviews
        </Typography>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 16,
            padding: "20px",
          }}
        >
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                position: "relative",
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "0 16px 36px rgba(0,0,0,0.08)",
              }}
            >
              <img
                src={placeholderImage}
                alt={`Review ${n}`}
                style={{ width: "100%", height: 500, objectFit: "cover" }}
              />
              {/* Speech bubble overlay */}
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  right: 14,
                  bottom: 14,
                  background: "#fff",
                  borderRadius: 14,
                  padding: 12,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                }}
              >
                <Typography level="title-sm">Happy Partner</Typography>
                <Typography level="body-xs" color="neutral">
                  “Great reach and easy tools. We got more tourist visits in the
                  first month.”
                </Typography>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    color: "#FFD166",
                    marginTop: 6,
                  }}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar key={i} size={12} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
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
            Join Today – Connect Your Business with Thousands of Tourists
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

      {/* Footer (multi-column) */}
      <footer style={{ padding: 0 }}>
        <div style={{ padding: "24px 16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src={logoImage}
                  alt="City Venture logo"
                  style={{ height: 32 }}
                />
                <Typography level="title-sm">City Venture</Typography>
              </div>
              <Typography
                level="body-sm"
                color="neutral"
                style={{ marginTop: 8 }}
              >
                Helping local businesses reach more tourists with modern tools
                and visibility.
              </Typography>
            </div>
            <div>
              <Typography level="title-sm" fontWeight={700}>
                Services
              </Typography>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 8,
                  display: "grid",
                  gap: 6,
                }}
              >
                <li>
                  <a href="#features" style={footerLinkStyle}>
                    Accommodations
                  </a>
                </li>
                <li>
                  <a href="#features" style={footerLinkStyle}>
                    Shops
                  </a>
                </li>
                <li>
                  <a href="#features" style={footerLinkStyle}>
                    Events
                  </a>
                </li>
                <li>
                  <a href="#features" style={footerLinkStyle}>
                    Tourist Spots
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <Typography level="title-sm" fontWeight={700}>
                Company
              </Typography>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 8,
                  display: "grid",
                  gap: 6,
                }}
              >
                <li>
                  <a href="#how-it-works" style={footerLinkStyle}>
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#" style={footerLinkStyle}>
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" style={footerLinkStyle}>
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <Typography level="title-sm" fontWeight={700}>
                Follow Us
              </Typography>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <a href="#" aria-label="Facebook" style={socialStyle}>
                  <FaFacebook />
                </a>
                <a href="#" aria-label="Instagram" style={socialStyle}>
                  <FaInstagram />
                </a>
                <a href="#" aria-label="Twitter" style={socialStyle}>
                  <FaTwitter />
                </a>
              </div>
              <Typography
                level="body-sm"
                color="neutral"
                style={{ marginTop: 10 }}
              >
                Contact: hello@cityventure.io
              </Typography>
            </div>
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid #E8EBF0",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Typography level="body-xs" color="neutral">
            © {new Date().getFullYear()} City Venture
          </Typography>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="#" style={footerLinkStyle}>
              Terms & Conditions
            </a>
            <a href="#" style={footerLinkStyle}>
              Privacy Policy
            </a>
          </div>
        </div>
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

const footerLinkStyle: React.CSSProperties = {
  color: "#0D1B2A",
  textDecoration: "none",
  fontSize: 12,
  opacity: 0.8,
};

// (arrow button styles removed as they are unused)
