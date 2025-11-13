import React from "react";
import { useNavigate } from "react-router-dom";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { Chip, Grid } from "@mui/joy";
import { FaAppStoreIos, FaGooglePlay } from "react-icons/fa";

const ValuePropositionSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="value-proposition" style={{ scrollMarginTop: 80,  padding: 16 }}>
      <Container
        gap="20px"
        align="center"
        padding="0"
        style={{ margin: "120px 0" }}
      >
        <Typography.Header size="md" align="center">
          How City Venture Works For You
        </Typography.Header>

        <Grid xs={12} sm={11} md={11} lg={9} container spacing={2}>
          <Grid xs={12} sm={12} md={6} lg={6}>
            {/* For Tourists */}
            <Container
              elevation={2}
              hover
              hoverEffect="lift"
              padding="24px"
              gap="16px"
            >
              <Chip size="md" color="primary">
                For Tourists
              </Chip>
              <Typography.CardTitle>
                Discover Naga with our mobile app
              </Typography.CardTitle>
              <Typography.Body size="sm" sx={{ opacity: 0.9 }}>
                Find attractions, events, places to stay, and local favorites.
                Plan your trip with beautiful maps and curated lists.
              </Typography.Body>
              <Container padding="0" direction="row">
                <Button
                  variant="outlined"
                  colorScheme="secondary"
                  startDecorator={<FaAppStoreIos />}
                >
                  App Store
                </Button>
                <Button
                  variant="outlined"
                  colorScheme="success"
                  startDecorator={<FaGooglePlay />}
                >
                  Google Play
                </Button>
              </Container>
            </Container>
          </Grid>

          <Grid xs={12} sm={12} md={6} lg={6}>
            {/* For Businesses */}
            <Container elevation={2} hover hoverEffect="lift" padding="24px">
              <Chip size="md" color="primary">
                For Businesses
              </Chip>
              <Typography.CardTitle>
                Showcase your business to visitors
              </Typography.CardTitle>
              <Typography.Body size="sm" sx={{ opacity: 0.9 }}>
                List your hotel, shop, or service and get discovered by tourists
                searching and exploring Naga City.
              </Typography.Body>
              <Container
                direction="row"
                gap="12px"
                padding="0"
                style={{ flexWrap: "wrap" }}
              >
                <Button
                  size="md"
                  colorScheme="primary"
                  onClick={() => navigate("/business-registration")}
                  sx={{
                    background:
                      "linear-gradient(135deg, #FF6B6B 0%, #FF914D 50%, #28C76F 100%)",
                  }}
                >
                  Register Now
                </Button>
                <Button
                  size="md"
                  variant="outlined"
                  colorScheme="gray"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
              </Container>
            </Container>
          </Grid>
        </Grid>
      </Container>
    </section>
  );
};

export default ValuePropositionSection;
