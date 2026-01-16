/**
 * Hierarchical Category Selector Component
 * Supports up to 3 levels of category selection
 */
import React from "react";
import { FormControl, FormLabel, Select, Option, Box, Chip } from "@mui/joy";
import { useCategorySelector } from "@/src/hooks/useCategorySelector";
import type { EntityType } from "@/src/types/Category";

interface CategorySelectorProps {
  entityType?: EntityType;
  entityId?: string;
  onCategoryChange?: (categories: { level1: number | null; level2: number | null; level3: number | null }) => void;
  required?: boolean;
  showBreadcrumb?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  entityType = "business",
  entityId,
  onCategoryChange,
  required = false,
  showBreadcrumb = true,
}) => {
  const {
    level1Categories,
    level2Categories,
    level3Categories,
    selectedCategories,
    loading,
    selectLevel1,
    selectLevel2,
    selectLevel3,
    getSelectedTitles,
    hasLevel2Options,
    hasLevel3Options,
  } = useCategorySelector({ entityType, entityId, onCategoryChange });

  const selectedTitles = getSelectedTitles();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Level 1 - Primary Category */}
      <FormControl required={required}>
        <FormLabel sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
          Category
        </FormLabel>
        <Select
          variant="outlined"
          size="md"
          value={selectedCategories.level1?.toString() ?? ""}
          onChange={(_e, value) => selectLevel1(value ? Number(value) : null)}
          disabled={loading}
          placeholder="Select a category"
        >
          <Option value="">-- Select a category --</Option>
          {level1Categories.map((category) => (
            <Option key={category.id} value={category.id.toString()}>
              {category.title}
            </Option>
          ))}
        </Select>
      </FormControl>

      {/* Level 2 - Subcategory (shown only if level 1 selected and has children) */}
      {selectedCategories.level1 && hasLevel2Options && (
        <FormControl>
          <FormLabel sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
            Subcategory
          </FormLabel>
          <Select
            variant="outlined"
            size="md"
            value={selectedCategories.level2?.toString() ?? ""}
            onChange={(_e, value) => selectLevel2(value ? Number(value) : null)}
            placeholder="Select a subcategory (optional)"
          >
            <Option value="">-- Select a subcategory --</Option>
            {level2Categories.map((category) => (
              <Option key={category.id} value={category.id.toString()}>
                {category.title}
              </Option>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Level 3 - Tertiary (shown only if level 2 selected and has children) */}
      {selectedCategories.level2 && hasLevel3Options && (
        <FormControl>
          <FormLabel sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
            Specialty
          </FormLabel>
          <Select
            variant="outlined"
            size="md"
            value={selectedCategories.level3?.toString() ?? ""}
            onChange={(_e, value) => selectLevel3(value ? Number(value) : null)}
            placeholder="Select a specialty (optional)"
          >
            <Option value="">-- Select a specialty --</Option>
            {level3Categories.map((category) => (
              <Option key={category.id} value={category.id.toString()}>
                {category.title}
              </Option>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Breadcrumb display */}
      {showBreadcrumb && selectedTitles.length > 0 && (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
          {selectedTitles.map((title, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span style={{ color: "#9ca3af", margin: "0 4px" }}>›</span>
              )}
              <Chip
                size="sm"
                variant="soft"
                color={index === selectedTitles.length - 1 ? "primary" : "neutral"}
              >
                {title}
              </Chip>
            </React.Fragment>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CategorySelector;
