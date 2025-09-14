import React from "react";
import CardHeader from "@/src/components/CardHeader";
import { FormControl, FormLabel, Button } from "@mui/joy";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { UploadIcon } from "lucide-react";
import Container from "@/src/components/Container";
import type { Business } from "@/src/types/Business";
import { supabase } from "@/src/lib/supabase";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
};

const Step4ImageUpload: React.FC<Props> = ({ data, setData }) => {
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!data.business_name) {
      alert("Please enter a business name before uploading.");
      return;
    }

    try {
      const fileExt = file.name.split(".").pop();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `${data.business_name.replace(/\s+/g, "_")}_${timestamp}.${fileExt}`;
      const filePath = fileName;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("business-profile")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;
      if (!uploadData?.path) throw new Error("Upload failed: no file path");

      const { data: publicData } = supabase.storage
        .from("business-profile")
        .getPublicUrl(uploadData.path);

      if (!publicData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      setData((prev) => ({ ...prev, business_image: publicData.publicUrl }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      console.error("Upload failed:", err);
      alert(message);
    }
  };

  return (
    <div className="br-form-wrapper" style={{ overflow: "auto", overflowX: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CardHeader
          title="Photos"
          color="dark"
          bg="white"
          variant="title"
          padding="12px"
          radius="8px"
          margin="0 0 12px 0"
        />

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
                  height: "280px",
                  border: "1.5px dashed #e5e7eb",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fafafa",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                {data.business_image ? (
                  <img
                    src={data.business_image}
                    alt="Business"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ textAlign: "center", color: "#94a3b8" }}>
                    <CloudUploadIcon style={{ fontSize: 40, color: "#cbd5e1" }} />
                    <p style={{ fontSize: "14px", marginTop: "8px" }}>Click to upload</p>
                  </div>
                )}
              </div>

              <Button
                size="md"
                variant="soft"
                color="neutral"
                startDecorator={<UploadIcon />}
                style={{ width: "100%" }}
                onClick={() => document.getElementById("image-upload")?.click()}
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
      </div>
    </div>
  );
};

export default Step4ImageUpload;
