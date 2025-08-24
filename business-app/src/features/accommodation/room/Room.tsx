import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import Text from "@/src/components/Text";
import { Button, Grid, Input } from "@mui/joy";
import InfoCard from "./components/InfoCard";
import {
  Bed,
  Calendar,
  DoorOpen,
  LogIn,
  LogOut,
  Search,
  Wrench,
} from "lucide-react";
import { colors } from "@/src/utils/Colors";
import { Add, CancelOutlined, FilterList } from "@mui/icons-material";
import StatusFilter from "./components/StatusFilter";
import { useState } from "react";
import AddRoomModal from "./components/AddRoomModal";
type Status = "All" | "Available" | "Checked-in" | "Cancelled" | "Maintenance";

const Room = () => {
  const [status, setStatus] = useState<Status>("All");
  const [openModal, setOpenModal] = useState(false);

  return (
    <PageContainer>
      {/* Stats Cards */}
      <Container padding="0" background="transparent">
        <Grid container spacing={3}>
          <Grid xs={2}>
            <InfoCard
              icon={<Bed color={colors.white} size={32} />}
              title={"20"}
              subtitle="Total Rooms"
              color={colors.secondary}
            />
          </Grid>
          <Grid xs={2}>
            <InfoCard
              icon={<DoorOpen color={colors.white} size={32} />}
              title={"12"}
              subtitle="Available"
              color={colors.success}
            />
          </Grid>
          <Grid xs={2}>
            <InfoCard
              icon={<LogIn color={colors.white} size={32} />}
              title={"6"}
              subtitle="Checked-in"
              color={colors.yellow}
            />
          </Grid>
          <Grid xs={2}>
            <InfoCard
              icon={<LogOut color={colors.white} size={32} />}
              title={"2"}
              subtitle="Checked-out"
              color={colors.warningBackground}
            />
          </Grid>
          <Grid xs={2}>
            <InfoCard
              icon={
                <CancelOutlined style={{ color: colors.white, fontSize: 32 }} />
              }
              title={"1"}
              subtitle="Cancelled"
              color={colors.error}
            />
          </Grid>
          <Grid xs={2}>
            <InfoCard
              icon={<Wrench color={colors.white} size={32} />}
              title={"1"}
              subtitle="Maintenance"
              color={colors.gray}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Room Management */}
      <Container gap="0" padding="0" elevation={3}>
        <Container
          direction="row"
          justify="space-between"
          align="center"
          padding="16px 16px 0 16px"
        >
          <div style={{ display: "flex", gap: "12px" }}>
            <Text variant="header-title">Room Management</Text>
            <Button
              startDecorator={<Calendar />}
              size="lg"
              color="primary"
              variant="soft"
            >
              Calendar
            </Button>
          </div>

          <Button
            startDecorator={<Add />}
            size="lg"
            color="primary"
            onClick={() => setOpenModal(true)}
          >
            Add Room
          </Button>

          {/* Add Room Modal */}
          <AddRoomModal open={openModal} onClose={() => setOpenModal(false)} />
        </Container>

        {/* Search + Filter */}
        <Container
          padding="20px 20px 0 20px"
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
        <StatusFilter active={status} onChange={setStatus} />
      </Container>
    </PageContainer>
  );
};

export default Room;
