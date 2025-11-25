import React from "react";
import {
  Stack,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Grid,
} from "@mui/joy";
import type { TouristSpotFormData } from "@/src/types/TouristSpot";

interface SocialsStepProps {
  formData: TouristSpotFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SocialsStep: React.FC<SocialsStepProps> = ({ formData, onInputChange }) => {
  return (
    <Stack spacing={1}>
      <Typography level="h4">Social Media & Contact</Typography>

      <Grid container spacing={1}>
        <Grid xs={12}>
          <FormControl>
            <FormLabel>Contact Phone</FormLabel>
            <Input
              type="tel"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={onInputChange}
              placeholder="Mobile Number"
            />
          </FormControl>
        </Grid>

        <Grid xs={12}>
          <FormControl>
            <FormLabel>Contact Email</FormLabel>
            <Input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={onInputChange}
              placeholder="Email"
            />
          </FormControl>
        </Grid>

        <Grid xs={12}>
          <FormControl>
            <FormLabel>Website</FormLabel>
            <Input
              type="url"
              name="website"
              value={formData.website}
              onChange={onInputChange}
              placeholder="Website URL"
            />
          </FormControl>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default SocialsStep;
