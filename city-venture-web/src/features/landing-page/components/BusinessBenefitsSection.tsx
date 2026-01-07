import React from "react";
import { useNavigate } from "react-router-dom";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { Grid, Chip } from "@mui/joy";
import {
  FaChartLine,
  FaMapMarkedAlt,
  FaCalendarCheck,
  FaCreditCard,
  FaBullhorn,
  FaUsers,
} from "react-icons/fa";
import Section from "@/src/components/ui/Section";

const BusinessBenefitsSection: React.FC = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <FaMapMarkedAlt size={28} />,
      title: "Get Discovered",
      description:
        "Your business appears in our mobile app with photos, details, and location. Tourists can easily find you while exploring Naga.",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      icon: <FaCalendarCheck size={28} />,
      title: "Booking System",
      description:
        "Accept online reservations directly through the platform. Manage bookings with our intuitive dashboard.",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      icon: <FaBullhorn size={28} />,
      title: "Promote Your Services",
      description:
        "Showcase your offerings, special deals, and events. Keep your listing updated to attract more customers.",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      icon: <FaChartLine size={28} />,
      title: "Business Analytics",
      description:
        "Track views, bookings, and customer engagement. Make data-driven decisions to grow your business.",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
    {
      icon: <FaCreditCard size={28} />,
      title: "Secure Payments",
      description:
        "Accept online payments securely. Multiple payment options for your customers' convenience.",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
    {
      icon: <FaUsers size={28} />,
      title: "Customer Reviews",
      description:
        "Build trust with verified customer reviews and ratings. Respond to feedback and improve your service.",
      gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    },
  ];

  return (
    <Section id="business-benefits">
      <Container padding="0" align="center">
        <Chip size="lg" color="success" variant="soft">
          For Business Owners
        </Chip>

        <Typography.Header
          size="lg"
          align="center"
          sx={{
            lineHeight: 1.15,
            marginBottom: 1,
            marginTop: 2,
            color: "#0A1B47",
          }}
        >
          Grow Your Business with{" "}
          <span className="gradient-bicol">City Venture</span>{" "}
        </Typography.Header>

        <Typography.Body
          size="md"
          align="center"
          sx={{
            maxWidth: 720,
            margin: "8px auto 48px",
            opacity: 0.9,
          }}
        >
          Join hundreds of businesses already attracting tourists through our
          platform. Get the tools you need to succeed in the tourism industry.
        </Typography.Body>

        <Grid xs={12} sm={11} md={11} lg={10} container spacing={3}>
          {benefits.map((benefit, index) => (
            <Grid key={index} xs={12} sm={6} md={6} lg={4}>
              <Container
                elevation={2}
                hover
                hoverEffect="lift"
                padding="28px"
                radius="20px"
                gap="16px"
                align="flex-start"
                style={{
                  height: "100%",
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <Container
                  padding="16px"
                  radius="16px"
                  style={{
                    background: benefit.gradient,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  }}
                >
                  {benefit.icon}
                </Container>

                <Container gap="8px" padding="0">
                  <Typography.CardTitle size="sm" color="primary">
                    {benefit.title}
                  </Typography.CardTitle>
                  <Typography.Body size="sm" sx={{ opacity: 0.85 }}>
                    {benefit.description}
                  </Typography.Body>
                </Container>
              </Container>
            </Grid>
          ))}
        </Grid>

        {/* CTA Section */}
        <Container
          elevation={3}
          padding="40px"
          radius="24px"
          align="center"
          gap="20px"
          style={{
            marginTop: 64,
            maxWidth: 900,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
          }}
        >
          <Typography.Header size="md" align="center" sx={{ color: "#fff" }}>
            Ready to Join City Venture?
          </Typography.Header>
          <Typography.Body
            size="md"
            align="center"
            sx={{ color: "rgba(255,255,255,0.95)", maxWidth: 600 }}
          >
            Start your application today and get your business in front of
            thousands of tourists exploring Naga City.
          </Typography.Body>
          <Container
            direction="row"
            gap="16px"
            padding="0"
            style={{ flexWrap: "wrap" }}
            justify="center"
          >
            <Button
              size="lg"
              onClick={() => navigate("/business/signup")}
              sx={{
                borderRadius: 12,
                px: 4,
                background: "#ffffff",
                color: "#667eea",
                fontWeight: 700,
                "&:hover": {
                  background: "#f8f9fa",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Register Your Business
            </Button>
            <Button
              size="lg"
              variant="outlined"
              onClick={() => navigate("/business/login")}
              sx={{
                borderRadius: 12,
                px: 4,
                borderColor: "#ffffff",
                color: "#ffffff",
                "&:hover": {
                  borderColor: "#ffffff",
                  background: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Business Login
            </Button>
          </Container>
        </Container>
      </Container>
    </Section>
  );
};

export default BusinessBenefitsSection;
