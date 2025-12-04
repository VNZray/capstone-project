import React from "react";
import {
  Input,
  Checkbox,
  FormControl,
  FormLabel,
  Stack,
  Grid,
  Divider,
} from "@mui/joy";
import type { EventFormData } from "@/src/types/Event";

interface DetailsStepProps {
  formData: EventFormData;
  onInputChange: (field: keyof EventFormData, value: any) => void;
}

const DetailsStep: React.FC<DetailsStepProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <Stack spacing={3}>
      <Divider>Pricing & Capacity</Divider>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <Checkbox
            label="This is a free event"
            checked={formData.is_free}
            onChange={(e) => onInputChange("is_free", e.target.checked)}
          />
        </Grid>

        {!formData.is_free && (
          <Grid xs={12} md={6}>
            <FormControl>
              <FormLabel>Entry Fee (PHP)</FormLabel>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.entry_fee}
                onChange={(e) => onInputChange("entry_fee", e.target.value)}
                startDecorator="₱"
              />
            </FormControl>
          </Grid>
        )}

        <Grid xs={12} md={formData.is_free ? 12 : 6}>
          <FormControl>
            <FormLabel>Max Attendees</FormLabel>
            <Input
              type="number"
              placeholder="Leave blank for unlimited"
              value={formData.max_attendees}
              onChange={(e) => onInputChange("max_attendees", e.target.value)}
            />
          </FormControl>
        </Grid>

        <Grid xs={12}>
          <Checkbox
            label="Registration Required"
            checked={formData.registration_required}
            onChange={(e) => onInputChange("registration_required", e.target.checked)}
          />
        </Grid>

        {formData.registration_required && (
          <Grid xs={12}>
            <FormControl>
              <FormLabel>Registration URL</FormLabel>
              <Input
                placeholder="https://..."
                value={formData.registration_url}
                onChange={(e) => onInputChange("registration_url", e.target.value)}
              />
            </FormControl>
          </Grid>
        )}
      </Grid>

      <Divider>Contact Information</Divider>
      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <FormControl>
            <FormLabel>Contact Phone</FormLabel>
            <Input
              placeholder="+63 900 000 0000"
              value={formData.contact_phone}
              onChange={(e) => onInputChange("contact_phone", e.target.value)}
            />
          </FormControl>
        </Grid>

        <Grid xs={12} md={6}>
          <FormControl>
            <FormLabel>Contact Email</FormLabel>
            <Input
              type="email"
              placeholder="contact@example.com"
              value={formData.contact_email}
              onChange={(e) => onInputChange("contact_email", e.target.value)}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default DetailsStep;
