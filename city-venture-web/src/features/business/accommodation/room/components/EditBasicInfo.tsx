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
  Autocomplete,
  FormHelperText,
  Alert as JoyAlert,
} from "@mui/joy";
import { updateData, getData } from "@/src/services/Service";
import Typography from "@/src/components/Typography";
import Alert from "@/src/components/Alert";
import type { Room } from "@/src/types/Business";

interface EditDescriptionModalProps {
  open: boolean;
  initialRoomNumber?: string;
  initialRoomType?: string;
  initialFloor?: string;
  initialCapacity?: string;
  initialPrice?: string;
  initialStatus?: string;

  roomId?: string;
  businessId?: string;
  onClose: () => void;
  onSave: (
    room_number: string,
    room_type: string,
    floor: string,
    capacity: string,
    room_price: string,
    status?: string
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
  initialStatus = "",
  roomId,
  businessId,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [room_number, setRoomNumber] = React.useState(initialRoomNumber);
  const [room_type, setRoomType] = React.useState(initialRoomType);
  const [floor, setFloor] = React.useState(initialFloor);
  const [capacity, setCapacity] = React.useState(initialCapacity);
  const [room_price, setPrice] = React.useState(initialPrice);
  const [status, setStatus] = React.useState(initialStatus);
  const [error, setError] = React.useState("");
  const [existingRoomNumbers, setExistingRoomNumbers] = React.useState<
    string[]
  >([]);
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

  // Fetch existing room numbers for this business (excluding current room)
  const fetchExistingRoomNumbers = async () => {
    if (!businessId) return;
    const rooms = await getData("room");
    if (rooms) {
      const businessRooms = (rooms as Room[]).filter(
        (room: Room) =>
          room.business_id === businessId && room.id !== roomId
      );
      setExistingRoomNumbers(
        businessRooms.map((room: Room) =>
          (room.room_number || "").trim().toLowerCase()
        )
      );
    }
  };

  React.useEffect(() => {
    setRoomNumber(initialRoomNumber);
    setRoomType(initialRoomType);
    setFloor(initialFloor);
    setCapacity(initialCapacity);
    setPrice(initialPrice);
    setStatus(initialStatus);
    if (open) {
      fetchExistingRoomNumbers();
      setError("");
    }
  }, [
    initialRoomNumber,
    initialRoomType,
    initialFloor,
    initialCapacity,
    initialPrice,
    initialStatus,
    open,
    businessId,
    roomId,
  ]);

  const handleSave = async () => {
    // Validate room number is not empty
    if (!room_number?.trim()) {
      setError("Room number is required");
      return;
    }

    // Check for duplicate room number within this business
    const roomNumberLower = (room_number || "").trim().toLowerCase();
    if (existingRoomNumbers.includes(roomNumberLower)) {
      setError(
        `Room number "${room_number}" already exists for this business`
      );
      return;
    }

    if (roomId) {
      try {
        const updatePayload = {
          room_number,
          room_type,
          floor,
          capacity,
          room_price,
          status,
        };
        await updateData(roomId, updatePayload, "room");
        
        // Show success alert
        setAlertConfig({
          open: true,
          type: "success",
          title: "Room Updated",
          message: `Room ${room_number} has been successfully updated with new information.`,
        });
        
        setError("");
        onSave(room_number, room_type, floor, capacity, room_price, status);
        
        // Close modal and reload after showing success
        setTimeout(() => {
          onClose();
          if (onUpdate) onUpdate();
        }, 1500);
        
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update room";
        
        let alertMessage = errorMessage;
        if (
          errorMessage.includes("Duplicate entry") ||
          errorMessage.includes("UNIQUE")
        ) {
          alertMessage = `Room number "${room_number}" already exists for this business. Please use a different room number.`;
        }
        
        setAlertConfig({
          open: true,
          type: "error",
          title: "Update Failed",
          message: alertMessage,
        });
        
        setError(alertMessage);
        return;
      }
    } else {
      onSave(room_number, room_type, floor, capacity, room_price, status);
      onClose();
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog size="lg" variant="outlined" maxWidth={500} minWidth={500}>
          <Typography.CardTitle>Edit Basic Information</Typography.CardTitle>
          <DialogContent>
            {error && (
              <JoyAlert color="danger" variant="soft">
                {error}
              </JoyAlert>
            )}
          <FormControl error={!!error && error.includes("Room number")}>
            <FormLabel>Room Number</FormLabel>
            <Input
              type="text"
              size="md"
              value={room_number}
              onChange={(e) => setRoomNumber(e.target.value)}
            />
            {error && error.includes("Room number") && (
              <FormHelperText>{error}</FormHelperText>
            )}
          </FormControl>
          <FormControl>
            <FormLabel>Room Type</FormLabel>
            <Autocomplete
              freeSolo
              placeholder="Select or type room type"
              options={roomTypeOptions}
              value={room_type || ""}
              onChange={(_, value) => setRoomType(value || "")}
              onInputChange={(_, value) => setRoomType(value || "")}
            />
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
          <FormControl>
            <FormLabel>Status</FormLabel>
            <Select
              size="md"
              value={status}
              onChange={(_, value) => setStatus(value || "Available")}
            >
              <Option value="Available">Available</Option>
              <Option value="Reserved">Reserved</Option>
              <Option value="Occupied">Occupied</Option>
              <Option value="Maintenance">Maintenance</Option>
            </Select>
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

export default EditBasicInfo;
