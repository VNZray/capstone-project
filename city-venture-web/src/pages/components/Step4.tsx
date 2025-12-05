import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import type { Business } from "@/src/types/Business";
import type { Permit } from "@/src/types/Permit";
import { useState } from "react";
import FileUpload from "@/src/components/FileUpload";
import { Box, Chip, Card, CardContent, Grid, Input } from "@mui/joy";
import { DocumentScannerOutlined, CheckCircle } from "@mui/icons-material";
import Alert from "@/src/components/Alert";

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
    description: "DTI/SEC certificate or business registration",
  },
  {
    type: "Mayor's Permit",
    key: "mayors_permit",
    description: "Local city or municipal permit",
  },
];

const Step4: React.FC<Props> = ({ data, permitData, setPermitData }) => {
  const [selectedPermits, setSelectedPermits] = useState<string[]>([]);
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

    // Remove existing permit of same type and add new one
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

  const togglePermitSelection = (permitKey: string) => {
    setSelectedPermits((prev) =>
      prev.includes(permitKey)
        ? prev.filter((k) => k !== permitKey)
        : [...prev, permitKey]
    );
  };

  const handleExpirationChange = (permitType: string, date: string) => {
    setPermitExpirations((prev) => ({ ...prev, [permitType]: date }));
  };

  const getPermitByType = (permitType: string) => {
    return permitData.find((p) => p.permit_type === permitType);
  };

  const hasRequiredPermits = () => {
    return (
      selectedPermits.length > 0 &&
      selectedPermits.every((key) => getPermitByType(key))
    );
  };
  return (
    <PageContainer gap={24} padding="clamp(12px, 3vw, 24px)">
      <Container gap="8px" style={{ textAlign: "center" }}>
        <Typography.CardTitle sx={{ fontSize: "clamp(1.25rem, 4vw, 1.5rem)" }}>
          Business Permits
        </Typography.CardTitle>
        <Typography.CardSubTitle
          sx={{ fontSize: "clamp(0.875rem, 2.5vw, 1rem)" }}
        >
          Upload your business permits and required documents
        </Typography.CardSubTitle>
      </Container>

      {/* Requirements Card */}
      <Card
        variant="soft"
        color="primary"
        sx={{ borderRadius: "clamp(8px, 2vw, 12px)" }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography.Label
            size="sm"
            weight="semibold"
            sx={{ mb: 1, fontSize: "clamp(0.75rem, 2vw, 0.875rem)" }}
          >
            📋 Requirements:
          </Typography.Label>
          <Box
            component="ul"
            sx={{
              pl: { xs: 1.5, sm: 2 },
              m: 0,
              "& li": {
                fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                color: "#374151",
                mb: 0.5,
                lineHeight: 1.5,
              },
            }}
          >
            <li>
              Select at least one permit type (Business Permit or Mayor's
              Permit)
            </li>
            <li>Provide expiration date for each permit</li>
            <li>Supported formats: PDF, JPG, JPEG, PNG</li>
            <li>Maximum file size: 10MB per document</li>
            <li>Ensure documents are clear and legible</li>
          </Box>
        </CardContent>
      </Card>

      {/* Permit Selection */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: "clamp(8px, 2vw, 12px)",
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
          <Typography.Label
            size="sm"
            weight="semibold"
            sx={{ mb: 1.5, fontSize: "clamp(0.875rem, 2.5vw, 1rem)" }}
          >
            Select Permits to Upload:
          </Typography.Label>
          <Box
            sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 1, sm: 1.5 } }}
          >
            {PERMIT_TYPES.map(({ type, key }) => (
              <Chip
                key={key}
                variant={selectedPermits.includes(key) ? "solid" : "outlined"}
                color={selectedPermits.includes(key) ? "primary" : "neutral"}
                onClick={() => togglePermitSelection(key)}
                sx={{
                  cursor: "pointer",
                  fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                  py: { xs: 0.75, sm: 1 },
                  px: { xs: 1.5, sm: 2 },
                  "&:hover": {
                    bgcolor: selectedPermits.includes(key)
                      ? "primary.600"
                      : "neutral.100",
                  },
                }}
              >
                {selectedPermits.includes(key) && (
                  <CheckCircle sx={{ fontSize: { xs: 14, sm: 16 }, mr: 0.5 }} />
                )}
                {type}
              </Chip>
            ))}
          </Box>
          {selectedPermits.length === 0 && (
            <Typography.Body
              size="xs"
              sx={{
                mt: 1,
                color: "#dc2626",
                fontSize: "clamp(0.7rem, 1.8vw, 0.875rem)",
              }}
            >
              ⚠ Please select at least one permit type
            </Typography.Body>
          )}
        </CardContent>
      </Card>

      {/* Permit Upload Grid */}
      {selectedPermits.length > 0 && (
        <Grid
          container
          spacing={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ flexGrow: 1 }}
        >
          {PERMIT_TYPES.filter(({ key }) => selectedPermits.includes(key)).map(
            ({ type, key, description }) => {
              const existingPermit = getPermitByType(key);
              const isUploaded = !!existingPermit;

              return (
                <Grid xs={12} sm={12} md={12} lg={12} xl={12} key={key}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: "clamp(8px, 2vw, 12px)",
                      border: "2px dashed #e5e7eb",
                      "&:hover": {
                        borderColor: "#2563eb",
                        boxShadow: "0 2px 8px rgba(37, 99, 235, 0.1)",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: { xs: 0.5, sm: 1 },
                          mb: { xs: 1.5, sm: 2 },
                          flexWrap: "wrap",
                        }}
                      >
                        <DocumentScannerOutlined
                          sx={{
                            color: "#2563eb",
                            fontSize: { xs: 20, sm: 22, md: 24 },
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography.Label
                            size="md"
                            weight="semibold"
                            sx={{
                              fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
                            }}
                          >
                            {type}
                            <span
                              style={{ color: "#dc2626", marginLeft: "4px" }}
                            >
                              *
                            </span>
                          </Typography.Label>
                          <Typography.Body
                            size="xs"
                            sx={{
                              color: "#6b7280",
                              fontSize: "clamp(0.7rem, 1.8vw, 0.875rem)",
                              mt: 0.25,
                            }}
                          >
                            {description}
                          </Typography.Body>
                        </Box>
                        {isUploaded && (
                          <Chip
                            size="sm"
                            color="success"
                            startDecorator={
                              <CheckCircle sx={{ fontSize: 16 }} />
                            }
                          >
                            Uploaded
                          </Chip>
                        )}
                      </Box>
                      {/* Expiration Date Input */}
                      <Box sx={{ mb: 2 }}>
                        <Typography.Label
                          size="sm"
                          sx={{
                            mb: 0.5,
                            fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                          }}
                        >
                          Expiration Date *
                        </Typography.Label>
                        <Input
                          type="date"
                          value={permitExpirations[key] || ""}
                          onChange={(e) =>
                            handleExpirationChange(key, e.target.value)
                          }
                          slotProps={{
                            input: {
                              min: new Date().toISOString().split("T")[0],
                            },
                          }}
                          required
                          sx={{
                            fontSize: "clamp(0.875rem, 2vw, 1rem)",
                            "--Input-focusedThickness": "2px",
                          }}
                        />
                      </Box>{" "}
                      <FileUpload
                        uploadTo="permits"
                        folderName={`business/${data.id || "temp"}/permit`}
                        onUploadComplete={(publicUrl, fileName) =>
                          handlePermitUpload(publicUrl, fileName, key)
                        }
                        placeholder={`Upload ${type}`}
                        accept=".pdf,.png,.jpg,.jpeg"
                        maxSizeMB={10}
                        storeLocally={true}
                        allowedTypes={[
                          "application/pdf",
                          "image/png",
                          "image/jpeg",
                          "image/jpg",
                        ]}
                      />{" "}
                      {existingPermit && (
                        <Box
                          sx={{
                            mt: 1.5,
                            p: { xs: 1, sm: 1.5 },
                            backgroundColor: "#f0f9ff",
                            borderRadius: "clamp(6px, 1.5vw, 8px)",
                            border: "1px solid #bae6fd",
                          }}
                        >
                          <Typography.Body
                            size="xs"
                            sx={{
                              color: "#0369a1",
                              fontSize: "clamp(0.7rem, 1.8vw, 0.875rem)",
                              wordBreak: "break-word",
                              mb: 0.5,
                            }}
                          >
                            <strong>File:</strong>{" "}
                            {existingPermit.file_name || "Unknown"}
                          </Typography.Body>
                          <Typography.Body
                            size="xs"
                            sx={{
                              color: "#0369a1",
                              fontSize: "clamp(0.7rem, 1.8vw, 0.875rem)",
                            }}
                          >
                            <strong>Format:</strong>{" "}
                            {existingPermit.file_format.toUpperCase()}
                          </Typography.Body>
                          <Typography.Body
                            size="xs"
                            sx={{
                              color: "#0369a1",
                              fontSize: "clamp(0.7rem, 1.8vw, 0.875rem)",
                            }}
                          >
                            <strong>Status:</strong> {existingPermit.status}
                          </Typography.Body>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            }
          )}
        </Grid>
      )}

      {/* Progress Summary */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: "clamp(8px, 2vw, 12px)",
          bgcolor: hasRequiredPermits() ? "#f0fdf4" : "#fef3c7",
          borderColor: hasRequiredPermits() ? "#86efac" : "#fbbf24",
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
              flexWrap: "wrap",
            }}
          >
            <Typography.Label
              size="md"
              weight="semibold"
              sx={{
                color: hasRequiredPermits() ? "#16a34a" : "#d97706",
                fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
              }}
            >
              {hasRequiredPermits()
                ? "✓ All selected permits uploaded!"
                : selectedPermits.length === 0
                ? "⚠ Please select at least one permit type"
                : "⚠ Please upload all selected permits to continue"}
            </Typography.Label>
          </Box>
          <Typography.Body
            size="xs"
            sx={{
              mt: 0.5,
              color: hasRequiredPermits() ? "#15803d" : "#92400e",
              fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
            }}
          >
            Selected: {selectedPermits.length} | Uploaded: {permitData.length}
          </Typography.Body>
        </CardContent>
      </Card>

      <Alert
        open={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        showCancel={false}
        confirmText="OK"
      />
    </PageContainer>
  );
};

export default Step4;
