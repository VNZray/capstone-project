import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import HierarchicalCategorySelector from "@/src/components/HierarchicalCategorySelector";
import { useBusinessBasics } from "@/src/hooks/useBusiness";
import type { BusinessAmenity, Amenity } from "@/src/types/Amenity";
import type { Business } from "@/src/types/Business";
import {
  FormControl,
  Input,
  Textarea,
  FormLabel,
  Autocomplete,
  Chip,
  Box,
  Grid,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { getData, insertData } from "@/src/services/Service";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  businessAmenities: BusinessAmenity[];
  setBusinessAmenities: React.Dispatch<React.SetStateAction<BusinessAmenity[]>>;
};

const Step1: React.FC<Props> = ({ data, setData, setBusinessAmenities }) => {
  const {
    rootCategories,
    selectedCategories,
    setSelectedCategories,
    getChildCategories,
  } = useBusinessBasics(data, setData);

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([]);

  // Handle category changes from HierarchicalCategorySelector
  const handleCategoryChange = (categoryIds: number[]) => {
    setSelectedCategories(categoryIds);

    // Find primary categories (root level) from the selected IDs
    const primaryIds = categoryIds.filter((id) =>
      rootCategories.some(
        (cat) => cat.id === id && cat.parent_category === null
      )
    );

    // Determine hasBooking if Accommodation is in primary categories
    const hasAccommodation = primaryIds.some((id) => {
      const cat = rootCategories.find((c) => c.id === id);
      return cat?.alias?.toLowerCase().includes("accommodation");
    });

    // Set primary_category_id to first selected primary (or Accommodation if present)
    const accommodationId = primaryIds.find((id) => {
      const cat = rootCategories.find((c) => c.id === id);
      return cat?.alias?.toLowerCase().includes("accommodation");
    });
    const mainPrimaryId = accommodationId || primaryIds[0];

    setData((prev) => ({
      ...prev,
      primary_category_id: mainPrimaryId ?? undefined,
      category_ids: categoryIds,
      hasBooking: hasAccommodation,
    }));
  };

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

  // Common styles for inputs
  const inputSx = {
    "--Input-focusedThickness": "2px",
    "--Input-focusedHighlight": "var(--joy-palette-primary-500)",
    backgroundColor: "#fafafa",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#ffffff",
      borderColor: "#d0d0d0",
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
    },
    "&:focus-within": {
      backgroundColor: "#ffffff",
      borderColor: "var(--joy-palette-primary-500)",
      boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.1)",
    },
  };

  return (
    <PageContainer gap={0} padding={0}>
      <Container gap="0">
        <Typography.CardTitle>Business Information</Typography.CardTitle>
        <Typography.CardSubTitle>
          Tell us about your business to get started
        </Typography.CardSubTitle>
      </Container>

      <Container>
        <Box sx={{ width: "100%" }}>
          <Grid container spacing={2}>
            {/* Left Column */}
            <Grid xs={12} md={6}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControl required>
                  <FormLabel
                    sx={{
                      mb: 0.75,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Business Name
                  </FormLabel>
                  <Input
                    placeholder="Enter your business name"
                    fullWidth
                    value={data.business_name}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        business_name: e.target.value,
                      }))
                    }
                    sx={inputSx}
                  />
                </FormControl>

                {/* Hierarchical Category Selector */}
                <HierarchicalCategorySelector
                  rootCategories={rootCategories}
                  selectedCategoryIds={selectedCategories}
                  onCategoryChange={handleCategoryChange}
                  getChildCategories={getChildCategories}
                  applicableTo="business"
                  required
                />
              </Box>
            </Grid>

            {/* Right Column */}
            <Grid xs={12} md={6}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControl required>
                  <FormLabel
                    sx={{
                      mb: 0.75,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Business Email
                  </FormLabel>
                  <Input
                    placeholder="Enter your business email"
                    fullWidth
                    type="email"
                    value={data.email}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    sx={inputSx}
                  />
                </FormControl>

                <FormControl required>
                  <FormLabel
                    sx={{
                      mb: 0.75,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Business Phone Number
                  </FormLabel>
                  <Input
                    placeholder="Enter your business phone number"
                    fullWidth
                    value={data.phone_number}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        phone_number: e.target.value,
                      }))
                    }
                    sx={inputSx}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel
                    sx={{
                      mb: 0.75,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Amenities
                  </FormLabel>
                  <Autocomplete
                    size="md"
                    multiple
                    freeSolo
                    placeholder="Select or add amenities..."
                    limitTags={6}
                    options={amenities}
                    value={selectedAmenities}
                    getOptionLabel={(option) =>
                      typeof option === "string" ? option : option.name
                    }
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <span key={option.id} style={{ margin: 2 }}>
                          <Chip
                            {...getTagProps({ index })}
                            color="primary"
                            variant="soft"
                            size="md"
                            sx={{
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                              fontWeight: 500,
                            }}
                          >
                            {option.name}
                          </Chip>
                        </span>
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
                          {
                            id: -1,
                            name: `Add "${state.inputValue}"`,
                          } as Amenity,
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
                          (a) =>
                            a.name.toLowerCase() ===
                            newAmenityName.toLowerCase()
                        );
                        if (inserted) {
                          setSelectedAmenities([
                            ...newValue
                              .slice(0, -1)
                              .filter(
                                (item): item is Amenity =>
                                  typeof item !== "string"
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
                    sx={inputSx}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel
                    sx={{
                      mb: 0.75,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Description
                  </FormLabel>
                  <Textarea
                    maxRows={4}
                    minRows={3}
                    size="md"
                    variant="outlined"
                    placeholder="Describe your business..."
                    value={data.description}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    sx={{
                      "--Textarea-focusedThickness": "2px",
                      "--Textarea-focusedHighlight":
                        "var(--joy-palette-primary-500)",
                      ...inputSx,
                    }}
                  />
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default Step1;
