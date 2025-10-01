import * as React from "react";
import {
  Modal,
  ModalDialog,
  DialogContent,
  DialogActions,
  Button,
  Input,
  FormControl,
  FormLabel,
  Select,
  Option,
} from "@mui/joy";
import { updateData } from "@/src/services/Service";
import CardHeader from "@/src/components/CardHeader";

interface EditDescriptionModalProps {
  open: boolean;
  initialRoomNumber?: string;
  initialRoomType?: string;
  initialFloor?: string;
  initialCapacity?: string;
  initialPrice?: string;

  roomId?: string;
  onClose: () => void;
  onSave: (
    room_number: string,
    room_type: string,
    floor: string,
    capacity: string,
    room_price: string
  ) => void;
  onUpdate?: () => void;
}

const EditBasicInfo: React.FC<EditDescriptionModalProps> = ({
  open,
  initialRoomNumber = "",
  initialRoomType = "",
  initialFloor = "",
  initialCapacity = "",
  initialPrice = "",
  roomId,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [room_number, setRoomNumber] = React.useState(initialRoomNumber);
  const [room_type, setRoomType] = React.useState(initialRoomType);
  const [floor, setFloor] = React.useState(initialFloor);
  const [capacity, setCapacity] = React.useState(initialCapacity);
  const [room_price, setPrice] = React.useState(initialPrice);

  React.useEffect(() => {
    setRoomNumber(initialRoomNumber);
    setRoomType(initialRoomType);
    setFloor(initialFloor);
    setCapacity(initialCapacity);
    setPrice(initialPrice);
  }, [
    initialRoomNumber,
    initialRoomType,
    initialFloor,
    initialCapacity,
    initialPrice,
    open,
  ]);

  const handleSave = async () => {
    if (roomId) {
      try {
        await updateData(
          roomId,
          { room_number, room_type, floor, capacity, room_price },
          "room"
        );
        onSave(room_number, room_type, floor, capacity, room_price);
      } catch (err) {
        console.error("Failed to update business contact", err);
      }
    } else {
      onSave(room_number, room_type, floor, capacity, room_price);
    }

    if (onUpdate) onUpdate();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" variant="outlined" maxWidth={500} minWidth={500}>
        <CardHeader title="Edit Contact" color="white" />
        <DialogContent>
          <FormControl>
            <FormLabel>Room Number</FormLabel>
            <Input
              type="text"
              size="md"
              value={room_number}
              onChange={(e) => setRoomNumber(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Room Type</FormLabel>
            <Select
              size="md"
              value={room_type}
              onChange={(_, value) => setRoomType(value || "")}
            >
              <Option value="Single">Single</Option>
              <Option value="Double">Double</Option>
              <Option value="Suite">Suite</Option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Floor</FormLabel>
            <Input
              type="number"
              size="md"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Capacity</FormLabel>
            <Input
              type="number"
              size="md"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Price</FormLabel>
            <Input
              type="number"
              size="md"
              value={room_price}
              onChange={(e) => setPrice(e.target.value)}
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

export default EditBasicInfo;
