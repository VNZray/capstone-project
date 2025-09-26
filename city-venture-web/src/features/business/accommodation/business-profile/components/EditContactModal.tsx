import * as React from "react";
import { Input, FormControl, FormLabel } from "@mui/joy";
import { updateData } from "@/src/services/Service";
import BaseEditModal from '@/src/components/BaseEditModal';
import { Email, PhoneOutlined } from "@mui/icons-material";

interface EditDescriptionModalProps {
  open: boolean;
  initialEmail?: string;
  initialPhoneNumber?: string;
  businessId?: string;
  onClose: () => void;
  onSave: (email: string, phone_number: string) => void;
  onUpdate?: () => void;
}

const EditContactModal: React.FC<EditDescriptionModalProps> = ({
  open,
  initialEmail = "",
  initialPhoneNumber = "",
  businessId,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [email, setEmail] = React.useState(initialEmail);
  const [phone_number, setPhoneNumber] = React.useState(initialPhoneNumber);

  React.useEffect(() => {
    setEmail(initialEmail);
    setPhoneNumber(initialPhoneNumber);
  }, [initialEmail, initialPhoneNumber, open]);

  const handleSave = async () => {
    if (businessId) {
      try {
        await updateData(businessId, { email, phone_number }, "business");
        onSave(email, phone_number);
      } catch (err) {
        console.error("Failed to update business contact", err);
      }
    } else {
      onSave(email, phone_number);
    }

    if (onUpdate) onUpdate();
    onClose();
  };

  return (
    <BaseEditModal
      open={open}
      onClose={onClose}
      title="Edit Contact"
      description="Update your business contact information"
      maxWidth={600}
      actions={[
        { label: 'Cancel', onClick: onClose },
        { label: 'Save Changes', onClick: handleSave, variant: 'primary' },
      ]}
    >
      <FormControl>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          size="md"
          startDecorator={<Email color="primary" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Phone Number</FormLabel>
        <Input
          type="tel"
          size="md"
          startDecorator={<PhoneOutlined color="primary" />}
          value={phone_number}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </FormControl>
    </BaseEditModal>
  );
};

export default EditContactModal;
