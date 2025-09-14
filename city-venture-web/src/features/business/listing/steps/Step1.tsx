import React, { useEffect, useState } from "react";
import CardHeader from "@/src/components/CardHeader";
import type { Business } from "@/src/types/Business";
import { useBusinessBasics } from "@/src/hooks/useBusiness";
import {
  FormControl,
  Input,
  Select,
  Option,
  Grid,
  Textarea,
  FormLabel,
  Autocomplete,
} from "@mui/joy";
import Container from "@/src/components/Container";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Chip } from "@mui/joy";
import HotelIcon from "@mui/icons-material/Hotel";
import StoreIcon from "@mui/icons-material/Store";
import Text from "@/src/components/Text";
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
          business_id: data.id ?? 0, // use the current business id or 0 as fallback
          amenity_id: amenity.id,
        }))
      );
    } else {
      setBusinessAmenities([]);
    }
  }, [selectedAmenities, setBusinessAmenities, data.id]);


  return (
    <div
      className="stepperContent"
      style={{ overflow: "auto", overflowX: "hidden" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CardHeader
          title="Basic Information"
          color="dark"
          bg="white"
          variant="title"
          padding="12px"
          radius="8px"
          margin="0 0 12px 0"
        />
        <Grid container columns={12}>
          <Grid xs={6}>
            <Container padding="0 20px " gap="20px">
              <FormControl required>
                <FormLabel>Business Name</FormLabel>
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
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Business Type</FormLabel>
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
                  sx={{ display: "flex", gap: 2, mt: 1 }}
                >
                  {businessTypes.map((type) => (
                    <ToggleButton
                      key={type.id}
                      value={type.id.toString()}
                      sx={{
                        flex: 1,
                        borderRadius: "12px",
                        px: 3,
                        py: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        textTransform: "none",
                      }}
                    >
                      {type.type.toLowerCase() === "accommodation" && (
                        <HotelIcon />
                      )}
                      {type.type.toLowerCase() === "shop" && <StoreIcon />}
                      <Text>{type.type}</Text>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </FormControl>

              <FormControl required>
                <FormLabel>Business Category</FormLabel>

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
                >
                  <Option value="">-- Select a category --</Option>
                  {businessCategories.map((category) => (
                    <Option key={category.id} value={category.id.toString()}>
                      {category.category}
                    </Option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  maxRows={4}
                  minRows={4}
                  size="md"
                  variant="outlined"
                  value={data.description}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </FormControl>

              {/* Business Hours moved to its own step */}
            </Container>
          </Grid>
          <Grid xs={6}>
            <Container padding="0 20px" gap="20px">
              {/* Image upload moved to Photos step */}

              <FormControl id="multiple-limit-tags">
                <FormLabel>Amenities</FormLabel>
                <Autocomplete
                  size="lg"
                  multiple
                  freeSolo
                  placeholder="Amenities"
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
                          variant="outlined"
                          size="lg"
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

                    // If user typed something not in list → add “Add …”
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
                        { id: -1, name: `Add "${state.inputValue}"` },
                      ];
                    }

                    return filtered;
                  }}
                  onChange={async (_, newValue) => {
                    const last = newValue[newValue.length - 1];

                    // User chose "Add ..."
                    if (last && typeof last !== "string" && last.id === -1) {
                      const newAmenityName = last.name
                        .replace(/^Add\s+"|"$/g, "")
                        .trim();
                      await addAmenity(newAmenityName);
                      await fetchAmenities();

                      // Find inserted amenity (assumes fetchAmenities updates amenities)
                      const inserted = amenities.find(
                        (a) =>
                          a.name.toLowerCase() === newAmenityName.toLowerCase()
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
                />
              </FormControl>
            </Container>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Step1;
