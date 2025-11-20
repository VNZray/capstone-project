import React from "react";
import {
  Stack,
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
                  <AppTypography.Body size="sm"><strong>Name:</strong> {formData.name}</AppTypography.Body>
                  <AppTypography.Body size="sm"><strong>Description:</strong> {formData.description}</AppTypography.Body>
                  <AppTypography.Body size="sm">
                    <strong>Categories:</strong> {selectedCategories.map(c => c.label).join(', ') || 'None selected'}
                  </AppTypography.Body>
                  {formData.entry_fee && (
                    <AppTypography.Body size="sm"><strong>Entry Fee:</strong> ₱{formData.entry_fee}</AppTypography.Body>
                  )}
                </Stack>
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <AppTypography.Label size="normal" weight="semibold" sx={{ color: "#0A1B47" }}>Location</AppTypography.Label>
                  <AppTypography.Body size="sm">
                    <strong>Address:</strong> {selectedBarangay?.label}, {selectedMunicipality?.label}, {selectedProvince?.label}
                  </AppTypography.Body>
                  {(formData.latitude && formData.longitude) && (
                    <AppTypography.Body size="sm">
                      <strong>Coordinates:</strong> {formData.latitude}, {formData.longitude}
                    </AppTypography.Body>
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
                    <AppTypography.Body size="sm"><strong>Phone:</strong> {formData.contact_phone}</AppTypography.Body>
                  )}
                  {formData.contact_email && (
                    <AppTypography.Body size="sm"><strong>Email:</strong> {formData.contact_email}</AppTypography.Body>
                  )}
                  {formData.website && (
                    <AppTypography.Body size="sm"><strong>Website:</strong> {formData.website}</AppTypography.Body>
                  )}
                  {!formData.contact_phone && !formData.contact_email && !formData.website && (
                    <AppTypography.Body size="sm" sx={{ color: "#94a3b8" }}>
                      No contact information provided
                    </AppTypography.Body>
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
                      <AppTypography.Body size="sm" key={sched.dayIndex}>
                        <strong>{daysOfWeek[sched.dayIndex]}:</strong> {sched.open_time} - {sched.close_time}
                      </AppTypography.Body>
                    ))
                  ) : (
                    <AppTypography.Body size="sm" sx={{ color: "#94a3b8" }}>
                      No operating hours set
                    </AppTypography.Body>
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
