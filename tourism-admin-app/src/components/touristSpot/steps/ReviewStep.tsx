import React from "react";
import {
  Stack,
  Typography,
  FormControl,
  FormLabel,
  Select,
  Option as SelectOption,
} from "@mui/joy";
import type { Option, TouristSpotFormData, DaySchedule } from "../types";

interface ReviewStepProps {
  mode: "add" | "edit";
  formData: TouristSpotFormData;
  selectedCategory: Option | null;
  selectedProvince: Option | null;
  selectedMunicipality: Option | null;
  selectedBarangay: Option | null;
  schedules: DaySchedule[];
  daysOfWeek: string[];
  onFormDataChange: (updater: (prev: TouristSpotFormData) => TouristSpotFormData) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  mode,
  formData,
  selectedCategory,
  selectedProvince,
  selectedMunicipality,
  selectedBarangay,
  schedules,
  daysOfWeek,
  onFormDataChange,
}) => {
  return (
    <Stack spacing={3}>
      <Typography level="h4">Review & Submit</Typography>
      
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography level="title-sm" sx={{ color: 'primary.600' }}>
            Basic Information
          </Typography>
          <Typography level="body-sm"><strong>Name:</strong> {formData.name}</Typography>
          <Typography level="body-sm"><strong>Description:</strong> {formData.description}</Typography>
          <Typography level="body-sm">
            <strong>Category:</strong> {selectedCategory?.label}
          </Typography>
          {formData.entry_fee && (
            <Typography level="body-sm"><strong>Entry Fee:</strong> ₱{formData.entry_fee}</Typography>
          )}
        </Stack>
        
        <Stack spacing={1}>
          <Typography level="title-sm" sx={{ color: 'primary.600' }}>
            Location
          </Typography>
          <Typography level="body-sm">
            <strong>Address:</strong> {selectedBarangay?.label}, {selectedMunicipality?.label}, {selectedProvince?.label}
          </Typography>
          {(formData.latitude && formData.longitude) && (
            <Typography level="body-sm">
              <strong>Coordinates:</strong> {formData.latitude}, {formData.longitude}
            </Typography>
          )}
        </Stack>

        <Stack spacing={1}>
          <Typography level="title-sm" sx={{ color: 'primary.600' }}>
            Contact Information
          </Typography>
          {formData.contact_phone && (
            <Typography level="body-sm"><strong>Phone:</strong> {formData.contact_phone}</Typography>
          )}
          {formData.contact_email && (
            <Typography level="body-sm"><strong>Email:</strong> {formData.contact_email}</Typography>
          )}
          {formData.website && (
            <Typography level="body-sm"><strong>Website:</strong> {formData.website}</Typography>
          )}
        </Stack>

        <Stack spacing={1}>
          <Typography level="title-sm" sx={{ color: 'primary.600' }}>
            Operating Hours
          </Typography>
          {schedules.filter(s => !s.is_closed).length > 0 ? (
            schedules.filter(s => !s.is_closed).map(sched => (
              <Typography level="body-sm" key={sched.dayIndex}>
                <strong>{daysOfWeek[sched.dayIndex]}:</strong> {sched.open_time} - {sched.close_time}
              </Typography>
            ))
          ) : (
            <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
              No operating hours set
            </Typography>
          )}
        </Stack>
      </Stack>

      {mode === "edit" && (
        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select
            value={formData.spot_status}
            onChange={(_e, value) =>
              onFormDataChange((prev) => ({
                ...prev,
                spot_status: (value as string) as "pending" | "active" | "inactive",
              }))
            }
          >
            <SelectOption value="active">Active</SelectOption>
            <SelectOption value="inactive">Inactive</SelectOption>
          </Select>
        </FormControl>
      )}
    </Stack>
  );
};

export default ReviewStep;
