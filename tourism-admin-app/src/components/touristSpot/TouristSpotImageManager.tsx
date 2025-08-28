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
import { 
  uploadTouristSpotImage, 
  getTouristSpotImages, 
  deleteTouristSpotImage, 
  setPrimaryTouristSpotImage 
} from "../../api_function";

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
  disabled?: boolean;
}

const TouristSpotImageManager: React.FC<TouristSpotImageManagerProps> = ({
  touristSpotId,
  onImagesChange,
  disabled = false,
}) => {
  const [images, setImages] = useState<TouristSpotImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Helper function to safely check if image is primary
  const isPrimary = (image: TouristSpotImage) => {
    // Handle both boolean and number (0/1) from database
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
    if (touristSpotId) {
      loadImages();
    } else {
      setImages([]);
    }
  }, [touristSpotId, loadImages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !touristSpotId) return;

    try {
      setUploading(true);
      const isPrimary = images.length === 0; // First image becomes primary
      await uploadTouristSpotImage(touristSpotId, file, isPrimary, file.name);
      await loadImages(); // Refresh the list
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleDeleteImage = async (imageId: string, fileUrl: string) => {
    if (!touristSpotId) return;
    
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      await deleteTouristSpotImage(touristSpotId, imageId, fileUrl);
      await loadImages(); // Refresh the list
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete image. Please try again.");
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!touristSpotId) return;

    try {
      await setPrimaryTouristSpotImage(touristSpotId, imageId);
      await loadImages(); // Refresh the list
    } catch (error) {
      console.error("Set primary failed:", error);
      alert("Failed to set primary image. Please try again.");
    }
  };

  if (!touristSpotId) {
    return (
      <Card variant="soft" sx={{ p: 3, textAlign: "center" }}>
        <Typography level="body-md" color="neutral">
          Save the tourist spot first to manage images
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Typography level="title-sm" sx={{ mb: 2 }}>
        Tourist Spot Images
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
          {images.length === 0 ? (
            <Grid xs={12}>
              <Card variant="soft" sx={{ p: 3, textAlign: "center" }}>
                <Typography level="body-md" color="neutral">
                  No images uploaded yet
                </Typography>
              </Card>
            </Grid>
          ) : (
            images.map((image) => (
              <Grid xs={6} sm={4} md={3} key={image.id}>
                <Card sx={{ maxWidth: 200 }}>
                  <CardOverflow>
                    <AspectRatio ratio="1">
                      <img
                        src={image.file_url}
                        alt={image.alt_text || "Tourist spot image"}
                        style={{ objectFit: "cover" }}
                      />
                    </AspectRatio>
                  </CardOverflow>
                  
                  <Box sx={{ p: 1 }}>
                    {/* Primary indicator */}
                    {isPrimary(image) && (
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
                        color={isPrimary(image) ? "neutral" : "primary"}
                        startDecorator={isPrimary(image) ? <StarOff size={14} /> : <Star size={14} />}
                        onClick={() => isPrimary(image) ? null : handleSetPrimary(image.id)}
                        disabled={isPrimary(image) || disabled}
                      >
                        {isPrimary(image) ? "Primary" : "Set Primary"}
                      </Button>
                      
                      <IconButton
                        size="sm"
                        variant="soft"
                        color="danger"
                        onClick={() => handleDeleteImage(image.id, image.file_url)}
                        disabled={disabled}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Box>
  );
};

export default TouristSpotImageManager;
