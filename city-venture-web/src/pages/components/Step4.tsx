import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import { LinearProgress, Sheet } from "@mui/joy";
import { supabase } from "@/src/lib/supabase";
import type { Business } from "@/src/types/Business";
import type { Permit } from "@/src/types/Permit";
import { useMemo, useRef, useState } from "react";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  permitData: Permit[];
  setPermitData: React.Dispatch<React.SetStateAction<Permit[]>>;
};

const Step4: React.FC<Props> = ({ data, setData: _setData, permitData, setPermitData }) => {
  const businessPermitInputRef = useRef<HTMLInputElement | null>(null);
  const mayorsPermitInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [lastFileName, setLastFileName] = useState<Record<string, string>>({});

  // core upload function
  const uploadFile = async (file: File, permitType: string) => {
    setUploading((u) => ({ ...u, [permitType]: true }));
    setLastFileName((n) => ({ ...n, [permitType]: file.name }));

    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, PNG, JPG, and JPEG are allowed.");
      setUploading((u) => ({ ...u, [permitType]: false }));
      return;
    }

    // ✅ validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File must be less than 10MB.");
      setUploading((u) => ({ ...u, [permitType]: false }));
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
      setUploading((u) => ({ ...u, [permitType]: false }));
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
    setUploading((u) => ({ ...u, [permitType]: false }));
  };

  // input change handler
  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    permitType: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadFile(file, permitType);
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    permitType: string
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file, permitType);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const businessPermit = useMemo(() => permitData.find(p => p.permit_type === "business_permit"), [permitData]);
  const mayorsPermit = useMemo(() => permitData.find(p => p.permit_type === "mayors_permit"), [permitData]);

  const removePermit = async (permitType: string) => {
    const current = permitData.find(p => p.permit_type === permitType);
    setPermitData(prev => prev.filter(p => p.permit_type !== permitType));
    // Attempt to remove from storage (best-effort)
    try {
      if (current?.file_format) {
        const path = `${permitType}/${data.business_name.replace(/\s+/g, "_")}.${current.file_format}`;
        await supabase.storage.from("permits").remove([path]);
      }
    } catch {}
  };
  return (
    <PageContainer gap={0} padding={0}>
      <Container gap="0">
        <Typography.CardTitle>
          Business Permits
        </Typography.CardTitle>
        <Typography.CardSubTitle>
          Upload your latest permits (PDF or Image up to 10MB).
        </Typography.CardSubTitle>
      </Container>

      <Container>
        {/* Hidden Inputs */}
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          ref={businessPermitInputRef}
          style={{ display: "none" }}
          onChange={(e) => handleUpload(e, "business_permit")}
        />
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          ref={mayorsPermitInputRef}
          style={{ display: "none" }}
          onChange={(e) => handleUpload(e, "mayors_permit")}
        />

        {/* Dropzones styled like the reference image (no Cancel/Created buttons) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginTop: "0.5rem" }}>
          {/* Business Permit */}
          <Sheet variant="outlined" sx={{ borderRadius: "10px", borderStyle: "solid", borderColor: "#e5e7eb" }}>
            <div style={{ padding: "12px 12px 8px" }}>
              <Typography.Label size="md">
                Upload Business Permit
              </Typography.Label>
            </div>
            <div
              onDragOver={onDragOver}
              onDrop={(e) => handleDrop(e, "business_permit")}
              onClick={() => businessPermitInputRef.current?.click()}
              style={{
                cursor: "pointer",
                border: "2px dashed #d1d5db",
                borderRadius: 10,
                margin: "0 12px 12px",
                padding: "18px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                background: "#fafafa",
              }}
            >
              <CloudUploadOutlinedIcon style={{ color: "#6b7280" }} />
              <Typography.Body>
                Click to upload or drag and drop
              </Typography.Body>
              <Typography.Body>
                Upload .pdf, .png, .jpg (MAX. 10MB)
              </Typography.Body>
            </div>

            {/* Status Row */}
            <div style={{ padding: "0 12px 12px" }}>
              {uploading["business_permit"] && (
                <LinearProgress determinate={false} variant="soft" />
              )}
              {!uploading["business_permit"] && businessPermit && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                  <Typography.Body>
                    {lastFileName["business_permit"] || `${data.business_name.replace(/\s+/g, "_")}.${businessPermit.file_format}`}
                  </Typography.Body>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <a href={businessPermit.file_url} target="_blank" rel="noreferrer">
                      <Typography.Body>View</Typography.Body>
                    </a>
                    <button
                      aria-label="Remove business permit"
                      onClick={() => removePermit("business_permit")}
                      style={{ background: "transparent", border: 0, padding: 4, cursor: "pointer" }}
                    >
                      <CloseRoundedIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Sheet>

          {/* Mayor's Permit */}
          <Sheet variant="outlined" sx={{ borderRadius: "10px", borderStyle: "solid", borderColor: "#e5e7eb" }}>
            <div style={{ padding: "12px 12px 8px" }}>
              <Typography.Label size="md">
                Upload Mayor's Permit
              </Typography.Label>
            </div>
            <div
              onDragOver={onDragOver}
              onDrop={(e) => handleDrop(e, "mayors_permit")}
              onClick={() => mayorsPermitInputRef.current?.click()}
              style={{
                cursor: "pointer",
                border: "2px dashed #d1d5db",
                borderRadius: 10,
                margin: "0 12px 12px",
                padding: "18px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                background: "#fafafa",
              }}
            >
              <CloudUploadOutlinedIcon style={{ color: "#6b7280" }} />
              <Typography.Body>
                Click to upload or drag and drop
              </Typography.Body>
              <Typography.Body>
                Upload .pdf, .png, .jpg (MAX. 10MB)
              </Typography.Body>
            </div>

            {/* Status Row */}
            <div style={{ padding: "0 12px 12px" }}>
              {uploading["mayors_permit"] && (
                <LinearProgress determinate={false} variant="soft" />
              )}
              {!uploading["mayors_permit"] && mayorsPermit && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                  <Typography.Body>
                    {lastFileName["mayors_permit"] || `${data.business_name.replace(/\s+/g, "_")}.${mayorsPermit.file_format}`}
                  </Typography.Body>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <a href={mayorsPermit.file_url} target="_blank" rel="noreferrer">
                      <Typography.Body>View</Typography.Body>
                    </a>
                    <button
                      aria-label="Remove mayor's permit"
                      onClick={() => removePermit("mayors_permit")}
                      style={{ background: "transparent", border: 0, padding: 4, cursor: "pointer" }}
                    >
                      <CloseRoundedIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Sheet>
        </div>
      </Container>
    </PageContainer>
  );
};

export default Step4;
