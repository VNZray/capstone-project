import * as React from "react";
import BaseEditModal from '@/src/components/BaseEditModal';
import { deleteData, getData, insertData } from "@/src/services/Service";
import type { Amenity } from "@/src/types/Amenity";
import * as Icons from 'lucide-react';
/* eslint-disable @typescript-eslint/no-explicit-any */
const icons = Icons as unknown as Record<string, React.ComponentType<any>>;
/* eslint-enable @typescript-eslint/no-explicit-any */
interface EditBusinessModalProps {
  open: boolean;
  businessId?: string;
  onClose: () => void;
  onSave: (amenity_id: string) => void;
  onUpdate?: () => void;
}

const EditAmenitiesModal: React.FC<EditBusinessModalProps> = ({
  open,
  businessId,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [amenities, setAmenities] = React.useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = React.useState<Amenity[]>(
    []
  );
  const [query, setQuery] = React.useState("");

  // get amenities
  const fetchAmenities = async () => {
    const response = await getData("amenities");
    if (response) setAmenities(response);
  };

  React.useEffect(() => {
    fetchAmenities();
  }, []);

  // Fetch amenities for the business and set selectedAmenities
  const fetchBusinessAmenities = React.useCallback(async () => {
    if (!businessId) return;

    const businessAmenityResponse = await getData("business-amenities");
    const amenityResponse = await getData("amenities");

    // All available amenities
    if (Array.isArray(amenityResponse)) {
      setAmenities(amenityResponse);
    }

    // Only those linked to this business
    const selected = Array.isArray(businessAmenityResponse)
      ? businessAmenityResponse
          .filter((ba) => ba.business_id === businessId)
          .map((ba) => {
            const match: Amenity | undefined = (
              amenityResponse as Amenity[]
            ).find((a: Amenity) => a.id === ba.amenity_id);
            return match ? match : null;
          })
          .filter((a): a is Amenity => !!a)
      : [];
    setSelectedAmenities(selected);
  }, [businessId]);

  React.useEffect(() => {
    fetchBusinessAmenities();
  }, [fetchBusinessAmenities]);

  const handleSave = async () => {
    if (businessId) {
      try {
        const businessAmenityResponse = await getData("business-amenities");
        if (Array.isArray(businessAmenityResponse)) {
          const toDelete = businessAmenityResponse.filter(
            (ba) => ba.business_id === businessId
          );
          for (const ba of toDelete) {
            await deleteData(ba.id, "business-amenities");
          }
        }
        // Add selected amenities
        for (const amenity of selectedAmenities) {
          await insertData(
            { business_id: businessId, amenity_id: amenity.id },
            "business-amenities"
          );
        }
        onSave(selectedAmenities.map((a) => a.id).join(","));
      } catch (err) {
        console.error("Failed to update business amenities", err);
      }
    } else {
      onSave(selectedAmenities.map((a) => a.id).join(","));
    }
    if (onUpdate) onUpdate();

    onClose();
  };
  return (
    <BaseEditModal
      open={open}
      onClose={onClose}
      title="Edit Amenities"
      description="Select amenities for this business"
      actions={[
        { label: 'Cancel', onClick: onClose },
        { label: 'Save', onClick: handleSave, variant: 'primary' },
      ]}
    >
      <div style={{ padding: 8 }}>
        <div style={{ marginBottom: 8 }}>
          <input
            placeholder="Search amenities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: '100%', padding: 8, boxSizing: 'border-box', borderRadius: 6, border: '1px solid #e5e7eb' }}
          />
        </div>

        <div style={{ maxHeight: 300, overflow: 'auto', paddingRight: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 4 }}>
            {amenities
              .filter((a) => a.name.toLowerCase().includes(query.trim().toLowerCase()))
              .map((amenity) => {
                const checked = selectedAmenities.some((s) => s.id === amenity.id);
                const IconComp = amenity.icon && icons[amenity.icon] ? icons[amenity.icon] : icons.Tag;
                return (
                  <label key={amenity.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px' }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedAmenities((s) => [...s, amenity]);
                        else setSelectedAmenities((s) => s.filter((x) => x.id !== amenity.id));
                      }}
                    />
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <IconComp size={16} style={{ color: 'var(--primary-color)' }} />
                      <span style={{ color: 'var(--primary-color)', fontWeight: 500 }}>{amenity.name}</span>
                    </span>
                  </label>
                );
              })}
          </div>
        </div>
      </div>
    </BaseEditModal>
  );
};

export default EditAmenitiesModal;
