import * as React from "react";
import { Textarea } from "@mui/joy";
import { updateData } from "@/src/services/Service";
import BaseEditModal from "@/src/components/BaseEditModal";
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
      <BaseEditModal
        open={open}
        onClose={onClose}
        title="Edit Room Description"
        description="Update the room description to provide guests with detailed information"
        maxWidth={600}
        actions={[
          { label: "Cancel", onClick: onClose, variant: "secondary" },
          { label: "Save Changes", onClick: handleSave, variant: "primary" },
        ]}
      >
        <Textarea
          minRows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter room description..."
          size="md"
        />
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

export default EditDescriptionModal;
