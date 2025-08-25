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
import { Facebook, Instagram } from "@mui/icons-material";
import { X } from "lucide-react";

interface EditDescriptionModalProps {
  open: boolean;
  initialFbLink?: string;
  initialIgLink?: string;
  initialTtLink?: string;
  businessId?: string;
  onClose: () => void;
  onSave: (
    facebook_url: string,
    instagram_url: string,
    tiktok_url: string
  ) => void;
  onUpdate?: () => void;
}

const EditSocialMediaModal: React.FC<EditDescriptionModalProps> = ({
  open,
  initialFbLink = "",
  initialIgLink = "",
  initialTtLink = "",
  businessId,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [facebook_url, setFacebookUrl] = React.useState(initialFbLink);
  const [instagram_url, setInstagramUrl] = React.useState(initialIgLink);
  const [tiktok_url, setTiktokUrl] = React.useState(initialTtLink);

  React.useEffect(() => {
    setFacebookUrl(initialFbLink);
    setInstagramUrl(initialIgLink);
    setTiktokUrl(initialTtLink);
  }, [initialFbLink, initialIgLink, initialTtLink, open]);

  const handleSave = async () => {
    if (businessId) {
      try {
        await updateData(
          businessId,
          { facebook_url, instagram_url, tiktok_url },
          "business"
        );
        onSave(facebook_url, instagram_url, tiktok_url);
      } catch (err) {
        console.error("Failed to update business contact", err);
      }
    } else {
      onSave(facebook_url, instagram_url, tiktok_url);
    }
    if (onUpdate) onUpdate();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" variant="outlined" maxWidth={600} minWidth={600}>
        <CardHeader title="Edit Social Media Links" color="white" />
        <DialogContent>
          <FormControl>
            <FormLabel>Facebook</FormLabel>
            <Input
              startDecorator={<Facebook color="primary" />}
              value={facebook_url}
              onChange={(e) => setFacebookUrl(e.target.value)}
              size="md"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Instagram</FormLabel>
            <Input
              startDecorator={<Instagram sx={{ color: "#E1306C" }} />}
              value={instagram_url}
              onChange={(e) => setInstagramUrl(e.target.value)}
              size="md"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Twitter</FormLabel>
            <Input
              startDecorator={<X color="#000" />}
              value={tiktok_url}
              onChange={(e) => setTiktokUrl(e.target.value)}
              size="md"
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

export default EditSocialMediaModal;
