import React, { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Input from "@/src/components/Input";
import Text from "@/src/components/Text";
import CardHeader from "@/src/components/CardHeader";
import "./Steps.css";
import type { Business } from "@/src/types/Business";
import { useBusinessBasics } from "@/src/hooks/useBusinessData";
import { supabase } from "@/src/utils/supabase";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import { colors } from "@/src/utils/Colors";
type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  API_URL: string;
  onNext: () => void;
  onPrev: () => void;
};

const StepBasics: React.FC<Props> = ({
  onNext,
  onPrev,
  API_URL,
  data,
  setData,
}) => {
  const {
    businessCategories,
    businessTypes,
    setSelectedCategory,
    previewUrl,
    handleImageChange,
  } = useBusinessBasics(API_URL, data, setData);

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
          <Input
            type="text"
            label="Business Name"
            placeholder="Enter the business name"
            value={data.business_name}
            onChange={(e) =>
              setData((prev) => ({ ...prev, business_name: e.target.value }))
            }
          />

          <Input
            type="select"
            label="Business Category"
            value={data.business_category_id}
            onChange={(e) => {
              const value = e.target.value;
              setData((prev) => ({
                ...prev,
                business_category_id: value.toString(),
              }));
              setSelectedCategory(value.toString());
            }}
            options={[
              { value: "", label: "-- Select a category --" },
              ...businessCategories.map((category) => ({
                value: category.id.toString(),
                label: category.category,
              })),
            ]}
          />

          <Input
            type="select"
            label="Business Type"
            value={data.business_type_id}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                business_type_id: e.target.value.toString(),
              }))
            }
            options={[
              { value: "", label: "-- Select a type --" },
              ...businessTypes.map((type) => ({
                value: type.id.toString(),
                label: type.type,
              })),
            ]}
          />

          <Input
            type="text"
            label="Description"
            placeholder="Enter the description"
            value={data.description}
            onChange={(e) =>
              setData((prev) => ({ ...prev, description: e.target.value }))
            }
          />

          {/* Click area for image selection */}
          <Text variant="medium" color="dark">
            Upload Image
          </Text>
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
          color="error"
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={onCancel}
          style={{ flex: 1 }}
        >
          Cancel
        </Button>

        <Button
          color="primary"
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={onNext}
          style={{ flex: 1 }}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default StepBasics;
