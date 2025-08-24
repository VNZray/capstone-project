import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "@/src/components/Loading";
import PageContainer from "@/src/components/PageContainer";
import Text from "@/src/components/Text";
import { useAuth } from "@/src/context/AuthContext";
import { useBusiness } from "@/src/context/BusinessContext";
import Card from "./components/Card";
import placeholderImage from "@/src/assets/images/uma-hotel-residences.jpg";
import type { Business } from "@/src/types/Business";
import { fetchBusinessesByOwner } from "@/src/services/BusinessService";
import Container from "@/src/components/Container";
import { colors } from "@/src/utils/Colors";
import { Button } from "@mui/joy";
import { Add } from "@mui/icons-material";
import Grid from "@mui/joy/Grid";

const MyBusiness = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setBusinessId } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    if (!user?.owner_id) return;

    const loadBusinesses = async () => {
      try {
        const data = await fetchBusinessesByOwner(user.owner_id!);
        setBusinesses(data);
        console.log("Fetched businesses:", data);
      } catch (err) {
        console.error("Error fetching businesses:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, [user?.owner_id]);

  if (loading) return <Loading />;

  return (
    <PageContainer style={{ padding: "20px" }}>
      <Text variant="title">My Business</Text>

      <Container background={colors.secondary} elevation={2} padding="20px">
        <Grid container spacing={2} columns={12}>
          <Grid xs={10}>
            <Text color="white" variant="header-title">
              Ready to expand your business?
            </Text>
            <Text color="white" variant="paragraph">
              Register your business to reach more customers and manage your
              listings efficiently.
            </Text>
          </Grid>
          <Grid xs={2}>
            <Button
              fullWidth
              variant="soft"
              color="neutral"
              size="lg"
              style={{ height: "100%" }}
              startDecorator={<Add />}
              onClick={() => {
                navigate(`/business-registration`);
              }}
            >
              Register New Business
            </Button>
          </Grid>
        </Grid>
      </Container>

      <Text variant="paragraph">
        Showing you listed business {businesses.length}
      </Text>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          width: "100%",
          alignItems: "stretch",
        }}
      >
        {businesses.map((business) => (
          <div key={business.id} style={{ height: "100%" }}>
            <Card
              elevation={1}
              image={business.business_image || placeholderImage}
              title={business.business_name}
              subtitle={business.description}
              rating={5}
              status={business.status}
            >
              <Button
                onClick={() => {
                  setBusinessId(business.id);
                  navigate(`/dashboard`);
                }}
                fullWidth
                size="lg"
              >
                Manage Business
              </Button>
            </Card>
          </div>
        ))}
      </div>
    </PageContainer>
  );
};

export default MyBusiness;
