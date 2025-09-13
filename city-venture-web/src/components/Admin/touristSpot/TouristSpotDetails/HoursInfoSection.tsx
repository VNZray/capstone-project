import React from "react";
import {
  Button,
  Chip,
  Stack,
  Typography,
  Sheet,
  Table,
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
    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 8 }}>
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
        <Table
          size="sm"
          variant="outlined"
          sx={{
            "& table": { tableLayout: "fixed" },
            "& td, & th": { textAlign: "center" },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: "30%" }}>Day</th>
              <th style={{ width: "40%" }}>Hours</th>
              <th style={{ width: "30%" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, idx) => (
              <tr key={`${s.id ?? idx}`}>
                <td>{dayNames[s.day_of_week] ?? s.day_of_week}</td>
                <td>
                  {s.is_closed
                    ? "Closed"
                    : `${s.open_time ?? "—"} - ${s.close_time ?? "—"}`}
                </td>
                <td>
                  <Chip
                    size="sm"
                    color={s.is_closed ? "neutral" : "success"}
                    variant="soft"
                  >
                    {s.is_closed ? "Closed" : "Open"}
                  </Chip>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
          {schedules ? "No operating hours set" : "Loading schedule..."}
        </Typography>
      )}
    </Sheet>
  );
};

export default HoursInfoSection;
