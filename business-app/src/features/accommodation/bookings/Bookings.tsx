import Text from "@/src/components/Text";
import InfoCard from "@/src/components/InfoCard";
import PageContainer from "@/src/components/PageContainer";
import { colors } from "@/src/utils/Colors";
import {
  Bed,
  DoorOpen,
  User,
  LogIn,
  LogOut,
  XCircle,
  Search,
} from "lucide-react"; // updated icons
import { Button, Grid, Input } from "@mui/joy";
import Container from "@/src/components/Container";

const Bookings = () => {
  return (
    <PageContainer>
      <Container padding="0" background="transparent">
        <Grid container spacing={3}>
          <Grid xs={2}>
            <InfoCard
              icon={<Bed color={colors.white} size={32} />}
              title={"0"}
              subtitle="Total Bookings"
              color={colors.secondary}
            />
          </Grid>
          <Grid xs={2}>
            <InfoCard
              icon={<DoorOpen color={colors.white} size={32} />}
              title={"0"}
              subtitle="Pending"
              color={colors.success}
            />
          </Grid>
          <Grid xs={2}>
            <InfoCard
              icon={<User color={colors.white} size={32} />}
              title={"0"}
              subtitle="Reserved"
              color={colors.yellow}
            />
          </Grid>
          <Grid xs={2}>
            <InfoCard
              icon={<LogIn color={colors.white} size={32} />} // Checked-in
              title={"0"}
              subtitle="Checked-in"
              color={colors.orange}
            />
          </Grid>
          <Grid xs={2}>
            <InfoCard
              icon={<LogOut color={colors.white} size={32} />} // Checked-out
              title={"0"}
              subtitle="Checked-out"
              color={colors.primary}
            />
          </Grid>
          <Grid xs={2}>
            <InfoCard
              icon={<XCircle color={colors.white} size={32} />} // Cancelled
              title={"0"}
              subtitle="Cancelled"
              color={colors.error}
            />
          </Grid>
        </Grid>
      </Container>

      <Container gap="0" padding="0" elevation={3}>
        <Container
          direction="row"
          justify="space-between"
          align="center"
          padding="16px 16px 0 16px"
        >
          <Text variant="header-title">Manage Reservation</Text>
        </Container>

        {/* Search + Filter */}
        <Container
          direction="row"
          justify="space-between"
          align="center"
        >
          <Input
            startDecorator={<Search />}
            placeholder="Search Rooms"
            size="lg"
            fullWidth
          />
        </Container>

        {/* Tabs Placeholder */}
      </Container>
    </PageContainer>
  );
};

export default Bookings;
