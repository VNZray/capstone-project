/**
 * Emergency Facility Details Modal Component
 * Displays detailed information about an emergency facility
 */

import {
  Modal,
  ModalDialog,
  ModalClose,
  Box,
  Stack,
  Chip,
  Divider,
  AspectRatio,
} from "@mui/joy";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import {
  Shield,
  Hospital,
  Flame,
  Home,
  Phone,
  Mail,
  MapPin,
  Clock,
  Users,
  FileText,
  AlertCircle,
} from "lucide-react";
import type {
  EmergencyFacility,
  FacilityType,
} from "@/src/types/EmergencyFacility";
import placeholderImage from "@/src/assets/images/placeholder-image.png";

interface EmergencyFacilityDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  facility: EmergencyFacility | null;
  onEdit: (facility: EmergencyFacility) => void;
}

const FACILITY_ICONS: Record<FacilityType, React.ReactNode> = {
  police_station: <Shield size={24} />,
  hospital: <Hospital size={24} />,
  fire_station: <Flame size={24} />,
  evacuation_center: <Home size={24} />,
};

const FACILITY_COLORS: Record<FacilityType, string> = {
  police_station: "#1976D2",
  hospital: "#D32F2F",
  fire_station: "#F57C00",
  evacuation_center: "#388E3C",
};

const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  police_station: "Police Station",
  hospital: "Hospital",
  fire_station: "Fire Station",
  evacuation_center: "Evacuation Center",
};

const STATUS_COLORS: Record<string, "success" | "neutral" | "warning"> = {
  active: "success",
  inactive: "neutral",
  under_maintenance: "warning",
};

export default function EmergencyFacilityDetails({
  isOpen,
  onClose,
  facility,
  onEdit,
}: EmergencyFacilityDetailsProps) {
  if (!facility) return null;

  const getAddressString = () => {
    const parts = [
      facility.address,
      facility.barangay_name,
      facility.municipality_name,
      facility.province_name,
    ].filter(Boolean);
    return parts.join(", ") || "No address provided";
  };

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value?: string | number | null;
  }) => {
    if (!value) return null;
    return (
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box sx={{ color: "text.secondary", pt: 0.25 }}>{icon}</Box>
        <Box>
          <Typography.Label sx={{ color: "text.secondary", fontSize: "xs" }}>
            {label}
          </Typography.Label>
          <Typography.Body>{value}</Typography.Body>
        </Box>
      </Stack>
    );
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalDialog
        sx={{
          width: "100%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <ModalClose />

        {/* Header with Image */}
        <AspectRatio ratio="16/9" sx={{ borderRadius: "md", mb: 2 }}>
          <img
            src={facility.facility_image || placeholderImage}
            alt={facility.name}
            style={{ objectFit: "cover" }}
          />
        </AspectRatio>

        {/* Type and Status Badges */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            variant="solid"
            sx={{
              backgroundColor: FACILITY_COLORS[facility.facility_type],
              color: "white",
            }}
            startDecorator={FACILITY_ICONS[facility.facility_type]}
          >
            {FACILITY_TYPE_LABELS[facility.facility_type]}
          </Chip>
          <Chip variant="soft" color={STATUS_COLORS[facility.status]}>
            {facility.status.replace("_", " ").toUpperCase()}
          </Chip>
        </Stack>

        {/* Title */}
        <Typography.Header sx={{ mb: 1 }}>{facility.name}</Typography.Header>

        {/* Description */}
        {facility.description && (
          <Typography.Body sx={{ color: "text.secondary", mb: 2 }}>
            {facility.description}
          </Typography.Body>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Contact Information */}
        <Typography.CardTitle sx={{ mb: 2 }}>
          Contact Information
        </Typography.CardTitle>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <InfoRow
            icon={<AlertCircle size={18} />}
            label="Emergency Hotline"
            value={facility.emergency_hotline}
          />
          <InfoRow
            icon={<Phone size={18} />}
            label="Phone"
            value={facility.contact_phone}
          />
          <InfoRow
            icon={<Mail size={18} />}
            label="Email"
            value={facility.contact_email}
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Location */}
        <Typography.CardTitle sx={{ mb: 2 }}>Location</Typography.CardTitle>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <InfoRow
            icon={<MapPin size={18} />}
            label="Address"
            value={getAddressString()}
          />
          {facility.latitude && facility.longitude && (
            <Box
              sx={{
                height: 200,
                borderRadius: "md",
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.google.com/maps/embed/v1/place?key=${
                  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
                }&q=${facility.latitude},${facility.longitude}&zoom=15`}
              />
            </Box>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Additional Information */}
        <Typography.CardTitle sx={{ mb: 2 }}>
          Additional Information
        </Typography.CardTitle>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <InfoRow
            icon={<Clock size={18} />}
            label="Operating Hours"
            value={facility.operating_hours}
          />
          {facility.facility_type === "evacuation_center" && (
            <InfoRow
              icon={<Users size={18} />}
              label="Capacity"
              value={
                facility.capacity ? `${facility.capacity} persons` : undefined
              }
            />
          )}
          {facility.services_offered && (
            <InfoRow
              icon={<FileText size={18} />}
              label="Services Offered"
              value={facility.services_offered}
            />
          )}
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={onClose} fullWidth>
            Close
          </Button>
          <Button onClick={() => onEdit(facility)} fullWidth>
            Edit Facility
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
