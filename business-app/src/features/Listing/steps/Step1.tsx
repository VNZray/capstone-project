import React, { useState } from "react";
import CardHeader from "@/src/components/CardHeader";
import type { Business } from "@/src/types/Business";
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
} from "@mui/joy";
import Container from "@/src/components/Container";
import { Sheet, SheetIcon, UploadIcon } from "lucide-react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import HotelIcon from "@mui/icons-material/Hotel";
import StoreIcon from "@mui/icons-material/Store";
import Text from "@/src/components/Text";
import Label from "@/src/components/Label";
type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  api: string;
};

const Step1: React.FC<Props> = ({ api, data, setData }) => {
  const {
    businessCategories,
    businessTypes,
    setSelectedType,
    handleImageChange,
  } = useBusinessBasics(api, data, setData);

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
      const fileName = `${data.business_name.replace(/\s+/g, "_")}.${fileExt}`;
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
    <div className="stepperContent">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CardHeader
          title="Basic Information"
          color="white"
          margin="0 0 20px 0"
        />
        <Grid container columns={12}>
          <Grid xs={6}>
            <Container padding="0 20px " gap="20px">
              <FormControl>
                <Label margin="0 0 5px 0">
                  <Text variant="medium">Business Name *</Text>
                </Label>
                <Input
                  variant="outlined"
                  size="lg"
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

              <FormControl>
                <Label margin="0 0 5px 0">
                  <Text variant="medium">Business Type *</Text>
                </Label>
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

              <FormControl>
                <Label margin="0 0 5px 0">
                  <Text variant="medium">Business Category *</Text>
                </Label>
                <Select
                  variant="outlined"
                  size="lg"
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
                <Label margin="0 0 5px 0">
                  <Text variant="medium">Description *</Text>
                </Label>{" "}
                <Textarea
                  maxRows={4}
                  minRows={4}
                  size="lg"
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
            </Container>
          </Grid>
          <Grid xs={6}>

            <Container padding="0 20px" gap="20px">
              <FormControl>
                <Label margin="0 0 5px 0">
                  <Text variant="medium">Upload Business Profile *</Text>
                </Label>{" "}
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
                    size="lg"
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
            </Container>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Step1;
