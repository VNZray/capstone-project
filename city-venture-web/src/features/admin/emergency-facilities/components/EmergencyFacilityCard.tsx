/**
 * Emergency Facility Card Component
 * Displays emergency facility information in a card format
 */

import { Box, Chip, Stack, Card } from "@mui/joy";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import IconButton from "@/src/components/IconButton";
import { MoreVert, Edit, Delete, Visibility } from "@mui/icons-material";
import {
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  ListItemDecorator,
} from "@mui/joy";
import {
  Shield,
  Hospital,
  Flame,
  Home,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import type {
  EmergencyFacility,
  FacilityType,
} from "@/src/types/EmergencyFacility";
import placeholderImage from "@/src/assets/images/placeholder-image.png";

interface EmergencyFacilityCardProps {
  facility: EmergencyFacility;
  onEdit: (facility: EmergencyFacility) => void;
  onDelete: (facility: EmergencyFacility) => void;
  onView: (facility: EmergencyFacility) => void;
}

const FACILITY_ICONS: Record<FacilityType, React.ReactNode> = {
  police_station: <Shield size={20} />,
  hospital: <Hospital size={20} />,
  fire_station: <Flame size={20} />,
  evacuation_center: <Home size={20} />,
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

export default function EmergencyFacilityCard({
  facility,
  onEdit,
  onDelete,
  onView,
}: EmergencyFacilityCardProps) {
  const getAddressString = () => {
    const parts = [
      facility.address,
      facility.barangay_name,
      facility.municipality_name,
    ].filter(Boolean);
    return parts.join(", ") || "No address";
  };

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "lg",
        },
      }}
      onClick={() => onView(facility)}
    >
      {/* Image */}
      <Box
        sx={{
          position: "relative",
          height: 160,
          overflow: "hidden",
          borderRadius: "md",
          mb: 2,
        }}
      >
        <img
          src={facility.facility_image || placeholderImage}
          alt={facility.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Type Badge */}
        <Chip
          size="lg"
          variant="solid"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            backgroundColor: FACILITY_COLORS[facility.facility_type],
            color: "white",
          }}
          startDecorator={FACILITY_ICONS[facility.facility_type]}
        >
          {FACILITY_TYPE_LABELS[facility.facility_type]}
        </Chip>

        {/* Status Badge */}
        <Chip
          size="sm"
          variant="soft"
          color={STATUS_COLORS[facility.status]}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
          }}
        >
          {facility.status.replace("_", " ")}
        </Chip>
      </Box>

      {/* Content */}
      <Stack spacing={1} sx={{ flex: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Typography.CardTitle sx={{ flex: 1, pr: 1 }}>
            {facility.name}
          </Typography.CardTitle>
          <Dropdown>
            <MenuButton
              slots={{ root: IconButton }}
              slotProps={{ root: { variant: "plain", color: "neutral" } }}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVert />
            </MenuButton>
            <Menu placement="bottom-end">
              <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onView(facility);
                }}
              >
                <ListItemDecorator>
                  <Visibility fontSize="small" />
                </ListItemDecorator>
                View Details
              </MenuItem>
              <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(facility);
                }}
              >
                <ListItemDecorator>
                  <Edit fontSize="small" />
                </ListItemDecorator>
                Edit
              </MenuItem>
              <MenuItem
                color="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(facility);
                }}
              >
                <ListItemDecorator>
                  <Delete fontSize="small" />
                </ListItemDecorator>
                Delete
              </MenuItem>
            </Menu>
          </Dropdown>
        </Stack>

        {/* Address */}
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <MapPin size={16} style={{ marginTop: 2, flexShrink: 0 }} />
          <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
            {getAddressString()}
          </Typography.Body>
        </Stack>

        {/* Contact */}
        {(facility.contact_phone || facility.emergency_hotline) && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Phone size={16} style={{ flexShrink: 0 }} />
            <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
              {facility.emergency_hotline || facility.contact_phone}
            </Typography.Body>
          </Stack>
        )}

        {/* Operating Hours */}
        {facility.operating_hours && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Clock size={16} style={{ flexShrink: 0 }} />
            <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
              {facility.operating_hours}
            </Typography.Body>
          </Stack>
        )}

        {/* Capacity for evacuation centers */}
        {facility.facility_type === "evacuation_center" &&
          facility.capacity && (
            <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
              Capacity: {facility.capacity} persons
            </Typography.Body>
          )}
      </Stack>
    </Card>
  );
}
