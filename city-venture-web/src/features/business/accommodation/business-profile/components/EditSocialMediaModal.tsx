import * as React from "react";
import BaseEditModal from '@/src/components/BaseEditModal';
import { updateData } from "@/src/services/Service";
import { Facebook, Instagram, Globe } from 'lucide-react';

interface EditDescriptionModalProps {
  open: boolean;
  initialFbLink?: string;
  initialIgLink?: string;
  initialWebsiteLink?: string;
  businessId?: string;
  onClose: () => void;
  onSave: (facebook_url: string, instagram_url: string, website_url: string) => void;
  onUpdate?: () => void;
}

const EditSocialMediaModal: React.FC<EditDescriptionModalProps> = ({
  open,
  initialFbLink = "",
  initialIgLink = "",
  initialWebsiteLink = "",
  businessId,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [facebook_url, setFacebookUrl] = React.useState(initialFbLink);
  const [instagram_url, setInstagramUrl] = React.useState(initialIgLink);
  const [website_url, setWebsiteUrl] = React.useState(initialWebsiteLink);

  React.useEffect(() => {
    setFacebookUrl(initialFbLink);
    setInstagramUrl(initialIgLink);
    setWebsiteUrl(initialWebsiteLink);
  }, [initialFbLink, initialIgLink, initialWebsiteLink, open]);

  const handleSave = async () => {
    if (businessId) {
      try {
        await updateData(
          businessId,
          { facebook_url, instagram_url, website_url },
          "business"
        );
        onSave(facebook_url, instagram_url, website_url);
      } catch (err) {
        console.error("Failed to update business contact", err);
      }
    } else {
      onSave(facebook_url, instagram_url, website_url);
    }
    if (onUpdate) onUpdate();
    onClose();
  };

  return (
    <BaseEditModal
      open={open}
      onClose={onClose}
      title="Edit Links"
      description="Update social media and website links"
      actions={[
        { label: 'Cancel', onClick: onClose },
        { label: 'Save', onClick: handleSave, variant: 'primary' },
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#374151' }}>Facebook</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Facebook size={18} style={{ color: 'var(--primary-color)' }} />
            <input
              aria-label="Facebook URL"
              value={facebook_url}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/yourpage"
              style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#374151' }}>Instagram</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Instagram size={18} style={{ color: '#E1306C' }} />
            <input
              aria-label="Instagram URL"
              value={instagram_url}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/yourhandle"
              style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#374151' }}>Website</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} style={{ color: '#000' }} />
            <input
              aria-label="Website URL"
              value={website_url}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>
    </BaseEditModal>
  );
};

export default EditSocialMediaModal;
