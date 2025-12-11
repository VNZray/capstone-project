import * as React from "react";
import {
  FormLabel,
  FormControl,
  Autocomplete,
  Chip,
} from "@mui/joy";
import { deleteData, getData, insertData } from "@/src/services/Service";
import type { Amenity } from "@/src/types/Amenity";
import BaseEditModal from "@/src/components/BaseEditModal";
import Alert from "@/src/components/Alert";
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
  const [alertConfig, setAlertConfig] = React.useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

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

        setAlertConfig({
          open: true,
          type: "success",
          title: "Amenities Updated",
          message: `Successfully updated room amenities. ${selectedAmenities.length} amenities are now linked to this room.`,
        });

        onSave(selectedAmenities.map((a) => a.id).join(","));

        setTimeout(() => {
          onClose();
          if (onUpdate) onUpdate();
        }, 1500);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update amenities";

        setAlertConfig({
          open: true,
          type: "error",
          title: "Update Failed",
          message: errorMessage,
        });

        console.error("Failed to update room amenities", err);
      }
    } else {
      onSave(selectedAmenities.map((a) => a.id).join(","));
      onClose();
    }
  };

  return (
    <>
      <BaseEditModal
        open={open}
        onClose={onClose}
        title="Edit Room Amenities"
        description="Add or remove amenities for this room"
        maxWidth={600}
        actions={[
          { label: "Cancel", onClick: onClose, variant: "secondary" },
          { label: "Save Changes", onClick: handleSave, variant: "primary" },
        ]}
      >
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
                      (a) =>
                        a.name.toLowerCase() === newAmenityName.toLowerCase()
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
      </BaseEditModal>

      <Alert
        open={alertConfig.open}
        onClose={() => setAlertConfig((prev) => ({ ...prev, open: false }))}
        onConfirm={() => setAlertConfig((prev) => ({ ...prev, open: false }))}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText="OK"
        showCancel={false}
      />
    </>
  );
};

export default EditAmenitiesModal;
