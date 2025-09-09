import Text from "@/src/components/Text";
import React, { useRef } from "react";
import type { Business } from "@/src/types/Business";
import CardHeader from "@/src/components/CardHeader";
import { Button, FormControl, FormLabel, Grid, Input, Sheet } from "@mui/joy";
import Container from "@/src/components/Container";
import Label from "@/src/components/Label";
import { colors } from "@/src/utils/Colors";
import { Building2, Upload } from "lucide-react";
import { DocumentScannerOutlined, FileCopy } from "@mui/icons-material";
import type { Permit } from "@/src/types/Permit";
import { supabase } from "@/src/utils/supabase"; // ✅ Import your supabase client

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

    // ✅ validate file type
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

    // upload to supabase
    const { data: uploadData, error } = await supabase.storage
      .from("permits")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("❌ Upload failed:", error.message);
      alert("Upload failed. Please try again.");
      return;
    }

    // get public url
    const { data: publicUrlData } = supabase.storage
      .from("permits")
      .getPublicUrl(filePath);

    // update state
    setPermitData((prev) => [
      ...prev.filter((p) => p.permit_type !== permitType),
      {
        id: "",
        business_id: data.id,
        permit_type: permitType,
        file_url: publicUrlData.publicUrl,
        file_format: ext!,
        file_size: file.size,
        status: "Pending",
      },
    ]);
  };

  return (
    <div className="stepperContent">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CardHeader
          title="Business Permits"
          color="white"
          margin="0 0 20px 0"
        />

        <Grid container columns={12}>
          {/* Mayor's Permit */}
          <Grid xs={6}>
            <Container padding="0 20px" gap="20px">
              <FormControl>
                <FormLabel>Mayor's Permit</FormLabel>

                <div
                  style={{
                    width: "100%",
                    height: 300,
                    borderWidth: 2,
                    borderStyle: "dashed",
                    borderColor: colors.primary,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <Building2
                    size={48}
                    strokeWidth={1.5}
                    color={colors.primary}
                  />
                  <Text variant="card-title">Mayor's Permit</Text>
                  <Text variant="card-sub-title">
                    Official permit issued by the local municipal or city
                    government
                  </Text>
                  <Button
                    size="md"
                    startDecorator={<Upload />}
                    onClick={() => mayorsPermitInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                  <Input
                    size="md"
                    readOnly
                    value={
                      permitData.find((p) => p.permit_type === "mayors_permit")
                        ?.file_url || ""
                    }
                  />
                  <input
                    type="file"
                    ref={mayorsPermitInputRef}
                    style={{ display: "none" }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleUpload(e, "mayors_permit")}
                  />
                </div>
              </FormControl>
            </Container>
          </Grid>

          {/* Business Permit */}
          <Grid xs={6}>
            <Container padding="0 20px" gap="20px">
              <FormControl required>
                <FormLabel>Business Permit</FormLabel>

                <div
                  style={{
                    width: "100%",
                    height: 300,
                    borderWidth: 2,
                    borderStyle: "dashed",
                    borderColor: colors.primary,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <DocumentScannerOutlined
                    fontSize="large"
                    sx={{ color: colors.primary }}
                  />
                  <Text variant="card-title">Business Permit</Text>
                  <Text variant="card-sub-title">
                    Certificate of business registration from DTI or SEC
                  </Text>
                  <Button
                    size="md"
                    startDecorator={<Upload />}
                    onClick={() => businessPermitInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                  <Input
                    size="md"
                    readOnly
                    value={
                      permitData.find(
                        (p) => p.permit_type === "business_permit"
                      )?.file_url || ""
                    }
                  />
                  <input
                    type="file"
                    ref={businessPermitInputRef}
                    style={{ display: "none" }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleUpload(e, "business_permit")}
                  />
                </div>
              </FormControl>
            </Container>
          </Grid>
        </Grid>

        {/* Requirements Info */}
        <Sheet
          color="warning"
          variant="soft"
          sx={{ p: 2, borderRadius: 8, m: 2 }}
        >
          <Label>
            <FileCopy color="info" />
            <Text variant="label" color={colors.primary}>
              File Requirements
            </Text>
          </Label>

          <ul style={{ display: "flex", flexDirection: "column" }}>
            {requirements.map((req, idx) => (
              <li key={idx}>
                <Text variant="paragraph" color={colors.primary}>
                  {req}
                </Text>
              </li>
            ))}
          </ul>
        </Sheet>
      </div>
    </div>
  );
};

export default StepPermits;
