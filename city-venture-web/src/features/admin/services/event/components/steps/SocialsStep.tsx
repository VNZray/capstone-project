import React from "react";
import {
  Input,
  FormControl,
  FormLabel,
  Stack,
  Grid,
} from "@mui/joy";
import { Globe, Facebook, Instagram } from "lucide-react";
import type { EventFormData } from "@/src/types/Event";

interface SocialsStepProps {
  formData: EventFormData;
  onInputChange: (field: keyof EventFormData, value: any) => void;
}

const SocialsStep: React.FC<SocialsStepProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <FormControl>
            <FormLabel>Website</FormLabel>
            <Input
              startDecorator={<Globe size={18} />}
              placeholder="https://..."
              value={formData.website}
              onChange={(e) => onInputChange("website", e.target.value)}
            />
          </FormControl>
        </Grid>

        <Grid xs={12}>
          <FormControl>
            <FormLabel>Facebook URL</FormLabel>
            <Input
              startDecorator={<Facebook size={18} />}
              placeholder="https://facebook.com/..."
              value={formData.facebook_url}
              onChange={(e) => onInputChange("facebook_url", e.target.value)}
            />
          </FormControl>
        </Grid>

        <Grid xs={12}>
          <FormControl>
            <FormLabel>Instagram URL</FormLabel>
            <Input
              startDecorator={<Instagram size={18} />}
              placeholder="https://instagram.com/..."
              value={formData.instagram_url}
              onChange={(e) => onInputChange("instagram_url", e.target.value)}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default SocialsStep;
