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

const HowItWorksSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"tourists" | "businesses">(
    "tourists"
  );

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
    <section
      id="how-it-works"
      style={{
        scrollMarginTop: 80,
        padding: 16,
      }}
    >
      <Container padding="0" align="center" style={{ margin: "60px 0" }}>
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
                elevation={1}
                hover
                hoverEffect="lift"
                align="center"
                padding="24px"
                radius="16px"
                gap="6px"
              >
                <Container
                  padding="16px"
                  radius="16px"
                  style={{
                    background:
                      "linear-gradient(135deg, #FF6B6B 0%, #FF914D 45%, #28C76F 100%)",
                    color: "#fff",
                    fontSize: 24,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {step.icon}
                </Container>

                <Typography.Label
                  size="md"
                  sx={{
                    color: "#FF914D",
                    letterSpacing: 2,
                  }}
                >
                  {step.number}
                </Typography.Label>

                <Typography.CardTitle size="sm" color="primary" align="center">
                  {step.title}
                </Typography.CardTitle>

                <Typography.Body size="sm" align="center" sx={{ opacity: 0.9 }}>
                  {step.desc}
                </Typography.Body>

                <Typography.Body size="xs" align="center" sx={{ opacity: 0.7 }}>
                  {step.subdesc}
                </Typography.Body>
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
              onClick={() => navigate("/business/signup")}
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
              onClick={() => navigate("/login")}
              sx={{ borderRadius: 12 }}
            >
              Login
            </Button>
          </Container>
        )}
      </Container>
    </section>
  );
};

export default HowItWorksSection;
