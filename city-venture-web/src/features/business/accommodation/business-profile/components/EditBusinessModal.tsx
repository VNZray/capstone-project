import * as React from "react";
import BaseEditModal from "@/src/components/BaseEditModal";
import { updateData } from "@/src/services/Service";
import ImageUpload from "@/src/components/ImageUpload";
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

  return (
    <BaseEditModal
      open={open}
      onClose={onClose}
      title="Edit Business"
      description="Update your business information and contact details"
      maxWidth={720}
      actions={[
        { label: "Cancel", onClick: onClose },
        { label: "Save", onClick: handleSave, variant: "primary" },
      ]}
    >
      <div
        style={{
          display: "flex",
          gap: 20,
          flexDirection: "column",
        }}
      >
        <div style={{ flex: "1 1 0%", minWidth: 0 }}>
          <label
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Business Name
          </label>
          <input
            value={business_name}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Enter business name..."
            aria-label="Business name"
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 15,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              boxSizing: "border-box",
              minWidth: 0,
              overflowWrap: "break-word",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Business Profile
          </label>
          <ImageUpload
            folderName={`${business_name}/profile`}
            uploadTo={`business-profile`}
            placeholder="Click to upload business image"
            maxSizeMB={5}
            storeLocally={true}
            onUploadComplete={(publicUrl) => {
              setBusinessImage(publicUrl);
            }}
            onError={(error) => {
              console.error("Upload error:", error);
              alert(`Upload failed: ${error}`);
            }}
          />
        </div>
      </div>
    </BaseEditModal>
  );
};

export default EditBusinessModal;
