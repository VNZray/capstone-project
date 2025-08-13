import React, { useState } from "react";
import Button from "@/src/components/Button";
import Input from "@/src/components/Input";
import Text from "@/src/components/Text";
import CardHeader from "@/src/components/CardHeader";
import "./Steps.css";
import type { Business } from "@/src/types/Business";
import { useBusinessBasics } from "@/src/features/listing/hooks/useBusinessData";
import { supabase } from "@/src/utils/supabase";

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
    selectedCategory,
    setSelectedCategory,
    previewUrl,
    handleImageChange,
  } = useBusinessBasics(API_URL, data, setData);

  const [uploading, setUploading] = useState(false);

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
        .from("business-profiles")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;
      if (!uploadData?.path) throw new Error("Upload failed: no file path");

      // Get public URL
      const { data: publicData } = supabase.storage
        .from("business-profiles")
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
              setData((prev) => ({ ...prev, business_category_id: value }));
              setSelectedCategory(value);
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
                business_type_id: e.target.value,
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
          <div
            onClick={() => document.getElementById("image-upload")?.click()}
            style={{
              border: "2px dashed #ccc",
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: "#fafafa",
            }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 12,
                  objectFit: "cover",
                  marginTop: 8,
                }}
              />
            ) : (
              <p style={{ color: "#777" }}>
                {uploading ? "Uploading..." : "Click to upload an image"}
              </p>
            )}
          </div>

          {/* Hidden file input */}
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
        <div style={{ flex: 1 }}></div>
        <Button onClick={onNext} variant="primary" style={{ flex: 1 }}>
          <Text variant="normal" color="white">
            Next
          </Text>
        </Button>
      </div>
    </div>
  );
};

export default StepBasics;
