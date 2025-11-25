import React from "react";
import { FormControl, FormLabel, Button } from "@mui/joy";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { UploadIcon } from "lucide-react";
import Typography from "@/src/components/Typography";
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
          .twoCol { display: grid; grid-template-columns: 1fr; gap: 16px; align-items: start; }
          @media (min-width: 640px) { .twoCol { grid-template-columns: 1fr 1fr; } }
          .twoCol .col { padding: 0 8px; }
        `}
      </style>
      <div
        className="stepperContent"
        style={{
          overflow: "visible",
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
            <Typography.Label size="lg" sx={{ color: "#111827", mb: 1 }}>
              Photos
            </Typography.Label>
            <Typography.Body size="xs" sx={{ color: "#6b7280" }}>
              Upload a photo of your business
            </Typography.Body>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '520px', padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormControl>
              <FormLabel sx={{ mb: 0.75, fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Upload Image</FormLabel>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: "520px",
                    height: "clamp(240px, 34vh, 320px)",
                    border: "2px dashed #d1d5db",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fafafa",
                    cursor: "pointer",
                    overflow: "hidden",
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  {data.business_image ? (
                    <img
                      src={data.business_image}
                      alt="Business"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "10px"
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: "center", color: "#6b7280" }}>
                      <CloudUploadIcon style={{ fontSize: 48, color: "#cbd5e1", marginBottom: '8px' }} />
                      <p style={{ fontSize: "16px", margin: "8px 0", fontWeight: 500 }}>Click to upload</p>
                      <p style={{ fontSize: "14px", margin: 0, opacity: 0.7 }}>PNG, JPG, JPEG up to 10MB</p>
                    </div>
                  )}
                </div>

                <Button
                  size="md"
                  variant="soft"
                  color="primary"
                  startDecorator={<UploadIcon />}
                  style={{
                    width: "100%",
                    maxWidth: "520px",
                    borderRadius: '8px',
                    fontWeight: 500
                  }}
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  {data.business_image ? 'Change Photo' : 'Upload Photo'}
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step4ImageUpload;
