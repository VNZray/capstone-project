import Paper from "@mui/material/Paper";
import { Grid, Typography } from "@mui/joy";

const ReviewsComponent = () => {
  return (
    <Paper
      elevation={0}
      style={{
        padding: "0 20px",
        borderRadius: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <Grid container spacing={2}>
        <Grid
          xs={12}
          sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <Typography fontFamily={"poppins"} level="h2" fontWeight={600}>
            Reviews
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReviewsComponent;
