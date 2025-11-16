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
import Alert from "@/src/components/Alert";

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

  React.useEffect(() => {
    setDescription(initialDescription);
  }, [initialDescription, open]);

  const handleSave = async () => {
    if (roomId) {
      try {
        await updateData(roomId, { description }, "room");
        
        setAlertConfig({
          open: true,
          type: "success",
          title: "Description Updated",
          message: "Room description has been successfully updated.",
        });
        
        onSave(description);
        
        setTimeout(() => {
          onClose();
          if (onUpdate) onUpdate();
        }, 1500);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update description";
        
        setAlertConfig({
          open: true,
          type: "error",
          title: "Update Failed",
          message: errorMessage,
        });
        
        console.error("Failed to update room description", err);
      }
    } else {
      onSave(description);
      onClose();
    }
  };

  return (
    <>
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

export default EditDescriptionModal;
