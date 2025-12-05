import {
  Box,
  Chip,
  CircularProgress,
  FormControl,
  FormLabel,
  Option,
  Select,
} from "@mui/joy";
import { useEffect, useState } from "react";
import Typography from "./Typography";
import type { Category } from "@/src/types/Category";

type HierarchicalCategorySelectorProps = {
  rootCategories: Category[];
  selectedCategoryIds: number[];
  onCategoryChange: (categoryIds: number[]) => void;
  getChildCategories: (parentId: number) => Promise<Category[]>;
  applicableTo?: "business" | "tourist_spot" | "event";
  required?: boolean;
};

/**
 * HierarchicalCategorySelector Component
 *
 * A three-level category selector supporting:
 * - Single primary category selection (Level 1)
 * - Single secondary category selection (Level 2)
 * - Optional specialty selection (Level 3)
 *
 * @example
 * <HierarchicalCategorySelector
 *   rootCategories={categories}
 *   selectedCategoryIds={selectedIds}
 *   onCategoryChange={handleChange}
 *   getChildCategories={fetchChildren}
 *   applicableTo="business"
 * />
 */
const HierarchicalCategorySelector: React.FC<
  HierarchicalCategorySelectorProps
> = ({
  rootCategories,
  selectedCategoryIds,
  onCategoryChange,
  getChildCategories,
  applicableTo = "business",
  required = true,
}) => {
  const [selectedPrimaryId, setSelectedPrimaryId] = useState<number | null>(
    null
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<
    number | null
  >(null);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | null>(
    null
  );

  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [specialties, setSpecialties] = useState<Category[]>([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);

  // Filter root categories by applicable_to
  const filteredRootCategories = rootCategories.filter(
    (cat) => cat.applicable_to === applicableTo && cat.parent_category === null
  );

  // Fetch sub-categories when primary category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (selectedPrimaryId) {
        setLoadingSubCategories(true);
        try {
          const children = await getChildCategories(selectedPrimaryId);
          setSubCategories(children);
        } catch (error) {
          console.error("Error fetching sub-categories:", error);
          setSubCategories([]);
        } finally {
          setLoadingSubCategories(false);
        }
      } else {
        setSubCategories([]);
        setSelectedSubCategoryId(null);
        setSpecialties([]);
        setSelectedSpecialtyId(null);
      }
    };
    fetchSubCategories();
  }, [selectedPrimaryId]);

  // Fetch specialties when sub-category changes
  useEffect(() => {
    const fetchSpecialties = async () => {
      if (selectedSubCategoryId) {
        setLoadingSpecialties(true);
        try {
          const children = await getChildCategories(selectedSubCategoryId);
          setSpecialties(children);
        } catch (error) {
          console.error("Error fetching specialties:", error);
          setSpecialties([]);
        } finally {
          setLoadingSpecialties(false);
        }
      } else {
        setSpecialties([]);
        setSelectedSpecialtyId(null);
      }
    };
    fetchSpecialties();
  }, [selectedSubCategoryId]);

  // Initialize from selectedCategoryIds prop
  useEffect(() => {
    if (selectedCategoryIds.length > 0 && filteredRootCategories.length > 0) {
      let primary: number | null = null;
      let subCategory: number | null = null;
      let specialty: number | null = null;

      for (const catId of selectedCategoryIds) {
        const isPrimary = filteredRootCategories.some((c) => c.id === catId);
        if (isPrimary && primary === null) {
          primary = catId;
        } else if (!isPrimary && subCategory === null) {
          subCategory = catId;
        } else if (!isPrimary && specialty === null) {
          specialty = catId;
        }
      }

      if (primary !== null) setSelectedPrimaryId(primary);
      if (subCategory !== null) setSelectedSubCategoryId(subCategory);
      if (specialty !== null) setSelectedSpecialtyId(specialty);
    }
  }, [selectedCategoryIds.join(","), filteredRootCategories.length]);

  // Notify parent when selections change
  useEffect(() => {
    const categoryIds: number[] = [];

    // Add primary category
    if (selectedPrimaryId) {
      categoryIds.push(selectedPrimaryId);
    }

    // Add sub-category if selected
    if (selectedSubCategoryId) {
      categoryIds.push(selectedSubCategoryId);
    }

    // Add specialty if selected
    if (selectedSpecialtyId) {
      categoryIds.push(selectedSpecialtyId);
    }

    onCategoryChange(categoryIds);
  }, [selectedPrimaryId, selectedSubCategoryId, selectedSpecialtyId]);

  const selectSx = {
    "--Select-focusedThickness": "2px",
    "--Select-focusedHighlight": "var(--joy-palette-primary-500)",
    backgroundColor: "#fafafa",
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Primary Category (Single-select) */}
      <FormControl required={required}>
        <FormLabel
          sx={{
            mb: 0.75,
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#374151",
          }}
        >
          Primary Category
        </FormLabel>
        <Typography.Body size="xs" sx={{ color: "#6b7280", mb: 1 }}>
          Select a main category (e.g., Accommodation, Dining, Shopping)
        </Typography.Body>
        <Select
          placeholder="Select primary category..."
          value={selectedPrimaryId?.toString() ?? ""}
          onChange={(_e, value) => {
            setSelectedPrimaryId(value ? Number(value) : null);
            setSelectedSubCategoryId(null);
            setSelectedSpecialtyId(null);
          }}
          sx={selectSx}
        >
          {filteredRootCategories.map((category) => (
            <Option key={category.id} value={category.id!.toString()}>
              {category.title}
            </Option>
          ))}
        </Select>
      </FormControl>

      {/* Secondary Category (Sub-Category) */}
      {selectedPrimaryId && subCategories.length > 0 && (
        <FormControl required={required}>
          <FormLabel
            sx={{
              mb: 0.75,
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Secondary Category
          </FormLabel>
          <Typography.Body size="xs" sx={{ color: "#6b7280", mb: 1 }}>
            Select a specific type (e.g., Hotels, Restaurants, Coffee Shop)
          </Typography.Body>
          {loadingSubCategories ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 1,
              }}
            >
              <CircularProgress size="sm" />
              <Typography.Body size="xs">Loading options...</Typography.Body>
            </Box>
          ) : (
            <Select
              placeholder="Select secondary category..."
              value={selectedSubCategoryId?.toString() ?? ""}
              onChange={(_e, value) => {
                setSelectedSubCategoryId(value ? Number(value) : null);
                setSelectedSpecialtyId(null);
              }}
              sx={selectSx}
            >
              {subCategories.map((category) => (
                <Option key={category.id} value={category.id!.toString()}>
                  {category.title}
                </Option>
              ))}
            </Select>
          )}
        </FormControl>
      )}

      {/* Specialty (Optional - Level 3) */}
      {selectedSubCategoryId && specialties.length > 0 && (
        <FormControl>
          <FormLabel
            sx={{
              mb: 0.75,
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Specialty (Optional)
          </FormLabel>
          <Typography.Body size="xs" sx={{ color: "#6b7280", mb: 1 }}>
            Select a specialty if applicable
          </Typography.Body>
          {loadingSpecialties ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 1,
              }}
            >
              <CircularProgress size="sm" />
              <Typography.Body size="xs">
                Loading specialties...
              </Typography.Body>
            </Box>
          ) : (
            <Select
              placeholder="Select a specialty..."
              value={selectedSpecialtyId?.toString() ?? ""}
              onChange={(_e, value) => {
                setSelectedSpecialtyId(value ? Number(value) : null);
              }}
              sx={selectSx}
            >
              {specialties.map((category) => (
                <Option key={category.id} value={category.id!.toString()}>
                  {category.title}
                </Option>
              ))}
            </Select>
          )}
        </FormControl>
      )}

      {/* Selected Categories Summary */}
      {selectedPrimaryId && (
        <Box
          sx={{
            p: 1.5,
            backgroundColor: "#f0f9ff",
            borderRadius: "8px",
            border: "1px solid #bae6fd",
          }}
        >
          <Typography.Body
            size="xs"
            sx={{ color: "#0369a1", fontWeight: 600, mb: 0.5 }}
          >
            Your Selection:
          </Typography.Body>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              alignItems: "center",
            }}
          >
            <Chip size="sm" variant="soft" color="primary">
              {
                filteredRootCategories.find((c) => c.id === selectedPrimaryId)
                  ?.title
              }
            </Chip>
            {selectedSubCategoryId && (
              <>
                <span style={{ color: "#64748b" }}>→</span>
                <Chip size="sm" variant="soft" color="primary">
                  {
                    subCategories.find((c) => c.id === selectedSubCategoryId)
                      ?.title
                  }
                </Chip>
              </>
            )}
            {selectedSpecialtyId && (
              <>
                <span style={{ color: "#64748b" }}>→</span>
                <Chip size="sm" variant="soft" color="primary">
                  {specialties.find((c) => c.id === selectedSpecialtyId)?.title}
                </Chip>
              </>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default HierarchicalCategorySelector;
