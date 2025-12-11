import * as React from "react";
import { Input, FormControl, FormLabel } from "@mui/joy";
import { updateData } from "@/src/services/Service";
import BaseEditModal from '@/src/components/BaseEditModal';
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
    <BaseEditModal
      open={open}
      onClose={onClose}
      title="Edit Pricing"
      description="Set the minimum and maximum price for your offering"
      actions={[
        { label: 'Cancel', onClick: onClose },
        { label: 'Save Changes', onClick: handleSave, variant: 'primary' },
      ]}
    >
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
    </BaseEditModal>
  );
};

export default EditPricingModal;
