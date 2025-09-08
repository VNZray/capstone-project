import React, { useEffect, useState } from "react";
import CardHeader from "@/src/components/CardHeader";
import type { Business, BusinessHours } from "@/src/types/Business";
import { useBusinessBasics } from "@/src/hooks/useBusinessData";
import { supabase } from "@/src/utils/supabase";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  FormControl,
  Input,
  Select,
  Option,
  Grid,
  Textarea,
  Button,
  FormLabel,
  Typography,
  Autocomplete,
} from "@mui/joy";
import Container from "@/src/components/Container";
import { UploadIcon } from "lucide-react";
import { Switch, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Chip } from "@mui/joy";
import HotelIcon from "@mui/icons-material/Hotel";
import StoreIcon from "@mui/icons-material/Store";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Text from "@/src/components/Text";
import type { Amenity, BusinessAmenity } from "@/src/types/Amenity";
import { getData, insertData } from "@/src/api_function";
type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  api: string;
  businessHours: BusinessHours[];
  businessAmenities: BusinessAmenity[];
  setBusinessHours: React.Dispatch<React.SetStateAction<BusinessHours[]>>;
  setBusinessAmenities: React.Dispatch<React.SetStateAction<BusinessAmenity[]>>;
};

const Step1: React.FC<Props> = ({
  api,
  data,
  setData,
  businessHours,
  setBusinessHours,
  businessAmenities,
  setBusinessAmenities,
}) => {
  const {
    businessCategories,
    businessTypes,
    setSelectedType,
    handleImageChange,
  } = useBusinessBasics(api, data, setData);

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
  }, [selectedAmenities, setBusinessAmenities]);

  // Upload immediately after selecting an image
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e); // update preview immediately

    const file = e.target.files?.[0];
    if (!file) return;

    if (!data.business_name) {
      alert("Please enter a business name before uploading.");
      return;
    }

    try {
      const fileExt = file.name.split(".").pop();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); // avoid invalid chars for filenames
      const fileName = `${data.business_name.replace(
        /\s+/g,
        "_"
      )}_${timestamp}.${fileExt}`;
      const filePath = fileName;

      // Upload file to Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("business-profile")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;
      if (!uploadData?.path) throw new Error("Upload failed: no file path");

      // Get public URL
      const { data: publicData } = supabase.storage
        .from("business-profile")
        .getPublicUrl(uploadData.path);

      if (!publicData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Save URL to business data
      setData((prev) => ({ ...prev, business_image: publicData.publicUrl }));
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(err?.message || "Upload failed");
    } finally {
    }
  };

  return (
    <div
      className="stepperContent"
      style={{ overflow: "auto", overflowX: "hidden" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CardHeader
          title="Basic Information"
          color="white"
          margin="0 0 20px 0"
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
                  onChange={(e, newValue) => {
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
                  onChange={(e, value) => {
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

              <FormControl>
                <FormLabel>Business Hours</FormLabel>

                {businessHours.map((hour, index) => (
                  <Container
                    key={hour.id}
                    padding="12px 0"
                    align="center"
                    direction="row"
                    style={{ gap: "12px" }}
                  >
                    <Typography level="body-sm" style={{ width: "80px" }}>
                      {hour.day_of_week}
                    </Typography>

                    <Input
                      size="md"
                      type="time"
                      value={hour.open_time}
                      readOnly={!hour.is_open}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        setBusinessHours((prev) =>
                          prev.map((h, i) =>
                            i === index ? { ...h, open_time: newTime } : h
                          )
                        );
                      }}
                    />

                    <Input
                      size="md"
                      type="time"
                      value={hour.close_time}
                      readOnly={!hour.is_open}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        setBusinessHours((prev) =>
                          prev.map((h, i) =>
                            i === index ? { ...h, close_time: newTime } : h
                          )
                        );
                      }}
                    />

                    <Typography level="body-sm">
                      {hour.is_open ? "Open" : "Closed"}
                    </Typography>
                    <Switch
                      checked={hour.is_open}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setBusinessHours((prev) =>
                          prev.map((h, i) =>
                            i === index ? { ...h, is_open: checked } : h
                          )
                        );
                      }}
                    />
                  </Container>
                ))}
              </FormControl>
            </Container>
          </Grid>
          <Grid xs={6}>
            <Container padding="0 20px" gap="20px">
              <FormControl>
                <FormLabel>Upload Image</FormLabel>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "right",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "400px",
                      border: "2px dashed #ccc",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f9f9f9",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    {data.business_image ? (
                      <img
                        src={data.business_image}
                        alt="Business"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div style={{ textAlign: "center", color: "#888" }}>
                        <CloudUploadIcon
                          style={{ fontSize: 40, color: "#aaa" }}
                        />
                        <p style={{ fontSize: "14px", marginTop: "8px" }}>
                          Click to upload
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    size="md"
                    variant="outlined"
                    color="primary"
                    startDecorator={<UploadIcon />}
                    style={{ width: "100%" }}
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    Upload Photo
                  </Button>
                </div>
                {/* Hidden file input */}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: "none" }}
                />
              </FormControl>

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
