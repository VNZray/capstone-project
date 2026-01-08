import React from "react";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { Box, Grid } from "@mui/joy";
import Section from "@/src/components/ui/Section";
import { useNavigate } from "react-router-dom";
import { colors } from "@/src/utils/Colors";
import { ArrowRight, Play } from "lucide-react";
import dashboardPreview from "@/src/assets/images/dashboard_preview.png";

/**
 * BusinessHeroSection - Clean, professional hero section
 * Based on modern SaaS landing page design patterns
 */
const BusinessHeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Section
      align="center"
      justify="flex-start"
      height="auto"
      minHeight="auto"
      maxHeight="auto"
      id="hero"
      padding="120px 24px 80px"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%)",
      }}
    >
      {/* Subtle decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "40%",
          height: "100%",
          background: "linear-gradient(135deg, rgba(251,191,36,0.03) 0%, rgba(251,191,36,0.08) 100%)",
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
          pointerEvents: "none",
        }}
      />

      <Grid
        xs={12}
        sm={12}
        md={11}
        lg={10}
        xl={10}
        container
        spacing={4}
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Grid xs={12}>
          <Container
            padding="0"
            direction="column"
            align="center"
            style={{ textAlign: "center", maxWidth: 800, margin: "0 auto" }}
          >
            {/* Main Headline */}
            <Typography.Title
              size="lg"
              weight="black"
              sx={{
                lineHeight: 1.1,
                marginBottom: 3,
                color: colors.primary,
                fontSize: { xs: "2.5rem", sm: "3rem", md: "3.75rem", lg: "4.25rem" },
                letterSpacing: "-0.02em",
                textAlign: "center",
              }}
            >
              Elevate Your Business
              <br />
              To New{" "}
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(135deg, #c9a227 0%, #d4af37 50%, #a68b1f 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Heights
              </Box>
            </Typography.Title>

            {/* Subheadline */}
            <Typography.Body
              size="lg"
              sx={{
                color: "#64748b",
                fontSize: { xs: "1rem", md: "1.2rem" },
                maxWidth: 620,
                marginBottom: 5,
                lineHeight: 1.7,
                textAlign: "center",
              }}
            >
              Join the premier platform connecting visionary business owners with
              powerful tools, trusted partners, and limitless growth opportunities.
            </Typography.Body>

            {/* CTA Buttons */}
            <Container 
              padding="0" 
              direction="row" 
              justify="center" 
              gap="16px" 
              style={{ flexWrap: "wrap", marginBottom: 64 }}
            >
              <Button
                size="lg"
                onClick={() => navigate("/business-registration")}
                sx={{
                  background: colors.primary,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "1rem",
                  borderRadius: 100,
                  padding: "16px 32px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    background: "#0a1a3d",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(13,27,42,0.25)",
                  },
                }}
                endDecorator={<ArrowRight size={18} />}
              >
                Start Your Journey
              </Button>

              <Button
                size="lg"
                variant="outlined"
                onClick={() => {
                  const el = document.getElementById("how-it-works");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                sx={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  fontWeight: 600,
                  fontSize: "1rem",
                  borderRadius: 100,
                  padding: "16px 32px",
                  borderWidth: 2,
                  "&:hover": {
                    background: "rgba(13,27,42,0.04)",
                    borderColor: colors.primary,
                  },
                }}
                startDecorator={
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: `2px solid ${colors.primary}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Play size={10} fill={colors.primary} color={colors.primary} />
                  </Box>
                }
              >
                Watch Demo
              </Button>
            </Container>

            {/* Browser Mockup with Dashboard Preview */}
            <Box
              sx={{
                width: "100%",
                maxWidth: 1000,
                margin: "0 auto",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 25px 80px rgba(0,0,0,0.15), 0 10px 30px rgba(0,0,0,0.1)",
                background: "#fff",
              }}
            >
              {/* Browser Chrome */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  padding: "12px 16px",
                  background: "#f8f9fa",
                  borderBottom: "1px solid #e9ecef",
                }}
              >
                {/* Traffic lights */}
                <Box sx={{ display: "flex", gap: 0.75 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#ff5f57",
                    }}
                  />
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#febc2e",
                    }}
                  />
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#28c840",
                    }}
                  />
                </Box>
              </Box>

              {/* Dashboard Image */}
              <Box
                component="img"
                src={dashboardPreview}
                alt="City Venture Business Dashboard"
                sx={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </Box>
          </Container>
        </Grid>
      </Grid>
    </Section>
  );
};

export default BusinessHeroSection;
