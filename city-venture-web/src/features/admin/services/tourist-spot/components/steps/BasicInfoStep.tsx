import React, { useMemo } from "react";
import {
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
import type { Category } from "@/src/types/Category";

interface BasicInfoStepProps {
  formData: TouristSpotFormData;
  categoryOptions: FormOption[];
  selectedCategories: FormOption[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormDataChange: (updater: (prev: TouristSpotFormData) => TouristSpotFormData) => void;
  allCategories: Category[];
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  onInputChange,
  onFormDataChange,
  allCategories,
}) => {
  const mainCategories = useMemo(() => 
    allCategories.filter(c => !c.parent_category), 
    [allCategories]
  );

  const subCategories = useMemo(() => 
    allCategories.filter(c => c.parent_category), 
    [allCategories]
  );

  const selectedMainIds = useMemo(() => 
    formData.category_ids.filter(id => mainCategories.some(mc => mc.id === id)),
    [formData.category_ids, mainCategories]
  );

  const selectedSubIds = useMemo(() => 
    formData.category_ids.filter(id => subCategories.some(sc => sc.id === id)),
    [formData.category_ids, subCategories]
  );

  const mainCategoryOptions = useMemo<FormOption[]>(() => 
    mainCategories.map(c => ({ id: c.id, label: c.title })),
    [mainCategories]
  );

  const subCategoryOptions = useMemo<FormOption[]>(() => {
    const relevantSubCategories = selectedMainIds.length === 0 
      ? subCategories 
      : subCategories.filter(c => c.parent_category && selectedMainIds.includes(c.parent_category));
      
    const options = relevantSubCategories.map(c => ({ 
      id: c.id, 
      label: c.title, 
      group: mainCategories.find(m => m.id === c.parent_category)?.title 
    }));

    // Sort options by group to prevent duplicate headers in Autocomplete
    return options.sort((a, b) => {
      const groupA = a.group || "";
      const groupB = b.group || "";
      return groupA.localeCompare(groupB);
    });
  }, [subCategories, selectedMainIds, mainCategories]);

  const selectedMainOptions = useMemo(() => 
    mainCategoryOptions.filter(o => selectedMainIds.includes(o.id)),
    [mainCategoryOptions, selectedMainIds]
  );

  const allSubCategoryOptions = useMemo(() => 
    subCategories.map(c => ({ id: c.id, label: c.title })),
    [subCategories]
  );
  
  const selectedSubOptions = useMemo(() => 
    allSubCategoryOptions.filter(o => selectedSubIds.includes(o.id)),
    [allSubCategoryOptions, selectedSubIds]
  );

  const handleMainCategoryChange = (_e: any, values: FormOption[]) => {
    const newMainIds = values.map(v => v.id);
    const validSubIds = selectedSubIds.filter(subId => {
      const subCat = subCategories.find(sc => sc.id === subId);
      return subCat && subCat.parent_category && newMainIds.includes(subCat.parent_category);
    });

    onFormDataChange(prev => ({
      ...prev,
      category_ids: [...newMainIds, ...validSubIds]
    }));
  };

  const handleSubCategoryChange = (_e: any, values: FormOption[]) => {
    const newSubIds = values.map(v => v.id);
    
    // Find parents of new subcategories
    const requiredMainIds = new Set(selectedMainIds);
    newSubIds.forEach(subId => {
      const subCat = subCategories.find(sc => sc.id === subId);
      if (subCat && subCat.parent_category) {
        requiredMainIds.add(subCat.parent_category);
      }
    });

    onFormDataChange(prev => ({
      ...prev,
      category_ids: [...Array.from(requiredMainIds), ...newSubIds]
    }));
  };

  return (
    <Box>
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
            <FormLabel>Main Category</FormLabel>
            <Autocomplete<FormOption, true>
              multiple
              options={mainCategoryOptions}
              value={selectedMainOptions}
              isOptionEqualToValue={(a, b) => a?.id === b?.id}
              getOptionLabel={(opt) => opt?.label ?? ""}
              onChange={handleMainCategoryChange}
              renderTags={(tags, getTagProps) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
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
              placeholder="Select Main Categories"
              slotProps={{ listbox: { sx: { zIndex: 2200 } } }}
            />
          </FormControl>
        </Grid>

        <Grid xs={12}>
          <FormControl>
            <FormLabel>Subcategory</FormLabel>
            <Autocomplete<FormOption, true>
              multiple
              options={subCategoryOptions}
              groupBy={(option) => option.group || "Other"}
              value={selectedSubOptions}
              isOptionEqualToValue={(a, b) => a?.id === b?.id}
              getOptionLabel={(opt) => opt?.label ?? ""}
              onChange={handleSubCategoryChange}
              renderTags={(tags, getTagProps) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {tags.map((option, index) => (
                    <Chip
                      variant="soft"
                      color="neutral"
                      size="sm"
                      {...getTagProps({ index })}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </Box>
              )}
              placeholder={selectedMainIds.length === 0 ? "Select Subcategories (All)" : "Select Subcategories"}
              slotProps={{ listbox: { sx: { zIndex: 2200 } } }}
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
    </Box>
  );
};

export default BasicInfoStep;
