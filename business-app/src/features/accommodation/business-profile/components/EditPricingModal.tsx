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
import { updateData } from "@/src/api_function";
import CardHeader from "@/src/components/CardHeader";
import { PhilippinePeso } from "lucide-react";
import { colors } from "@/src/utils/Colors";

interface EditDescriptionModalProps {
  open: boolean;
  initialMinimumPrice?: string;
  initialMaximumPrice?: string;
  businessId?: string;
  onClose: () => void;
  onSave: (min_price: string, max_price: string) => void;
  onUpdate?: () => void;
}

const EditPricingModal: React.FC<EditDescriptionModalProps> = ({
  open,
  initialMinimumPrice = "",
  initialMaximumPrice = "",
  businessId,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [min_price, setMinimumPrice] = React.useState(initialMinimumPrice);
  const [max_price, setMaximumPrice] = React.useState(initialMaximumPrice);

  React.useEffect(() => {
    setMinimumPrice(initialMinimumPrice);
    setMaximumPrice(initialMaximumPrice);
  }, [initialMinimumPrice, initialMaximumPrice, open]);

  const handleSave = async () => {
    if (businessId) {
      try {
        await updateData(businessId, { min_price, max_price }, "business");
        onSave(min_price, max_price);
      } catch (err) {
        console.error("Failed to update business contact", err);
      }
    } else {
      onSave(min_price, max_price);
    }
    if (onUpdate) onUpdate();

    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" variant="outlined" maxWidth={600} minWidth={600}>
        <CardHeader title="Edit Pricing" color="white" />
        <DialogContent>
          <FormControl>
            <FormLabel>Minimum Price</FormLabel>
            <Input
              type="number"
              size="md"
              startDecorator={<PhilippinePeso color={colors.secondary} />}
              value={min_price}
              onChange={(e) => setMinimumPrice(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Maximum Price</FormLabel>
            <Input
              type="number"
              size="md"
              startDecorator={<PhilippinePeso color={colors.secondary} />}
              value={max_price}
              onChange={(e) => setMaximumPrice(e.target.value)}
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

export default EditPricingModal;
