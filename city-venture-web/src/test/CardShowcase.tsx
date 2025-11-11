import { Divider } from "@mui/joy";
import Container from "../components/Container";
import Typography from "../components/Typography";

const CardShowcase = () => {
  return (
    <Container padding="40px">
      <Typography.Title weight="bold" color="primary">
        Card Showcase
      </Typography.Title>
      <Divider sx={{ my: 3 }} />
    </Container>
  );
};

export default CardShowcase;
