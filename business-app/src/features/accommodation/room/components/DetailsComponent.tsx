import Paper from "@mui/material/Paper";
import { Button, Chip, Divider, Grid, Sheet, Typography } from "@mui/joy";
import { useRoom } from "@/src/context/RoomContext";
import Container from "@/src/components/Container";
import { Bed, Users, DollarSign, ListChecks, PhilippinePeso } from "lucide-react";
import { Stairs, StairsRounded, StairsTwoTone } from "@mui/icons-material";
import HeightIcon from '@mui/icons-material/Height';
const DetailsComponent = () => {
  const { roomDetails } = useRoom();

  return (
    <Paper
      elevation={0}
      style={{
        padding: "20px",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <Grid container spacing={2}>
        <Grid
          xs={6}
          sx={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <Typography fontFamily={"poppins"} level="title-lg" fontWeight={600}>
            Basic Information
          </Typography>
          <Paper
            variant="outlined"
            sx={{ p: 2, display: "flex", flexDirection: "row" }}
          >
            <Container
              gap="16px"
              padding="0"
              direction="column"
              style={{ flex: 1 }}
            >
              <div>
                <Typography fontFamily={"poppins"} level="title-md" fontWeight={500}>
                  Room Number
                </Typography>
                <Typography startDecorator={<Bed size={18} />} fontFamily={"poppins"} level="body-md">
                  {roomDetails?.room_number || "-"}
                </Typography>
              </div>

              <div>
                <Typography fontFamily={"poppins"} level="title-md" fontWeight={500}>
                  Floor
                </Typography>
                <Typography startDecorator={<HeightIcon fontSize="small" />} fontFamily={"poppins"} level="body-md">
                  {roomDetails?.floor || "-"}
                </Typography>
              </div>

              <div>
                <Typography fontFamily={"poppins"} level="title-md" fontWeight={500}>
                  Price
                </Typography>
                <Typography startDecorator={<PhilippinePeso size={18} />} fontFamily={"poppins"} level="body-md">
                  {roomDetails?.room_price?.toLocaleString() || "-"}
                </Typography>
              </div>
            </Container>
            <Container padding="0" direction="column" style={{ flex: 1 }}>
              <div>
                <Typography fontFamily={"poppins"} level="title-md" fontWeight={500}>
                  Room Type
                </Typography>
                <Typography startDecorator={<ListChecks size={18} />} fontFamily={"poppins"} level="body-md">
                  {roomDetails?.room_type || "-"}
                </Typography>
              </div>
              <div>
                <Typography fontFamily={"poppins"} level="title-md" fontWeight={500}>
                  Capacity
                </Typography>
                <Typography startDecorator={<Users size={18} />} fontFamily={"poppins"} level="body-md">
                  {roomDetails?.capacity || "-"}
                </Typography>
              </div>
            </Container>
          </Paper>
        </Grid>

        <Grid
          xs={6}
          sx={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <Typography fontFamily={"poppins"} level="title-lg" fontWeight={600}>
            Amenities
          </Typography>

          <Paper variant="outlined" sx={{ p: 2, flex: 1 }}></Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid
          xs={12}
          sx={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <Typography fontFamily={"poppins"} level="title-lg" fontWeight={600}>
            Description
          </Typography>
          <Container padding="0" direction="row">
            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
              <Typography fontFamily={"poppins"} level="body-md">
                {roomDetails?.description || "-"}
              </Typography>
            </Paper>
          </Container>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DetailsComponent;
