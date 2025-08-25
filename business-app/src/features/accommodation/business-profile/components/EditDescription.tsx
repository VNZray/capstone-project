import * as React from "react";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Textarea,
} from "@mui/joy";
import { updateData } from "@/src/api_function";
import CardHeader from "@/src/components/CardHeader";

interface EditDescriptionModalProps {
  open: boolean;
  initialDescription?: string;
  businessId?: string;
  onClose: () => void;
  onSave: (description: string) => void;
  onUpdate?: () => void;
}

const EditDescriptionModal: React.FC<EditDescriptionModalProps> = ({
  open,
  initialDescription = "",
  businessId,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [description, setDescription] = React.useState(initialDescription);

  React.useEffect(() => {
    setDescription(initialDescription);
  }, [initialDescription, open]);

  const handleSave = async () => {
    if (businessId) {
      try {
        await updateData(businessId, { description }, "business");
        onSave(description);
      } catch (err) {
        // Optionally handle error
        console.error("Failed to update business description", err);
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
        <CardHeader title="Edit Description" color="white" />
        <DialogContent>
          <Textarea
            minRows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter business description..."
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
