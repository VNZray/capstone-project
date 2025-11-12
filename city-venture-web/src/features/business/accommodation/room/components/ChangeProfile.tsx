import React, { useState } from "react";
import {
  Modal,
  ModalDialog,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  Stack,
  Typography,
} from "@mui/joy";
import { X } from "lucide-react";
import ImageUpload from "@/src/components/ImageUpload";
import { useRoom } from "@/src/context/RoomContext";
import { updateData } from "@/src/services/Service";
import { useBusiness } from "@/src/context/BusinessContext";

export interface ChangeProfileProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal for changing the room profile image
 * Allows users to upload and update the main room image
 */
const ChangeProfile: React.FC<ChangeProfileProps> = ({
  open,
  onClose,
}) => {
  const { roomDetails } = useRoom();
  const { businessDetails } = useBusiness();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = async (publicUrl: string) => {
    try {
      if (!roomDetails?.id) {
        setError("Room ID not found");
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

      // Reload page to reflect changes
      window.location.reload();
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update room profile";
      setError(errorMessage);
      console.error("Profile update error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        size="md"
        minWidth={500}
        maxWidth={500}
        variant="outlined"
        role="dialog"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Typography level="h4" fontWeight={600}>
            Change Room Profile
          </Typography>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
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
                <Typography level="body-sm" color="danger">
                  {error}
                </Typography>
              </div>
            )}

            {/* Info Message */}
            <Typography level="body-sm" color="neutral">
              💡 Recommended image size: 1200x800px or higher. Maximum file
              size: 5MB.
            </Typography>

            {/* Actions */}
            <DialogActions>
              <Button
                variant="plain"
                color="neutral"
                onClick={onClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </DialogActions>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
};

export default ChangeProfile;
