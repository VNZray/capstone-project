import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import DynamicTab from "@/src/components/ui/DynamicTab";
import { Grid } from "@mui/joy";
import {
  FaMobileAlt,
  FaMapMarkedAlt,
  FaStar,
  FaListAlt,
  FaUserPlus,
  FaChartLine,
} from "react-icons/fa";
import Section from "@/src/components/ui/Section";

const HowItWorksSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"tourists" | "businesses">(
    "tourists"
  );
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const tabs = [
    { id: "tourists", label: "For Tourists" },
    { id: "businesses", label: "For Businesses" },
  ];

  const touristSteps = [
    {
      number: "01",
      title: "Download & Sign Up",
      desc: "Download the City Venture app",
      subdesc: "Create your account in seconds",
      icon: <FaMobileAlt />,
    },
    {
      number: "02",
      title: "Explore Naga",
      desc: "Browse local businesses and attractions",
      subdesc: "Get personalized recommendations",
      icon: <FaMapMarkedAlt />,
    },
    {
      number: "03",
      title: "Experience More",
      desc: "Book services, get directions, save favorites",
      subdesc: "Discover hidden gems with local insights",
      icon: <FaStar />,
    },
  ];

  const businessSteps = [
    {
      number: "01",
      title: "Prepare Your Business Info",
      desc: "Gather business permits and photos",
      subdesc: "Prepare your service descriptions",
      icon: <FaListAlt />,
    },
    {
      number: "02",
      title: "Submit Application",
      desc: "Fill out the registration form",
      subdesc: "Upload required documents",
      icon: <FaUserPlus />,
    },
    {
      number: "03",
      title: "Start Welcoming Visitors",
      desc: "Get approved and go live",
      subdesc: "Manage bookings through your dashboard",
      icon: <FaChartLine />,
    },
  ];

  const steps = activeTab === "tourists" ? touristSteps : businessSteps;

  return (
    <Section
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, #FAFBFC 0%, #F0F4F8 100%)",
      }}
      align="center"
      justify="center"
      id="how-it-works"
      minHeight="100vh"
      height="auto"
    >
      {/* Animated Background - Travel Theme */}
      <div className="how-it-works-bg">
        <div className="map-lines" />
        <div className="dot-grid" />
      </div>

      <Container
        width="100%"
        padding="0"
        align="center"
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Badge */}
        <Container
          padding="10px 20px"
          radius="999px"
          direction="row"
          style={{
            background:
              "linear-gradient(135deg, #FF6B6B15, #FF914D15, #28C76F15)",
            border: "1px solid #FF914D30",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <FaStar color="#FF914D" size={14} />
          <Typography.Label
            size="xs"
            sx={{ color: "#FF914D", letterSpacing: 1.5 }}
          >
            QUICK START GUIDE
          </Typography.Label>
        </Container>

        <Typography.Header size="md" color="primary" align="center">
          Getting Started is Simple
        </Typography.Header>

        <Typography.Body
          size="md"
          align="center"
          sx={{ maxWidth: 600, opacity: 0.9 }}
        >
          Choose your path and follow three easy steps to get the most out of
          City Venture.
        </Typography.Body>

        {/* Tab Navigation using DynamicTab */}
        <DynamicTab
          tabs={tabs}
          activeTabId={activeTab}
          onChange={(id) => setActiveTab(id as "tourists" | "businesses")}
          colorScheme="primary"
          size="md"
          variant="filled"
          padding={4}
          customStyle={{
            background: "#F7FAFC",
            border: "1px solid #E8EBF0",
            borderRadius: 12,
          }}
        />

        {/* Steps Grid */}
        <Grid xs={12} sm={11} md={11} lg={9} container spacing={2}>
          {steps.map((step, i) => (
            <Grid key={i} xs={12} sm={12} md={6} lg={4}>
              <Container
                elevation={hoveredStep === i ? 4 : 1}
                hover
                hoverEffect="lift"
                align="center"
                padding="28px 24px"
                radius="18px"
                gap="10px"
                background="white"
                onMouseEnterProp={() => setHoveredStep(i)}
                onMouseLeaveProp={() => setHoveredStep(null)}
                style={{
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform:
                    hoveredStep === i
                      ? "translateY(-8px) scale(1.02)"
                      : "translateY(0) scale(1)",
                  border:
                    hoveredStep === i
                      ? "2px solid #FF914D30"
                      : "2px solid transparent",
                  position: "relative",
                }}
              >
                {/* Step Number Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    right: 20,
                    background: "linear-gradient(135deg, #FF6B6B, #FF914D)",
                    color: "white",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: 14,
                    boxShadow: "0 4px 12px rgba(255, 145, 77, 0.3)",
                    opacity: hoveredStep === i ? 1 : 0.8,
                    transform: hoveredStep === i ? "scale(1.1)" : "scale(1)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {step.number}
                </div>

                <Container
                  padding="18px"
                  radius="16px"
                  style={{
                    background:
                      hoveredStep === i
                        ? "linear-gradient(135deg, #FF6B6B 0%, #FF914D 45%, #28C76F 100%)"
                        : "linear-gradient(135deg, #FF6B6B20 0%, #FF914D20 45%, #28C76F20 100%)",
                    color: hoveredStep === i ? "#fff" : "#FF914D",
                    fontSize: 28,
                    display: "grid",
                    placeItems: "center",
                    transition: "all 0.4s ease",
                    transform:
                      hoveredStep === i
                        ? "rotate(5deg) scale(1.1)"
                        : "rotate(0) scale(1)",
                  }}
                >
                  {step.icon}
                </Container>

                <Typography.CardTitle
                  size="sm"
                  color="primary"
                  align="center"
                  sx={{
                    transition: "color 0.3s ease",
                    color: hoveredStep === i ? "#FF914D" : "inherit",
                  }}
                >
                  {step.title}
                </Typography.CardTitle>

                <Typography.Body size="sm" align="center" sx={{ opacity: 0.9 }}>
                  {step.desc}
                </Typography.Body>

                <Typography.Body size="xs" align="center" sx={{ opacity: 0.7 }}>
                  {step.subdesc}
                </Typography.Body>

                {/* Animated Progress Bar */}
                <div
                  style={{
                    width: "100%",
                    height: 4,
                    background: "#F0F4F8",
                    borderRadius: 2,
                    overflow: "hidden",
                    marginTop: 8,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background:
                        "linear-gradient(90deg, #FF6B6B, #FF914D, #28C76F)",
                      width: hoveredStep === i ? "100%" : "0%",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </Container>
            </Grid>
          ))}
        </Grid>

        {/* CTA for businesses tab */}
        {activeTab === "businesses" && (
          <Container
            direction="row"
            gap="12px"
            padding="0"
            justify="center"
            style={{ flexWrap: "wrap", marginTop: 16 }}
          >
            <Button
              size="lg"
              colorScheme="primary"
              onClick={() => navigate("/business-registration")}
              sx={{
                borderRadius: 12,
                px: 3,
                background:
                  "linear-gradient(135deg, #FF6B6B 0%, #FF914D 50%, #28C76F 100%)",
                color: "#fff",
              }}
            >
              Start Your Application
            </Button>
            <Button
              size="lg"
              variant="outlined"
              colorScheme="gray"
              onClick={() => navigate("/business/login")}
              sx={{ borderRadius: 12 }}
            >
              Login
            </Button>
          </Container>
        )}
      </Container>

      <style>{`
        .how-it-works-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }

        .map-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 145, 77, 0.05) 2px, transparent 2px),
            linear-gradient(90deg, rgba(255, 145, 77, 0.05) 2px, transparent 2px);
          background-size: 100px 100px;
          animation: map-scroll 30s linear infinite;
        }

        .travel-icons {
          position: absolute;
          inset: 0;
        }

        .icon-float {
          position: absolute;
          font-size: 2rem;
          opacity: 0.15;
          animation: float-gentle 20s ease-in-out infinite;
        }

        .icon-plane {
          top: 15%;
          left: 10%;
          animation-delay: 0s;
        }

        .icon-compass {
          top: 60%;
          right: 15%;
          animation-delay: 4s;
        }

        .icon-mountain {
          top: 30%;
          right: 20%;
          animation-delay: 8s;
        }

        .icon-building {
          bottom: 20%;
          left: 15%;
          animation-delay: 12s;
        }

        .icon-leaf {
          bottom: 35%;
          right: 25%;
          animation-delay: 16s;
        }

        .dot-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255, 145, 77, 0.3) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        @keyframes map-scroll {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(100px, 100px);
          }
        }

        @keyframes float-gentle {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(30px, -30px) rotate(5deg);
          }
          50% {
            transform: translate(-20px, -40px) rotate(-5deg);
          }
          75% {
            transform: translate(40px, -20px) rotate(3deg);
          }
        }

        @media (max-width: 768px) {
          .icon-float {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </Section>
  );
};

export default HowItWorksSection;
