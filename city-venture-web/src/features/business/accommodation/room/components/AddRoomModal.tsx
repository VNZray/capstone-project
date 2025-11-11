import * as React from "react";
import {
  Modal,
  ModalDialog,
  DialogActions,
  Button,
  Input,
  FormControl,
  FormLabel,
  Stack,
  Textarea,
  Grid,
  Autocomplete,
  FormHelperText,
  Alert,
} from "@mui/joy";
import type { Room } from "@/src/types/Business";
import { useBusiness } from "@/src/context/BusinessContext";
import { getData, insertData } from "@/src/services/Service";
import type { Amenity } from "@/src/types/Amenity";
import { useEffect } from "react";
import Typography from "@/src/components/Typography";
import ImageUpload from "@/src/components/ImageUpload";
interface AddRoomModalProps {
  business_name?: string;
  open: boolean;
  onClose: () => void;
  onRoomAdded?: () => void;
}

export default function AddRoomModal({
  open,
  onClose,
  onRoomAdded,
  business_name,
}: AddRoomModalProps) {
  const { businessDetails } = useBusiness();
  const [amenities, setAmenities] = React.useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = React.useState<Amenity[]>(
    []
  );
  const [existingRoomNumbers, setExistingRoomNumbers] = React.useState<
    string[]
  >([]);
  const [error, setError] = React.useState("");

  // Predefined room types
  const roomTypeOptions = [
    "Single",
    "Couple",
    "Family",
    "Deluxe",
    "Suite",
    "Twin",
    "Studio",
    "Penthouse",
    "Standard",
    "Premium",
    "Economy",
    "Luxury",
  ];

  // get amenities
  const fetchAmenities = async () => {
    const response = await getData("amenities");
    if (response) {
      setAmenities(response);
    }
  };

  // Fetch existing room numbers for this business
  const fetchExistingRoomNumbers = async () => {
    const rooms = await getData("room");
    if (rooms) {
      const businessRooms = rooms.filter(
        (room: Room) => room.business_id === businessDetails?.id
      );
      setExistingRoomNumbers(
        businessRooms.map((room: Room) =>
          (room.room_number || "").trim().toLowerCase()
        )
      );
    }
  };

  const addAmenity = (name: string) => {
    insertData({ name }, "amenities");
  };

  useEffect(() => {
    fetchAmenities();
    if (open) {
      fetchExistingRoomNumbers();
      setError("");
    }
  }, [open]);

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

  const handleSave = async () => {
    // Validate room number is not empty
    if (!roomData.room_number?.trim()) {
      setError("Room number is required");
      return;
    }

    // Check for duplicate room number within this business
    const roomNumberLower = (roomData.room_number || "").trim().toLowerCase();
    if (existingRoomNumbers.includes(roomNumberLower)) {
      setError(
        `Room number "${roomData.room_number}" already exists for this business`
      );
      return;
    }

    const payload = {
      ...roomData,
      business_id: businessDetails?.id ?? null, // ensure valid FK
    };

    const response = await insertData(payload, "room");
    if (response.error) {
      // Check if it's a unique constraint violation
      if (
        response.error.includes("Duplicate entry") ||
        response.error.includes("UNIQUE")
      ) {
        setError(
          `Room number "${roomData.room_number}" already exists for this business`
        );
      } else {
        setError(response.error);
      }
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
    setError("");

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
        <Typography.CardTitle>Add New Room</Typography.CardTitle>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <Stack spacing={2}>
            {error && (
              <Alert color="danger" variant="soft">
                {error}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid sx={{ paddingLeft: "0" }} xs={4}>
                <FormControl required error={!!error && error.includes("Room number")}>
                  <FormLabel>Room Number</FormLabel>
                  <Input
                    size="md"
                    placeholder="e.g. Room 1"
                    value={roomData.room_number}
                    onChange={(e) =>
                      setRoomData({ ...roomData, room_number: e.target.value })
                    }
                  />
                  {error && error.includes("Room number") && (
                    <FormHelperText>{error}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid xs={4}>
                <FormControl required>
                  <FormLabel>Floor</FormLabel>
                  <Input
                    size="md"
                    type="number"
                    placeholder="e.g. 1"
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
                  <Autocomplete
                    freeSolo
                    placeholder="Select or type room type"
                    options={roomTypeOptions}
                    value={roomData.room_type || ""}
                    onChange={(_, value) => {
                      setRoomData({ ...roomData, room_type: value || "" });
                    }}
                    onInputChange={(_, value) => {
                      setRoomData({ ...roomData, room_type: value || "" });
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid sx={{ paddingRight: "0" }} xs={6}>
                <FormControl required>
                  <FormLabel>Room Size</FormLabel>
                  <Input
                    size="md"
                    type="number"
                    placeholder="e.g. 2 m²"
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

            {/* Room Image Upload */}
            <FormControl>
              <FormLabel>Room Image</FormLabel>
              <ImageUpload
                folderName={business_name!}
                uploadTo="room-profile"
                placeholder="Click to upload room image"
                maxSizeMB={5}
                storeLocally={true}
                onUploadComplete={(publicUrl) => {
                  setRoomData((prev) => ({
                    ...prev,
                    room_image: publicUrl,
                  }));
                }}
                onError={(error) => {
                  console.error("Upload error:", error);
                  alert(`Upload failed: ${error}`);
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
