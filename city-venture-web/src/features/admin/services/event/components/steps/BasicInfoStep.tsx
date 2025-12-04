import React from "react";
import {
  Input,
  Textarea,
  Select,
  Option,
  FormControl,
  FormLabel,
  FormHelperText,
  Stack,
  Grid,
  Chip,
  ChipDelete,
  Box,
} from "@mui/joy";
import type { EventFormData, EventCategory } from "@/src/types/Event";

interface BasicInfoStepProps {
  formData: EventFormData;
  categories: EventCategory[];
  onInputChange: (field: keyof EventFormData, value: any) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  categories,
  onInputChange,
}) => {
  // Handle multi-select for categories
  const selectedCategoryIds = formData.event_category_ids || 
    (formData.event_category_id ? [formData.event_category_id] : []);

  const handleRemoveCategory = (categoryId: string) => {
    const newIds = selectedCategoryIds.filter(id => id !== categoryId);
    onInputChange("event_category_ids", newIds);
    // Update single category for backward compatibility
    onInputChange("event_category_id", newIds[0] || "");
  };

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id.toString() === id)?.name || id;
  };

  // Get available categories (not yet selected)
  const availableCategories = categories.filter(
    c => !selectedCategoryIds.includes(c.id.toString())
  );

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <FormControl required>
            <FormLabel>Event Name</FormLabel>
            <Input
              placeholder="Enter event name"
              value={formData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
            />
          </FormControl>
        </Grid>

        <Grid xs={12} md={6}>
          <FormControl required>
            <FormLabel>Categories</FormLabel>
            <Select<string>
              placeholder={selectedCategoryIds.length > 0 ? "Add more categories..." : "Select categories"}
              value={null}
              onChange={(_, value) => {
                if (!value) return;
                if (selectedCategoryIds.includes(value)) return;
                const newIds = [...selectedCategoryIds, value];
                onInputChange("event_category_ids", newIds);
                onInputChange("event_category_id", newIds[0]);
              }}
              slotProps={{
                listbox: {
                  sx: { zIndex: 9999 }
                }
              }}
            >
              {availableCategories.map((category) => (
                <Option key={category.id} value={category.id.toString()}>
                  {category.name}
                </Option>
              ))}
            </Select>
            <FormHelperText>Select one or more categories</FormHelperText>
            
            {/* Selected Categories Chips */}
            {selectedCategoryIds.length > 0 && (
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
                {selectedCategoryIds.map((id) => (
                  <Chip
                    key={id}
                    size="sm"
                    variant="soft"
                    color="primary"
                    endDecorator={
                      <ChipDelete onDelete={() => handleRemoveCategory(id)} />
                    }
                  >
                    {getCategoryName(id)}
                  </Chip>
                ))}
              </Box>
            )}
          </FormControl>
        </Grid>

        <Grid xs={12} md={6}>
          <FormControl>
            <FormLabel>Organizer Name</FormLabel>
            <Input
              placeholder="Enter organizer name"
              value={formData.organizer_name}
              onChange={(e) => onInputChange("organizer_name", e.target.value)}
            />
          </FormControl>
        </Grid>

        <Grid xs={12}>
          <FormControl required>
            <FormLabel>Short Description</FormLabel>
            <Input
              placeholder="Brief summary of the event"
              value={formData.short_description}
              onChange={(e) => onInputChange("short_description", e.target.value)}
            />
            <FormHelperText>Used for cards and previews</FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12}>
          <FormControl required>
            <FormLabel>Full Description</FormLabel>
            <Textarea
              minRows={4}
              placeholder="Detailed description of the event"
              value={formData.description}
              onChange={(e) => onInputChange("description", e.target.value)}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default BasicInfoStep;
