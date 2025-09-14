import { Button, Typography } from "@mui/joy";
import Container from "../components/Container";
import PageContainer from "../components/PageContainer";
import { useNavigate } from "react-router-dom";
import React from "react";
import {
  FaBed,
  FaStore,
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
  FaCheckCircle,
  FaMobileAlt,
  FaEnvelope,
  FaPhone,
  FaBuilding,
} from "react-icons/fa";

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'tourists' | 'businesses'>('tourists');

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
                onClick={() => {
                  const el = document.getElementById("how-it-works");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                sx={{
                  borderRadius: 12,
                  px: 3,
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #FF914D 50%, #28C76F 100%)',
                  boxShadow: '0 10px 26px rgba(0,0,0,0.12)',
                  border: 'none',
                  textTransform: 'none',
                  fontWeight: 700,
                  transition: 'transform 160ms ease, box-shadow 160ms ease, filter 160ms ease',
                  '&:hover': {
                    filter: 'brightness(1.02)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.14)'
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
                  },
                  '&:focusVisible': {
                    outline: 'none',
                    boxShadow: '0 0 0 3px rgba(255,145,77,0.35), 0 10px 26px rgba(0,0,0,0.12)'
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
                  const el = document.getElementById("how-it-works");
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
                <Button size="lg" variant="outlined" color="neutral" onClick={() => navigate('/login')} sx={{ borderRadius: 12 }}>
                  Login (Tourist / Admin)
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
                <Button size="lg" variant="outlined" color="neutral" onClick={() => navigate('/login')} sx={{ borderRadius: 12 }}>
                  Login (Tourist / Admin)
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

      {/* Compatibility anchor for old #features links */}
      <div id="features" aria-hidden style={{ height: 0, margin: 0, padding: 0 }} />

      {/* How It Works (tabbed, minimalistic) */}
      <section
        id="how-it-works"
        style={{ scrollMarginTop: 80, padding: "48px 16px", backgroundColor: "#ffffff" }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography
            level="h2"
            fontSize="clamp(1.5rem, 3vw, 2rem)"
            fontWeight={800}
            textAlign="center"
            textColor={colors.primary}
            sx={{ marginBottom: 1 }}
          >
            Getting Started is Simple
          </Typography>
          <Typography level="body-md" color="neutral" textAlign="center" style={{ maxWidth: 600, marginBottom: 32, opacity: 0.9 }}>
            Choose your path and follow three easy steps to get the most out of City Venture.
          </Typography>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', background: '#F7FAFC', border: '1px solid #E8EBF0', borderRadius: 12, padding: 4, marginBottom: 24 }}>
            <button 
              type="button"
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === 'tourists' ? '#ffffff' : 'transparent',
                color: activeTab === 'tourists' ? '#0A1B47' : '#6B7280',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: activeTab === 'tourists' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 200ms ease'
              }}
              onClick={() => setActiveTab('tourists')}
            >
              For Tourists
            </button>
            <button 
              type="button"
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === 'businesses' ? '#ffffff' : 'transparent',
                color: activeTab === 'businesses' ? '#0A1B47' : '#6B7280',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: activeTab === 'businesses' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 200ms ease'
              }}
              onClick={() => setActiveTab('businesses')}
            >
              For Businesses
            </button>
          </div>

          {/* Tab Content - Tourists */}
          {activeTab === 'tourists' && (
            <div style={{ width: '100%', maxWidth: 800 }}>
              <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                {[
                  {
                    number: '01',
                    title: 'Download & Sign Up',
                    desc: 'Download the City Venture app',
                    subdesc: 'Create your account in seconds',
                    icon: <FaMobileAlt />
                  },
                  {
                    number: '02',
                    title: 'Explore Naga',
                    desc: 'Browse local businesses and attractions',
                    subdesc: 'Get personalized recommendations',
                    icon: <FaMapMarkedAlt />
                  },
                  {
                    number: '03',
                    title: 'Experience More',
                    desc: 'Book services, get directions, save favorites',
                    subdesc: 'Discover hidden gems with local insights',
                    icon: <FaStar />
                  }
                ].map((step, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '20px 16px' }}>
                    <div style={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: 16, 
                      background: 'linear-gradient(135deg, #FF6B6B 0%, #FF914D 45%, #28C76F 100%)', 
                      display: 'grid', 
                      placeItems: 'center', 
                      margin: '0 auto 16px auto',
                      color: '#fff',
                      fontSize: 18
                    }}>
                      {step.icon}
                    </div>
                    <div style={{ 
                      color: '#FF914D', 
                      fontSize: 12, 
                      fontWeight: 700, 
                      letterSpacing: 2, 
                      marginBottom: 8 
                    }}>
                      {step.number}
                    </div>
                    <Typography level="title-lg" fontWeight={700} textColor={colors.primary} sx={{ marginBottom: 1 }}>
                      {step.title}
                    </Typography>
                    <Typography level="body-sm" color="neutral" sx={{ marginBottom: 0.5 }}>
                      {step.desc}
                    </Typography>
                    <Typography level="body-xs" color="neutral" sx={{ opacity: 0.8 }}>
                      {step.subdesc}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content - Businesses */}
          {activeTab === 'businesses' && (
            <div style={{ width: '100%', maxWidth: 800 }}>
              <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                {[
                  {
                    number: '01',
                    title: 'Prepare Your Business Info',
                    desc: 'Gather business permits and photos',
                    subdesc: 'Prepare your service descriptions',
                    icon: <FaListAlt />
                  },
                  {
                    number: '02',
                    title: 'Submit Application',
                    desc: 'Fill out the registration form',
                    subdesc: 'Upload required documents',
                    icon: <FaUserPlus />
                  },
                  {
                    number: '03',
                    title: 'Start Welcoming Visitors',
                    desc: 'Get approved and go live',
                    subdesc: 'Manage bookings through your dashboard',
                    icon: <FaChartLine />
                  }
                ].map((step, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '20px 16px' }}>
                    <div style={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: 16, 
                      background: 'linear-gradient(135deg, #FF6B6B 0%, #FF914D 45%, #28C76F 100%)', 
                      display: 'grid', 
                      placeItems: 'center', 
                      margin: '0 auto 16px auto',
                      color: '#fff',
                      fontSize: 18
                    }}>
                      {step.icon}
                    </div>
                    <div style={{ 
                      color: '#FF914D', 
                      fontSize: 12, 
                      fontWeight: 700, 
                      letterSpacing: 2, 
                      marginBottom: 8 
                    }}>
                      {step.number}
                    </div>
                    <Typography level="title-lg" fontWeight={700} textColor={colors.primary} sx={{ marginBottom: 1 }}>
                      {step.title}
                    </Typography>
                    <Typography level="body-sm" color="neutral" sx={{ marginBottom: 0.5 }}>
                      {step.desc}
                    </Typography>
                    <Typography level="body-xs" color="neutral" sx={{ opacity: 0.8 }}>
                      {step.subdesc}
                    </Typography>
                  </div>
                ))}
              </div>
              
              {/* Business CTA */}
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
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
                    Start Your Application
                  </Button>
                  <Button size="lg" variant="outlined" color="neutral" onClick={() => navigate('/login')} sx={{ borderRadius: 12 }}>
                    Login (Tourist / Admin)
                  </Button>
                  <Button size="lg" variant="outlined" color="neutral" onClick={() => navigate('/business/login')} sx={{ borderRadius: 12 }}>
                    Business Login
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>


      {/* Promotional/Testimonial Banner removed as requested */}

      {/* Resources section removed as requested */}

      {/* Credibility Icons removed as requested */}

      {/* Testimonials section removed as requested */}

      {/* Final CTA removed as requested */}

      {/* Footer (multi-column) */}
      <footer style={{ backgroundColor: colors.primary, color: 'rgba(255, 255, 255, 0.8)', padding: '60px 16px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* 5-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', marginBottom: 40 }}>
            {/* Column 1: Brand & Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={logoImage} alt="City Venture logo" style={{ height: 32, filter: 'brightness(0) invert(1)' }} />
                <Typography level="title-lg" fontWeight={700} textColor="#fff">City Venture</Typography>
              </div>
              <Typography level="body-sm" sx={{ opacity: 0.9 }}>Your Gateway to Naga</Typography>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaEnvelope /><a href="mailto:hello@cityventure.io" style={footerLinkStyle}>hello@cityventure.io</a></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaPhone /><a href="tel:+1234567890" style={footerLinkStyle}>+1 (234) 567-890</a></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaBuilding />Naga City, Philippines</li>
              </ul>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <a href="#" aria-label="Facebook" style={socialStyle}><FaFacebook /></a>
                <a href="#" aria-label="Instagram" style={socialStyle}><FaInstagram /></a>
                <a href="#" aria-label="Twitter" style={socialStyle}><FaTwitter /></a>
              </div>
            </div>

            {/* Column 2: For Tourists */}
            <div>
              <Typography level="title-sm" fontWeight={700} sx={{ color: '#fff', marginBottom: 2 }}>For Tourists</Typography>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                <li><a href="#" style={footerLinkStyle}>Explore</a></li>
                <li><a href="#" style={footerLinkStyle}>Download App</a></li>
                <li><a href="#" style={footerLinkStyle}>Popular Attractions</a></li>
                <li><a href="#" style={footerLinkStyle}>Local Events</a></li>
                <li><a href="#" style={footerLinkStyle}>Travel Guide</a></li>
                <li><a href="#" style={footerLinkStyle}>FAQ for Tourists</a></li>
              </ul>
            </div>

            {/* Column 3: For Businesses */}
            <div>
              <Typography level="title-sm" fontWeight={700} sx={{ color: '#fff', marginBottom: 2 }}>Partner With Us</Typography>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                <li><a href="/business/signup" style={footerLinkStyle}>Business Registration</a></li>
                <li><a href="/login" style={footerLinkStyle}>Tourist/Admin Login</a></li>
                <li><a href="/business/login" style={footerLinkStyle}>Partner Portal Login</a></li>
                <li><a href="#" style={footerLinkStyle}>Business Resources</a></li>
                <li><a href="#" style={footerLinkStyle}>Pricing/Plans</a></li>
                <li><a href="#" style={footerLinkStyle}>FAQ for Businesses</a></li>
              </ul>
            </div>

            {/* Column 4: Company */}
            <div>
              <Typography level="title-sm" fontWeight={700} sx={{ color: '#fff', marginBottom: 2 }}>Company</Typography>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                <li><a href="#about" style={footerLinkStyle}>About City Venture</a></li>
                <li><a href="#how-it-works" style={footerLinkStyle}>How It Works</a></li>
                <li><a href="#" style={footerLinkStyle}>Blog/News</a></li>
                <li><a href="#" style={footerLinkStyle}>Careers</a></li>
                <li><a href="#" style={footerLinkStyle}>Press Kit</a></li>
              </ul>
            </div>

            {/* Column 5: Support & Legal */}
            <div>
              <Typography level="title-sm" fontWeight={700} sx={{ color: '#fff', marginBottom: 2 }}>Help & Legal</Typography>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                <li><a href="#" style={footerLinkStyle}>Help Center</a></li>
                <li><a href="#" style={footerLinkStyle}>Contact Support</a></li>
                <li><a href="#" style={footerLinkStyle}>Terms of Service</a></li>
                <li><a href="#" style={footerLinkStyle}>Privacy Policy</a></li>
                <li><a href="#" style={footerLinkStyle}>Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <Typography level="body-xs" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>© {new Date().getFullYear()} City Venture</Typography>
              <Typography level="body-xs" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Made with ❤️ in Naga</Typography>
            </div>
            <div className="store-buttons">
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
      </footer>
    </PageContainer>
  );
}

const socialStyle: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  width: 36,
  height: 36,
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.1)',
  color: '#fff',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  transition: 'transform 150ms ease, background-color 150ms ease',
};

const footerLinkStyle: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.8)',
  textDecoration: 'none',
  fontSize: 14,
  transition: 'color 150ms ease',
};

// (arrow button styles removed as they are unused)
