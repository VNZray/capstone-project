import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Option,
  CircularProgress,
  Chip,
  Autocomplete,
} from "@mui/joy";
import { Building2, Store, Hotel, Coffee } from "lucide-react";
import Typography from "@/src/components/Typography";
import { colors } from "@/src/utils/Colors";
import type { Business } from "@/src/types/Business";
import type { BusinessAmenity, Amenity } from "@/src/types/Amenity";
import type { Category } from "@/src/types/Category";
import { useBusinessBasics } from "@/src/hooks/useBusiness";
import { getData, insertData } from "@/src/services/Service";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  businessAmenities: BusinessAmenity[];
  setBusinessAmenities: React.Dispatch<React.SetStateAction<BusinessAmenity[]>>;
};

const Step1Basic: React.FC<Props> = ({
  data,
  setData,
  setBusinessAmenities,
}) => {
  const {
    rootCategories,
    selectedCategories,
    setSelectedCategories,
    getChildCategories,
  } = useBusinessBasics(data, setData);

  // Hierarchical category state
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

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([]);

  // Fetch sub-categories when primary category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (selectedPrimaryId) {
        setLoadingSubCategories(true);
        const children = await getChildCategories(selectedPrimaryId);
        setSubCategories(children);
        setLoadingSubCategories(false);
        setSelectedSubCategoryId(null);
        setSpecialties([]);
        setSelectedSpecialtyId(null);
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
        const children = await getChildCategories(selectedSubCategoryId);
        setSpecialties(children);
        setLoadingSpecialties(false);
        setSelectedSpecialtyId(null);
      } else {
        setSpecialties([]);
        setSelectedSpecialtyId(null);
      }
    };
    fetchSpecialties();
  }, [selectedSubCategoryId]);

  // Update form data when category selections change
  useEffect(() => {
    const categoryIds: number[] = [];

    if (selectedPrimaryId) {
      categoryIds.push(selectedPrimaryId);
      if (selectedSubCategoryId) {
        categoryIds.push(selectedSubCategoryId);
        if (selectedSpecialtyId) {
          categoryIds.push(selectedSpecialtyId);
        }
      }
    }

    const primaryCategory = rootCategories.find(
      (c: Category) => c.id === selectedPrimaryId
    );
    const isAccommodation = primaryCategory?.alias
      ?.toLowerCase()
      .includes("accommodation");

    setSelectedCategories(categoryIds);
    setData((prev) => ({
      ...prev,
      primary_category_id: selectedPrimaryId ?? undefined,
      category_ids: categoryIds,
      hasBooking: isAccommodation ?? false,
    }));
  }, [
    selectedPrimaryId,
    selectedSubCategoryId,
    selectedSpecialtyId,
    rootCategories,
  ]);

  // Fetch amenities
  const fetchAmenities = async () => {
    const response = await getData("amenities");
    if (response) {
      setAmenities(response);
    }
  };

  const addAmenity = (name: string) => {
    insertData({ name }, "amenities");
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  // Sync selectedAmenities to parent businessAmenities
  useEffect(() => {
    if (selectedAmenities.length > 0) {
      setBusinessAmenities(
        selectedAmenities.map((amenity) => ({
          business_id: data.id ?? undefined,
          amenity_id: amenity.id ?? undefined,
        }))
      );
    } else {
      setBusinessAmenities([]);
    }
  }, [selectedAmenities, setBusinessAmenities, data.id]);

  const getCategoryIcon = (alias?: string) => {
    if (!alias) return <Building2 size={20} />;
    if (alias.includes("accommodation")) return <Hotel size={20} />;
    if (alias.includes("food") || alias.includes("dining"))
      return <Coffee size={20} />;
    if (alias.includes("shopping")) return <Store size={20} />;
    return <Building2 size={20} />;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography.CardTitle size="md" sx={{ mb: 1, color: colors.primary }}>
          Basic Information
        </Typography.CardTitle>
        <Typography.Body size="sm" sx={{ color: colors.gray }}>
          Tell us about your business to get started
        </Typography.Body>
      </Box>

      {/* Form Grid */}
      <Grid container spacing={3}>
        {/* Business Name */}
        <Grid xs={12}>
          <FormControl required>
            <FormLabel>
              <Typography.Label size="sm">Business Name</Typography.Label>
            </FormLabel>
            <Input
              size="lg"
              placeholder="Enter your business name"
              value={data.business_name}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  business_name: e.target.value,
                }))
              }
              sx={{
                backgroundColor: colors.white,
                borderColor: colors.gray,
                "&:hover": { borderColor: colors.secondary },
                "&:focus-within": {
                  borderColor: colors.primary,
                  boxShadow: `0 0 0 3px ${colors.primary}20`,
                },
              }}
            />
          </FormControl>
        </Grid>

        {/* Primary Category */}
        <Grid xs={12} md={6}>
          <FormControl required>
            <FormLabel>
              <Typography.Label size="sm">Primary Category</Typography.Label>
            </FormLabel>
            <Typography.Body size="xs" sx={{ color: colors.gray, mb: 1 }}>
              Select the main type of your business
            </Typography.Body>
            <Select
              size="lg"
              placeholder="Choose a category..."
              value={selectedPrimaryId?.toString() ?? ""}
              onChange={(_e, value) => {
                setSelectedPrimaryId(value ? Number(value) : null);
              }}
              startDecorator={getCategoryIcon(
                rootCategories.find((c: Category) => c.id === selectedPrimaryId)
                  ?.alias
              )}
              sx={{
                backgroundColor: colors.white,
                borderColor: colors.gray,
                "&:hover": { borderColor: colors.secondary },
              }}
            >
              {rootCategories.map((category: Category) => (
                <Option key={category.id} value={category.id.toString()}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {getCategoryIcon(category.alias)}
                    {category.title}
                  </Box>
                </Option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Sub-Category */}
        {selectedPrimaryId && (
          <Grid xs={12} md={6}>
            <FormControl required={subCategories.length > 0}>
              <FormLabel>
                <Typography.Label size="sm">Sub-Category</Typography.Label>
              </FormLabel>
              <Typography.Body size="xs" sx={{ color: colors.gray, mb: 1 }}>
                Choose a more specific type
              </Typography.Body>
              {loadingSubCategories ? (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}
                >
                  <CircularProgress size="sm" />
                  <Typography.Body size="xs">Loading...</Typography.Body>
                </Box>
              ) : subCategories.length > 0 ? (
                <Select
                  size="lg"
                  placeholder="Select sub-category..."
                  value={selectedSubCategoryId?.toString() ?? ""}
                  onChange={(_e, value) => {
                    setSelectedSubCategoryId(value ? Number(value) : null);
                  }}
                  sx={{
                    backgroundColor: colors.white,
                    borderColor: colors.gray,
                    "&:hover": { borderColor: colors.secondary },
                  }}
                >
                  {subCategories.map((category) => (
                    <Option key={category.id} value={category.id.toString()}>
                      {category.title}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Typography.Body
                  size="xs"
                  sx={{ color: colors.gray, fontStyle: "italic", py: 2 }}
                >
                  No sub-categories available
                </Typography.Body>
              )}
            </FormControl>
          </Grid>
        )}

        {/* Specialty */}
        {selectedSubCategoryId && specialties.length > 0 && (
          <Grid xs={12} md={6}>
            <FormControl>
              <FormLabel>
                <Typography.Label size="sm">
                  Specialty (Optional)
                </Typography.Label>
              </FormLabel>
              <Typography.Body size="xs" sx={{ color: colors.gray, mb: 1 }}>
                Select a specialty if applicable
              </Typography.Body>
              {loadingSpecialties ? (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}
                >
                  <CircularProgress size="sm" />
                  <Typography.Body size="xs">Loading...</Typography.Body>
                </Box>
              ) : (
                <Select
                  size="lg"
                  placeholder="Select specialty..."
                  value={selectedSpecialtyId?.toString() ?? ""}
                  onChange={(_e, value) => {
                    setSelectedSpecialtyId(value ? Number(value) : null);
                  }}
                  sx={{
                    backgroundColor: colors.white,
                    borderColor: colors.gray,
                    "&:hover": { borderColor: colors.secondary },
                  }}
                >
                  {specialties.map((category) => (
                    <Option key={category.id} value={category.id.toString()}>
                      {category.title}
                    </Option>
                  ))}
                </Select>
              )}
            </FormControl>
          </Grid>
        )}

        {/* Category Path Display */}
        {selectedCategories.length > 0 && (
          <Grid xs={12}>
            <Box
              sx={{
                p: 2,
                backgroundColor: `${colors.primary}10`,
                borderRadius: "8px",
                border: `1px solid ${colors.primary}30`,
              }}
            >
              <Typography.Body
                size="xs"
                sx={{ color: colors.primary, fontWeight: 600, mb: 1 }}
              >
                Selected Path:
              </Typography.Body>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                {selectedPrimaryId && (
                  <Chip
                    size="md"
                    variant="solid"
                    sx={{ bgcolor: colors.primary }}
                  >
                    {
                      rootCategories.find(
                        (c: Category) => c.id === selectedPrimaryId
                      )?.title
                    }
                  </Chip>
                )}
                {selectedSubCategoryId && (
                  <>
                    <Typography.Body size="sm" sx={{ color: colors.gray }}>
                      →
                    </Typography.Body>
                    <Chip
                      size="md"
                      variant="soft"
                      sx={{ bgcolor: colors.secondary, color: colors.white }}
                    >
                      {
                        subCategories.find(
                          (c) => c.id === selectedSubCategoryId
                        )?.title
                      }
                    </Chip>
                  </>
                )}
                {selectedSpecialtyId && (
                  <>
                    <Typography.Body size="sm" sx={{ color: colors.gray }}>
                      →
                    </Typography.Body>
                    <Chip
                      size="md"
                      variant="outlined"
                      sx={{ borderColor: colors.secondary }}
                    >
                      {
                        specialties.find((c) => c.id === selectedSpecialtyId)
                          ?.title
                      }
                    </Chip>
                  </>
                )}
              </Box>
            </Box>
          </Grid>
        )}

        {/* Amenities */}
        <Grid xs={12}>
          <FormControl>
            <FormLabel>
              <Typography.Label size="sm">Amenities</Typography.Label>
            </FormLabel>
            <Autocomplete
              multiple
              freeSolo
              size="lg"
              placeholder="Select or add amenities..."
              options={amenities}
              value={selectedAmenities}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.name
              }
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    size="md"
                    variant="soft"
                    sx={{ bgcolor: colors.secondary, color: colors.white }}
                  >
                    {option.name}
                  </Chip>
                ))
              }
              filterOptions={(options, state) => {
                const inputValue = state.inputValue.trim().toLowerCase();
                const filtered = options.filter(
                  (option) =>
                    typeof option !== "string" &&
                    option.name.toLowerCase().includes(inputValue)
                );
                if (
                  inputValue !== "" &&
                  !options.some(
                    (opt) =>
                      typeof opt !== "string" &&
                      opt.name.toLowerCase() === inputValue
                  )
                ) {
                  return [
                    ...filtered,
                    { id: -1, name: `Add "${state.inputValue}"` } as Amenity,
                  ];
                }
                return filtered;
              }}
              onChange={async (_, newValue) => {
                const last = newValue[newValue.length - 1];
                if (
                  last &&
                  typeof last !== "string" &&
                  (last as Amenity).id === -1
                ) {
                  const newAmenityName = (last as Amenity).name
                    .replace(/^Add\s+"|"$/g, "")
                    .trim();
                  await addAmenity(newAmenityName);
                  await fetchAmenities();
                  const inserted = amenities.find(
                    (a) => a.name.toLowerCase() === newAmenityName.toLowerCase()
                  );
                  if (inserted) {
                    setSelectedAmenities([
                      ...newValue
                        .slice(0, -1)
                        .filter(
                          (item): item is Amenity => typeof item !== "string"
                        ),
                      inserted,
                    ]);
                  }
                } else {
                  setSelectedAmenities(
                    newValue.filter(
                      (item): item is Amenity => typeof item !== "string"
                    )
                  );
                }
              }}
              sx={{
                backgroundColor: colors.white,
                borderColor: colors.gray,
                "&:hover": { borderColor: colors.secondary },
              }}
            />
          </FormControl>
        </Grid>

        {/* Description */}
        <Grid xs={12}>
          <FormControl>
            <FormLabel>
              <Typography.Label size="sm">Description</Typography.Label>
            </FormLabel>
            <Textarea
              minRows={4}
              maxRows={6}
              size="lg"
              placeholder="Describe your business..."
              value={data.description}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              sx={{
                backgroundColor: colors.white,
                borderColor: colors.gray,
                "&:hover": { borderColor: colors.secondary },
                "&:focus-within": {
                  borderColor: colors.primary,
                  boxShadow: `0 0 0 3px ${colors.primary}20`,
                },
              }}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Step1Basic;
