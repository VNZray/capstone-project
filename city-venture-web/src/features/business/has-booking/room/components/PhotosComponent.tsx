import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import { Paper, Checkbox } from "@mui/material";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/joy";
import Container from "@/src/components/Container";
import Button from "@/src/components/Button";
import Typography from "@/src/components/Typography";
import NoDataFound from "@/src/components/NoDataFound";
import { Upload, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRoom } from "@/src/context/RoomContext";
import { getData, insertData, deleteData } from "@/src/services/Service";
import { uploadFile } from "@/src/services/upload/FileUploadService";

interface RoomPhoto {
  id: string;
  room_id: string;
  file_url: string;
  file_format: string;
  file_size: number;
  uploaded_at: string;
}

export default function PhotosComponent() {
  const { roomDetails } = useRoom();
  const [photos, setPhotos] = useState<RoomPhoto[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch room photos
  const fetchRoomPhotos = async () => {
    if (!roomDetails?.id) return;

    try {
      setIsLoading(true);
      const response = await getData(`room-photos/room/${roomDetails.id}`);

      if (Array.isArray(response)) {
        setPhotos(response);
      }
    } catch (error) {
      console.error("Error fetching room photos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomPhotos();
  }, [roomDetails?.id]);

  // Handle batch file upload
  const handleBatchUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !roomDetails?.id) return;

    try {
      setIsUploading(true);
      setTotalFiles(files.length);
      setUploadProgress(0);

      const uploadPromises = Array.from(files).map(async (file, index) => {
        // Upload to Supabase using existing utility
        const uploadResult = await uploadFile(file, {
          folderName: `rooms/${roomDetails.id}/photos`,
          uploadTo: "business-profile",
          storeLocally: true,
        });

        if (!uploadResult.success || !uploadResult.publicUrl) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        // Extract file format
        const fileFormat = file.name.split(".").pop() || "jpg";

        // Save to database
        const photoData = {
          room_id: roomDetails.id,
          file_url: uploadResult.publicUrl,
          file_format: fileFormat,
          file_size: file.size,
        };

        await insertData(photoData, "room-photos");

        // Update progress
        setUploadProgress(Math.round(((index + 1) / files.length) * 100));
      });

      await Promise.all(uploadPromises);
      await fetchRoomPhotos();
      setUploadModalOpen(false);
      alert(`Successfully uploaded ${files.length} photo(s)!`);
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Failed to upload some photos. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setTotalFiles(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Toggle photo selection
  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  // Select all photos
  const selectAllPhotos = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map((photo) => photo.id)));
    }
  };

  // Handle batch delete
  const handleBatchDelete = async () => {
    if (selectedPhotos.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedPhotos.size} photo(s)? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);

      const deletePromises = Array.from(selectedPhotos).map((photoId) =>
        deleteData(photoId, "room-photos")
      );

      await Promise.all(deletePromises);
      await fetchRoomPhotos();
      setSelectedPhotos(new Set());
      setIsEditMode(false);
      alert(`Successfully deleted ${deletePromises.length} photo(s)!`);
    } catch (error) {
      console.error("Error deleting photos:", error);
      alert("Failed to delete some photos. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel edit mode
  const cancelEditMode = () => {
    setIsEditMode(false);
    setSelectedPhotos(new Set());
  };

  return (
    <>
      <Paper
        elevation={0}
        style={{
          padding: "0 20px",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Container
          padding="0"
          direction="row"
          align="center"
          justify="space-between"
        >
          <Typography.CardTitle>Room Photos</Typography.CardTitle>

          <Container padding="0" direction="row" gap="12px">
            {isEditMode ? (
              <>
                <Button
                  colorScheme="error"
                  variant="solid"
                  onClick={handleBatchDelete}
                  disabled={selectedPhotos.size === 0 || isLoading}
                >
                  <Trash2 size={18} style={{ marginRight: "8px" }} />
                  Delete ({selectedPhotos.size})
                </Button>
                <Button
                  colorScheme="secondary"
                  variant="outlined"
                  onClick={cancelEditMode}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  colorScheme="primary"
                  variant="outlined"
                  onClick={() => setUploadModalOpen(true)}
                  disabled={isUploading}
                >
                  <Upload size={18} style={{ marginRight: "8px" }} />
                  Upload Photos
                </Button>
                {photos.length > 0 && (
                  <Button
                    colorScheme="secondary"
                    variant="outlined"
                    onClick={() => setIsEditMode(true)}
                  >
                    Select
                  </Button>
                )}
              </>
            )}
          </Container>
        </Container>

        {isLoading ? (
          <Container padding="40px" align="center">
            <Typography.Body>Loading photos...</Typography.Body>
          </Container>
        ) : photos.length === 0 ? (
          <NoDataFound
            title="No photos yet"
            message="Upload photos to showcase this room"
            icon="file"
            size="medium"
          >
            <Button
              colorScheme="primary"
              variant="solid"
              onClick={() => setUploadModalOpen(true)}
              style={{ marginTop: "16px" }}
            >
              <Upload size={18} style={{ marginRight: "8px" }} />
              Upload First Photos
            </Button>
          </NoDataFound>
        ) : (
          <>
            {isEditMode && (
              <Container
                padding="12px 0"
                direction="row"
                align="center"
                gap="12px"
              >
                <Button
                  colorScheme="secondary"
                  variant="outlined"
                  onClick={selectAllPhotos}
                  style={{ fontSize: "14px" }}
                >
                  {selectedPhotos.size === photos.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                <Typography.Body>
                  {selectedPhotos.size} of {photos.length} selected
                </Typography.Body>
              </Container>
            )}

            <ImageList cols={4} gap={12} style={{ marginTop: "16px" }}>
              {photos.map((photo) => (
                <ImageListItem
                  key={photo.id}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "8px",
                    cursor: isEditMode ? "pointer" : "default",
                    border: selectedPhotos.has(photo.id)
                      ? "4px solid #1976d2"
                      : "2px solid transparent",
                    transition: "all 0.2s ease",
                    transform: selectedPhotos.has(photo.id)
                      ? "scale(0.95)"
                      : "scale(1)",
                    opacity:
                      isEditMode && !selectedPhotos.has(photo.id) ? 0.7 : 1,
                  }}
                  onClick={() => isEditMode && togglePhotoSelection(photo.id)}
                >
                  <img
                    style={{
                      borderRadius: "6px",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      userSelect: "none",
                    }}
                    src={photo.file_url}
                    alt={`Room photo ${photo.id}`}
                    loading="lazy"
                    draggable={false}
                  />

                  {/* Selection overlay */}
                  {isEditMode && (
                    <>
                      {/* Checkbox */}
                      <div
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          borderRadius: "6px",
                          padding: "2px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                          zIndex: 2,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePhotoSelection(photo.id);
                        }}
                      >
                        <Checkbox
                          checked={selectedPhotos.has(photo.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            togglePhotoSelection(photo.id);
                          }}
                          sx={{
                            color: "#1976d2",
                            padding: "4px",
                            "&.Mui-checked": {
                              color: "#1976d2",
                            },
                          }}
                        />
                      </div>

                      {/* Selected indicator overlay */}
                      {selectedPhotos.has(photo.id) && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(25, 118, 210, 0.15)",
                            borderRadius: "6px",
                            pointerEvents: "none",
                            zIndex: 1,
                          }}
                        />
                      )}
                    </>
                  )}
                </ImageListItem>
              ))}
            </ImageList>
          </>
        )}
      </Paper>

      {/* Upload Photo Modal */}
      <Modal
        open={uploadModalOpen}
        onClose={() => !isUploading && setUploadModalOpen(false)}
      >
        <ModalDialog
          size="lg"
          sx={{
            maxWidth: 600,
            borderRadius: "12px",
          }}
        >
          <DialogTitle>
            <Typography.CardTitle>Upload Room Photos</Typography.CardTitle>
          </DialogTitle>

          <DialogContent>
            <Container padding="0" gap="16px">
              <Typography.Body>
                Select multiple photos for Room {roomDetails?.room_number}
              </Typography.Body>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleBatchUpload}
                style={{ display: "none" }}
              />

              {/* Upload area */}
              <Container
                padding="40px"
                align="center"
                gap="16px"
                style={{
                  border: "2px dashed #e0e0e0",
                  borderRadius: "8px",
                  cursor: isUploading ? "not-allowed" : "pointer",
                  backgroundColor: "#f9f9f9",
                }}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <>
                    <CircularProgress
                      determinate
                      value={uploadProgress}
                      size="lg"
                      color="primary"
                    />
                    <Typography.Body>
                      Uploading {uploadProgress}%
                    </Typography.Body>
                    <Typography.Body>
                      {uploadProgress === 0
                        ? `Preparing to upload ${totalFiles} file(s)...`
                        : `Processing ${Math.ceil(
                            (uploadProgress / 100) * totalFiles
                          )} of ${totalFiles}`}
                    </Typography.Body>
                  </>
                ) : (
                  <>
                    <Upload size={48} style={{ color: "#1976d2" }} />
                    <Typography.Body>Click to select photos</Typography.Body>
                    <Typography.Body>
                      You can select multiple images at once
                    </Typography.Body>
                    <Typography.Body>
                      PNG, JPG, GIF up to 5MB each
                    </Typography.Body>
                  </>
                )}
              </Container>
            </Container>
          </DialogContent>

          <DialogActions>
            <Button
              colorScheme="secondary"
              variant="outlined"
              onClick={() => setUploadModalOpen(false)}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Cancel"}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* CSS for hover effect */}
      <style>{`
        .MuiImageListItem-root:hover .photo-delete-btn {
          opacity: 1;
        }
      `}</style>
    </>
  );
}
