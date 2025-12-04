import React, { useEffect, useState } from "react";
import type { Business } from "@/src/types/Business";
import { useBusinessBasics } from "@/src/hooks/useBusiness";
import {
  FormControl,
  Input,
  Textarea,
  FormLabel,
  Autocomplete,
  Select,
  Option,
  CircularProgress,
} from "@mui/joy";
import { Chip } from "@mui/joy";
import Typography from "@/src/components/Typography";
import type { Amenity, BusinessAmenity } from "@/src/types/Amenity";
import type { Category } from "@/src/types/Category";
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
  const [selectedAmenities, setSelectedAmenities] = React.useState<Amenity[]>(
    []
  );

  // Fetch sub-categories when primary category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (selectedPrimaryId) {
        setLoadingSubCategories(true);
        const children = await getChildCategories(selectedPrimaryId);
        setSubCategories(children);
        setLoadingSubCategories(false);
        // Reset sub-category and specialty selections
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

    // Build category hierarchy - primary is always the root category
    if (selectedPrimaryId) {
      categoryIds.push(selectedPrimaryId);
      if (selectedSubCategoryId) {
        categoryIds.push(selectedSubCategoryId);
        if (selectedSpecialtyId) {
          categoryIds.push(selectedSpecialtyId);
        }
      }
    }

    // Determine hasBooking based on root category alias
    const primaryCategory = rootCategories.find(
      (c) => c.id === selectedPrimaryId
    );
    const isAccommodation = primaryCategory?.alias
      ?.toLowerCase()
      .includes("accommodation");

    setSelectedCategories(categoryIds);
    setData((prev) => ({
      ...prev,
      // Primary category is the root/main category (Level 1)
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

  // get amenities
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

  // Common select styles
  const selectSx = {
    "--Select-focusedThickness": "2px",
    "--Select-focusedHighlight": "var(--joy-palette-primary-500)",
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
    <>
      <style>
        {`
          .br-section {
            box-shadow: none !important;
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .stepperContent {
            background: transparent;
          }
          /* Responsive two-column layout for Step 1 */
          .twoCol {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
            align-items: start;
          }
          @media (min-width: 640px) {
            .twoCol { grid-template-columns: 1fr 1fr; }
          }
          .twoCol .col { padding: 0 8px; }
        `}
      </style>
      <div
        className="stepperContent"
        style={{
          overflow: "auto",
          overflowX: "hidden",
          padding: "16px 16px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            width: "100%",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              paddingBottom: 12,
              textAlign: "center",
              borderBottom: "1px solid #e5e7eb",
              marginBottom: 20,
              paddingTop: 4,
            }}
          >
            <Typography.Label size="lg" sx={{ mb: 1, color: "#111827" }}>
              Basic information
            </Typography.Label>
            <Typography.Body size="xs" sx={{ color: "#6b7280" }}>
              Tell us about your business to get started
            </Typography.Body>
          </div>
          <div className="twoCol">
            <div className="col">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
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
                    variant="outlined"
                    size="md"
                    value={data.business_name}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        business_name: e.target.value,
                      }))
                    }
                    placeholder="Write the name of your business"
                    sx={inputSx}
                  />
                </FormControl>

                {/* Primary Category (Level 1) */}
                <FormControl required>
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
                    Select the main category for your business
                  </Typography.Body>
                  <Select
                    placeholder="Select a primary category..."
                    value={selectedPrimaryId?.toString() ?? ""}
                    onChange={(_e, value) => {
                      if (!value) {
                        setSelectedPrimaryId(null);
                        return;
                      }
                      setSelectedPrimaryId(Number(value));
                    }}
                    sx={selectSx}
                  >
                    {rootCategories.map((category) => (
                      <Option key={category.id} value={category.id.toString()}>
                        {category.title}
                      </Option>
                    ))}
                  </Select>
                </FormControl>

                {/* Sub-Category (Level 2) - Only show if primary is selected and has children */}
                {selectedPrimaryId && (
                  <FormControl required={subCategories.length > 0}>
                    <FormLabel
                      sx={{
                        mb: 0.75,
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Sub-Category
                    </FormLabel>
                    <Typography.Body size="xs" sx={{ color: "#6b7280", mb: 1 }}>
                      Choose a more specific category
                    </Typography.Body>
                    {loadingSubCategories ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 0",
                        }}
                      >
                        <CircularProgress size="sm" />
                        <Typography.Body size="xs">
                          Loading sub-categories...
                        </Typography.Body>
                      </div>
                    ) : subCategories.length > 0 ? (
                      <Select
                        placeholder="Select a sub-category..."
                        value={selectedSubCategoryId?.toString() ?? ""}
                        onChange={(_e, value) => {
                          if (!value) {
                            setSelectedSubCategoryId(null);
                            return;
                          }
                          setSelectedSubCategoryId(Number(value));
                        }}
                        sx={selectSx}
                      >
                        {subCategories.map((category) => (
                          <Option
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.title}
                          </Option>
                        ))}
                      </Select>
                    ) : (
                      <Typography.Body
                        size="xs"
                        sx={{ color: "#9ca3af", fontStyle: "italic", py: 1 }}
                      >
                        No sub-categories available for this category
                      </Typography.Body>
                    )}
                  </FormControl>
                )}

                {/* Specialty (Level 3) - Only show if sub-category is selected and has children */}
                {selectedSubCategoryId && (
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 0",
                        }}
                      >
                        <CircularProgress size="sm" />
                        <Typography.Body size="xs">
                          Loading specialties...
                        </Typography.Body>
                      </div>
                    ) : specialties.length > 0 ? (
                      <Select
                        placeholder="Select a specialty..."
                        value={selectedSpecialtyId?.toString() ?? ""}
                        onChange={(_e, value) => {
                          if (!value) {
                            setSelectedSpecialtyId(null);
                            return;
                          }
                          setSelectedSpecialtyId(Number(value));
                        }}
                        sx={selectSx}
                      >
                        {specialties.map((category) => (
                          <Option
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.title}
                          </Option>
                        ))}
                      </Select>
                    ) : (
                      <Typography.Body
                        size="xs"
                        sx={{ color: "#9ca3af", fontStyle: "italic", py: 1 }}
                      >
                        No specialties available for this sub-category
                      </Typography.Body>
                    )}
                  </FormControl>
                )}

                {/* Selected Categories Summary */}
                {selectedCategories.length > 0 && (
                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "#f0f9ff",
                      borderRadius: "8px",
                      border: "1px solid #bae6fd",
                    }}
                  >
                    <Typography.Body
                      size="xs"
                      sx={{ color: "#0369a1", fontWeight: 600, mb: 0.5 }}
                    >
                      Selected Categories:
                    </Typography.Body>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {selectedPrimaryId && (
                        <Chip size="sm" variant="soft" color="primary">
                          {
                            rootCategories.find(
                              (c) => c.id === selectedPrimaryId
                            )?.title
                          }
                        </Chip>
                      )}
                      {selectedSubCategoryId && (
                        <>
                          <span style={{ color: "#64748b" }}>→</span>
                          <Chip size="sm" variant="soft" color="primary">
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
                          <span style={{ color: "#64748b" }}>→</span>
                          <Chip size="sm" variant="soft" color="primary">
                            {
                              specialties.find(
                                (c) => c.id === selectedSpecialtyId
                              )?.title
                            }
                          </Chip>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <FormControl id="multiple-limit-tags">
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
                    value={data.description}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe your business..."
                    sx={{
                      "--Textarea-focusedThickness": "2px",
                      "--Textarea-focusedHighlight":
                        "var(--joy-palette-primary-500)",
                      ...inputSx,
                    }}
                  />
                </FormControl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step1;
