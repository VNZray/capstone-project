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
  Chip,
  Box,
} from "@mui/joy";
import type { FormOption, TouristSpotFormData } from "@/src/types/TouristSpot";

interface BasicInfoStepProps {
  formData: TouristSpotFormData;
  categoryOptions: FormOption[];
  selectedCategories: FormOption[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormDataChange: (updater: (prev: TouristSpotFormData) => TouristSpotFormData) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  categoryOptions,
  selectedCategories,
  onInputChange,
  onFormDataChange,
}) => {
  return (
    <Stack spacing={1}>
      <Typography level="h4">Basic Information</Typography>

      <Grid container spacing={1}>
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
            <FormLabel>Categories</FormLabel>
            <Autocomplete<FormOption, true>
              multiple
              options={categoryOptions}
              value={selectedCategories}
              isOptionEqualToValue={(a, b) => a?.id === b?.id}
              getOptionLabel={(opt) => opt?.label ?? ""}
              onChange={(_e, values) =>
                onFormDataChange((prev) => ({
                  ...prev,
                  category_ids: values ? values.map((v: FormOption) => v.id) : [],
                }))
              }
              renderTags={(tags, getTagProps) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {tags.map((option, index) => (
                    <Chip
                      variant="soft"
                      color="primary"
                      size="sm"
                      {...getTagProps({ index })}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </Box>
              )}
              slotProps={{ listbox: { sx: { zIndex: 2200 } } }}
              placeholder="Select Categories"
            />
          </FormControl>
        </Grid>

        <Grid xs={12}>
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
      </Grid>
    </Stack>
  );
};

export default BasicInfoStep;
