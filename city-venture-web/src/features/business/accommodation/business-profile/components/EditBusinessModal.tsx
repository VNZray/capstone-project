import * as React from "react";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Textarea,
  Input,
  FormLabel,
  FormControl,
} from "@mui/joy";
import { updateData } from "@/src/services/Service";
import CardHeader from "@/src/components/CardHeader";
import placeholderImage from "@/src/assets/images/placeholder-image.png";
import {  UploadIcon } from "lucide-react";
import { supabase } from "@/src/lib/supabase";
import { Save } from "@mui/icons-material";
interface EditBusinessModalProps {
  open: boolean;
  initialBusinessName?: string;
  initialBusinessImage?: string;
  businessId?: string;
  onClose: () => void;
  onSave: (business_name: string, initialBusinessImage: string) => void;
  onUpdate?: () => void;
}

const EditBusinessModal: React.FC<EditBusinessModalProps> = ({
  open,
  initialBusinessName = "",
  initialBusinessImage = "",
  businessId,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [business_name, setBusinessName] = React.useState(initialBusinessName);
  const [business_image, setBusinessImage] =
    React.useState(initialBusinessImage);

  React.useEffect(() => {
    setBusinessName(initialBusinessName);
    setBusinessImage(initialBusinessImage);
  }, [initialBusinessName, initialBusinessImage, open]);

  const handleSave = async () => {
    if (businessId) {
      try {
        await updateData(
          businessId,
          { business_name, business_image },
          "business"
        );
        onSave(business_name, business_image);
      } catch (err) {
        // Optionally handle error
        console.error("Failed to update business name", err);
      }
    } else {
      onSave(business_name, business_image);
    }
    if (onUpdate) onUpdate();

    onClose();
  };

  // Upload immediately after selecting an image
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set preview for UI
    const preview = URL.createObjectURL(file);
    setBusinessImage(preview);

    try {
      const fileExt = file.name.split(".").pop();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const safeRoomNumber = business_image
        ? business_image.replace(/\s+/g, "_")
        : "room";
      const fileName = `${safeRoomNumber}_${timestamp}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("business-profile")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;
      if (!uploadData?.path) throw new Error("Upload failed: no file path");

      // Get public URL
      const { data: publicData } = supabase.storage
        .from("business-profile")
        .getPublicUrl(uploadData.path);

      if (!publicData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Save to state
      setBusinessImage(publicData.publicUrl);
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(err?.message || "Upload failed");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" variant="outlined" maxWidth={600} minWidth={600}>
        <CardHeader title="Edit Business" color="white" />
        <DialogContent>
          <FormControl>
            <FormLabel>Business Name</FormLabel>
            <Input
              value={business_name}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter business name..."
              size="md"
            />
          </FormControl>

          <FormControl sx={{ display: "flex", alignItems: "center", gap: 2, marginTop: 2 }}>
            <img
              width={"100%"}
              height={400}
              src={business_image}
              alt={placeholderImage}
              style={{ objectFit: "cover", borderRadius: 8 }}
            />
            <Button
              size="lg"
              variant="outlined"
              color="primary"
              startDecorator={<UploadIcon />}
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              Change Business Profile
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{
                display: "none",
              }}
            />{" "}
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

export default EditBusinessModal;
