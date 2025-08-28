import React from "react";
import {
  Stack,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Box,
  Card,
} from "@mui/joy";
import type { DaySchedule } from "../types";

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
    <Stack spacing={3}>
      <Typography level="h4">Operating Schedule</Typography>
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        Set the operating hours for each day of the week
      </Typography>
      
      <Card variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          {schedules.map((sched) => (
            <Box
              key={sched.dayIndex}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
                py: 1,
                borderBottom: sched.dayIndex < 6 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              {/* Day name */}
              <Box sx={{ width: 80, flexShrink: 0 }}>
                <Typography level="body-sm" fontWeight="md">
                  {daysOfWeek[sched.dayIndex]}
                </Typography>
              </Box>

              {/* Open/Closed toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControl orientation="horizontal" sx={{ minWidth: 0 }}>
                  <Switch
                    size="sm"
                    checked={!sched.is_closed}
                    onChange={(e) => {
                      onScheduleChange((prev) =>
                        prev.map((s) =>
                          s.dayIndex === sched.dayIndex
                            ? { ...s, is_closed: !e.target.checked }
                            : s
                        )
                      );
                    }}
                  />
                  <FormLabel sx={{ fontSize: 'xs', ml: 0.5 }}>
                    {sched.is_closed ? 'Closed' : 'Open'}
                  </FormLabel>
                </FormControl>
              </Box>

              {/* Time inputs */}
              {!sched.is_closed && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary', width: 30 }}>
                      From
                    </Typography>
                    <Input
                      size="sm"
                      type="time"
                      value={sched.open_time}
                      onChange={(e) => {
                        onScheduleChange((prev) =>
                          prev.map((s) =>
                            s.dayIndex === sched.dayIndex
                              ? { ...s, open_time: e.target.value }
                              : s
                          )
                        );
                      }}
                      sx={{ width: 120 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary', width: 20 }}>
                      To
                    </Typography>
                    <Input
                      size="sm"
                      type="time"
                      value={sched.close_time}
                      onChange={(e) => {
                        onScheduleChange((prev) =>
                          prev.map((s) =>
                            s.dayIndex === sched.dayIndex
                              ? { ...s, close_time: e.target.value }
                              : s
                          )
                        );
                      }}
                      sx={{ width: 120 }}
                    />
                  </Box>
                </>
              )}
            </Box>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
};

export default ScheduleStep;
