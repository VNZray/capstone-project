import React from "react";
import {
  Button,
  Stack,
  Typography,
  Sheet,
  Box,
  Divider,
} from "@mui/joy";
import { Edit } from "lucide-react";
import type { TouristSpotSchedule } from "@/src/types/TouristSpot";

interface HoursInfoSectionProps {
  schedules: TouristSpotSchedule[] | null;
  onEdit: () => void;
}

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const HoursInfoSection: React.FC<HoursInfoSectionProps> = ({ schedules, onEdit }) => {
  return (
    <Sheet sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography level="h4">Operating Hours</Typography>
        <Button
          variant="outlined"
          size="sm"
          startDecorator={<Edit size={16} />}
          onClick={onEdit}
        >
          Edit
        </Button>
      </Stack>

      {schedules && schedules.length > 0 ? (
        <Box>
          {schedules.map((s, idx) => (
            <Box
              key={`${s.id ?? idx}`}
              sx={{ display: "flex", alignItems: "center", py: 0.5 }}
            >
              <Typography level="body-md" sx={{ minWidth: 48, fontWeight: 500 }}>
                {dayNames[s.day_of_week] ?? s.day_of_week}
              </Typography>
              <Typography level="body-md" sx={{ ml: 2, color: s.is_closed ? "text.tertiary" : "inherit" }}>
                {s.is_closed
                  ? "Closed"
                  : `${s.open_time ?? "—"} - ${s.close_time ?? "—"}`}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
          {schedules ? "No operating hours set" : "Loading schedule..."}
        </Typography>
      )}
    </Sheet>
  );
};

export default HoursInfoSection;
