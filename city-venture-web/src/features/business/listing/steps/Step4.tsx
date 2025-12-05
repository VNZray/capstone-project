import Typography from "@/src/components/Typography";
import type { Business } from "@/src/types/Business";
import type { Permit } from "@/src/types/Permit";
import { useState } from "react";
import FileUpload from "@/src/components/FileUpload";
import Alert from "@/src/components/Alert";
import { Box, Card, CardContent, Input, FormControl } from "@mui/joy";
import { DescriptionOutlined } from "@mui/icons-material";
import { colors } from "@/src/utils/Colors";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  permitData: Permit[];
  setPermitData: React.Dispatch<React.SetStateAction<Permit[]>>;
};

const PERMIT_TYPES = [
  {
    type: "Business Permit",
    key: "business_permit",
    description: "Upload Document *",
  },
  {
    type: "Mayor's Permit",
    key: "mayors_permit",
    description: "Upload Document *",
  },
];

const Step4: React.FC<Props> = ({ data, permitData, setPermitData }) => {
  const [permitExpirations, setPermitExpirations] = useState<
    Record<string, string>
  >({});
  const [alert, setAlert] = useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({ open: false, type: "info", title: "", message: "" });

  const handlePermitUpload = (
    publicUrl: string,
    fileName: string,
    permitType: string
  ) => {
    const fileExtension = fileName.split(".").pop() || "";

    const newPermit: Permit = {
      id: crypto.randomUUID(),
      business_id: data.id || "",
      permit_type: permitType,
      file_url: publicUrl,
      file_format: fileExtension,
      file_size: 0,
      file_name: fileName,
      status: "pending",
      submitted_at: new Date().toISOString(),
      expiration_date: permitExpirations[permitType] || undefined,
    };

    setPermitData((prev) => [
      ...prev.filter((p) => p.permit_type !== permitType),
      newPermit,
    ]);

    setAlert({
      open: true,
      type: "success",
      title: "Upload Successful",
      message: `${permitType} has been uploaded successfully.`,
    });
  };

  const handleExpirationChange = (permitType: string, date: string) => {
    setPermitExpirations((prev) => ({ ...prev, [permitType]: date }));

    setPermitData((prevData) =>
      prevData.map((permit) =>
        permit.permit_type === permitType
          ? { ...permit, expiration_date: date }
          : permit
      )
    );
  };

  const getPermitByType = (permitType: string) => {
    return permitData.find((p) => p.permit_type === permitType);
  };

  return (
    <>
      <Alert
        open={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        showCancel={false}
      />

      <Box sx={{ mb: 4 }}>
        <Typography.Header sx={{ mb: 1, color: colors.primary }}>
          Permits & Licenses
        </Typography.Header>
        <Typography.Body
          sx={{ mb: 4, color: colors.gray, fontSize: "0.95rem" }}
        >
          Upload documents
        </Typography.Body>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {PERMIT_TYPES.map((permit) => {
            const uploadedPermit = getPermitByType(permit.key);
            return (
              <Card
                key={permit.key}
                variant="outlined"
                sx={{
                  borderRadius: "12px",
                  border: `1px solid ${colors.tertiary}`,
                  boxShadow: "none",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        backgroundColor: colors.secondary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: colors.white,
                      }}
                    >
                      <DescriptionOutlined />
                    </Box>
                    <Box>
                      <Typography.CardTitle size="sm">
                        {permit.type}
                      </Typography.CardTitle>
                    </Box>
                  </Box>

                  <FormControl sx={{ mb: 2 }}>
                    <Typography.Label>{permit.description}</Typography.Label>
                    <FileUpload
                      folderName={`${data.id || "temp"}/${permit.key}`}
                      uploadTo="permits"
                      onUploadComplete={(publicUrl, fileName) =>
                        handlePermitUpload(publicUrl, fileName, permit.key)
                      }
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSizeMB={10}
                      placeholder={
                        uploadedPermit
                          ? "Change Document"
                          : "Click to upload or drag and drop PDF, JPG, PNG (Max 10MB)"
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <Typography.Label>Expiry Date *</Typography.Label>
                    <Input
                      type="date"
                      placeholder="dd/mm/yyyy"
                      value={permitExpirations[permit.key] || ""}
                      onChange={(e) =>
                        handleExpirationChange(permit.key, e.target.value)
                      }
                      sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
                    />
                    <Typography.Body
                      sx={{ fontSize: "0.8rem", color: colors.gray, mt: 0.5 }}
                    >
                      Must be a future date
                    </Typography.Body>
                  </FormControl>
                </CardContent>
              </Card>
            );
          })}

          <Box
            sx={{
              p: 2,
              borderRadius: "8px",
              backgroundColor: colors.lightBackground,
              border: `1px solid ${colors.tertiary}`,
            }}
          >
            <Typography.Body sx={{ fontSize: "0.85rem", color: colors.text }}>
              <strong>At least 1 permit is required.</strong> All documents must
              be valid and not expired. Accepted formats: PDF, JPG, PNG. Maximum
              file size: 10MB per document.
            </Typography.Body>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Step4;
