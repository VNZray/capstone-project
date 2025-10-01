import * as React from "react";
import BaseEditModal from '@/src/components/BaseEditModal';
import { updateData } from "@/src/services/Service";

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
    <BaseEditModal
      open={open}
      onClose={onClose}
      title="Edit Description"
      description="Update the business description"
      maxWidth={640}
      actions={[
        { label: 'Cancel', onClick: onClose },
        { label: 'Save', onClick: handleSave, variant: 'primary' },
      ]}
    >
      <div style={{ padding: '8px 0' }}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter business description..."
          rows={6}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            resize: 'vertical',
            boxSizing: 'border-box',
            fontFamily: 'inherit'
          }}
        />
      </div>
    </BaseEditModal>
  );
};

export default EditDescriptionModal;
