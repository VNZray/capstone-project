import { Button, Typography } from "@mui/joy";
import Container from "../components/Container";
import PageContainer from "../components/PageContainer";
import { useNavigate } from "react-router-dom";

export default function About() {
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
        About City Venture
      </Typography>

      <Button size="lg" onClick={() => navigate("/")}>Back to Home</Button>
    </Container>
  );
}
