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
} from "@mui/joy";
import type { Room } from "@/src/types/Business";
import { useBusiness } from "@/src/context/BusinessContext";
interface AddRoomModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddRoomModal({ open, onClose }: AddRoomModalProps) {
  const { businessDetails } = useBusiness();
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
  });

  const handleSave = () => {
    if (!roomData.room_number || !roomData.room_price) return;

    alert(`New Room: ${JSON.stringify(roomData, null, 2)}`);
    console.log("New Room:", roomData);

    // Reset form
    setRoomData({
      id: "",
      room_number: "",
      room_type: "",
      capacity: "",
      room_price: "",
      description: "",
      business_id: "",
      status: "Available",
      room_image: "",
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        size="lg"
        minWidth={600}
        maxWidth={600}
        variant="outlined"
        role="dialog"
      >
        <DialogTitle>Add New Room</DialogTitle>
        <DialogContent>
          Fill in the details below to add a new room.
        </DialogContent>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <Stack spacing={2}>
            {/* Room Number */}
            <FormControl required>
              <FormLabel>Room Number</FormLabel>
              <Input
                size="lg"
                placeholder="Enter room number"
                value={roomData.room_number}
                onChange={(e) =>
                  setRoomData({ ...roomData, room_number: e.target.value })
                }
              />
            </FormControl>

            {/* Room Type */}
            <FormControl>
              <FormLabel>Room Type</FormLabel>
              <Select
                size="lg"
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

            {/* Capacity */}
            <FormControl>
              <FormLabel>Capacity</FormLabel>
              <Input
                size="lg"
                type="number"
                placeholder="e.g. 2"
                value={roomData.capacity}
                onChange={(e) =>
                  setRoomData({ ...roomData, capacity: e.target.value })
                }
              />
            </FormControl>

            {/* Price */}
            <FormControl required>
              <FormLabel>Price per Night</FormLabel>
              <Input
                type="number"
                size="lg"
                placeholder="e.g. 1500"
                value={roomData.room_price}
                onChange={(e) =>
                  setRoomData({ ...roomData, room_price: e.target.value })
                }
              />
            </FormControl>

            {/* Description */}
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                size="lg"
                minRows={3}
                placeholder="Optional description"
                value={roomData.description}
                onChange={(e) =>
                  setRoomData({ ...roomData, description: e.target.value })
                }
              />
            </FormControl>

            {/* Status */}
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select
                size="lg"
                value={roomData.status}
                onChange={(_, value) =>
                  setRoomData({ ...roomData, status: value || "Available" })
                }
              >
                <Option value="Available">Available</Option>
                <Option value="Checked-in">Checked-in</Option>
                <Option value="Cancelled">Cancelled</Option>
                <Option value="Maintenance">Maintenance</Option>
              </Select>
            </FormControl>

            {/* Room Image */}
            <FormControl>
              <FormLabel>Room Image</FormLabel>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setRoomData({
                    ...roomData,
                    room_image: e.target.files?.[0]?.name || "",
                  })
                }
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
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
