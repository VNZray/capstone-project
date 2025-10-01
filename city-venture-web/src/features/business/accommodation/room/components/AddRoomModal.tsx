import * as React from "react";
import {
  Modal,
  ModalDialog,
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
  Autocomplete,
} from "@mui/joy";
import placeholderImage from "@/src/assets/images/placeholder-image.png";
import type { Room } from "@/src/types/Business";
import { useBusiness } from "@/src/context/BusinessContext";
import CardHeader from "@/src/components/CardHeader";
import { getData, insertData } from "@/src/services/Service";
import { supabase } from "@/src/lib/supabase";
import { UploadIcon } from "lucide-react";
import type { Amenity } from "@/src/types/Amenity";
import { useEffect } from "react";
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
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [amenities, setAmenities] = React.useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = React.useState<Amenity[]>(
    []
  );

  // get amenities
  const fetchAmenities = async () => {
    const response = await getData("amenities");
    if (response) {
      setAmenities(response);
    }
  };

  const addAmenity = (name: string) => {
    insertData({ name }, "amenities");
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

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

    const addAmenityPromises = selectedAmenities.map((amenity) => {
      return insertData(
        { room_id: response.id, amenity_id: amenity.id },
        "room-amenities"
      );
    });

    await Promise.all(addAmenityPromises);

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
      room_size: "",
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
              <Grid sx={{ paddingLeft: "0" }} xs={4}>
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

              <Grid xs={4}>
                <FormControl required>
                  <FormLabel>Floor</FormLabel>
                  <Input
                    size="md"
                    type="number"
                    placeholder="Enter floor"
                    value={roomData.floor}
                    onChange={(e) =>
                      setRoomData({
                        ...roomData,
                        floor: e.target.value,
                      })
                    }
                  />
                </FormControl>
              </Grid>

              <Grid sx={{ paddingRight: "0" }} xs={4}>
                <FormControl required>
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
            </Grid>

            <Grid container spacing={2}>
              <Grid sx={{ paddingLeft: "0" }} xs={6}>
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
              </Grid>

              <Grid sx={{ paddingRight: "0" }} xs={6}>
                <FormControl required>
                  <FormLabel>Room Size</FormLabel>
                  <Input
                    size="md"
                    type="number"
                    placeholder="e.g. 2 sqm(㎡)"
                    value={roomData.room_size}
                    onChange={(e) =>
                      setRoomData({ ...roomData, room_size: e.target.value })
                    }
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid sx={{ paddingLeft: "0" }} xs={6}>
                <FormControl id="multiple-limit-tags">
                  <FormLabel>Amenities</FormLabel>
                  <Autocomplete
                    multiple
                    freeSolo
                    placeholder="Amenities"
                    limitTags={1}
                    options={amenities}
                    value={selectedAmenities}
                    getOptionLabel={(option) =>
                      typeof option === "string" ? option : option.name
                    }
                    filterOptions={(options, state) => {
                      const inputValue = state.inputValue.trim().toLowerCase();
                      const filtered = options.filter(
                        (option) =>
                          typeof option !== "string" &&
                          option.name.toLowerCase().includes(inputValue)
                      );

                      // If user typed something not in list → add “Add …”
                      if (
                        inputValue !== "" &&
                        !options.some(
                          (opt) =>
                            typeof opt !== "string" &&
                            opt.name.toLowerCase() === inputValue
                        )
                      ) {
                        return [
                          ...filtered,
                          { id: -1, name: `Add "${state.inputValue}"` },
                        ];
                      }

                      return filtered;
                    }}
                    onChange={async (_, newValue) => {
                      const last = newValue[newValue.length - 1];

                      // User chose "Add ..."
                      if (last && typeof last !== "string" && last.id === -1) {
                        const newAmenityName = last.name
                          .replace(/^Add\s+"|"$/g, "")
                          .trim();
                        await addAmenity(newAmenityName);
                        await fetchAmenities();

                        // Find inserted amenity (assumes fetchAmenities updates amenities)
                        const inserted = amenities.find(
                          (a) =>
                            a.name.toLowerCase() ===
                            newAmenityName.toLowerCase()
                        );
                        if (inserted) {
                          setSelectedAmenities([
                            ...newValue
                              .slice(0, -1)
                              .filter(
                                (item): item is Amenity =>
                                  typeof item !== "string"
                              ),
                            inserted,
                          ]);
                        }
                      } else {
                        setSelectedAmenities(
                          newValue.filter(
                            (item): item is Amenity => typeof item !== "string"
                          )
                        );
                      }
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid sx={{ paddingRight: "0" }} xs={6}>
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
