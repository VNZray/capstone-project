import Typography from "@/src/components/Typography";
import React, { useRef } from "react";
import type { Business } from "@/src/types/Business";
import { Button, FormControl, FormLabel, Input, Sheet } from "@mui/joy";
import Label from "@/src/components/Label";
import { Upload } from "lucide-react";
import { DocumentScannerOutlined, FileCopy } from "@mui/icons-material";
import type { Permit } from "@/src/types/Permit";
import { supabase } from "@/src/lib/supabase";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  api: string;
  permitData: Permit[];
  setPermitData: React.Dispatch<React.SetStateAction<Permit[]>>;
};

const requirements = [
  "Upload at least one of the following permit",
  "Additional documents help speed up the approval process",
  "Supported formats: PDF, JPG, JPEG, PNG",
  "Maximum file size: 10MB per document",
  "Ensure documents are clear and legible",
  "All required documents must be valid and current",
];

const StepPermits: React.FC<Props> = ({ data, permitData, setPermitData }) => {
  // hidden input refs
  const businessPermitInputRef = useRef<HTMLInputElement | null>(null);
  const mayorsPermitInputRef = useRef<HTMLInputElement | null>(null);

  // generic uploader
  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    permitType: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, PNG, JPG, and JPEG are allowed.");
      return;
    }

    // ✅ validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File must be less than 10MB.");
      return;
    }

    const ext = file.name.split(".").pop();
    const filePath = `${permitType}/${data.business_name.replace(
      /\s+/g,
      "_"
    )}.${ext}`;

    const { error } = await supabase.storage
      .from("permits")
      .upload(filePath, file, { upsert: true });
    if (error) {
      console.error("❌ Upload failed:", error.message);
      alert("Upload failed. Please try again.");
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("permits")
      .getPublicUrl(filePath);

    setPermitData((prev) => [
      ...prev.filter((p) => p.permit_type !== permitType),
      {
        id: crypto.randomUUID(),
        business_id: data.id ?? "",
        permit_type: permitType,
        file_url: publicUrlData.publicUrl,
        file_format: ext!,
        file_size: file.size,
        status: "pending",
        expiration_date: "",
        submitted_at: new Date().toISOString(),
      },
    ]);
  };

  return (
    <>
      <style>
        {`
          .br-section { box-shadow: none !important; background: transparent !important; border: none !important; border-radius: 0 !important; }
          .stepperContent { background: transparent; }
          .twoCol { display: grid; grid-template-columns: 1fr; gap: 16px; align-items: start; }
          @media (min-width: 640px) { .twoCol { grid-template-columns: 1fr 1fr; } }
          .twoCol .col { padding: 0 8px; }
        `}
      </style>
      <div
        className="stepperContent"
        style={{
          overflow: "visible",
          padding: "16px 16px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
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
            <Typography.Label size="lg" sx={{ color: "#111827", mb: 1 }}>
              Business Permits
            </Typography.Label>
            <Typography.Body size="xs" sx={{ color: "#6b7280" }}>
              Upload your business permits and documents
            </Typography.Body>
          </div>

          <div style={{ paddingRight: 6 }}>
            <div className="twoCol">
              {/* Mayor's Permit */}
              <div className="col">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <FormControl>
                    <FormLabel
                      sx={{
                        mb: 0.75,
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Mayor's Permit
                    </FormLabel>
                    <div
                      style={{
                        width: "100%",
                        borderWidth: 2,
                        borderStyle: "dashed",
                        borderColor: "#e5e7eb",
                        borderRadius: 10,
                        backgroundColor: "#fff",
                        padding: 12,
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto",
                        gap: 12,
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      onClick={() => mayorsPermitInputRef.current?.click()}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: "#f3f4f6",
                        }}
                      >
                        <DocumentScannerOutlined
                          sx={{ color: "#6b7280", fontSize: 18 }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <Typography.Body
                          size="sm"
                          weight="bold"
                          sx={{ color: "#374151" }}
                        >
                          Mayor's Permit
                        </Typography.Body>
                        <Typography.Body size="xs" sx={{ color: "#6b7280" }}>
                          Local city or municipal permit
                        </Typography.Body>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <Input
                            size="sm"
                            readOnly
                            value={
                              permitData.find(
                                (p) => p.permit_type === "mayors_permit"
                              )?.file_url || ""
                            }
                            placeholder="No file selected"
                            sx={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #e0e0e0",
                              borderRadius: "6px",
                            }}
                          />
                          {permitData.find(
                            (p) => p.permit_type === "mayors_permit"
                          )?.file_url ? (
                            <a
                              href={
                                permitData.find(
                                  (p) => p.permit_type === "mayors_permit"
                                )?.file_url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: 12,
                                color: "#1976d2",
                                textDecoration: "underline",
                                whiteSpace: "nowrap",
                              }}
                            >
                              View
                            </a>
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <Button
                          size="sm"
                          startDecorator={<Upload />}
                          variant="soft"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            mayorsPermitInputRef.current?.click();
                          }}
                          sx={{ borderRadius: "8px", fontWeight: 500 }}
                        >
                          Choose
                        </Button>
                        <input
                          type="file"
                          ref={mayorsPermitInputRef}
                          style={{ display: "none" }}
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleUpload(e, "mayors_permit")}
                        />
                      </div>
                    </div>
                  </FormControl>
                </div>
              </div>

              {/* Business Permit */}
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
                      Business Permit
                    </FormLabel>
                    <div
                      style={{
                        width: "100%",
                        borderWidth: 2,
                        borderStyle: "dashed",
                        borderColor: "#e5e7eb",
                        borderRadius: 10,
                        backgroundColor: "#fff",
                        padding: 12,
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto",
                        gap: 12,
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      onClick={() => businessPermitInputRef.current?.click()}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: "#f3f4f6",
                        }}
                      >
                        <DocumentScannerOutlined
                          sx={{ color: "#6b7280", fontSize: 18 }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <Typography.Body
                          size="sm"
                          weight="bold"
                          sx={{ color: "#374151" }}
                        >
                          Business Permit
                        </Typography.Body>
                        <Typography.Body size="xs" sx={{ color: "#6b7280" }}>
                          DTI/SEC certificate or business registration
                        </Typography.Body>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <Input
                            size="sm"
                            readOnly
                            value={
                              permitData.find(
                                (p) => p.permit_type === "business_permit"
                              )?.file_url || ""
                            }
                            placeholder="No file selected"
                            sx={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #e0e0e0",
                              borderRadius: "6px",
                            }}
                          />
                          {permitData.find(
                            (p) => p.permit_type === "business_permit"
                          )?.file_url ? (
                            <a
                              href={
                                permitData.find(
                                  (p) => p.permit_type === "business_permit"
                                )?.file_url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: 12,
                                color: "#1976d2",
                                textDecoration: "underline",
                                whiteSpace: "nowrap",
                              }}
                            >
                              View
                            </a>
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <Button
                          size="sm"
                          startDecorator={<Upload />}
                          variant="soft"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            businessPermitInputRef.current?.click();
                          }}
                          sx={{ borderRadius: "8px", fontWeight: 500 }}
                        >
                          Choose
                        </Button>
                        <input
                          type="file"
                          ref={businessPermitInputRef}
                          style={{ display: "none" }}
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleUpload(e, "business_permit")}
                        />
                      </div>
                    </div>
                  </FormControl>
                </div>
              </div>
            </div>

            {/* Requirements Info */}
            <Sheet
              color="warning"
              variant="soft"
              sx={{
                p: 1.5,
                borderRadius: 10,
                backgroundColor: "#fef3c7",
                border: "1px solid #f59e0b",
                margin: "12px 8px 0",
              }}
            >
              <Label>
                <FileCopy color="warning" fontSize="small" />
                <Typography.Body
                  size="sm"
                  weight="bold"
                  sx={{ color: "#92400e" }}
                >
                  File Requirements
                </Typography.Body>
              </Label>
              <ul
                className="req-grid"
                style={{
                  display: "grid",
                  columnGap: 12,
                  rowGap: 4,
                  marginTop: 6,
                  paddingLeft: 16,
                }}
              >
                {requirements.map((req, idx) => (
                  <li key={idx} style={{ lineHeight: 1.3 }}>
                    <Typography.Body size="xs" sx={{ color: "#92400e" }}>
                      {req}
                    </Typography.Body>
                  </li>
                ))}
              </ul>
              <style>{`.req-grid { display: grid; grid-template-columns: 1fr; } @media (min-width: 640px) { .req-grid { grid-template-columns: 1fr 1fr; } }`}</style>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  );
};

export default StepPermits;
