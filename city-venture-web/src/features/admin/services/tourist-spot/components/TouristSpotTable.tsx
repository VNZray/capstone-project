import React from "react";
import { Typography, Sheet, Grid, Stack, Chip } from "@mui/joy";
import type { TouristSpot } from "@/src/types/TouristSpot";
import "./TouristSpotTable.css";
import Button from "@/src/components/Button";

interface TouristSpotTableProps {
  spots: TouristSpot[];
  onViewDetails: (spot: TouristSpot) => void;
  onEdit: (spot: TouristSpot) => void;
}

const TouristSpotTable: React.FC<TouristSpotTableProps> = ({
  spots,
  onViewDetails,
  onEdit,
}) => {
  const filteredSpots = spots.filter(
    (spot) => spot.spot_status === "active" || spot.spot_status === "inactive"
  );

  return (
    <div className="table-container">
      <Sheet
        variant="outlined"
        sx={{ p: 2, backgroundColor: "#0A1B47", borderRadius: 8, mb: 1 }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} sm={3}>
            <Typography level="title-md" sx={{ fontWeight: 700, color: "#fff" }}>Name</Typography>
          </Grid>
          <Grid xs={12} sm={3}>
            <Typography level="title-md" sx={{ fontWeight: 700, color: "#fff" }}>Description</Typography>
          </Grid>
          <Grid xs={12} sm={2}>
            <Typography level="title-md" sx={{ fontWeight: 700, color: "#fff" }}>Category</Typography>
          </Grid>
          <Grid xs={12} sm={1}>
            <Typography level="title-md" sx={{ fontWeight: 700, color: "#fff" }}>Status</Typography>
          </Grid>
          <Grid xs={12} sm={3}>
            <Typography level="title-md" sx={{ fontWeight: 700, color: "#fff" }}>Actions</Typography>
          </Grid>
        </Grid>
      </Sheet>

      {filteredSpots.map((spot) => (
        <Sheet
          key={spot.id}
          variant="outlined"
          sx={{ p: 2, backgroundColor: "#fff", borderRadius: 8, mb: 1, "&:hover": { backgroundColor: "#f8f9fa" } }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} sm={3}>
              <Typography level="body-md" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {spot.name}
              </Typography>
            </Grid>
            <Grid xs={12} sm={3}>
              <Typography level="body-sm" sx={{ opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {spot.description}
              </Typography>
            </Grid>
            <Grid xs={12} sm={2}>
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                {Array.isArray(spot.categories)
                  ? spot.categories.map((cat, idx) => (
                      <Chip key={idx} color="primary" variant="soft" size="sm" sx={{ mb: 0.5 }}>
                        {cat.category || String(cat)}
                      </Chip>
                    ))
                  : null}
              </Stack>
            </Grid>
            <Grid xs={12} sm={1}>
              <Typography level="body-md" sx={{ textTransform: 'capitalize' }}>{spot.spot_status}</Typography>
            </Grid>
            <Grid xs={12} sm={3}>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'nowrap' }}>
                <Button variant="outlined" colorScheme="primary" size="sm" onClick={() => onEdit(spot)}>
                  Edit
                </Button>
                <Button variant="outlined" colorScheme="success" size="sm" onClick={() => onViewDetails(spot)}>
                  View Details
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Sheet>
      ))}
    </div>
  );
};

export default TouristSpotTable;
