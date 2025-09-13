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
import { Facebook, Instagram, Save } from "@mui/icons-material";
import { Globe, X } from "lucide-react";

interface EditDescriptionModalProps {
  open: boolean;
  initialFbLink?: string;
  initialIgLink?: string;
  initialXLink?: string;
  initialWebsiteLink?: string;
  businessId?: string;
  onClose: () => void;
  onSave: (facebook_url: string, instagram_url: string, x_url: string, website_url: string) => void;
  onUpdate?: () => void;
}

const EditSocialMediaModal: React.FC<EditDescriptionModalProps> = ({
  open,
  initialFbLink = "",
  initialIgLink = "",
  initialXLink = "",
  initialWebsiteLink = "",
  businessId,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [facebook_url, setFacebookUrl] = React.useState(initialFbLink);
  const [instagram_url, setInstagramUrl] = React.useState(initialIgLink);
  const [x_url, setXUrl] = React.useState(initialXLink);
  const [website_url, setWebsiteUrl] = React.useState(initialWebsiteLink);

  React.useEffect(() => {
    setFacebookUrl(initialFbLink);
    setInstagramUrl(initialIgLink);
    setXUrl(initialXLink);
    setWebsiteUrl(initialWebsiteLink);
  }, [initialFbLink, initialIgLink, initialXLink, initialWebsiteLink, open]);

  const handleSave = async () => {
    if (businessId) {
      try {
        await updateData(
          businessId,
          { facebook_url, instagram_url, x_url, website_url },
          "business"
        );
        onSave(facebook_url, instagram_url, x_url, website_url);
      } catch (err) {
        console.error("Failed to update business contact", err);
      }
    } else {
      onSave(facebook_url, instagram_url, x_url, website_url);
    }
    if (onUpdate) onUpdate();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" variant="outlined" maxWidth={600} minWidth={600}>
        <CardHeader title="Edit Links" color="white" />
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
            <FormLabel>X</FormLabel>
            <Input
              startDecorator={<X color="#000" />}
              value={x_url}
              onChange={(e) => setXUrl(e.target.value)}
              size="md"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Website</FormLabel>
            <Input
              startDecorator={<Globe color="#000" />}
              value={website_url}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              size="md"
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button fullWidth variant="plain" color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button fullWidth color="primary" startDecorator={<Save />} onClick={handleSave}>
            Save Changes
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default EditSocialMediaModal;
