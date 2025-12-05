import Typography from "@/src/components/Typography";
import React, { useState } from "react";
import type { Business } from "@/src/types/Business";
import { Chip, Card, CardContent, Box, Grid, Input } from "@mui/joy";
import {
  DocumentScannerOutlined,
  CheckCircle,
  FileCopy,
} from "@mui/icons-material";
import type { Permit } from "@/src/types/Permit";
import FileUpload from "@/src/components/FileUpload";
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

const requirements = [
  "Select at least one permit type (Business Permit or Mayor's Permit)",
  "Provide expiration date for each permit",
  "Supported formats: PDF, JPG, JPEG, PNG",
  "Maximum file size: 10MB per document",
  "Ensure documents are clear and legible",
];

const StepPermits: React.FC<Props> = ({ data, permitData, setPermitData }) => {
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
    <>
      <style>
        {`
          .br-section { box-shadow: none !important; background: transparent !important; border: none !important; border-radius: 0 !important; }
          .stepperContent { background: transparent; }
        `}
      </style>
      <div
        className="stepperContent"
        style={{
          overflow: "visible",
          padding:
            "clamp(12px, 2.5vw, 16px) clamp(12px, 2.5vw, 16px) clamp(16px, 3vw, 24px)",
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
            gap: "clamp(16px, 3vw, 24px)",
            width: "100%",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              paddingBottom: "clamp(8px, 2vw, 12px)",
              textAlign: "center",
              borderBottom: "1px solid #e5e7eb",
              marginBottom: "clamp(12px, 2.5vw, 20px)",
              paddingTop: 4,
            }}
          >
            <Typography.Label
              size="lg"
              sx={{
                color: "#111827",
                mb: 1,
                fontSize: "clamp(1rem, 3vw, 1.25rem)",
              }}
            >
              Business Permits
            </Typography.Label>
            <Typography.Body
              size="xs"
              sx={{
                color: "#6b7280",
                fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
              }}
            >
              Upload your business permits and documents
            </Typography.Body>
          </div>

          <div style={{ paddingRight: "clamp(0px, 1vw, 6px)" }}>
            {/* Requirements Card */}
            <Card
              variant="soft"
              color="warning"
              sx={{
                borderRadius: "clamp(8px, 2vw, 12px)",
                mb: { xs: 1.5, sm: 2 },
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 0.5, sm: 1 },
                    mb: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <FileCopy
                    sx={{ fontSize: { xs: 16, sm: 18 }, color: "#d97706" }}
                  />
                  <Typography.Label
                    size="sm"
                    weight="semibold"
                    sx={{
                      color: "#92400e",
                      fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                    }}
                  >
                    📋 Requirements:
                  </Typography.Label>
                </Box>
                <Box
                  component="ul"
                  sx={{
                    pl: { xs: 1.5, sm: 2 },
                    m: 0,
                    "& li": {
                      fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                      color: "#92400e",
                      mb: 0.5,
                      lineHeight: 1.5,
                    },
                  }}
                >
                  {requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Permit Selection */}
            <Card
              variant="outlined"
              sx={{
                borderRadius: "clamp(8px, 2vw, 12px)",
                mb: { xs: 1.5, sm: 2 },
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography.Label
                  size="sm"
                  weight="semibold"
                  sx={{ mb: 1.5, fontSize: "clamp(0.875rem, 2.5vw, 1rem)" }}
                >
                  Select Permits to Upload:
                </Typography.Label>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {PERMIT_TYPES.map(({ type, key }) => (
                    <Chip
                      key={key}
                      variant={
                        selectedPermits.includes(key) ? "solid" : "outlined"
                      }
                      color={
                        selectedPermits.includes(key) ? "primary" : "neutral"
                      }
                      onClick={() => togglePermitSelection(key)}
                      sx={{
                        cursor: "pointer",
                        fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                        "&:hover": {
                          bgcolor: selectedPermits.includes(key)
                            ? "primary.600"
                            : "neutral.100",
                        },
                      }}
                    >
                      {selectedPermits.includes(key) && (
                        <CheckCircle sx={{ fontSize: 14, mr: 0.5 }} />
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
              <Grid container spacing={2}>
                {PERMIT_TYPES.filter(({ key }) =>
                  selectedPermits.includes(key)
                ).map(({ type, key }) => {
                  const existingPermit = getPermitByType(key);
                  const isUploaded = !!existingPermit;

                  return (
                    <Grid xs={12} sm={12} md={12} lg={6} xl={6} key={key}>
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
                        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
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
                                fontSize: { xs: 20, sm: 22 },
                              }}
                            />
                            <Typography.Label
                              size="md"
                              weight="semibold"
                              sx={{
                                fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
                                flex: 1,
                              }}
                            >
                              {type}
                            </Typography.Label>
                            {isUploaded && (
                              <Chip
                                size="sm"
                                color="success"
                                startDecorator={
                                  <CheckCircle sx={{ fontSize: 14 }} />
                                }
                              >
                                Uploaded
                              </Chip>
                            )}
                          </Box>

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
                          </Box>

                          <FileUpload
                            uploadTo="permits"
                            folderName={`business/${data.id || "temp"}/permit`}
                            onUploadComplete={(publicUrl, fileName) =>
                              handlePermitUpload(publicUrl, fileName, type)
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
                          />

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
                                <strong>Status:</strong> {existingPermit.status}
                              </Typography.Body>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}

            {/* Progress Summary */}
            <Card
              variant="outlined"
              sx={{
                borderRadius: "clamp(8px, 2vw, 12px)",
                mt: { xs: 1.5, sm: 2 },
                bgcolor: hasRequiredPermits() ? "#f0fdf4" : "#fef3c7",
                borderColor: hasRequiredPermits() ? "#86efac" : "#fbbf24",
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography.Label
                  size="sm"
                  weight="semibold"
                  sx={{
                    color: hasRequiredPermits() ? "#16a34a" : "#d97706",
                    fontSize: "clamp(0.8rem, 2.2vw, 0.875rem)",
                  }}
                >
                  {hasRequiredPermits()
                    ? "✓ All selected permits uploaded!"
                    : "⚠ Please upload at least one permit to continue"}
                </Typography.Label>
                <Typography.Body
                  size="xs"
                  sx={{
                    mt: 0.5,
                    color: hasRequiredPermits() ? "#15803d" : "#92400e",
                    fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                  }}
                >
                  Selected: {selectedPermits.length} | Uploaded:{" "}
                  {permitData.length}
                </Typography.Body>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Alert
        open={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        showCancel={false}
        confirmText="OK"
      />
    </>
  );
};

export default StepPermits;
