import { uploadTouristSpotImage } from "@/src/services/Service";
import type { PendingImage } from "../../types/TouristSpot";

/**
 * Uploads multiple pending images after a tourist spot is created
 * @param touristSpotId - The ID of the created tourist spot
 * @param pendingImages - Array of pending images to upload
 * @param categoryName - Optional category name for folder structure
 * @param touristSpotName - Optional tourist spot name for folder structure
 * @returns Promise that resolves when all images are uploaded
 */

export const uploadPendingImages = async (
  touristSpotId: string, 
  pendingImages: PendingImage[],
  categoryName?: string,
  touristSpotName?: string,
  spotFolderName?: string
): Promise<void> => {
  if (!pendingImages.length) return;

  const uploadPromises = pendingImages.map(async (pendingImage) => {
    try {
      await uploadTouristSpotImage(
        touristSpotId, 
        pendingImage.file, 
        pendingImage.is_primary, 
        pendingImage.alt_text,
        categoryName,
        touristSpotName,
        spotFolderName
      );
    } catch (error) {
      console.error(`Failed to upload image ${pendingImage.alt_text}:`, error);
      throw error;
    }
  });

  await Promise.all(uploadPromises);
};

/**
 * Creates a preview URL for a selected image file
 * @param file - The image file to create preview for
 * @returns Promise that resolves with the preview URL
 */

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validates if a file is a valid image
 * @param file - The file to validate
 * @returns boolean indicating if file is a valid image
 */

export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return false;
  }

  if (file.size > maxSize) {
    return false;
  }

  return true;
};

/**
 * Generates a unique ID for pending images
 * @returns string - Unique identifier
 */
export const generateImageId = (): string => {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
