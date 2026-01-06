import { useEffect } from "react";
import "./style/landing.css";
import PageContainer from "@/src/components/PageContainer";
import Section from "@/src/components/ui/Section";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { Grid, Box, Chip } from "@mui/joy";
import { ArrowRight, TrendingUp, Users, Shield, Zap, LayoutDashboard, CreditCard, BarChart3, Bell, Star, Calendar, Quote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FooterSection from "./components/FooterSection";
import Navbar from "./components/Navbar";
import BusinessHeroSection from "./components/BusinessHeroSection";
import { colors } from "@/src/utils/Colors";

/**
 * Business Landing Page - Placeholder
 * This page serves as the entry point for businesses looking to join City Venture.
 * It will showcase business benefits, features, and guide them to registration.
 */
export default function BusinessLandingPage() {
  const navigate = useNavigate();
  const logoImage = new URL("../assets/images/logo.png", import.meta.url).href;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: <TrendingUp size={24} strokeWidth={1.5} />,
      title: "Accelerated Growth",
      description: "Our platform connects you with thousands of tourists actively searching for businesses like yours in Naga City.",
    },
    {
      icon: <Users size={24} strokeWidth={1.5} />,
      title: "Exclusive Network",
      description: "Connect with verified tourists, fellow business owners, and partners within our growing tourism ecosystem.",
    },
    {
      icon: <Shield size={24} strokeWidth={1.5} />,
      title: "Enterprise Security",
      description: "Bank-grade encryption and PayMongo integration ensure your business data and transactions remain secure.",
    },
    {
      icon: <Zap size={24} strokeWidth={1.5} />,
      title: "Seamless Integration",
      description: "Manage bookings, orders, and payments in one dashboard. We make running your business effortless.",
    },
  ];

  return (
    <PageContainer gap={0} padding={0} id="top">
      {/* Navbar */}
      <Navbar solid />

      {/* Hero Section */}
      <BusinessHeroSection />

      {/* Trusted By Section */}
      <Section
        align="center"
        justify="center"
        height="auto"
        minHeight="auto"
        padding="32px 24px"
        background="#fff"
        style={{
          borderTop: "1px solid #e2e8f0",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Container direction="column" align="center" padding="0">
          <Typography.Body
            size="xs"
            sx={{
              color: "#94a3b8",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Trusted by Naga's Best
          </Typography.Body>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 4, md: 8 },
              flexWrap: "wrap",
            }}
          >
            {["Villa Caceres", "Avenue Plaza", "Robertson", "Bigg's Diner", "Bob Marlin"].map((name) => (
              <Typography.Body
                key={name}
                size="lg"
                sx={{
                  color: "#64748b",
                  fontWeight: 600,
                  fontSize: { xs: "1rem", md: "1.25rem" },
                  opacity: 0.7,
                }}
              >
                {name}
              </Typography.Body>
            ))}
          </Box>
        </Container>
      </Section>

      {/* Features Section */}
      <Section
        align="center"
        justify="center"
        height="auto"
        minHeight="auto"
        id="features"
        padding="100px 24px"
        background="#fff"
      >
        <Grid xs={12} sm={12} md={11} lg={10} container spacing={4}>
          {/* Header - Left aligned */}
          <Grid xs={12} md={5}>
            <Container direction="column" align="flex-start" padding="0" style={{ marginBottom: 48 }}>
              <Typography.Title
                size="md"
                weight="bold"
                sx={{
                  color: colors.primary,
                  lineHeight: 1.2,
                  marginBottom: 2,
                }}
              >
                Why Business Leaders
                <br />
                <Box
                  component="span"
                  sx={{
                    background: "linear-gradient(135deg, #c9a227 0%, #d4af37 50%, #a68b1f 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Choose City Venture
                </Box>
              </Typography.Title>
              <Typography.Body
                size="md"
                sx={{
                  color: "#64748b",
                  maxWidth: 420,
                  lineHeight: 1.7,
                }}
              >
                We don't just provide tools; we provide a foundation for scalable, 
                sustainable success in a competitive market.
              </Typography.Body>
            </Container>
          </Grid>

          {/* Decorative element */}
          <Grid xs={12} md={7} sx={{ display: { xs: "none", md: "flex" }, justifyContent: "flex-end", alignItems: "flex-end" }}>
            <Box
              sx={{
                width: 60,
                height: 4,
                background: colors.primary,
                borderRadius: 2,
                marginBottom: 6,
              }}
            />
          </Grid>

          {/* Feature Cards */}
          {features.map((feature, index) => (
            <Grid xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  padding: "32px 24px",
                  background: "#fff",
                  borderRadius: "16px",
                  height: "100%",
                  border: "1px solid #f1f5f9",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "#e2e8f0",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                  },
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    color: colors.primary,
                    marginBottom: 3,
                  }}
                >
                  {feature.icon}
                </Box>

                {/* Title */}
                <Typography.CardTitle
                  size="sm"
                  weight="bold"
                  sx={{
                    color: colors.primary,
                    marginBottom: 1.5,
                  }}
                >
                  {feature.title}
                </Typography.CardTitle>

                {/* Description */}
                <Typography.Body
                  size="sm"
                  sx={{
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </Typography.Body>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* System Features/Tools Section */}
      <Section
        align="center"
        justify="center"
        height="auto"
        minHeight="auto"
        id="tools"
        padding="100px 24px"
        background="#f8fafc"
      >
        <Grid xs={12} sm={12} md={11} lg={10} container spacing={4}>
          {/* Header */}
          <Grid xs={12}>
            <Container direction="column" align="center" padding="0" style={{ marginBottom: 48 }}>
              <Typography.Body
                size="sm"
                sx={{
                  color: "#94a3b8",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}
              >
                Platform Features
              </Typography.Body>
              <Typography.Title
                size="md"
                weight="bold"
                sx={{
                  color: colors.primary,
                  textAlign: "center",
                  marginBottom: 2,
                }}
              >
                Everything You Need to{" "}
                <Box
                  component="span"
                  sx={{
                    background: "linear-gradient(135deg, #c9a227 0%, #d4af37 50%, #a68b1f 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Run Your Business
                </Box>
              </Typography.Title>
              <Typography.Body
                size="md"
                sx={{
                  color: "#64748b",
                  maxWidth: 600,
                  textAlign: "center",
                  lineHeight: 1.7,
                }}
              >
                A comprehensive suite of tools designed to streamline your operations
                and maximize your business potential.
              </Typography.Body>
            </Container>
          </Grid>

          {/* Tool Cards */}
          {[
            {
              icon: <LayoutDashboard size={28} strokeWidth={1.5} />,
              title: "Business Dashboard",
              description: "Real-time overview of your bookings, orders, and performance metrics all in one place.",
            },
            {
              icon: <CreditCard size={28} strokeWidth={1.5} />,
              title: "Payment Processing",
              description: "Secure PayMongo integration for seamless online payments with fast payouts.",
            },
            {
              icon: <BarChart3 size={28} strokeWidth={1.5} />,
              title: "Analytics & Reports",
              description: "Detailed insights into customer behavior, revenue trends, and business performance.",
            },
            {
              icon: <Calendar size={28} strokeWidth={1.5} />,
              title: "Booking Management",
              description: "Effortlessly manage reservations, appointments, and availability schedules.",
            },
            {
              icon: <Bell size={28} strokeWidth={1.5} />,
              title: "Real-time Notifications",
              description: "Instant alerts for new bookings, orders, and customer inquiries.",
            },
            {
              icon: <Star size={28} strokeWidth={1.5} />,
              title: "Reviews & Ratings",
              description: "Build trust with customer reviews and maintain your business reputation.",
            },
          ].map((tool, index) => (
            <Grid xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  padding: "32px",
                  background: "#fff",
                  borderRadius: "16px",
                  height: "100%",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
                    borderColor: colors.primary,
                  },
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "12px",
                    background: `${colors.primary}08`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.primary,
                    marginBottom: 3,
                  }}
                >
                  {tool.icon}
                </Box>

                {/* Title */}
                <Typography.CardTitle
                  size="sm"
                  weight="bold"
                  sx={{
                    color: colors.primary,
                    marginBottom: 1.5,
                  }}
                >
                  {tool.title}
                </Typography.CardTitle>

                {/* Description */}
                <Typography.Body
                  size="sm"
                  sx={{
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  {tool.description}
                </Typography.Body>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* Registration Steps Section */}
      <Section
        align="center"
        justify="center"
        height="auto"
        minHeight="auto"
        id="how-it-works"
        background={colors.primary}
        padding="48px 24px"
      >
        {/* Section Header */}
        <Grid xs={12} sx={{ textAlign: "center", marginBottom: 3 }}>
          <Chip
            variant="soft"
            size="sm"
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.7rem",
              marginBottom: 1,
              padding: "2px 10px",
            }}
          >
            EASY REGISTRATION
          </Chip>
          <Typography.Header
            size="md"
            weight="bold"
            sx={{
              color: "#fff",
              marginBottom: 1,
            }}
          >
            Get Started in 3 Simple Steps
          </Typography.Header>
          <Typography.Body
            size="sm"
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              maxWidth: 500,
              margin: "0 auto",
            }}
          >
            Join City Venture and start growing your business today.
          </Typography.Body>
        </Grid>

        {/* Steps */}
        <Grid container spacing={2} sx={{ maxWidth: 900, margin: "0 auto" }}>
          {[
            {
              step: "1",
              title: "Create Your Account",
              description: "Sign up with your email and basic info.",
              icon: <Users size={20} />,
            },
            {
              step: "2",
              title: "Set Up Your Business",
              description: "Add details, photos, and customize offerings.",
              icon: <LayoutDashboard size={20} />,
            },
            {
              step: "3",
              title: "Start Accepting Bookings",
              description: "Go live and grow your revenue.",
              icon: <TrendingUp size={20} />,
            },
          ].map((item, index) => (
            <Grid key={index} xs={12} md={4}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: 2,
                  position: "relative",
                }}
              >
                {/* Step Badge */}
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #c9a227 0%, #d4af37 50%, #a68b1f 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.primary,
                    marginBottom: 1.5,
                    boxShadow: "0 4px 12px rgba(201, 162, 39, 0.4)",
                    position: "relative",
                  }}
                >
                  {item.icon}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: colors.primary,
                      border: "2px solid #d4af37",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {item.step}
                  </Box>
                </Box>

                {/* Title */}
                <Typography.CardTitle
                  size="sm"
                  weight="bold"
                  sx={{
                    color: "#fff",
                    marginBottom: 0.5,
                  }}
                >
                  {item.title}
                </Typography.CardTitle>

                {/* Description */}
                <Typography.Body
                  size="xs"
                  sx={{
                    color: "rgba(255, 255, 255, 0.75)",
                    lineHeight: 1.5,
                  }}
                >
                  {item.description}
                </Typography.Body>

                {/* Connector Line (for non-last items on desktop) */}
                {index < 2 && (
                  <Box
                    sx={{
                      display: { xs: "none", md: "block" },
                      position: "absolute",
                      top: "32px",
                      right: "-16px",
                      width: 32,
                      height: 2,
                      background: "linear-gradient(90deg, rgba(212, 175, 55, 0.6), rgba(212, 175, 55, 0.2))",
                    }}
                  />
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* CTA Button */}
        <Grid xs={12} sx={{ textAlign: "center", marginTop: 3 }}>
          <Button
            variant="solid"
            size="md"
            onClick={() => navigate("/register")}
            sx={{
              background: "linear-gradient(135deg, #c9a227 0%, #d4af37 50%, #a68b1f 100%)",
              color: colors.primary,
              padding: "10px 24px",
              fontSize: "0.9rem",
              fontWeight: 600,
              borderRadius: "10px",
              "&:hover": {
                background: "linear-gradient(135deg, #d4af37 0%, #e5c040 50%, #c9a227 100%)",
                filter: "brightness(1.05)",
              },
            }}
          >
            Register Your Business
            <ArrowRight size={16} style={{ marginLeft: 8 }} />
          </Button>
        </Grid>
      </Section>

      {/* Testimonials Section */}
      <Section
        align="center"
        justify="center"
        height="auto"
        minHeight="auto"
        id="testimonials"
        background="#fff"
        padding="64px 24px"
      >
        <Grid xs={12} sm={12} md={11} lg={10} container spacing={3}>
          {/* Header */}
          <Grid xs={12} sx={{ textAlign: "center", marginBottom: 4 }}>
            <Typography.Title
              size="md"
              weight="bold"
              sx={{
                color: colors.primary,
              }}
            >
              Voices of Success
            </Typography.Title>
          </Grid>

          {/* Testimonial Cards */}
          {[
            {
              quote: "City Venture transformed how we reach tourists. Our bookings increased by 40% in the first quarter alone.",
              name: "Maria Santos",
              title: "OWNER",
              company: "VILLA CACERES HOTEL",
              avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            },
            {
              quote: "The platform is incredibly intuitive and powerful. Finally, software that respects our time and grows with us.",
              name: "Juan Dela Cruz",
              title: "MANAGER",
              company: "BIGG'S DINER",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            },
            {
              quote: "Getting started was a breeze. We were operational and connecting with customers within hours.",
              name: "Ana Reyes",
              title: "DIRECTOR",
              company: "BOB MARLIN RESTAURANT",
              avatar: "https://randomuser.me/api/portraits/women/68.jpg",
            },
          ].map((testimonial, index) => (
            <Grid key={index} xs={12} md={4}>
              <Box
                sx={{
                  padding: "24px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Quote Icon */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #c9a227 0%, #d4af37 50%, #a68b1f 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 2,
                  }}
                >
                  <Quote size={20} color="#fff" fill="#fff" />
                </Box>

                {/* Quote Text */}
                <Typography.Body
                  size="sm"
                  sx={{
                    color: "#475569",
                    lineHeight: 1.7,
                    fontStyle: "italic",
                    marginBottom: 3,
                    flex: 1,
                  }}
                >
                  "{testimonial.quote}"
                </Typography.Body>

                {/* Author Info */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    component="img"
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <Box>
                    <Typography.Body
                      size="sm"
                      sx={{
                        color: colors.primary,
                        fontWeight: 600,
                      }}
                    >
                      {testimonial.name}
                    </Typography.Body>
                    <Typography.Body
                      size="xs"
                      sx={{
                        color: "#94a3b8",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {testimonial.title}, {testimonial.company}
                    </Typography.Body>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* CTA Section - Placeholder */}
      <Section
        align="center"
        justify="center"
        height="auto"
        minHeight="auto"
        id="cta"
        background="#f1f5f9"
        padding="64px 24px"
      >
        <Grid xs={12} sm={12} md={8} lg={6}>
          <Container
            direction="column"
            align="center"
            padding="48px"
            background="#fff"
            radius="24px"
            style={{
              textAlign: "center",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}
          >
            <Typography.Title size="sm" weight="bold" color="primary">
              Ready to Get Started?
            </Typography.Title>
            <Typography.Body size="md" sx={{ opacity: 0.8, marginBottom: 3 }}>
              Join hundreds of businesses already growing with City Venture.
              Registration is free and takes only a few minutes.
            </Typography.Body>
            <Button
              size="lg"
              onClick={() => navigate("/business-registration")}
              sx={{
                backgroundColor: colors.primary,
                color: "#fff",
                fontWeight: 700,
                borderRadius: 12,
                padding: "14px 32px",
                "&:hover": {
                  backgroundColor: "#0a1a3d",
                },
              }}
              endDecorator={<ArrowRight size={18} />}
            >
              Register Now — It's Free
            </Button>
          </Container>
        </Grid>
      </Section>

      {/* Footer */}
      <FooterSection logoImage={logoImage} />
    </PageContainer>
  );
}
