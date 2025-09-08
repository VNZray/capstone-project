import React from "react";
import {
  Stack,
  Typography,
} from "@mui/joy";
import TouristSpotImageManager from "../TouristSpotImageManager";
import type { PendingImage } from "../../../types/TouristSpot";

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
    <Stack spacing={1}>
      <Typography level="h4">Images</Typography>
      <TouristSpotImageManager 
        touristSpotId={touristSpotId}
        mode={mode}
        pendingImages={pendingImages}
        onPendingImagesChange={onPendingImagesChange}
        initialSpotName={initialSpotName}
      />
    </Stack>
  );
};

export default ImagesStep;
