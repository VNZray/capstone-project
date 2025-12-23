import React from "react";
import { Box, Card, Grid } from "@mui/joy";
import Typography from "@/src/components/Typography";
import { colors } from "@/src/utils/Colors";
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
    <Box>
      <Typography.Body size="sm" sx={{ color: colors.gray, mb: 2 }}>
        Configure opening hours for each day
      </Typography.Body>

      <Card variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {schedules.map((sched) => (
            <Grid
              container
              key={sched.dayIndex}
              spacing={2}
              sx={{
                alignItems: "center",
                py: 1.5,
                borderBottom: sched.dayIndex < 6 ? "1px solid" : "none",
                borderColor: "divider",
              }}
            >
              {/* Day name */}
              <Grid xs={12} sm={3}>
                <Typography.Label
                  sx={{ color: colors.primary, fontWeight: 600 }}
                >
                  {daysOfWeek[sched.dayIndex]}
                </Typography.Label>
              </Grid>

              {/* Time inputs */}
              <Grid xs={12} sm={5}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
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
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1px solid ${colors.offWhite}`,
                      minWidth: 120,
                      background: sched.is_closed ? colors.offWhite : "#fff",
                      fontFamily: "inherit",
                    }}
                  />
                  <Typography.Body sx={{ fontSize: "0.875rem" }}>
                    to
                  </Typography.Body>
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
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1px solid ${colors.offWhite}`,
                      minWidth: 120,
                      background: sched.is_closed ? colors.offWhite : "#fff",
                      fontFamily: "inherit",
                    }}
                  />
                </Box>
              </Grid>

              {/* Status + toggle */}
              <Grid xs={12} sm={4}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    justifyContent: { xs: "flex-start", sm: "flex-end" },
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: sched.is_closed
                        ? colors.gray
                        : colors.success,
                    }}
                  />
                  <Typography.Body
                    sx={{
                      color: sched.is_closed ? colors.gray : colors.success,
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    {sched.is_closed ? "Closed" : "Open"}
                  </Typography.Body>
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
                    style={{ accentColor: colors.primary, cursor: "pointer" }}
                  />
                </Box>
              </Grid>
            </Grid>
          ))}
        </Box>
      </Card>
    </Box>
  );
};

export default ScheduleStep;
