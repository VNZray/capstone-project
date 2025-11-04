import React from "react";
import { Card, Typography, Box, Stack, LinearProgress } from "@mui/joy";

interface RoomStatusCardProps {
  totalRooms: number;
  available: number;
  occupied: number;
  maintenance: number;
}

const RoomStatusCard: React.FC<RoomStatusCardProps> = ({
  totalRooms,
  available,
  occupied,
  maintenance,
}) => {
  const availablePercent = totalRooms > 0 ? (available / totalRooms) * 100 : 0;
  const occupiedPercent = totalRooms > 0 ? (occupied / totalRooms) * 100 : 0;
  const maintenancePercent = totalRooms > 0 ? (maintenance / totalRooms) * 100 : 0;

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 12,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: "md",
          borderColor: "primary.outlinedBorder",
        },
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography level="body-sm" sx={{ color: "text.secondary", fontWeight: 500 }}>
            Room Availability
          </Typography>
          <Typography level="h2" fontWeight="700" sx={{ color: "text.primary", mt: 0.5 }}>
            {available}/{totalRooms}
          </Typography>
          <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
            Available Rooms
          </Typography>
        </Box>

        <Stack spacing={1.5}>
          {/* Available */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                Available
              </Typography>
              <Typography level="body-xs" fontWeight="600" sx={{ color: "success.solidBg" }}>
                {available} ({availablePercent.toFixed(0)}%)
              </Typography>
            </Box>
            <LinearProgress
              determinate
              value={availablePercent}
              color="success"
              size="sm"
              sx={{ borderRadius: 4 }}
            />
          </Box>

          {/* Occupied */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                Occupied
              </Typography>
              <Typography level="body-xs" fontWeight="600" sx={{ color: "warning.solidBg" }}>
                {occupied} ({occupiedPercent.toFixed(0)}%)
              </Typography>
            </Box>
            <LinearProgress
              determinate
              value={occupiedPercent}
              color="warning"
              size="sm"
              sx={{ borderRadius: 4 }}
            />
          </Box>

          {/* Maintenance */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                Maintenance
              </Typography>
              <Typography level="body-xs" fontWeight="600" sx={{ color: "danger.solidBg" }}>
                {maintenance} ({maintenancePercent.toFixed(0)}%)
              </Typography>
            </Box>
            <LinearProgress
              determinate
              value={maintenancePercent}
              color="danger"
              size="sm"
              sx={{ borderRadius: 4 }}
            />
          </Box>
        </Stack>
      </Stack>
    </Card>
  );
};

export default RoomStatusCard;
