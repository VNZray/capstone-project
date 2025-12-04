import React from "react";
import {
  Input,
  Checkbox,
  FormControl,
  FormLabel,
  Stack,
  Grid,
  FormHelperText,
} from "@mui/joy";
import type { EventFormData } from "@/src/types/Event";

interface ScheduleStepProps {
  formData: EventFormData;
  onInputChange: (field: keyof EventFormData, value: any) => void;
}

const ScheduleStep: React.FC<ScheduleStepProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <Checkbox
            label="All Day Event"
            checked={formData.is_all_day}
            onChange={(e) => onInputChange("is_all_day", e.target.checked)}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <FormControl required>
            <FormLabel>Start Date & Time</FormLabel>
            <Input
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) => onInputChange("start_date", e.target.value)}
            />
          </FormControl>
        </Grid>

        <Grid xs={12} md={6}>
          <FormControl required>
            <FormLabel>End Date & Time</FormLabel>
            <Input
              type="datetime-local"
              value={formData.end_date}
              onChange={(e) => onInputChange("end_date", e.target.value)}
            />
          </FormControl>
        </Grid>
        
        <Grid xs={12}>
            <FormHelperText>
                Events will be displayed based on these dates. Make sure to include the correct time zone if applicable.
            </FormHelperText>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ScheduleStep;
