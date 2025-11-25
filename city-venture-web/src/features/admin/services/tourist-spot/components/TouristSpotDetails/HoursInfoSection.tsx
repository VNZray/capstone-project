import React from "react";
import { Stack, Typography, Sheet, Box, Chip } from "@mui/joy";
import { TimerIcon } from "lucide-react";
import { Edit } from "lucide-react";
import type { TouristSpotSchedule } from "@/src/types/TouristSpot";
import Button from "@/src/components/Button";

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
        <Typography
          fontFamily={"poppins"}
          level="title-lg"
          fontWeight={700}
          sx={{ color: "#1e293b" }}
        >
          Operating Hours
        </Typography>

        <Button
          variant="outlined"
          size="sm"
          startDecorator={<Edit size={16} />}
          onClick={onEdit}
          sx={{ borderRadius: '8px' }}
        >
          Edit
        </Button>
      </Stack>

      {schedules && schedules.length > 0 ? (
        <Box>
          {schedules.map((s, idx) => (
            <Box key={`${s.id ?? idx}`} sx={{ display: "flex", alignItems: "center", py: 0.5, gap: 1 }}>
              <Typography startDecorator={<TimerIcon />} level="body-md" sx={{ minWidth: 64, fontWeight: 500 }}>
                {dayNames[s.day_of_week] ?? s.day_of_week}
              </Typography>
              <Typography level="body-md" sx={{ ml: 2, color: s.is_closed ? "text.tertiary" : "inherit" }}>
                {s.is_closed ? "Closed" : `${s.open_time ?? "—"} - ${s.close_time ?? "—"}`}
              </Typography>
              <Chip size="sm" variant="soft" sx={{ ml: 1 }} color={s.is_closed ? "neutral" : "success"}>
                {s.is_closed ? "Closed" : "Open"}
              </Chip>
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
