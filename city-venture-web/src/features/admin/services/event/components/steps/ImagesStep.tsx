import React from "react";
import { Stack, Typography } from "@mui/joy";
import EventImageManager, { type PendingEventImage } from "../EventImageManager";

interface ImagesStepProps {
  mode: "add" | "edit";
  eventId?: string;
  pendingImages?: PendingEventImage[];
  onPendingImagesChange?: (images: PendingEventImage[]) => void;
  initialEventName?: string;
}

const ImagesStep: React.FC<ImagesStepProps> = ({
  mode,
  eventId,
  pendingImages,
  onPendingImagesChange,
  initialEventName,
}) => {
  return (
    <Stack spacing={2}>
      <Typography level="h4">Event Images</Typography>
      <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
        Upload photos to showcase your event. The first image will be set as the primary image.
      </Typography>
      <EventImageManager 
        eventId={eventId}
        mode={mode}
        pendingImages={pendingImages}
        onPendingImagesChange={onPendingImagesChange}
        initialEventName={initialEventName}
      />
    </Stack>
  );
};

export default ImagesStep;
