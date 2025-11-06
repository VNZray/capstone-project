import React, { useEffect, useState } from "react";
import type { Business } from "@/src/types/Business";
import { useBusinessBasics } from "@/src/hooks/useBusiness";
import {
  FormControl,
  Input,
  Select,
  Option,
  Textarea,
  FormLabel,
  Autocomplete,
} from "@mui/joy";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Chip } from "@mui/joy";
import HotelIcon from "@mui/icons-material/Hotel";
import StoreIcon from "@mui/icons-material/Store";
import ResponsiveText from "@/src/components/ResponsiveText";
import type { Amenity, BusinessAmenity } from "@/src/types/Amenity";
import { getData, insertData } from "@/src/services/Service";
type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  api: string;
  businessAmenities: BusinessAmenity[];
  setBusinessAmenities: React.Dispatch<React.SetStateAction<BusinessAmenity[]>>;
};

const Step1: React.FC<Props> = ({
  api,
  data,
  setData,
  setBusinessAmenities,
}) => {
  const { businessCategories, businessTypes, setSelectedType } =
    useBusinessBasics(api, data, setData);

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = React.useState<Amenity[]>(
    []
  );
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
    // Only update if selectedAmenities is not empty
    if (selectedAmenities.length > 0) {
      setBusinessAmenities(
        selectedAmenities.map((amenity) => ({
          business_id: data.id ?? undefined, // ensure string or undefined, not null
          amenity_id: amenity.id ?? undefined,
        }))
      );
    } else {
      setBusinessAmenities([]);
    }
  }, [selectedAmenities, setBusinessAmenities, data.id]);


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
          padding: '16px 16px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: 24,
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
        <div style={{ 
          paddingBottom: 12, 
          textAlign: 'center',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: 20,
          paddingTop: 4
        }}>
          <ResponsiveText type="label-large" weight="bold" color="#111827" mb={1}>
            Basic information
          </ResponsiveText>
          <ResponsiveText type="body-extra-small" color="#6b7280">
            Tell us about your business to get started
          </ResponsiveText>
        </div>
        <div className="twoCol">
          <div className="col">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FormControl required>
                <FormLabel sx={{ mb: 0.75, fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Business Name</FormLabel>
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
                  sx={{ 
                    '--Input-focusedThickness': '2px',
                    '--Input-focusedHighlight': 'var(--joy-palette-primary-500)',
                    backgroundColor: '#fafafa',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#ffffff',
                      borderColor: '#d0d0d0',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                    },
                    '&:focus-within': {
                      backgroundColor: '#ffffff',
                      borderColor: 'var(--joy-palette-primary-500)',
                      boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                    }
                  }}
                />
              </FormControl>

              <FormControl required>
                <FormLabel sx={{ mb: 0.75, fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Business Type</FormLabel>
                <ToggleButtonGroup
                  color="primary"
                  value={data.business_type_id?.toString() ?? ""}
                  exclusive
                  onChange={(_e, newValue) => {
                    if (!newValue) return;
                    const type_id = Number(newValue);
                    setSelectedType(type_id);
                    setData((prev) => ({
                      ...prev,
                      business_type_id: type_id,
                    }));
                  }}
                  sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: 'wrap' }}
                >
                  {businessTypes.map((type) => (
                    <ToggleButton
                      key={type.id}
                      value={type.id.toString()}
                      sx={{
                        flex: 1,
                        minWidth: '120px',
                        borderRadius: "10px",
                        px: 2,
                        py: 1.25,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.75,
                        textTransform: "none",
                        border: '1px solid',
                        borderColor: '#e5e7eb',
                        backgroundColor: '#fafafa',
                        color: '#374151',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: '#f5f7ff',
                          borderColor: '#d0d7ff',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#eaf2ff',
                          borderColor: '#2563eb',
                          color: '#1d4ed8',
                          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                        },
                        '&.Mui-selected:hover': {
                          backgroundColor: '#e0ecff',
                          borderColor: '#1e40af',
                        },
                        '&.Mui-focusVisible': {
                          outline: '2px solid #93c5fd',
                          outlineOffset: 2,
                        },
                      }}
                    >
                      {type.type.toLowerCase() === "accommodation" && <HotelIcon fontSize="small" />}
                      {type.type.toLowerCase() === "shop" && <StoreIcon fontSize="small" />}
                      <ResponsiveText type="body-small" weight="medium">{type.type}</ResponsiveText>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </FormControl>

              <FormControl required>
                <FormLabel sx={{ mb: 0.75, fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Business Category</FormLabel>
                <Select
                  variant="outlined"
                  size="md"
                  value={data.business_category_id?.toString() ?? ""}
                  onChange={(_e, value) => {
                    if (!value) return;
                    const category_id = Number(value);
                    setData((prev) => ({
                      ...prev,
                      business_category_id: category_id,
                    }));
                  }}
                  sx={{ 
                    '--Select-focusedThickness': '2px',
                    '--Select-focusedHighlight': 'var(--joy-palette-primary-500)',
                    backgroundColor: '#fafafa',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#ffffff',
                      borderColor: '#d0d0d0',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                    },
                    '&:focus-within': {
                      backgroundColor: '#ffffff',
                      borderColor: 'var(--joy-palette-primary-500)',
                      boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                    }
                  }}
                >
                  <Option value="">-- Select a category --</Option>
                  {businessCategories.map((category) => (
                    <Option key={category.id} value={category.id.toString()}>
                      {category.category}
                    </Option>
                  ))}
                </Select>
              </FormControl>

              
            </div>
          </div>

          <div className="col">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FormControl id="multiple-limit-tags">
                <FormLabel sx={{ mb: 0.75, fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Amenities</FormLabel>
                <Autocomplete
                  size="md"
                  multiple
                  freeSolo
                  placeholder="Select or add amenities..."
                  limitTags={6}
                  options={amenities}
                  value={selectedAmenities}
                  getOptionLabel={(option) => (typeof option === "string" ? option : option.name)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <span key={option.id} style={{ margin: 2 }}>
                        <Chip 
                          {...getTagProps({ index })} 
                          color="primary" 
                          variant="soft" 
                          size="md"
                          sx={{
                            borderRadius: '6px',
                            fontSize: '0.8rem',
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
                      (option) => typeof option !== "string" && option.name.toLowerCase().includes(inputValue)
                    );
                    if (
                      inputValue !== "" &&
                      !options.some((opt) => typeof opt !== "string" && opt.name.toLowerCase() === inputValue)
                    ) {
                      return [...filtered, { id: -1, name: `Add "${state.inputValue}"` } as Amenity];
                    }
                    return filtered;
                  }}
                  onChange={async (_, newValue) => {
                    const last = newValue[newValue.length - 1];
                    if (last && typeof last !== "string" && (last as Amenity).id === -1) {
                      const newAmenityName = (last as Amenity).name.replace(/^Add\s+"|"$/g, "").trim();
                      await addAmenity(newAmenityName);
                      await fetchAmenities();
                      const inserted = amenities.find((a) => a.name.toLowerCase() === newAmenityName.toLowerCase());
                      if (inserted) {
                        setSelectedAmenities([
                          ...newValue
                            .slice(0, -1)
                            .filter((item): item is Amenity => typeof item !== "string"),
                          inserted,
                        ]);
                      }
                    } else {
                      setSelectedAmenities(newValue.filter((item): item is Amenity => typeof item !== "string"));
                    }
                  }}
                  sx={{ 
                    '--Input-focusedThickness': '2px',
                    '--Input-focusedHighlight': 'var(--joy-palette-primary-500)',
                    backgroundColor: '#fafafa',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#ffffff',
                      borderColor: '#d0d0d0',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                    },
                    '&:focus-within': {
                      backgroundColor: '#ffffff',
                      borderColor: 'var(--joy-palette-primary-500)',
                      boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                    }
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel sx={{ mb: 0.75, fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Description</FormLabel>
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
                    '--Textarea-focusedThickness': '2px',
                    '--Textarea-focusedHighlight': 'var(--joy-palette-primary-500)',
                    backgroundColor: '#fafafa',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#ffffff',
                      borderColor: '#d0d0d0',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                    },
                    '&:focus-within': {
                      backgroundColor: '#ffffff',
                      borderColor: 'var(--joy-palette-primary-500)',
                      boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                    }
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
