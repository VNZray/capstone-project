import React from "react";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import { FaMapMarkerAlt, FaStore, FaBed } from "react-icons/fa";
import { Chip, Grid } from "@mui/joy";
import { colors } from "@/src/utils/Colors";

const BenefitsSection: React.FC = () => {
  return (
    <section id="about" style={{ scrollMarginTop: 80, padding: 16 }}>
      <Container padding="0" align="center">
        <Chip size="lg" color="primary">
          About
        </Chip>

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
                  <FaMapMarkerAlt size={24} />
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
                  <FaStore size={24} />
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
                  <FaBed size={24} />
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
    </section>
  );
};

export default BenefitsSection;
