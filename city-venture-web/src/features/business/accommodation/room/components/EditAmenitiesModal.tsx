import * as React from "react";
import {
  Modal,
  ModalDialog,
  DialogContent,
  DialogActions,
  Button,
  FormLabel,
  FormControl,
  Autocomplete,
  Chip,
} from "@mui/joy";
import {
  deleteData,
  getData,
  insertData,
} from "@/src/services/Service";
import type { Amenity } from "@/src/types/Amenity";
import ResponsiveText from "@/src/components/ResponsiveText";
interface EditBusinessModalProps {
  open: boolean;
  roomId?: string;
  onClose: () => void;
  onSave: (amenity_id: string) => void;
  onUpdate?: () => void;
}

const EditAmenitiesModal: React.FC<EditBusinessModalProps> = ({
  open,
  roomId,
  onClose,
  onSave,
  onUpdate,
}) => {
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

  React.useEffect(() => {
    fetchAmenities();
  }, []);

  // Fetch amenities for the room and set selectedAmenities
  const fetchRoomAmenities = async () => {
    if (!roomId) return;

    const roomAmenityResponse = await getData("room-amenities");
    const amenityResponse = await getData("amenities");

    // All available amenities
    if (Array.isArray(amenityResponse)) {
      setAmenities(amenityResponse);
    }

    // Only those linked to this room
    const selected = Array.isArray(roomAmenityResponse)
      ? roomAmenityResponse
          .filter((ra) => ra.room_id === roomId)
          .map((ra) => {
            const match: Amenity | undefined = (
              amenityResponse as Amenity[]
            ).find((a: Amenity) => a.id === ra.amenity_id);
            return match ? match : null;
          })
          .filter((a): a is Amenity => !!a)
      : [];
    setSelectedAmenities(selected);
  };

  React.useEffect(() => {
    fetchRoomAmenities();
  }, [roomId]);

  const handleSave = async () => {
    if (roomId) {
      try {
        const roomAmenityResponse = await getData("room-amenities");
        if (Array.isArray(roomAmenityResponse)) {
          const toDelete = roomAmenityResponse.filter(
            (ba) => ba.room_id === roomId
          );
          for (const ba of toDelete) {
            await deleteData(ba.id, "room-amenities");
          }
        }
        // Add selected amenities
        for (const amenity of selectedAmenities) {
          await insertData(
            { room_id: roomId, amenity_id: amenity.id },
            "room-amenities"
          );
        }
        onSave(selectedAmenities.map((a) => a.id).join(","));
      } catch (err) {
        console.error("Failed to update room amenities", err);
      }
    } else {
      onSave(selectedAmenities.map((a) => a.id).join(","));
    }
    if (onUpdate) onUpdate();

    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" variant="outlined" maxWidth={600} minWidth={600}>
        <ResponsiveText type="title-small">Add New Room</ResponsiveText>
        <DialogContent>
          <FormControl>
            <FormLabel>Update Amenities</FormLabel>
            <Autocomplete
              size="lg"
              multiple
              freeSolo
              placeholder="Amenities"
              limitTags={6}
              options={amenities}
              value={selectedAmenities}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.name
              }
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <span key={option.id} style={{ margin: 2 }}>
                    <Chip
                      {...getTagProps({ index })}
                      color="primary"
                      variant="outlined"
                      size="lg"
                    >
                      {option.name}
                    </Chip>
                  </span>
                ))
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
                  addAmenity(newAmenityName);
                  await fetchAmenities();

                  // Find inserted amenity (assumes fetchAmenities updates amenities)
                  const inserted = amenities.find(
                    (a) => a.name.toLowerCase() === newAmenityName.toLowerCase()
                  );
                  if (inserted) {
                    setSelectedAmenities([
                      ...newValue
                        .slice(0, -1)
                        .filter(
                          (item): item is Amenity => typeof item !== "string"
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
        </DialogContent>
        <DialogActions>
          <Button fullWidth variant="plain" color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button fullWidth color="primary" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default EditAmenitiesModal;
