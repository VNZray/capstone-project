import React, { useRef, useState } from "react";
import {
  Button,
  CircularProgress,
  Typography,
  Modal,
  ModalDialog,
} from "@mui/joy";
import { Upload, X, Eye } from "lucide-react";
import { useFileUpload } from "@/src/hooks/useFileUpload";
import type { UploadOptions } from "@/src/services/upload/FileUploadService";
import Container from "@/src/components/Container";

export interface ImageUploadProps {
  folderName: string; // subfolder in storage
  uploadTo: string; // bucket
  onUploadComplete?: (publicUrl: string, localUrl?: string) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  accept?: string;
  maxSizeMB?: number;
  storeLocally?: boolean;
}

/**
 * Reusable Image Upload Component with local storage support
 */
const ImageUpload: React.FC<ImageUploadProps> = ({
  folderName,
  uploadTo,
  onUploadComplete,
  onError,
  placeholder = "Click to upload image",
  accept = "image/*",
  maxSizeMB = 5,
  storeLocally = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const uploadOptions: UploadOptions = {
    folderName,
    uploadTo,
    storeLocally,
  };

  const {
    previewUrl,
    isUploading,
    uploadProgress,
    error,
    publicUrl,
    handleFileSelect,
    clearUpload,
    resetError,
  } = useFileUpload(uploadOptions);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      const errorMsg = `File size exceeds ${maxSizeMB}MB limit`;
      onError?.(errorMsg);
      return;
    }

    // Handle upload and wait for result
    const result = await handleFileSelect(e);

    // Callback on completion with the actual result
    if (result?.success && result?.publicUrl) {
      onUploadComplete?.(result.publicUrl, result.localUrl || undefined);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    clearUpload();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    resetError();
  };

  return (
    <Container
      direction="column"
      gap="12px"
      padding="16px"
      style={{
        border: "2px dashed #e0e0e0",
        borderRadius: "8px",
        textAlign: "center",
        cursor: isUploading ? "not-allowed" : "pointer",
        opacity: isUploading ? 0.6 : 1,
        transition: "all 0.3s ease",
        backgroundColor: previewUrl ? "#f5f5f5" : "transparent",
      }}
    >
      {/* Preview or Upload Area */}
      {previewUrl ? (
        <Container direction="column" gap="12px" padding="0">
          <Typography level="body-sm" color="success">
            ✓ Image uploaded successfully
          </Typography>
          {publicUrl && (
            <Typography level="body-xs" color="neutral">
              URL: {publicUrl.substring(0, 50)}...
            </Typography>
          )}
          <Button
            size="md"
            variant="soft"
            color="primary"
            startDecorator={<Eye size={18} />}
            onClick={() => setShowPreview(true)}
          >
            Preview Image
          </Button>
        </Container>
      ) : (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={isUploading}
            style={{ display: "none" }}
          />

          {isUploading ? (
            <Container direction="column" gap="8px" align="center" padding="0">
              <CircularProgress
                determinate
                value={uploadProgress}
                size="md"
                color="primary"
              />
              <Typography level="body-sm">
                Uploading... {uploadProgress}%
              </Typography>
            </Container>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Upload size={40} style={{ color: "#1976d2" }} />
              <Typography level="body-md" fontWeight={600}>
                {placeholder}
              </Typography>
              <Typography level="body-sm" color="neutral">
                {accept === "image/*" ? "PNG, JPG, GIF up to " : "Files up to "}
                {maxSizeMB}MB
              </Typography>
            </div>
          )}
        </>
      )}

      {/* Error Message */}
      {error && (
        <Container
          direction="row"
          align="center"
          gap="8px"
          padding="8px"
          style={{
            backgroundColor: "#ffebee",
            borderRadius: "4px",
            color: "#c62828",
          }}
        >
          <X size={18} />
          <Typography level="body-sm" style={{ color: "#c62828" }}>
            {error}
          </Typography>
        </Container>
      )}

      {/* Action Buttons */}
      {previewUrl && (
        <Container direction="row" gap="8px" justify="center" padding="0">
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            size="sm"
            variant="soft"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            Change Image
          </Button>
        </Container>
      )}

      {/* Image Preview Modal */}
      <Modal open={showPreview} onClose={() => setShowPreview(false)}>
        <ModalDialog
          layout="center"
          size="lg"
          sx={{
            maxWidth: 600,
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ position: "relative" }}>
            {/* Close Button */}
            <button
              onClick={() => setShowPreview(false)}
              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                background: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                zIndex: 10,
              }}
            >
              <X size={24} style={{ color: "#333" }} />
            </button>

            {/* Preview Image */}
            <img
              src={previewUrl || ""}
              alt="Full Preview"
              style={{
                width: "100%",
                borderRadius: "8px",
                display: "block",
              }}
            />

            {/* Action Buttons */}
            <Container
              direction="row"
              gap="8px"
              justify="center"
              padding="12px"
              style={{ marginTop: "12px" }}
            >
              <Button
                size="md"
                variant="outlined"
                color="neutral"
                startDecorator={<X size={18} />}
                onClick={() => {
                  setShowPreview(false);
                  handleClear();
                }}
              >
                Clear
              </Button>
              <Button
                size="md"
                variant="soft"
                onClick={() => {
                  setShowPreview(false);
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
              >
                Change Image
              </Button>
              <Button
                size="md"
                variant="solid"
                color="primary"
                onClick={() => setShowPreview(false)}
              >
                Close
              </Button>
            </Container>
          </div>
        </ModalDialog>
      </Modal>
    </Container>
  );
};

export default ImageUpload;
