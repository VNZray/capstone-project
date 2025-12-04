import React, { useState, useEffect } from "react";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Section from "@/src/components/ui/Section";
import { Grid, Avatar } from "@mui/joy";
import {
  FaStar,
  FaQuoteLeft,
  FaUsers,
  FaStore,
  FaMapMarkedAlt,
  FaTrophy,
} from "react-icons/fa";

const SocialProofSection: React.FC = () => {
  const [counters, setCounters] = useState({
    businesses: 0,
    downloads: 0,
    destinations: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  // Animated counter effect
  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    const targets = { businesses: 50, downloads: 2000, destinations: 100 };
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setCounters({
        businesses: Math.floor(targets.businesses * progress),
        downloads: Math.floor(targets.downloads * progress),
        destinations: Math.floor(targets.destinations * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounters(targets);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible]);

  // Intersection observer to trigger animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById("social-proof");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      icon: <FaStore />,
      value: counters.businesses + "+",
      label: "Partner Businesses",
      color: "#FF6B6B",
    },
    {
      icon: <FaUsers />,
      value: counters.downloads.toLocaleString() + "+",
      label: "App Downloads",
      color: "#FF914D",
    },
    {
      icon: <FaMapMarkedAlt />,
      value: counters.destinations + "+",
      label: "Destinations",
      color: "#28C76F",
    },
  ];

  const testimonials = [
    {
      type: "user",
      name: "Maria Santos",
      role: "Tourist from Manila",
      avatar: "MS",
      rating: 5,
      quote:
        "Found the best coffee shop thanks to this app! The recommendations were spot-on and the navigation made exploring Naga so easy.",
    },
    {
      type: "business",
      name: "Juan Dela Cruz",
      role: "Owner, Kinalas Corner",
      avatar: "JD",
      rating: 5,
      quote:
        "Since listing on the portal, our foot traffic increased by 20%. We're now getting tourists we never reached before!",
    },
  ];

  return (
    <Section
      id="social-proof"
      height="auto"
      minHeight={"100vh"}
      maxHeight={"auto"}
      justify="center"
      align="center"
      padding="0 0 100px 0"
    >
      {/* Animated Background Elements */}
      <div className="social-proof-bg-elements">
        <div className="wave-pattern" />
      </div>

      <Container
        padding="0"
        gap="56px"
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Stats Counter */}
        <Container padding="0" align="center" gap="32px">
          {/* Badge */}
          <Container
            padding="10px 20px"
            radius="999px"
            direction="row"
            style={{
              background:
                "linear-gradient(135deg, #FF6B6B15, #FF914D15, #28C76F15)",
              border: "1px solid #28C76F30",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FaTrophy color="#28C76F" size={14} />
            <Typography.Label
              size="xs"
              sx={{ color: "#28C76F", letterSpacing: 1.5 }}
            >
              TRUSTED PLATFORM
            </Typography.Label>
          </Container>

          <Typography.Header size="md" color="primary" align="center">
            Trusted by the Community
          </Typography.Header>

          <Grid container spacing={3} xs={12} sm={11} md={10} lg={9}>
            {stats.map((stat, index) => (
              <Grid key={index} xs={12} sm={6} md={4} lg={4} xl={4}>
                <Container
                  hover
                  hoverEffect="glow"
                  padding="28px 24px"
                  align="center"
                  gap="14px"
                  radius="18px"
                >
                  <Container
                    padding="16px"
                    radius="14px"
                    style={{
                      background: `${stat.color}15`,
                      color: stat.color,
                      fontSize: 28,
                    }}
                  >
                    {stat.icon}
                  </Container>

                  <Typography.Header size="lg" color="primary">
                    {stat.value}
                  </Typography.Header>

                  <Typography.Body
                    size="sm"
                    align="center"
                    sx={{ opacity: 0.8 }}
                  >
                    {stat.label}
                  </Typography.Body>
                </Container>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Testimonials */}
        <Container padding="0" align="center" gap="32px">
          <Container padding="0" align="center" gap="8px">
            <Typography.Header size="md" color="primary" align="center">
              What People Are Saying
            </Typography.Header>
            <Typography.Body
              size="md"
              align="center"
              sx={{ maxWidth: 600, opacity: 0.9 }}
            >
              Real feedback from tourists and business owners who've experienced
              the platform.
            </Typography.Body>
          </Container>

          <Grid container spacing={3} xs={12} sm={11} md={11} lg={10}>
            {testimonials.map((testimonial, index) => (
              <Grid key={index} xs={12} sm={12} md={6}>
                <Container
                  elevation={2}
                  hover
                  hoverEffect="lift"
                  padding="28px"
                  gap="18px"
                  radius="18px"
                  style={{
                    background: "white",
                    height: "100%",
                  }}
                >
                  {/* Quote Icon */}
                  <FaQuoteLeft size={32} color="#FF914D" opacity={0.3} />

                  {/* Rating */}
                  <Container direction="row" padding="0" gap="4px">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} color="#FFB800" size={16} />
                    ))}
                  </Container>

                  {/* Quote */}
                  <Typography.Body
                    size="md"
                    sx={{
                      fontStyle: "italic",
                      lineHeight: 1.6,
                      opacity: 0.9,
                    }}
                  >
                    "{testimonial.quote}"
                  </Typography.Body>

                  {/* Author */}
                  <Container
                    direction="row"
                    padding="0"
                    gap="12px"
                    align="center"
                  >
                    <Avatar
                      size="md"
                      sx={{
                        background:
                          "linear-gradient(135deg, #FF6B6B 0%, #FF914D 50%, #28C76F 100%)",
                        color: "white",
                        fontWeight: 700,
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>

                    <Container padding="0" gap="2px">
                      <Typography.CardTitle size="xs" color="primary">
                        {testimonial.name}
                      </Typography.CardTitle>
                      <Typography.Body size="xs" sx={{ opacity: 0.7 }}>
                        {testimonial.role}
                      </Typography.Body>
                    </Container>
                  </Container>
                </Container>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Container>
    </Section>
  );
};

export default SocialProofSection;
