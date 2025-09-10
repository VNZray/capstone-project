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
} from "@mui/joy";
import { updateData } from "@/src/services/Service";
import CardHeader from "@/src/components/CardHeader";
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
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" variant="outlined" maxWidth={600} minWidth={600}>
        <CardHeader title="Edit Contact" color="white" />
        <DialogContent>
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

export default EditContactModal;
