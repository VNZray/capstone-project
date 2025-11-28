import React, { useState } from "react";
import Alert from "../components/Alert";
import FileUpload from "../components/FileUpload";
import Button from "../components/Button";
import Typography from "../components/Typography";
import Container from "../components/Container";
import { Box, Divider } from "@mui/joy";

const AlertShowcase: React.FC = () => {
  const [alerts, setAlerts] = useState({
    success: false,
    error: false,
    warning: false,
    info: false,
    noCancel: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    image?: string;
    document?: string;
    video?: string;
  }>({});

  const [uploadError, setUploadError] = useState<string>("");
  const [showUploadErrorAlert, setShowUploadErrorAlert] = useState(false);

  const openAlert = (type: keyof typeof alerts) => {
    setAlerts((prev) => ({ ...prev, [type]: true }));
  };

  const closeAlert = (type: keyof typeof alerts) => {
    setAlerts((prev) => ({ ...prev, [type]: false }));
  };

  const handleUploadComplete = (
    type: "image" | "document" | "video",
    publicUrl: string,
    fileName: string
  ) => {
    setUploadedFiles((prev) => ({ ...prev, [type]: publicUrl }));
    console.log(`✅ ${type} uploaded:`, fileName, publicUrl);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
    setShowUploadErrorAlert(true);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
      {/* Header */}
      <Container direction="column" gap="16px" padding="0">
        <Typography.Title weight="bold" color="primary">
          Component Showcase
        </Typography.Title>
        <Typography.Body>
          Interactive demonstrations of Alert and FileUpload components
        </Typography.Body>
      </Container>

      <Divider sx={{ mb: 4 }} />

      {/* Alert Component Section */}
      <Container direction="column" gap="24px" padding="0 0 48px 0">
        <Typography.CardTitle>Alert Component</Typography.CardTitle>
        <Typography.Body size="sm">
          Display important messages with different severity levels and
          customizable actions.
        </Typography.Body>

        <Container
          direction="row"
          gap="16px"
          padding="24px"
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: "12px",
            flexWrap: "wrap",
          }}
        >
          {/* Success Alert */}
          <Button
            variant="solid"
            colorScheme="success"
            onClick={() => openAlert("success")}
          >
            Show Success Alert
          </Button>

          {/* Error Alert */}
          <Button
            variant="solid"
            colorScheme="error"
            onClick={() => openAlert("error")}
          >
            Show Error Alert
          </Button>

          {/* Warning Alert */}
          <Button
            variant="solid"
            colorScheme="warning"
            onClick={() => openAlert("warning")}
          >
            Show Warning Alert
          </Button>

          {/* Info Alert */}
          <Button
            variant="solid"
            colorScheme="primary"
            onClick={() => openAlert("info")}
          >
            Show Info Alert
          </Button>

          {/* No Cancel Button */}
          <Button
            variant="outlined"
            colorScheme="secondary"
            onClick={() => openAlert("noCancel")}
          >
            Alert Without Cancel
          </Button>
        </Container>

        {/* Alert Features */}
        <Container
          direction="column"
          gap="8px"
          padding="16px"
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
          }}
        >
          <Typography.Label>Features:</Typography.Label>
          <Typography.Body size="sm">
            • Four alert types: Success, Error, Warning, Info
            <br />
            • Customizable titles, messages, and button labels
            <br />
            • Optional cancel button
            <br />
            • Confirm action with callback support
            <br />
            • Animated icon entrance
            <br />• Responsive design with proper spacing
          </Typography.Body>
        </Container>
      </Container>

      <Divider sx={{ mb: 4 }} />

      {/* FileUpload Component Section */}
      <Container direction="column" gap="24px" padding="0">
        <Typography.CardTitle>FileUpload Component</Typography.CardTitle>
        <Typography.Body size="sm">
          Upload files with progress tracking, validation, and preview support.
        </Typography.Body>

        {/* Image Upload */}
        <Container direction="column" gap="12px" padding="0">
          <Typography.Label>Image Upload</Typography.Label>
          <FileUpload
            folderName="showcase-images"
            uploadTo="local"
            onUploadComplete={(url, name) =>
              handleUploadComplete("image", url, name)
            }
            onError={handleUploadError}
            placeholder="Upload an image"
            accept="image/*"
            maxSizeMB={5}
            allowedTypes={[
              "image/jpeg",
              "image/png",
              "image/gif",
              "image/webp",
            ]}
          />
          {uploadedFiles.image && (
            <Container
              direction="column"
              gap="8px"
              padding="12px"
              style={{
                backgroundColor: "#e8f5e9",
                borderRadius: "8px",
              }}
            >
              <Typography.Body size="sm">
                ✅ Image uploaded successfully!
              </Typography.Body>
              <Typography.Body size="xs" sx={{ wordBreak: "break-all" }}>
                URL: {uploadedFiles.image}
              </Typography.Body>
            </Container>
          )}
        </Container>

        {/* Document Upload */}
        <Container direction="column" gap="12px" padding="0">
          <Typography.Label>Document Upload</Typography.Label>
          <FileUpload
            folderName="showcase-documents"
            uploadTo="local"
            onUploadComplete={(url, name) =>
              handleUploadComplete("document", url, name)
            }
            onError={handleUploadError}
            placeholder="Upload a document (PDF, DOCX, TXT)"
            accept=".pdf,.doc,.docx,.txt"
            maxSizeMB={10}
            allowedTypes={[
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "text/plain",
            ]}
          />
          {uploadedFiles.document && (
            <Container
              direction="column"
              gap="8px"
              padding="12px"
              style={{
                backgroundColor: "#e3f2fd",
                borderRadius: "8px",
              }}
            >
              <Typography.Body size="sm">
                ✅ Document uploaded successfully!
              </Typography.Body>
              <Typography.Body size="xs" sx={{ wordBreak: "break-all" }}>
                URL: {uploadedFiles.document}
              </Typography.Body>
            </Container>
          )}
        </Container>

        {/* Video Upload */}
        <Container direction="column" gap="12px" padding="0">
          <Typography.Label>Video Upload</Typography.Label>
          <FileUpload
            folderName="showcase-videos"
            uploadTo="local"
            onUploadComplete={(url, name) =>
              handleUploadComplete("video", url, name)
            }
            onError={handleUploadError}
            placeholder="Upload a video (MP4, MOV)"
            accept="video/*"
            maxSizeMB={50}
            allowedTypes={["video/mp4", "video/quicktime", "video/x-msvideo"]}
          />
          {uploadedFiles.video && (
            <Container
              direction="column"
              gap="8px"
              padding="12px"
              style={{
                backgroundColor: "#fff3e0",
                borderRadius: "8px",
              }}
            >
              <Typography.Body size="sm">
                ✅ Video uploaded successfully!
              </Typography.Body>
              <Typography.Body size="xs" sx={{ wordBreak: "break-all" }}>
                URL: {uploadedFiles.video}
              </Typography.Body>
            </Container>
          )}
        </Container>

        {/* FileUpload Features */}
        <Container
          direction="column"
          gap="8px"
          padding="16px"
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
          }}
        >
          <Typography.Label>Features:</Typography.Label>
          <Typography.Body size="sm">
            • Progress tracking with percentage
            <br />
            • File type validation
            <br />
            • File size validation
            <br />
            • Preview modal with file details
            <br />
            • Clear and change file options
            <br />
            • Local and remote storage support
            <br />
            • Drag and drop ready styling
            <br />• Error handling with callbacks
          </Typography.Body>
        </Container>
      </Container>

      {/* Alert Modals */}
      <Alert
        open={alerts.success}
        onClose={() => closeAlert("success")}
        onConfirm={() => {
          console.log("Success confirmed!");
          closeAlert("success");
        }}
        type="success"
        title="Success!"
        message="Your operation completed successfully. All changes have been saved."
        confirmText="Great!"
      />

      <Alert
        open={alerts.error}
        onClose={() => closeAlert("error")}
        onConfirm={() => {
          console.log("Error acknowledged");
          closeAlert("error");
        }}
        type="error"
        title="Error Occurred"
        message="Something went wrong while processing your request. Please try again."
        confirmText="Try Again"
        cancelText="Dismiss"
      />

      <Alert
        open={alerts.warning}
        onClose={() => closeAlert("warning")}
        onConfirm={() => {
          console.log("Warning confirmed, proceeding...");
          closeAlert("warning");
        }}
        type="warning"
        title="Warning"
        message="This action cannot be undone. Are you sure you want to continue?"
        confirmText="Continue Anyway"
        cancelText="Go Back"
      />

      <Alert
        open={alerts.info}
        onClose={() => closeAlert("info")}
        onConfirm={() => {
          console.log("Info acknowledged");
          closeAlert("info");
        }}
        type="info"
        title="Information"
        message="Here's some important information you should know about this feature."
        confirmText="Got it"
      />

      <Alert
        open={alerts.noCancel}
        onClose={() => closeAlert("noCancel")}
        onConfirm={() => {
          console.log("User acknowledged");
          closeAlert("noCancel");
        }}
        type="info"
        title="Single Action Alert"
        message="This alert only has a confirm button. The user must acknowledge this message."
        confirmText="Acknowledge"
        showCancel={false}
      />

      {/* Upload Error Alert */}
      <Alert
        open={showUploadErrorAlert}
        onClose={() => setShowUploadErrorAlert(false)}
        type="error"
        title="Upload Failed"
        message={uploadError}
        confirmText="OK"
        showCancel={false}
      />
    </Box>
  );
};

export default AlertShowcase;
