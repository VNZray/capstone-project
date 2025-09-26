import * as React from "react";
import BaseEditModal from '@/src/components/BaseEditModal';
import { updateData } from "@/src/services/Service";
import placeholderImage from "@/src/assets/images/placeholder-image.png";
import { supabase } from "@/src/lib/supabase";
// ...existing code...
// ...existing code...
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
    } catch (err: unknown) {
      console.error("Upload failed:", err);
      const message = (err instanceof Error && err.message) ? err.message : 'Upload failed';
      alert(message);
    }
  };

  return (
    <BaseEditModal
      open={open}
      onClose={onClose}
      title="Edit Business"
      description="Update your business information and contact details"
      maxWidth={720}
      actions={[
        { label: 'Cancel', onClick: onClose },
        { label: 'Save', onClick: handleSave, variant: 'primary' },
      ]}
    >
      <div style={{ padding: '8px 0' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 180px', minWidth: 120, maxWidth: '40%' }}>
            <div style={{
              borderRadius: 8,
              overflow: 'hidden',
              position: 'relative',
              height: 140,
              width: '100%',
              border: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <img
                src={business_image || placeholderImage}
                alt="Business image"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <button
                aria-label="Change image"
                onClick={() => document.getElementById('image-upload')?.click()}
                style={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                  background: 'rgba(255,255,255,0.95)',
                  border: 'none',
                  padding: 6,
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
              >
                ⤴
              </button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div style={{ flex: '1 1 0%', minWidth: 0 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#374151' }}>
              Business Name
            </label>
            <input
              value={business_name}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter business name..."
              aria-label="Business name"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 15,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: '#fff',
                boxSizing: 'border-box',
                minWidth: 0,
                overflowWrap: 'break-word'
              }}
            />
          </div>
        </div>
      </div>
    </BaseEditModal>
  );
};

export default EditBusinessModal;
