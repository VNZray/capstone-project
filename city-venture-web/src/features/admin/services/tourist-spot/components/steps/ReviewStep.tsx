import React from "react";
import {
  Stack,
  Typography as JoyTypography,
  FormControl,
  FormLabel,
  Select,
  Option as SelectOption,
  Grid,
  Card,
  CardContent,
} from "@mui/joy";
import AppTypography from "@/src/components/Typography";
import type { FormOption, TouristSpotFormData, DaySchedule } from "@/src/types/TouristSpot";

interface ReviewStepProps {
  mode: "add" | "edit";
  formData: TouristSpotFormData;
  selectedCategories: FormOption[];
  selectedProvince: FormOption | null;
  selectedMunicipality: FormOption | null;
  selectedBarangay: FormOption | null;
  schedules: DaySchedule[];
  daysOfWeek: string[];
  onFormDataChange: (updater: (prev: TouristSpotFormData) => TouristSpotFormData) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  mode,
  formData,
  selectedCategories,
  selectedProvince,
  selectedMunicipality,
  selectedBarangay,
  schedules,
  daysOfWeek,
  onFormDataChange,
}) => {
  return (
    <Stack spacing={2}>
      <AppTypography.Header size="sm" weight="semibold" sx={{ color: "#0A1B47" }}>Review & Submit</AppTypography.Header>
      {mode === "edit" && (
        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select
            placeholder="Select status"
            value={formData.spot_status || null}
            onChange={(_e, value) =>
              onFormDataChange((prev) => ({
                ...prev,
                spot_status: (value as string) as "active" | "inactive" | "pending" | "",
              }))
            }
            slotProps={{
              listbox: {
                sx: { zIndex: 3000, maxHeight: 240, overflow: 'auto' }
              }
            }}
          >
            <SelectOption value="active">Active</SelectOption>
            <SelectOption value="inactive">Inactive</SelectOption>
          </Select>
        </FormControl>
      )}
      <Grid container spacing={2}>
        {/* Left Column */}
        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <AppTypography.Label size="normal" weight="semibold" sx={{ color: "#0A1B47" }}>Basic Information</AppTypography.Label>
                  <JoyTypography level="body-sm"><strong>Name:</strong> {formData.name}</JoyTypography>
                  <JoyTypography level="body-sm"><strong>Description:</strong> {formData.description}</JoyTypography>
                  <JoyTypography level="body-sm">
                    <strong>Categories:</strong> {selectedCategories.map(c => c.label).join(', ') || 'None selected'}
                  </JoyTypography>
                  {formData.entry_fee && (
                    <JoyTypography level="body-sm"><strong>Entry Fee:</strong> ₱{formData.entry_fee}</JoyTypography>
                  )}
                </Stack>
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <AppTypography.Label size="normal" weight="semibold" sx={{ color: "#0A1B47" }}>Location</AppTypography.Label>
                  <JoyTypography level="body-sm">
                    <strong>Address:</strong> {selectedBarangay?.label}, {selectedMunicipality?.label}, {selectedProvince?.label}
                  </JoyTypography>
                  {(formData.latitude && formData.longitude) && (
                    <JoyTypography level="body-sm">
                      <strong>Coordinates:</strong> {formData.latitude}, {formData.longitude}
                    </JoyTypography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <AppTypography.Label size="normal" weight="semibold" sx={{ color: "#0A1B47" }}>Contact Information</AppTypography.Label>
                  {formData.contact_phone && (
                    <JoyTypography level="body-sm"><strong>Phone:</strong> {formData.contact_phone}</JoyTypography>
                  )}
                  {formData.contact_email && (
                    <JoyTypography level="body-sm"><strong>Email:</strong> {formData.contact_email}</JoyTypography>
                  )}
                  {formData.website && (
                    <JoyTypography level="body-sm"><strong>Website:</strong> {formData.website}</JoyTypography>
                  )}
                  {!formData.contact_phone && !formData.contact_email && !formData.website && (
                    <JoyTypography level="body-sm" sx={{ color: 'text.tertiary' }}>
                      No contact information provided
                    </JoyTypography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <AppTypography.Label size="normal" weight="semibold" sx={{ color: "#0A1B47" }}>Operating Hours</AppTypography.Label>
                  {schedules.filter(s => !s.is_closed).length > 0 ? (
                    schedules.filter(s => !s.is_closed).map(sched => (
                      <JoyTypography level="body-sm" key={sched.dayIndex}>
                        <strong>{daysOfWeek[sched.dayIndex]}:</strong> {sched.open_time} - {sched.close_time}
                      </JoyTypography>
                    ))
                  ) : (
                    <JoyTypography level="body-sm" sx={{ color: 'text.tertiary' }}>
                      No operating hours set
                    </JoyTypography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ReviewStep;
