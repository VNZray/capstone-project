import React from "react";
import {
  Stack,
  Typography,
  Sheet,
} from "@mui/joy";
import type { TouristSpot } from "@/src/types/TouristSpot";

interface AdminInfoSectionProps {
  spot: TouristSpot;
  onEdit: () => void;
}

const AdminInfoSection: React.FC<AdminInfoSectionProps> = ({ spot }) => {
  const createdDisplay = React.useMemo(() => {
    if (!spot) return "—";
    try {
      return new Date(spot.created_at).toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return spot.created_at;
    }
  }, [spot]);

  const updatedDisplay = React.useMemo(() => {
    if (!spot) return "—";
    try {
      return new Date(spot.updated_at).toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return spot.updated_at;
    }
  }, [spot]);

  return (
    <Sheet sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography
          fontFamily={"poppins"}
          level="title-lg"
          fontWeight={700}
          sx={{ color: "#1e293b" }}
        >
          Administrative Information
        </Typography>
      </Stack>

      <Stack spacing={1}>
        <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
          Created: {createdDisplay}
        </Typography>
        <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
          Updated: {updatedDisplay}
        </Typography>
        {spot.spot_status && (
          <>
            <Stack spacing={0.5}>
              <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
                Status
              </Typography>
              <Typography level="body-md">
                {spot.spot_status.charAt(0).toUpperCase() + spot.spot_status.slice(1)}
              </Typography>
            </Stack>
          </>
        )}
      </Stack>
    </Sheet>
  );
};

export default AdminInfoSection;
