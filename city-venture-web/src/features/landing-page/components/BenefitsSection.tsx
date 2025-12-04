import React from "react";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import { FaMapMarkerAlt, FaStore, FaBed } from "react-icons/fa";
import { Grid } from "@mui/joy";
import { colors } from "@/src/utils/Colors";
import Section from "@/src/components/ui/Section";
import { DetailsOutlined } from "@mui/icons-material";

const BenefitsSection: React.FC = () => {
  return (
    <Section
      height="auto"
      id="about"
      padding="90px 0"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, #FAFBFC 0%, #F0F4F8 100%)",
      }}
    >
      <Container padding="0" align="center">
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
            alignSelf: "center",
          }}
        >
          <DetailsOutlined fontSize="small" color="warning" />
          <Typography.Label
            size="xs"
            sx={{ color: "#FF914D", letterSpacing: 1.5 }}
          >
            DISCOVER NAGA
          </Typography.Label>
        </Container>

        <Typography.Header
          size="md"
          color="primary"
          align="center"
          sx={{ lineHeight: 1.15, marginBottom: 1 }}
        >
          City Venture — a Tourism{" "}
          <span className="gradient-bicol">Digital Platform</span>
        </Typography.Header>

        <Typography.Body
          size="md"
          align="center"
          sx={{
            maxWidth: 820,
            margin: "8px auto 32px",
            opacity: 0.9,
          }}
        >
          City Venture is a tourism platform dedicated to showcasing Naga's
          latest attractions, local shops, and places to stay. We connect
          travelers with curated experiences, and help businesses get discovered
          through clean listings, search, and maps.
        </Typography.Body>

        <Grid xs={12} sm={11} md={11} lg={9} container spacing={2}>
          <Grid xs={12} sm={12} md={12} lg={12} xl={4}>
            <Container hover gap="8px" direction="row" elevation={2}>
              <Container padding="0" align="center" justify="center">
                <Container background={colors.primary} padding="16px">
                  <FaMapMarkerAlt color="white" size={24} />
                </Container>
              </Container>

              <Container gap="0" padding="0">
                <Typography.CardTitle size="xs">
                  Explore Attractions & Culture
                </Typography.CardTitle>
                <Typography.Body size="xs" sx={{ opacity: 0.8 }}>
                  Discover the rich cultural heritage and vibrant attractions
                  that make our city unique.
                </Typography.Body>
              </Container>
            </Container>
          </Grid>
          <Grid xs={12} sm={12} md={12} lg={12} xl={4}>
            <Container hover gap="8px" direction="row" elevation={2}>
              <Container padding="0" align="center" justify="center">
                <Container background={colors.primary} padding="16px">
                  <FaStore color="white" size={24} />
                </Container>
              </Container>

              <Container gap="0" padding="0">
                <Typography.CardTitle size="xs">
                  Local Shops
                </Typography.CardTitle>
                <Typography.Body size="xs" sx={{ opacity: 0.8 }}>
                  Find trusted merchants, cafés, and specialty stores.
                </Typography.Body>
              </Container>
            </Container>
          </Grid>
          <Grid xs={12} sm={12} md={12} lg={12} xl={4}>
            <Container hover gap="8px" direction="row" elevation={2}>
              <Container padding="0" align="center" justify="center">
                <Container background={colors.primary} padding="16px">
                  <FaBed color="white" size={24} />
                </Container>
              </Container>

              <Container gap="0" padding="0">
                <Typography.CardTitle size="xs">
                  Hotel and Accommodations
                </Typography.CardTitle>
                <Typography.Body size="xs" sx={{ opacity: 0.8 }}>
                  Browse accommodations with photos, details, and amenities.
                </Typography.Body>
              </Container>
            </Container>
          </Grid>
        </Grid>
      </Container>
    </Section>
  );
};

export default BenefitsSection;
