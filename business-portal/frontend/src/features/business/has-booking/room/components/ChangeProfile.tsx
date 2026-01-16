import React, { useState } from "react";
import { FormControl, FormLabel, Stack } from "@mui/joy";
import { X } from "lucide-react";
import ImageUpload from "@/src/components/ImageUpload";
import { useRoom } from "@/src/context/RoomContext";
import { updateData } from "@/src/services/Service";
import { useBusiness } from "@/src/context/BusinessContext";
import BaseEditModal from "@/src/components/BaseEditModal";
import Typography from "@/src/components/Typography";

export interface ChangeProfileProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

/**
 * Modal for changing the room profile image
 * Allows users to upload and update the main room image
 */
const ChangeProfile: React.FC<ChangeProfileProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
}) => {
  const { roomDetails } = useRoom();
  const { businessDetails } = useBusiness();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = async (publicUrl: string) => {
    try {
      if (!roomDetails?.id) {
        const errorMsg = "Room ID not found";
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      setIsUploading(true);
      setError(null);

      // Update room image in database
      await updateData(
        roomDetails.id as string,
        { room_image: publicUrl },
        "room"
      );

      // Trigger success callback
      if (onSuccess) {
        onSuccess(`Room ${roomDetails.room_number} profile image updated successfully!`);
      }

      // Close modal
      onClose();

      // Reload page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update room profile";
      setError(errorMessage);
      if (onError) onError(errorMessage);
      console.error("Profile update error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    if (onError) onError(errorMsg);
  };

  return (
    <BaseEditModal
      open={open}
      onClose={onClose}
      title="Change Room Profile"
      description="Upload a new profile image for this room"
      maxWidth={500}
      actions={[
        {
          label: "Cancel",
          onClick: onClose,
          variant: "secondary",
          disabled: isUploading,
        },
      ]}
    >
      <Stack spacing={2}>
            {/* Current Image Preview */}
            {roomDetails?.room_image && (
              <FormControl>
                <FormLabel>Current Profile Image</FormLabel>
                <div
                  style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={roomDetails.room_image}
                    alt="Current room profile"
                    style={{
                      width: "100%",
                      height: "250px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </FormControl>
            )}

            {/* Image Upload Component */}
            <FormControl>
              <FormLabel>Upload New Profile Image</FormLabel>
              <ImageUpload
                folderName={businessDetails?.business_name || "room-profile"}
                uploadTo="room-profile"
                placeholder="Click to upload new profile image"
                maxSizeMB={5}
                storeLocally={true}
                onUploadComplete={handleUploadComplete}
                onError={handleError}
              />
            </FormControl>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  backgroundColor: "#ffebee",
                  padding: "12px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <X size={18} color="#c62828" />
                <Typography.Body size="sm" color="error">
                  {error}
                </Typography.Body>
              </div>
            )}

            {/* Info Message */}
            <Typography.Body size="sm" sx={{ opacity: 0.7 }}>
              💡 Recommended image size: 1200x800px or higher. Maximum file
              size: 5MB.
            </Typography.Body>
          </Stack>
    </BaseEditModal>
  );
};

export default ChangeProfile;
