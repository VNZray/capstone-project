import React from "react";
import { Stack, Typography, Box, Card } from "@mui/joy";
import type { DaySchedule } from "@/src/types/TouristSpot";

interface ScheduleStepProps {
  schedules: DaySchedule[];
  daysOfWeek: string[];
  onScheduleChange: (updater: (prev: DaySchedule[]) => DaySchedule[]) => void;
}

const ScheduleStep: React.FC<ScheduleStepProps> = ({
  schedules,
  daysOfWeek,
  onScheduleChange,
}) => {
  return (
    <Stack spacing={1.5}>
      <Typography
        fontFamily={"poppins"}
        level="title-lg"
        fontWeight={700}
        sx={{ color: "#1e293b" }}
      >
        Operating Schedule
      </Typography>
      <Typography level="body-sm" sx={{ color: "text.secondary" }}>
        Configure opening hours for each day
      </Typography>

      <Card variant="outlined" sx={{ p: 1 }}>
        <Stack spacing={0}>
          {schedules.map((sched) => (
            <Box
              key={sched.dayIndex}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
                py: 1,
                borderBottom: sched.dayIndex < 6 ? "1px solid" : "none",
                borderColor: "divider",
              }}
            >
              {/* Day name */}
              <div
                style={{
                  width: 120,
                  color: "var(--primary-color)",
                  fontWeight: 600,
                }}
              >
                {daysOfWeek[sched.dayIndex]}
              </div>

              {/* Time inputs (read-only when closed) */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="time"
                  value={sched.open_time}
                  readOnly={sched.is_closed}
                  onChange={(e) => {
                    const newTime = e.target.value;
                    onScheduleChange((prev) =>
                      prev.map((s) =>
                        s.dayIndex === sched.dayIndex
                          ? { ...s, open_time: newTime }
                          : s
                      )
                    );
                  }}
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #e5e7eb",
                    width: 120,
                    background: sched.is_closed ? "#f9fafb" : "#fff",
                  }}
                />

                <input
                  type="time"
                  value={sched.close_time}
                  readOnly={sched.is_closed}
                  onChange={(e) => {
                    const newTime = e.target.value;
                    onScheduleChange((prev) =>
                      prev.map((s) =>
                        s.dayIndex === sched.dayIndex
                          ? { ...s, close_time: newTime }
                          : s
                      )
                    );
                  }}
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #e5e7eb",
                    width: 120,
                    background: sched.is_closed ? "#f9fafb" : "#fff",
                  }}
                />
              </div>

              {/* Status + toggle */}
              <div style={{ minWidth: 100, display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: sched.is_closed ? "#d1d5db" : "var(--primary-color)",
                  }}
                />
                <span style={{ color: "var(--primary-color)", fontWeight: 600 }}>
                  {sched.is_closed ? "Closed" : "Open"}
                </span>
              </div>
              <input
                type="checkbox"
                checked={!sched.is_closed}
                onChange={(e) => {
                  const checked = e.target.checked;
                  onScheduleChange((prev) =>
                    prev.map((s) =>
                      s.dayIndex === sched.dayIndex
                        ? { ...s, is_closed: !checked }
                        : s
                    )
                  );
                }}
                style={{ accentColor: "var(--primary-color)" }}
              />
            </Box>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
};

export default ScheduleStep;
