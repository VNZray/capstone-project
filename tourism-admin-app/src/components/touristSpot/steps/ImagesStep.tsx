import React from "react";
import {
  Stack,
  Typography,
} from "@mui/joy";
import TouristSpotImageManager from "../TouristSpotImageManager";

interface ImagesStepProps {
  mode: "add" | "edit";
  touristSpotId?: string;
}

const ImagesStep: React.FC<ImagesStepProps> = ({
  mode,
  touristSpotId,
}) => {
  return (
    <Stack spacing={3}>
      <Typography level="h4">Images</Typography>
      {mode === "edit" && touristSpotId ? (
        <TouristSpotImageManager touristSpotId={touristSpotId} />
      ) : (
        <Stack spacing={2} sx={{ textAlign: 'center', py: 6 }}>
          <Typography level="body-lg" sx={{ color: 'text.tertiary' }}>
            📷 Image Upload
          </Typography>
          <Typography level="body-md" sx={{ color: 'text.secondary' }}>
            Save the tourist spot first to upload images
          </Typography>
          <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
            You can add images after creating the tourist spot by editing it
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

export default ImagesStep;
