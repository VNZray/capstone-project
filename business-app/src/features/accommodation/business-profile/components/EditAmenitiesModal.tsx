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
import { deleteData, getData, insertData } from "@/src/services/Service";
import CardHeader from "@/src/components/CardHeader";
import type { Amenity } from "@/src/types/Amenity";
interface EditBusinessModalProps {
  open: boolean;
  businessId?: string;
  onClose: () => void;
  onSave: (amenity_id: string) => void;
  onUpdate?: () => void;
}

const EditAmenitiesModal: React.FC<EditBusinessModalProps> = ({
  open,
  businessId,
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

  // Fetch amenities for the business and set selectedAmenities
  const fetchBusinessAmenities = async () => {
    if (!businessId) return;

    const businessAmenityResponse = await getData("business-amenities");
    const amenityResponse = await getData("amenities");

    // All available amenities
    if (Array.isArray(amenityResponse)) {
      setAmenities(amenityResponse);
    }

    // Only those linked to this business
    const selected = Array.isArray(businessAmenityResponse)
      ? businessAmenityResponse
          .filter((ba) => ba.business_id === businessId)
          .map((ba) => {
            const match: Amenity | undefined = (
              amenityResponse as Amenity[]
            ).find((a: Amenity) => a.id === ba.amenity_id);
            return match ? match : null;
          })
          .filter((a): a is Amenity => !!a)
      : [];
    setSelectedAmenities(selected);
  };

  React.useEffect(() => {
    fetchBusinessAmenities();
  }, [businessId]);

  const handleSave = async () => {
    if (businessId) {
      try {
        const businessAmenityResponse = await getData("business-amenities");
        if (Array.isArray(businessAmenityResponse)) {
          const toDelete = businessAmenityResponse.filter(
            (ba) => ba.business_id === businessId
          );
          for (const ba of toDelete) {
            await deleteData(ba.id, "business-amenities");
          }
        }
        // Add selected amenities
        for (const amenity of selectedAmenities) {
          await insertData(
            { business_id: businessId, amenity_id: amenity.id },
            "business-amenities"
          );
        }
        onSave(selectedAmenities.map((a) => a.id).join(","));
      } catch (err) {
        console.error("Failed to update business amenities", err);
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
        <CardHeader title="Edit Business" color="white" />
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
