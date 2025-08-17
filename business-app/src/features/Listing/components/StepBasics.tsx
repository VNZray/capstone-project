import React, { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Text from "@/src/components/Text";
import CardHeader from "@/src/components/CardHeader";
import "./Steps.css";
import type { Business } from "@/src/types/Business";
import { useBusinessBasics } from "@/src/hooks/useBusinessData";
import { supabase } from "@/src/utils/supabase";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
import Button from "@mui/joy/Button";
import { FormControl, FormLabel, Input, Select, Option } from "@mui/joy";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  api: string;
  onNext: () => void;
  onPrev: () => void;
};

const StepBasics: React.FC<Props> = ({ onNext, api, data, setData }) => {
  const {
    businessCategories,
    businessTypes,
    setSelectedType,
    previewUrl,
    handleImageChange,
  } = useBusinessBasics(api, data, setData);

  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const onCancel = () => {
    navigate("/business");
  };

  // Upload immediately after selecting an image
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e); // update preview immediately

    const file = e.target.files?.[0];
    if (!file) return;

    if (!data.business_name) {
      alert("Please enter a business name before uploading.");
      return;
    }

    setUploading(true);

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
      setUploading(false);
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

        <div className="content">
          <FormControl>
            <FormLabel>Buasiness Name</FormLabel>
            <Input
              size="lg"
              value={data.business_name}
              onChange={(e) =>
                setData((prev) => ({ ...prev, business_name: e.target.value }))
              }
              placeholder="Placeholder"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Business Type</FormLabel>
            <Select
              size="lg"
              value={data.business_type_id} // state variable for type
              onChange={(e, value) => {
                setSelectedType(value as string);
                setData((prev) => ({
                  ...prev,
                  business_type_id: value as string,
                }));
              }}
              slotProps={{
                button: {
                  id: "select-type-button",
                  "aria-labelledby": "select-type-label select-type-button",
                },
              }}
            >
              <Option value="">-- Select business type --</Option>
              {businessTypes.map((type) => (
                <Option key={type.id} value={type.id.toString()}>
                  {type.type}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Category</FormLabel>
            <Select
              size="lg"
              value={data.business_category_id}
              onChange={(e, value) =>
                setData((prev) => ({
                  ...prev,
                  business_category_id: value as string,
                }))
              }
              slotProps={{
                button: {
                  id: "select-category-button",
                  "aria-labelledby":
                    "select-category-label select-category-button",
                },
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
            <Input
              size="lg"
              type="text"
              placeholder="Enter the description"
              value={data.description}
              onChange={(e) =>
                setData((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </FormControl>

          {/* Click area for image selection */}
          <FormLabel>Upload Business Profile</FormLabel>

          <Card
            sx={{
              border: "2px dashed #ccc",
              borderRadius: 2,
              backgroundColor: "#fafafa",
              cursor: "pointer",
              textAlign: "center",
            }}
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            {previewUrl ? (
              <CardMedia
                component="img"
                image={previewUrl}
                alt="Preview"
                sx={{
                  width: 160,
                  height: 160,
                  objectFit: "cover",
                  borderRadius: 2,
                  margin: "20px auto",
                }}
              />
            ) : (
              <CardContent>
                <CloudUploadIcon
                  sx={{ fontSize: 40, color: "text.secondary" }}
                />
                <Typography variant="body2" color="textSecondary" mt={1}>
                  {uploading ? "Uploading..." : "Click to upload an image"}
                </Typography>
              </CardContent>
            )}
          </Card>

          {/* Hidden File Input */}
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: "none" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 300 }}>
        <Button
          size="lg"
          onClick={onCancel}
          style={{ flex: 1 }}
          startDecorator={<ArrowBackIcon />}
          color="neutral"
        >
          Back
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          endDecorator={<ArrowForwardIcon />}
          color="primary"
          style={{ flex: 1 }}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default StepBasics;
