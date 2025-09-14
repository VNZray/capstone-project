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
  FaHeart,
} from "react-icons/fa";
import { colors } from "../utils/Colors";
// import heroImage from "@/src/assets/images/uma-hotel-residences.jpg";
import "./landing.css";
// Use curated local assets for the hero grid mosaic

// Decide how each tile spans within the 3-column mosaic grid
function tileClassFor(index: number): string {
  // Pattern inspired by the provided reference image
  // c3=wider full row; c2=two columns; r2/3=taller rows
  const pattern = [
    "span-c2 span-r2", // 0: wide and tall
    "span-r3",         // 1: tall
    "span-c2 span-r2", // 2: wide and tall
    "",                // 3: default 1x1
    "span-c3 span-r2", // 4: full row wide and tall
    "span-r2",         // 5: tall
    "",                // 6: default
    "",                // 7: default
    "span-c2 span-r2", // 8: wide and tall (bottom)
  ];
  return pattern[index % pattern.length];
}
import {
  FaUserPlus,
  FaListAlt,
  FaChartLine,
  FaMapMarkerAlt,
  FaLock,
  FaShieldAlt,
  FaThumbsUp,
  FaCheckCircle,
  FaMobileAlt,
} from "react-icons/fa";

export default function LandingPage() {
  const navigate = useNavigate();

  const logoImage = new URL("../assets/images/logo.png", import.meta.url).href;
  const testimonialImage = new URL(
    "../assets/images/placeholder-image.png",
    import.meta.url
  ).href;
  const placeholderImage = testimonialImage;

  // Curated 5-image mosaic for perfect compact hero
  const gridItems = [
    {
      src: new URL("../assets/gridimages/grid1.jpg", import.meta.url).href,
      title: "Naga Metropolitan Cathedral",
      subtitle: "Shrine of Our Lady of Peñafrancia",
    },
    {
      src: new URL("../assets/gridimages/grid2.jpg", import.meta.url).href,
      title: "Kinalas",
      subtitle: "Authentic Bicolano noodle soup",
    },
    {
      src: new URL("../assets/gridimages/grid3.jpg", import.meta.url).href,
      title: "Plaza Rizal & Heritage Village",
      subtitle: "Heart of historic Naga",
    },
    {
      src: new URL("../assets/gridimages/grid5.jpg", import.meta.url).href,
      title: "Peñafrancia Festival",
      subtitle: "Centuries of devotion",
    },
    {
      src: new URL("../assets/gridimages/grid6.jpg", import.meta.url).href,
      title: "Mt. Isarog Nature Reserve",
      subtitle: "Hike and relax",
    },
  ];

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
      {/* Hero Section: Two-column main section */}
      <section id="hero" className="main-hero" style={{ scrollMarginTop: 80 }}>
        <div className="hero-inner">
          {/* Left column: Welcome and actions */}
          <div className="hero-left">
            <span className="hero-eyebrow"><FaHeart className="heart" aria-hidden="true" /> Explore Naga City</span>
            <Typography
              level="h1"
              fontSize="clamp(2rem, 4vw, 3rem)"
              fontWeight={800}
              textColor={colors.primary}
              sx={{ lineHeight: 1.1 }}
            >
              Begin your journey in the <span className="gradient-bicol">Heart of Bicol</span>
            </Typography>
            <div className="hero-quote">— Where Faith Meets Adventure</div>
            <Typography
              level="body-lg"
              fontSize="clamp(1rem, 1.5vw, 1.15rem)"
              textColor={colors.text}
              sx={{ maxWidth: 620, opacity: 0.9 }}
            >
              Iconic attractions, vibrant culture, and hidden gems — curated in one place. From the devotion of Peñafrancia to the flavors of kinalas and the trails of Mt. Isarog, experience the city’s spirit up close.
            </Typography>

            <div className="hero-actions">
              <Button
                size="lg"
                onClick={() => navigate("/business/login")}
                sx={{
                  borderRadius: 12,
                  px: 3,
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #0077B6 0%, #0A1B47 100%)',
                  boxShadow: '0 8px 24px rgba(10,27,71,0.25)',
                  border: 'none',
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'transform 160ms ease, box-shadow 160ms ease, filter 160ms ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0B82C4 0%, #0A1B47 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 10px 28px rgba(10,27,71,0.3)'
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                    boxShadow: '0 6px 18px rgba(10,27,71,0.24)'
                  },
                  '&:focusVisible': {
                    outline: 'none',
                    boxShadow: '0 0 0 3px rgba(0,119,182,0.35), 0 8px 24px rgba(10,27,71,0.25)'
                  }
                }}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outlined"
                color="neutral"
                onClick={() => {
                  const el = document.getElementById("features");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                sx={{ borderRadius: 12 }}
              >
                Learn More
              </Button>
            </div>
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
                  <img src={item.src} alt={item.title} />
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

      {/* Value Proposition Section (Right after hero) */}
      <section id="value-proposition" className="value-prop-section" style={{ scrollMarginTop: 80 }}>
        <div className="value-prop-inner">
          <h2 className="vp-title-gradient">How City Venture Works For You</h2>
          <div className="vp-grid">
            {/* For Tourists */}
            <div className="vp-card vp-tourists">
              <div className="vp-card-header">For Tourists</div>
              <h3 className="vp-card-title">Discover Naga with our mobile app</h3>
              <p className="vp-card-text">Find attractions, events, places to stay, and local favorites. Plan your trip with beautiful maps and curated lists.</p>
              <div className="store-buttons" aria-label="Download our app">
                <button type="button" className="store-btn app-store" title="Download on the App Store" aria-label="Download on the App Store">
                  <span className="store-badge"></span>
                  <span className="store-text"><strong>App Store</strong><small>Coming soon</small></span>
                </button>
                <button type="button" className="store-btn play-store" title="Get it on Google Play" aria-label="Get it on Google Play">
                  <span className="store-badge">▶</span>
                  <span className="store-text"><strong>Google Play</strong><small>Coming soon</small></span>
                </button>
              </div>
            </div>

            {/* For Businesses */}
            <div className="vp-card vp-businesses">
              <div className="vp-card-header">For Businesses</div>
              <h3 className="vp-card-title">Showcase your business to visitors</h3>
              <p className="vp-card-text">List your hotel, shop, or service and get discovered by tourists searching and exploring Naga City.</p>
              <div className="vp-actions">
                <Button
                  size="lg"
                  onClick={() => navigate('/business/signup')}
                  sx={{
                    borderRadius: 12,
                    px: 3,
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF914D 50%, #28C76F 100%)',
                    boxShadow: '0 10px 26px rgba(0,0,0,0.12)',
                    textTransform: 'none',
                    fontWeight: 700,
                    '&:hover': { filter: 'brightness(1.02)' }
                  }}
                >
                  Register Now
                </Button>
                <Button size="lg" variant="outlined" color="neutral" onClick={() => navigate('/business/login')} sx={{ borderRadius: 12 }}>
                  Business Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choosing Us */}
      {/* About Section */}
      <section id="about" className="about-section" style={{ scrollMarginTop: 80 }}>
        <div className="about-inner">
          <span className="about-badge">About</span>
          <Typography
            level="h2"
            fontWeight={800}
            fontSize="clamp(1.5rem, 3vw, 2rem)"
            textColor={colors.primary}
            sx={{ lineHeight: 1.15, textAlign: 'center' }}
          >
            City Venture — a Tourism <span className="gradient-bicol">Digital Platform</span>
          </Typography>
          <Typography
            level="body-md"
            color="neutral"
            sx={{ maxWidth: 820, textAlign: 'center', margin: '8px auto 0', opacity: 0.9 }}
          >
            City Venture is a tourism platform dedicated to showcasing Naga’s latest attractions, local shops, and places to stay. We connect travelers with curated experiences, and help businesses get discovered through clean listings, search, and maps.
          </Typography>

          <ul className="about-features" aria-label="Highlights">
            <li>
              <span className="about-icon" aria-hidden><FaMapMarkerAlt /></span>
              <div>
                <div className="feat-title">Attractions & Culture</div>
                <div className="feat-text">Discover places, events, and experiences around the city.</div>
              </div>
            </li>
            <li>
              <span className="about-icon" aria-hidden><FaStore /></span>
              <div>
                <div className="feat-title">Local Shops</div>
                <div className="feat-text">Find trusted merchants, cafés, and specialty stores.</div>
              </div>
            </li>
            <li>
              <span className="about-icon" aria-hidden><FaBed /></span>
              <div>
                <div className="feat-title">Hotel and Accommodations</div>
                <div className="feat-text">Browse accommodations with photos, details, and amenities.</div>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section
        id="why-choose-us"
        style={{ padding: "28px 20px", backgroundColor: "#ffffff" }}
      >
        <Container padding="0" gap="20px" style={{ flex: 1 }}>
          {/* Tourist Features Section */}
          <div
            id="tourist-features"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            {/* Mobile app showcase (placeholder) */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #E8EBF0",
                borderRadius: 18,
                boxShadow: "0 14px 28px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: 14, borderBottom: "1px solid #F0F3F8" }}>
                <Typography level="title-sm" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FaMobileAlt /> Mobile App Preview
                </Typography>
              </div>
              <div style={{ height: 360, display: "grid", placeItems: "center", background: "#F7FAFC" }}>
                <img src={placeholderImage} alt="Mobile app placeholder" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", borderRadius: 12 }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, justifySelf: "center", maxWidth: 550 }}>
              <Typography level="body-xs" style={{ color: "#FF914D", letterSpacing: 1 }}>FOR TOURISTS</Typography>
              <Typography level="h2" fontWeight={800} fontSize="clamp(1.25rem, 2.5vw, 1.75rem)">
                Discover Naga with our mobile app
              </Typography>
              <Typography level="body-sm" color="neutral">
                Explore attractions, events, and local favorites. Plan with an interactive map and curated lists.
              </Typography>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                {[
                  { text: "Interactive Map" },
                  { text: "All-in-one access to information in the app" },
                  { text: "User-friendly, intuitive interface designed for all citizens" },
                ].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "#28C76F", display: "grid", placeItems: "center" }}><FaCheckCircle /></span>
                    <Typography level="body-sm" color="neutral">{f.text}</Typography>
                  </li>
                ))}
              </ul>
              <div className="store-buttons" style={{ marginTop: 8 }}>
                <button type="button" className="store-btn app-store" title="Download on the App Store" aria-label="Download on the App Store">
                  <span className="store-badge"></span>
                  <span className="store-text"><strong>App Store</strong><small>Coming soon</small></span>
                </button>
                <button type="button" className="store-btn play-store" title="Get it on Google Play" aria-label="Get it on Google Play">
                  <span className="store-badge">▶</span>
                  <span className="store-text"><strong>Google Play</strong><small>Coming soon</small></span>
                </button>
              </div>
            </div>
          </div>

          {/* Business Owner Benefits Section */}
          <div
            id="business-benefits"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10, justifySelf: "center", maxWidth: 550 }}>
              <Typography 
                level="body-xs" 
                sx={{ 
                  letterSpacing: 1,
                  background: 'linear-gradient(90deg, #FF6B6B 0%, #FF914D 45%, #28C76F 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  fontWeight: 700
                }}
              >
                FOR BUSINESS OWNERS
              </Typography>
              <Typography level="h2" fontWeight={800} fontSize="clamp(1.25rem, 2.5vw, 1.75rem)">
                Benefits of registering your business
              </Typography>
              <Typography level="body-sm" color="neutral">
                Get discovered by visitors and manage your presence with built-in tools.
              </Typography>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                {[
                  { text: "Get listed on City Venture and be discoverable in our mobile app" },
                  { text: "Access to Booking/Reservation System" },
                  { text: "Content Management Tools for listings and updates" },
                ].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "#28C76F", display: "grid", placeItems: "center" }}><FaCheckCircle /></span>
                    <Typography level="body-sm" color="neutral">{f.text}</Typography>
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                <Button
                  size="lg"
                  onClick={() => navigate('/business/signup')}
                  sx={{
                    borderRadius: 12,
                    px: 3,
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF914D 50%, #28C76F 100%)',
                    boxShadow: '0 10px 26px rgba(0,0,0,0.12)',
                    textTransform: 'none',
                    fontWeight: 700,
                    '&:hover': { filter: 'brightness(1.02)' }
                  }}
                >
                  Join Now
                </Button>
                <Button size="lg" variant="outlined" color="neutral" onClick={() => navigate('/business/login')} sx={{ borderRadius: 12 }}>
                  Business Login
                </Button>
              </div>
            </div>

            {/* Dashboard preview (placeholder) */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #E8EBF0",
                borderRadius: 18,
                boxShadow: "0 14px 28px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: 14, borderBottom: "1px solid #F0F3F8" }}>
                <Typography level="title-sm">Dashboard Preview</Typography>
              </div>
              <div style={{ height: 360, display: "grid", placeItems: "center", background: "#F7FAFC" }}>
                <img src={placeholderImage} alt="Dashboard placeholder" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", borderRadius: 12 }} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Services (card row like reference) */}
      <section
        id="features"
        style={{ scrollMarginTop: 80, padding: "24px 16px", backgroundColor: colors.offWhite2 }}
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
