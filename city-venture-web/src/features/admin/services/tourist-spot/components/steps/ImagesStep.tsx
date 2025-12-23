import React from "react";
import { Box } from "@mui/joy";
import TouristSpotImageManager from "../TouristSpotImageManager";
import type { PendingImage } from "@/src/types/TouristSpot";

interface ImagesStepProps {
  mode: "add" | "edit";
  touristSpotId?: string;
  pendingImages?: PendingImage[];
  onPendingImagesChange?: (images: PendingImage[]) => void;
  initialSpotName?: string;
}

const ImagesStep: React.FC<ImagesStepProps> = ({
  mode,
  touristSpotId,
  pendingImages,
  onPendingImagesChange,
  initialSpotName,
}) => {
  return (
    <Box>
      <TouristSpotImageManager
        touristSpotId={touristSpotId}
        mode={mode}
        pendingImages={pendingImages}
        onPendingImagesChange={onPendingImagesChange}
        initialSpotName={initialSpotName}
      />
    </Box>
  );
};

export default ImagesStep;
