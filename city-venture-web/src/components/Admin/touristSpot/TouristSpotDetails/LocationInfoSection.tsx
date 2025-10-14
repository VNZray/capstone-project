import React from "react";
import {
  Button,
  Stack,
  Typography,
  Sheet,
} from "@mui/joy";
import { Edit } from "lucide-react";
import MapInput from "../MapInput";
import type { TouristSpot } from "@/src/types/TouristSpot";

interface LocationInfoSectionProps {
  spot: TouristSpot;
  onEdit: () => void;
}

const LocationInfoSection: React.FC<LocationInfoSectionProps> = ({ spot, onEdit }) => {
  return (
    <Sheet sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography level="h4">Location</Typography>
        <Button
          variant="outlined"
          size="sm"
          startDecorator={<Edit size={16} />}
          onClick={onEdit}
        >
          Edit
        </Button>
      </Stack>

      <Stack spacing={2}>
        {/* Map */}
        <Stack spacing={1}>
          <Sheet
            variant="outlined"
            sx={{
              borderRadius: 8,
              overflow: "hidden",
              "& > div": {
                "& > div": {
                  height: "300px !important",
                  borderRadius: "8px",
                },
              },
            }}
          >
            <MapInput
              latitude={spot.latitude ?? undefined}
              longitude={spot.longitude ?? undefined}
              onChange={() => {}}
            />
          </Sheet>
        </Stack>

        {/* Address */}
        <Stack spacing={0.5}>
          <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
            Address
          </Typography>
          <Typography level="body-md">
            {spot.barangay}, {spot.municipality}, {spot.province}
          </Typography>
        </Stack>
      </Stack>
    </Sheet>
  );
};

export default LocationInfoSection;
