import * as React from "react";
import {
  Modal,
  ModalDialog,
  DialogContent,
  DialogActions,
  Button,
  Textarea,
} from "@mui/joy";
import { updateData } from "@/src/services/Service";
import Typography from "@/src/components/Typography";

interface EditDescriptionModalProps {
  open: boolean;
  initialDescription?: string;
  roomId?: string;
  onClose: () => void;
  onSave: (description: string) => void;
  onUpdate?: () => void;
}

const EditDescriptionModal: React.FC<EditDescriptionModalProps> = ({
  open,
  initialDescription = "",
  roomId,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [description, setDescription] = React.useState(initialDescription);

  React.useEffect(() => {
    setDescription(initialDescription);
  }, [initialDescription, open]);

  const handleSave = async () => {
    if (roomId) {
      try {
        await updateData(roomId, { description }, "room");
        onSave(description);
      } catch (err) {
        // Optionally handle error
        console.error("Failed to update room description", err);
      }
    } else {
      onSave(description);
    }
    if (onUpdate) onUpdate();

    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" variant="outlined" maxWidth={600} minWidth={600}>
        <Typography.CardTitle>Edit Room Description</Typography.CardTitle>
        <DialogContent>
          <Textarea
            minRows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter room description..."
            size="md"
          />
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

export default EditDescriptionModal;
