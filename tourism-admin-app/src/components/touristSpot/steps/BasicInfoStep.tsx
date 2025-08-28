import React from "react";
import {
  Stack,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Autocomplete,
  Grid,
} from "@mui/joy";
import type { Option, TouristSpotFormData } from "../types";

interface BasicInfoStepProps {
  formData: TouristSpotFormData;
  categoryOptions: Option[];
  selectedCategory: Option | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormDataChange: (updater: (prev: TouristSpotFormData) => TouristSpotFormData) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  categoryOptions,
  selectedCategory,
  onInputChange,
  onFormDataChange,
}) => {
  return (
    <Stack spacing={3}>
      <Typography level="h4">Basic Information</Typography>
      
      <Grid container spacing={2}>
        <Grid xs={12}>
          <FormControl required>
            <FormLabel>Name</FormLabel>
            <Input
              name="name"
              value={formData.name}
              onChange={onInputChange}
              required
            />
          </FormControl>
        </Grid>
        
        <Grid xs={12}>
          <FormControl required>
            <FormLabel>Description</FormLabel>
            <Textarea
              minRows={3}
              name="description"
              value={formData.description}
              onChange={onInputChange}
            />
          </FormControl>
        </Grid>

        <Grid xs={12}>
          <FormControl required>
            <FormLabel>Category</FormLabel>
            <Autocomplete<Option>
              options={categoryOptions}
              value={selectedCategory}
              isOptionEqualToValue={(a, b) => a?.id === b?.id}
              getOptionLabel={(opt) => opt?.label ?? ""}
              onChange={(_e, val) =>
                onFormDataChange((prev) => ({
                  ...prev,
                  category_id: val?.id.toString() || "",
                  type_id: "4", // Always set to Tourist Spot type
                }))
              }
              placeholder="Select Category"
            />
          </FormControl>
        </Grid>

        <Grid xs={6}>
          <FormControl>
            <FormLabel>Entry Fee (₱)</FormLabel>
            <Input
              type="number"
              name="entry_fee"
              value={formData.entry_fee}
              onChange={onInputChange}
              placeholder="0"
              slotProps={{ input: { step: "0.01" } }}
            />
          </FormControl>
        </Grid>
        
        <Grid xs={6}>
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

        <Grid xs={6}>
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
        
        <Grid xs={6}>
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

export default BasicInfoStep;
