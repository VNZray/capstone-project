import React, { useEffect } from "react";
import { Grid } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Target, Eye, Linkedin, Github, Mail } from "lucide-react";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import PageContainer from "@/src/components/PageContainer";
import FooterSection from "@/src/features/landing-page/components/FooterSection";
import { colors } from "@/src/utils/Colors";

// Gold accent from Tourist Landing Page
const GOLD_ACCENT = "#C5A059";

interface TeamMemberProps {
  name: string;
  position: string;
  image: string;
  index: number;
}

const TeamMemberCard: React.FC<TeamMemberProps> = ({ name, position, image, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: "100%" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          padding: "48px 32px",
          background: "linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)",
          borderRadius: 24,
          border: "1px solid rgba(0, 0, 0, 0.04)",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-8px)";
          e.currentTarget.style.boxShadow = "0 24px 48px rgba(10, 27, 71, 0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Decorative gradient accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            borderRadius: "24px 24px 0 0",
          }}
        />

        {/* Avatar with ring */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            padding: 3,
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: "#f0f2f5",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={image}
              alt={name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>

        {/* Name & Position */}
        <div style={{ textAlign: "center" }}>
          <Typography.CardTitle size="sm" color="primary" sx={{ marginBottom: "4px" }}>
            {name}
          </Typography.CardTitle>
          <Typography.Body size="sm" sx={{ color: colors.secondary, fontWeight: 500 }}>
            {position}
          </Typography.Body>
        </div>

        {/* Social Links */}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          {[Linkedin, Github, Mail].map((Icon, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "rgba(10, 27, 71, 0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary;
                const icon = e.currentTarget.querySelector("svg");
                if (icon) (icon as SVGElement).style.color = colors.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(10, 27, 71, 0.04)";
                const icon = e.currentTarget.querySelector("svg");
                if (icon) (icon as SVGElement).style.color = colors.primary;
              }}
            >
              <Icon size={18} color={colors.primary} style={{ transition: "color 0.2s ease" }} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default function About() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const teamMembers = [
    { name: "John Doe", position: "Project Lead", image: "https://api.dicebear.com/7.x/notionists/svg?seed=john" },
    { name: "Jane Smith", position: "Full Stack Developer", image: "https://api.dicebear.com/7.x/notionists/svg?seed=jane" },
    { name: "Mike Johnson", position: "UI/UX Designer", image: "https://api.dicebear.com/7.x/notionists/svg?seed=mike" },
    { name: "Sarah Williams", position: "Backend Developer", image: "https://api.dicebear.com/7.x/notionists/svg?seed=sarah" },
  ];

  return (
    <PageContainer gap={0} padding={0} style={{ background: "#fafbfc" }}>
      {/* Floating Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "fixed",
          top: 24,
          left: 24,
          zIndex: 100,
        }}
      >
        <Button
          variant="soft"
          startDecorator={<ArrowLeft size={18} />}
          onClick={() => navigate("/")}
          sx={{
            borderRadius: 16,
            padding: "12px 24px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
            color: colors.primary,
            fontWeight: 600,
            "&:hover": {
              backgroundColor: colors.white,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            },
          }}
        >
          Back
        </Button>
      </motion.div>

      {/* Hero Section */}
      <section
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px 80px",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, #ffffff 0%, #f8f9fb 100%)",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "10%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.tertiary}40 0%, transparent 70%)`,
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "5%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.secondary}15 0%, transparent 70%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <Container
          direction="column"
          align="center"
          gap="32px"
          padding="0"
          style={{ maxWidth: 720, textAlign: "center", position: "relative", zIndex: 1 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 20px",
                borderRadius: 100,
                backgroundColor: `${GOLD_ACCENT}15`,
                color: GOLD_ACCENT,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 24,
              }}
            >
              About City Venture
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Typography.Title
              size="lg"
              color="primary"
              weight="bold"
              sx={{ lineHeight: 1.1, marginBottom: "24px" }}
            >
              We're building the future of{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                city exploration
              </span>
            </Typography.Title>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Typography.Body
              size="md"
              sx={{
                lineHeight: 1.8,
                color: colors.gray,
                maxWidth: 560,
                margin: "0 auto",
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.
            </Typography.Body>
          </motion.div>
        </Container>
      </section>

      {/* Mission & Vision Section */}
      <section
        style={{
          padding: "100px 24px",
          background: "#ffffff",
        }}
      >
        <Container
          direction="column"
          gap="80px"
          padding="0"
          style={{ maxWidth: 1100, margin: "0 auto" }}
        >
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Grid container spacing={6} alignItems="center">
              <Grid xs={12} md={5}>
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    maxWidth: 320,
                    borderRadius: 32,
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)",
                    }}
                  />
                  <Target size={80} color="white" strokeWidth={1.5} />
                </div>
              </Grid>
              <Grid xs={12} md={7}>
                <div style={{ paddingLeft: 16 }}>
                  <Typography.Label
                    size="sm"
                    sx={{
                      color: colors.secondary,
                      letterSpacing: "2px",
                      marginBottom: "16px",
                      display: "block",
                    }}
                  >
                    OUR MISSION
                  </Typography.Label>
                  <Typography.Header
                    size="md"
                    color="primary"
                    weight="bold"
                    sx={{ marginBottom: "20px", lineHeight: 1.3 }}
                  >
                    Connecting travelers with authentic local experiences
                  </Typography.Header>
                  <Typography.Body size="md" sx={{ lineHeight: 1.9, color: colors.gray }}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </Typography.Body>
                </div>
              </Grid>
            </Grid>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Grid container spacing={6} alignItems="center" direction="row-reverse">
              <Grid xs={12} md={5}>
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    maxWidth: 320,
                    marginLeft: "auto",
                    borderRadius: 32,
                    background: `linear-gradient(135deg, ${colors.secondary} 0%, #00a8cc 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)",
                    }}
                  />
                  <Eye size={80} color="white" strokeWidth={1.5} />
                </div>
              </Grid>
              <Grid xs={12} md={7}>
                <div style={{ paddingRight: 16 }}>
                  <Typography.Label
                    size="sm"
                    sx={{
                      color: colors.secondary,
                      letterSpacing: "2px",
                      marginBottom: "16px",
                      display: "block",
                    }}
                  >
                    OUR VISION
                  </Typography.Label>
                  <Typography.Header
                    size="md"
                    color="primary"
                    weight="bold"
                    sx={{ marginBottom: "20px", lineHeight: 1.3 }}
                  >
                    A world where every journey tells a story
                  </Typography.Header>
                  <Typography.Body size="md" sx={{ lineHeight: 1.9, color: colors.gray }}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </Typography.Body>
                </div>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </section>

      {/* Team Section */}
      <section
        style={{
          padding: "100px 24px 120px",
          background: "linear-gradient(180deg, #f8f9fb 0%, #ffffff 100%)",
          position: "relative",
        }}
      >
        {/* Decorative background */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            height: "60%",
            background: `radial-gradient(ellipse, ${colors.tertiary}30 0%, transparent 60%)`,
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />

        <Container
          direction="column"
          align="center"
          gap="64px"
          padding="0"
          style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}
        >
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: "center", maxWidth: 500 }}
          >
            <Typography.Label
              size="sm"
              sx={{
                color: colors.secondary,
                letterSpacing: "2px",
                marginBottom: "16px",
                display: "block",
              }}
            >
              THE TEAM
            </Typography.Label>
            <Typography.Header size="lg" color="primary" weight="bold" sx={{ marginBottom: "16px" }}>
              Meet the people behind City Venture
            </Typography.Header>
            <Typography.Body size="md" sx={{ color: colors.gray }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Typography.Body>
          </motion.div>

          {/* Team Grid */}
          <Grid container spacing={3} sx={{ width: "100%" }}>
            {teamMembers.map((member, index) => (
              <Grid key={index} xs={12} sm={6} md={3}>
                <TeamMemberCard {...member} index={index} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Footer */}
      <FooterSection />
    </PageContainer>
  );
}
