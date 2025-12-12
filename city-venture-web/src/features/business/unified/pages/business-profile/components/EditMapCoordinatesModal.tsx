import * as React from "react";
import { updateData } from "@/src/services/Service";
import Container from "@/src/components/Container";
import MapInput from "@/src/components/MapInput";
import BaseEditModal from '@/src/components/BaseEditModal';

interface EditDescriptionModalProps {
  open: boolean;
  initialLatitude?: string;
  initialLongitude?: string;
  businessId?: string;
  onClose: () => void;
  onSave: (latitude: string, longitude: string) => void;
  onUpdate?: () => void;
}

const EditMapCoordinatesModal: React.FC<EditDescriptionModalProps> = ({
  open,
  initialLatitude = "",
  initialLongitude = "",
  businessId,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [latitude, setLatitude] = React.useState(initialLatitude);
  const [longitude, setLongitude] = React.useState(initialLongitude);

  React.useEffect(() => {
    setLatitude(initialLatitude);
    setLongitude(initialLongitude);
  }, [initialLatitude, initialLongitude, open]);

  const handleSave = async () => {
    if (businessId) {
      try {
        await updateData(businessId, { latitude, longitude }, "business");
        onSave(latitude, longitude);
      } catch (err) {
        console.error("Failed to update business contact", err);
      }
    } else {
      onSave(latitude, longitude);
    }

    if (onUpdate) onUpdate();
    onClose();
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toString();
        const lng = position.coords.longitude.toString();

        setLatitude(lat);
        setLongitude(lng);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert(
          "Unable to retrieve your location. Please allow location access."
        );
      }
    );
  };

  return (
    <BaseEditModal
      open={open}
      onClose={onClose}
      title="Edit Map Coordinates"
      description="Pin the location of your business on the map"
      actions={[
        { label: 'Cancel', onClick: onClose },
        { label: 'Locate', onClick: handleGetCurrentLocation },
        { label: 'Save Changes', onClick: handleSave, variant: 'primary' },
      ]}
    >
      <Container padding="0" gap="8px" style={{ overflow: "hidden" }}>
        <Container padding="8px" style={{ position: 'relative' }}>
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
            <MapInput
              latitude={latitude}
              longitude={longitude}
              height={240}
              onChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
            />

            {/* Lower-left small overlay showing coordinates (read-only) */}
            <div style={{ position: 'absolute', left: 12, bottom: 12 }}>
              <div
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  padding: '6px 8px',
                  borderRadius: 8,
                  fontSize: 12,
                  lineHeight: '14px',
                  minWidth: 120,
                }}
              >
                <div style={{ fontWeight: 600 }}>Lat: {latitude || '—'}</div>
                <div>Lng: {longitude || '—'}</div>
              </div>
            </div>
          </div>
        </Container>
      </Container>
    </BaseEditModal>
  );
};

export default EditMapCoordinatesModal;
