import { Button, Typography } from "@mui/joy";
import Container from "../components/Container";
import PageContainer from "../components/PageContainer";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Container
      direction="column"
      justify="center"
      align="center"
      gap="1rem"
      height="100%"
      background="transparent"
      padding="0"
    >
      <Typography level="h1" fontSize="3rem" fontWeight="lg" textAlign="center">
        Welcome to City Venture
      </Typography>
      <Typography
        level="h2"
        fontSize="1.5rem"
        fontWeight="md"
        textAlign="center"
        marginTop="1rem"
      >
        Your gateway to managing your business efficiently and effectively.
        <Container direction="row" gap="0.5rem" background="transparent">
          <Button
            onClick={() => {
              navigate("/business/login");
            }}
            size="lg"
            fullWidth
          >
            Get Started
          </Button>

          <Button
            onClick={() => {
              navigate("/tourism/login");
            }}
            size="lg"
            fullWidth
            variant="outlined"
            color="primary"
          >
            Login as Admin
          </Button>

          <Button
            onClick={() => {
              navigate("/about");
            }}
            size="lg"
            fullWidth
            variant="solid"
            color="neutral"
          >
            About
          </Button>
        </Container>
      </Typography>
    </Container>
  );
}
