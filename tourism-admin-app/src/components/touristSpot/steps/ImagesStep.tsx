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
  onPendingImagesChange?: (images: PendingImage[]) => void;
}

const ImagesStep: React.FC<ImagesStepProps> = ({
  mode,
  touristSpotId,
  onPendingImagesChange,
}) => {
  return (
    <Stack spacing={3}>
      <Typography level="h4">Images</Typography>
      <TouristSpotImageManager 
        touristSpotId={touristSpotId}
        mode={mode}
        onPendingImagesChange={onPendingImagesChange}
      />
    </Stack>
  );
};

export default ImagesStep;
