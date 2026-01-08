import React, { useState, useEffect } from "react";
import {
  Grid,
  Button,
  Typography,
  Card,
  CardOverflow,
  AspectRatio,
  IconButton,
  Chip,
  Box,
  CircularProgress,
} from "@mui/joy";
import { UploadIcon, Trash2, Star, StarOff } from "lucide-react";
import Alert from "@/src/components/Alert";
import { 
  uploadTouristSpotImage, 
  getTouristSpotImages, 
  deleteTouristSpotImage, 
  setPrimaryTouristSpotImage 
} from "@/src/services/Service";
import type { PendingImage } from "@/src/types/TouristSpot";

interface TouristSpotImage {
  id: string;
  tourist_spot_id: string;
  file_url: string;
  file_format: string;
  file_size?: number;
  is_primary: boolean | number;
  alt_text?: string;
  uploaded_at: string;
}

interface TouristSpotImageManagerProps {
  touristSpotId?: string;
  onImagesChange?: (images: TouristSpotImage[]) => void;
  onPendingImagesChange?: (images: PendingImage[]) => void;
  pendingImages?: PendingImage[];
  disabled?: boolean;
  mode?: "add" | "edit";
  initialSpotName?: string;
}

const TouristSpotImageManager: React.FC<TouristSpotImageManagerProps> = ({
  touristSpotId,
  onImagesChange,
  onPendingImagesChange,
  pendingImages = [],
  disabled = false,
  mode = "edit",
  initialSpotName,
}) => {
  const [images, setImages] = useState<TouristSpotImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Alert state
  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    onConfirm?: () => void;
    showCancel?: boolean;
    confirmText?: string;
  }>({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
    options?: {
      onConfirm?: () => void;
      showCancel?: boolean;
      confirmText?: string;
    }
  ) => {
    setAlertConfig({
      open: true,
      type,
      title,
      message,
      onConfirm: options?.onConfirm,
      showCancel: options?.showCancel,
      confirmText: options?.confirmText,
    });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, open: false }));
  };

  // Helper function to safely check if image is primary
  const isPrimary = (image: TouristSpotImage) => {
    return image.is_primary === true || image.is_primary === 1;
  };

  // Load images when touristSpotId changes
  const loadImages = React.useCallback(async () => {
    if (!touristSpotId) return;
    
    try {
      setLoading(true);
      const imageList = await getTouristSpotImages(touristSpotId);
      setImages(imageList || []);
      onImagesChange?.(imageList || []);
    } catch (error) {
      console.error("Failed to load images:", error);
    } finally {
      setLoading(false);
    }
  }, [touristSpotId, onImagesChange]);

  useEffect(() => {
    if (touristSpotId && mode === "edit") {
      loadImages();
    } else {
      setImages([]);
    }
  }, [touristSpotId, loadImages, mode]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For add mode, store images temporarily
    if (mode === "add" || !touristSpotId) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const newPendingImage: PendingImage = {
          id: Date.now().toString(),
          file,
          preview: fileReader.result as string,
          is_primary: pendingImages.length === 0, // First image becomes primary
          alt_text: file.name,
        };
        onPendingImagesChange?.([...pendingImages, newPendingImage]);
      };
      fileReader.readAsDataURL(file);
      e.target.value = ""; // Reset file input
      return;
    }

    // For edit mode, upload directly
    try {
      setUploading(true);
      const isPrimary = images.length === 0;
      // Always use original spot name for folder
      if (!initialSpotName) throw new Error("No original spot name found for folder!");
      const spotFolderName = initialSpotName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      await uploadTouristSpotImage(touristSpotId, file, isPrimary, file.name, undefined, spotFolderName);
      await loadImages();
    } catch (error) {
      console.error("Upload failed:", error);
      showAlert("error", "Error", "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteImage = async (imageId: string, fileUrl: string) => {
    if (!touristSpotId) return;

    showAlert(
      "warning",
      "Delete Image",
      "Are you sure you want to delete this image?",
      {
        onConfirm: async () => {
          try {
            await deleteTouristSpotImage(touristSpotId, imageId, fileUrl);
            closeAlert();
            await loadImages();
          } catch (error) {
            console.error("Delete failed:", error);
            showAlert("error", "Error", "Failed to delete image. Please try again.");
          }
        },
        showCancel: true,
        confirmText: "Delete",
      }
    );
  };

  const handleDeletePendingImage = (imageId: string) => {
    showAlert(
      "warning",
      "Remove Image",
      "Are you sure you want to remove this image?",
      {
        onConfirm: () => {
          onPendingImagesChange?.(pendingImages.filter((img) => img.id !== imageId));
          closeAlert();
        },
        showCancel: true,
        confirmText: "Remove",
      }
    );
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!touristSpotId) return;

    try {
      await setPrimaryTouristSpotImage(touristSpotId, imageId);
      await loadImages();
    } catch (error) {
      console.error("Set primary failed:", error);
      showAlert("error", "Error", "Failed to set primary image. Please try again.");
    }
  };

  const handleSetPendingPrimary = (imageId: string) => {
    onPendingImagesChange?.(
      pendingImages.map(img => ({
        ...img,
        is_primary: img.id === imageId
      }))
    );
  };

  // Show images based on mode
  const displayImages = mode === "add" ? pendingImages : images;

  return (
    <Box>
      <Typography level="title-sm" sx={{ mb: 2 }}>
        Tourist Spot Images {mode === "add" && pendingImages.length > 0 && `(${pendingImages.length} pending)`}
      </Typography>
      
      {/* Upload Button */}
      <Button
        component="label"
        variant="outlined"
        color="primary"
        startDecorator={uploading ? <CircularProgress size="sm" /> : <UploadIcon />}
        disabled={disabled || uploading}
        sx={{ mb: 2 }}
      >
        {uploading ? "Uploading..." : "Upload Image"}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
      </Button>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Images Grid */}
      {!loading && (
        <Grid container spacing={2}>
          {displayImages.length === 0 ? (
            <Grid xs={12}>
              <Card variant="soft" sx={{ p: 3, textAlign: "center" }}>
                <Typography level="body-md" color="neutral">
                  No images uploaded yet
                </Typography>
              </Card>
            </Grid>
          ) : (
            displayImages.map((image) => {
              const isPrimaryImage = mode === "add" 
                ? (image as PendingImage).is_primary 
                : isPrimary(image as TouristSpotImage);
              const imageUrl = mode === "add" 
                ? (image as PendingImage).preview 
                : (image as TouristSpotImage).file_url;
              const altText = mode === "add" 
                ? (image as PendingImage).alt_text 
                : (image as TouristSpotImage).alt_text || "Tourist spot image";

              return (
                <Grid xs={6} sm={4} md={3} key={image.id}>
                  <Card sx={{ maxWidth: 200 }}>
                    <CardOverflow>
                      <AspectRatio ratio="1">
                        <img
                          src={imageUrl}
                          alt={altText}
                          style={{ objectFit: "cover" }}
                        />
                      </AspectRatio>
                    </CardOverflow>
                    
                    <Box sx={{ p: 1 }}>
                      {/* Primary indicator */}
                      {isPrimaryImage && (
                        <Chip
                          size="sm"
                          color="primary"
                          variant="soft"
                          startDecorator={<Star size={12} />}
                          sx={{ mb: 1 }}
                        >
                          Primary
                        </Chip>
                      )}
                      
                      {/* Action buttons */}
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
                        <Button
                          size="sm"
                          variant="soft"
                          color={isPrimaryImage ? "neutral" : "primary"}
                          startDecorator={isPrimaryImage ? <StarOff size={14} /> : <Star size={14} />}
                          onClick={() => {
                            if (isPrimaryImage) return;
                            if (mode === "add") {
                              handleSetPendingPrimary(image.id);
                            } else {
                              handleSetPrimary(image.id);
                            }
                          }}
                          disabled={isPrimaryImage || disabled}
                        >
                          {isPrimaryImage ? "Primary" : "Set Primary"}
                        </Button>
                        
                        <IconButton
                          size="sm"
                          variant="soft"
                          color="danger"
                          onClick={() => {
                            if (mode === "add") {
                              handleDeletePendingImage(image.id);
                            } else {
                              handleDeleteImage(image.id, (image as TouristSpotImage).file_url);
                            }
                          }}
                          disabled={disabled}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      )}

      <Alert
        open={alertConfig.open}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
      />
    </Box>
  );
};

export default TouristSpotImageManager;
