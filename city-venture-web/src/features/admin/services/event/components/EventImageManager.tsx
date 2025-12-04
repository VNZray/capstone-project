import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
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
import Button from "@/src/components/Button";
import { apiService } from "@/src/utils/api";
import { supabase } from "@/src/lib/supabase";
import type { EventImage } from "@/src/types/Event";

export interface PendingEventImage {
  id: string;
  file: File;
  preview: string;
  is_primary: boolean;
  alt_text?: string;
}

interface EventImageManagerProps {
  eventId?: string;
  onImagesChange?: (images: EventImage[]) => void;
  onPendingImagesChange?: (images: PendingEventImage[]) => void;
  pendingImages?: PendingEventImage[];
  disabled?: boolean;
  mode?: "add" | "edit";
  initialEventName?: string;
}

const EventImageManager: React.FC<EventImageManagerProps> = ({
  eventId,
  onImagesChange,
  onPendingImagesChange,
  pendingImages = [],
  disabled = false,
  mode = "edit",
  initialEventName,
}) => {
  const [images, setImages] = useState<EventImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Helper function to safely check if image is primary
  const isPrimary = (image: EventImage) => {
    return image.is_primary === true || (image.is_primary as unknown as number) === 1;
  };

  // Load images when eventId changes
  const loadImages = useCallback(async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      const imageList = await apiService.getEventImages(eventId);
      setImages(imageList || []);
      onImagesChange?.(imageList || []);
    } catch (error) {
      console.error("Failed to load images:", error);
    } finally {
      setLoading(false);
    }
  }, [eventId, onImagesChange]);

  useEffect(() => {
    if (eventId && mode === "edit") {
      loadImages();
    } else {
      setImages([]);
    }
  }, [eventId, loadImages, mode]);

  const uploadEventImage = async (
    eventId: string,
    file: File,
    isPrimary: boolean = false,
    altText?: string,
    eventFolderName?: string
  ) => {
    // Get folder name
    let folderName = eventFolderName;
    if (!folderName) {
      folderName = initialEventName 
        ? initialEventName.toLowerCase().replace(/[^a-z0-9]/g, '-')
        : `event-${eventId}`;
    }
    
    const fileExt = file.name.split('.').pop();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${timestamp}.${fileExt}`;
    const filePath = `${folderName}/imgs/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("event-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;
    if (!uploadData?.path) throw new Error("Upload failed: no file path");
    
    const { data: publicData } = supabase.storage
      .from("event-images")
      .getPublicUrl(uploadData.path);

    if (!publicData?.publicUrl) {
      throw new Error("Failed to get public URL");
    }

    const imageData = {
      file_url: publicData.publicUrl,
      file_name: fileName,
      file_format: fileExt || 'jpg',
      file_size: file.size,
      is_primary: isPrimary,
      alt_text: altText || undefined,
    };

    return await apiService.addEventImage(eventId, imageData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Image upload - Mode:", mode, "EventId:", eventId);

    // For add mode, store images temporarily
    if (mode === "add" || !eventId) {
      console.log("Using pending image mode (add mode)");
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const newPendingImage: PendingEventImage = {
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
    if (!eventId) {
      console.error("Cannot upload: eventId is required in edit mode");
      alert("Cannot upload image: Event ID is missing. Please save the event first.");
      return;
    }

    try {
      setUploading(true);
      const shouldBePrimary = images.length === 0;
      const folderName = initialEventName?.toLowerCase().replace(/[^a-z0-9]/g, '-');
      await uploadEventImage(eventId, file, shouldBePrimary, file.name, folderName);
      await loadImages();
    } catch (error: unknown) {
      console.error("Upload failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to upload image: ${errorMessage}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!eventId) return;
    
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      await apiService.deleteEventImage(imageId);
      await loadImages();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete image. Please try again.");
    }
  };

  const handleDeletePendingImage = (imageId: string) => {
    if (!window.confirm("Are you sure you want to remove this image?")) return;
    onPendingImagesChange?.(pendingImages.filter(img => img.id !== imageId));
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!eventId) return;

    try {
      await apiService.setPrimaryEventImage(imageId);
      await loadImages();
    } catch (error) {
      console.error("Set primary failed:", error);
      alert("Failed to set primary image. Please try again.");
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
        Event Images {mode === "add" && pendingImages.length > 0 && `(${pendingImages.length} pending)`}
      </Typography>
      
      {/* Upload Button */}
      <Button
        component="label"
        variant="outlined"
        colorScheme="primary"
        startDecorator={uploading ? <CircularProgress size="sm" /> : <UploadIcon size={16} />}
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
      {!loading && displayImages.length === 0 && (
        <Typography level="body-sm" sx={{ color: "text.tertiary", textAlign: "center", py: 4 }}>
          No images uploaded yet. Click "Upload Image" to add photos.
        </Typography>
      )}

      <Grid container spacing={2}>
        {mode === "add" ? (
          // Pending images (add mode)
          pendingImages.map((image) => (
            <Grid xs={6} sm={4} md={3} key={image.id}>
              <Card variant="outlined" sx={{ position: "relative" }}>
                <CardOverflow>
                  <AspectRatio ratio="4/3">
                    <img
                      src={image.preview}
                      alt={image.alt_text || "Event image"}
                      style={{ objectFit: "cover" }}
                    />
                  </AspectRatio>
                </CardOverflow>
                
                {/* Primary Badge */}
                {image.is_primary && (
                  <Chip
                    size="sm"
                    color="primary"
                    variant="solid"
                    sx={{ 
                      position: "absolute", 
                      top: 8, 
                      left: 8,
                      zIndex: 2
                    }}
                  >
                    Primary
                  </Chip>
                )}

                {/* Action Buttons */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                    gap: 0.5,
                    zIndex: 2,
                  }}
                >
                  <IconButton
                    size="sm"
                    variant="soft"
                    color={image.is_primary ? "warning" : "neutral"}
                    onClick={() => handleSetPendingPrimary(image.id)}
                    title={image.is_primary ? "Primary image" : "Set as primary"}
                  >
                    {image.is_primary ? <Star size={16} /> : <StarOff size={16} />}
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="soft"
                    color="danger"
                    onClick={() => handleDeletePendingImage(image.id)}
                    title="Remove image"
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))
        ) : (
          // Existing images (edit mode)
          images.map((image) => (
            <Grid xs={6} sm={4} md={3} key={image.id}>
              <Card variant="outlined" sx={{ position: "relative" }}>
                <CardOverflow>
                  <AspectRatio ratio="4/3">
                    <img
                      src={image.file_url}
                      alt={image.alt_text || "Event image"}
                      style={{ objectFit: "cover" }}
                    />
                  </AspectRatio>
                </CardOverflow>
                
                {/* Primary Badge */}
                {isPrimary(image) && (
                  <Chip
                    size="sm"
                    color="primary"
                    variant="solid"
                    sx={{ 
                      position: "absolute", 
                      top: 8, 
                      left: 8,
                      zIndex: 2
                    }}
                  >
                    Primary
                  </Chip>
                )}

                {/* Action Buttons */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                    gap: 0.5,
                    zIndex: 2,
                  }}
                >
                  {!isPrimary(image) && (
                    <IconButton
                      size="sm"
                      variant="soft"
                      color="neutral"
                      onClick={() => handleSetPrimary(image.id)}
                      title="Set as primary"
                    >
                      <StarOff size={16} />
                    </IconButton>
                  )}
                  {isPrimary(image) && (
                    <IconButton
                      size="sm"
                      variant="soft"
                      color="warning"
                      title="Primary image"
                    >
                      <Star size={16} />
                    </IconButton>
                  )}
                  <IconButton
                    size="sm"
                    variant="soft"
                    color="danger"
                    onClick={() => handleDeleteImage(image.id)}
                    title="Delete image"
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default EventImageManager;
