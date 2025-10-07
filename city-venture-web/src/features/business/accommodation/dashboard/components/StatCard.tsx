import Container from "@/src/components/Container";
import { colors } from "@/src/utils/Colors";
import { Typography } from "@mui/joy";

const StatCard = () => {
  return (
    <Container
      direction="row"
      justify="space-between"
      elevation={2}
      radius="12px"
      background="#fff"
    >
      <Container padding="0" background={colors.primary}>
        <Typography>Left Content</Typography>
      </Container>

      <Container padding="0" background={colors.primary}>
        <Typography>Right Content</Typography>
      </Container>
    </Container>
  );
};

export default StatCard;
