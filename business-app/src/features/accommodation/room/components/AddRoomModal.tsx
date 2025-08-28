import * as React from "react";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Select,
  Option,
  FormControl,
  FormLabel,
  Stack,
  Textarea,
  Grid,
} from "@mui/joy";
import placeholderImage from "@/src/assets/images/placeholder-image.png";
import type { Room } from "@/src/types/Business";
import { useBusiness } from "@/src/context/BusinessContext";
import CardHeader from "@/src/components/CardHeader";
import { insertData } from "@/src/api_function";
import { data } from "react-router-dom";
import { supabase } from "@/src/utils/supabase";
import { UploadIcon } from "lucide-react";
interface AddRoomModalProps {
  open: boolean;
  onClose: () => void;
  onRoomAdded?: () => void;
}

export default function AddRoomModal({
  open,
  onClose,
  onRoomAdded,
}: AddRoomModalProps) {
  const { businessDetails } = useBusiness();
  const [roomImage, setRoomImage] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // Handle file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRoomImage(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setRoomData((prev) => ({
        ...prev,
        room_image: preview,
      }));
    }
  };

  const [roomData, setRoomData] = React.useState<Room>({
    id: "",
    room_number: "",
    room_type: "",
    capacity: "",
    room_price: "",
    description: "",
    business_id: businessDetails?.id ?? "",
    status: "Available",
    room_image: "",
    floor: "",
  });

  // Upload immediately after selecting an image
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set preview for UI
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    try {
      // Create a unique file name
      const fileExt = file.name.split(".").pop();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const safeRoomNumber = roomData.room_number
        ? roomData.room_number.replace(/\s+/g, "_")
        : "room";
      const fileName = `${safeRoomNumber}_${timestamp}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("room-profile")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;
      if (!uploadData?.path) throw new Error("Upload failed: no file path");

      // Get public URL
      const { data: publicData } = supabase.storage
        .from("room-profile")
        .getPublicUrl(uploadData.path);

      if (!publicData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Save to state
      setRoomData((prev) => ({ ...prev, room_image: publicData.publicUrl }));
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(err?.message || "Upload failed");
    }
  };

  const handleSave = async () => {
    const payload = {
      ...roomData,
      business_id: businessDetails?.id ?? null, // ensure valid FK
    };

    const response = await insertData(payload, "room");
    if (response.error) {
      alert(`Error: ${response.error}`);
      return;
    }

    // Reset form
    setRoomData({
      id: "",
      room_number: "",
      room_type: "",
      capacity: "",
      room_price: "",
      description: "",
      business_id: businessDetails?.id ?? "", // keep it
      status: "Available",
      room_image: "",
      floor: "",
    });

    setPreviewUrl(null);
    if (onRoomAdded) onRoomAdded();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        size="md"
        minWidth={600}
        maxWidth={600}
        variant="outlined"
        role="dialog"
      >
        <CardHeader title="Add New Room" color="white" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid sx={{ paddingLeft: "0" }} xs={6}>
                <FormControl required>
                  <FormLabel>Room Number</FormLabel>
                  <Input
                    size="md"
                    placeholder="Enter room number"
                    value={roomData.room_number}
                    onChange={(e) =>
                      setRoomData({ ...roomData, room_number: e.target.value })
                    }
                  />
                </FormControl>
              </Grid>

              <Grid sx={{ paddingRight: "0" }} xs={6}>
                <FormControl required>
                  <FormLabel>Floor</FormLabel>
                  <Input
                    size="md"
                    placeholder="Enter floor"
                    value={roomData.floor}
                    onChange={(e) =>
                      setRoomData({ ...roomData, floor: e.target.value })
                    }
                  />
                </FormControl>
              </Grid>
            </Grid>

            {/* Room Type */}
            <FormControl required>
              <FormLabel>Room Type</FormLabel>
              <Select
                size="md"
                value={roomData.room_type}
                onChange={(_, value) =>
                  setRoomData({ ...roomData, room_type: value || "" })
                }
              >
                <Option value="Single">Single</Option>
                <Option value="Double">Double</Option>
                <Option value="Suite">Suite</Option>
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid xs={6}>
                <FormControl>
                  <FormLabel>Capacity</FormLabel>
                  <Input
                    size="md"
                    type="number"
                    placeholder="e.g. 2"
                    value={roomData.capacity}
                    onChange={(e) =>
                      setRoomData({ ...roomData, capacity: e.target.value })
                    }
                  />
                </FormControl>
              </Grid>

              <Grid xs={6}>
                <FormControl required>
                  <FormLabel>Price per Night</FormLabel>
                  <Input
                    type="number"
                    size="md"
                    placeholder="e.g. 1500"
                    value={roomData.room_price}
                    onChange={(e) =>
                      setRoomData({ ...roomData, room_price: e.target.value })
                    }
                  />
                </FormControl>
              </Grid>
            </Grid>

            {/* Description */}
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                size="md"
                minRows={3}
                placeholder="Optional description"
                value={roomData.description}
                onChange={(e) =>
                  setRoomData({ ...roomData, description: e.target.value })
                }
              />
            </FormControl>

            {/* Room Image */}
            <FormControl sx={{ alignItems: "center", gap: 2 }}>
              <FormLabel>Room Image</FormLabel>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  width: "160px",
                  height: "160px",
                  borderStyle: "dashed",
                  borderWidth: "1px",
                  borderColor: "grey.400",
                  borderRadius: "8px",
                }}
              >
                  <img
                    src={previewUrl || placeholderImage}
                    alt="Room Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
              </div>

              <Button
                size="md"
                variant="outlined"
                color="primary"
                startDecorator={<UploadIcon />}
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                Upload Photo
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{
                  display: "none",
                }}
              />
            </FormControl>

            {/* Actions */}
            <DialogActions>
              <Button variant="plain" color="neutral" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Save
              </Button>
            </DialogActions>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}
