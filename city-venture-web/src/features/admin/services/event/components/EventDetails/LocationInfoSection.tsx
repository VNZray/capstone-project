import React from "react";
import { Stack, Typography, Sheet } from "@mui/joy";
import { Edit } from "lucide-react";
import { Place } from "@mui/icons-material";
import Button from "@/src/components/Button";
import MapInput from "@/src/features/admin/services/event/components/MapInput";
import type { Event as EventType } from "@/src/types/Event";

interface LocationInfoSectionProps {
  event: EventType;
  onEdit: () => void;
}

const LocationInfoSection: React.FC<LocationInfoSectionProps> = ({ event, onEdit }) => {
  const fullAddress = [
    event.venue_name,
    event.address,
    event.barangay,
    event.municipality,
    event.province
  ].filter(Boolean).join(", ");

  return (
    <Sheet sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography
          fontFamily={"poppins"}
          level="title-lg"
          fontWeight={700}
          sx={{ color: "#1e293b" }}
        >
          Location
        </Typography>
        <Button
          variant="outlined"
          size="sm"
          startDecorator={<Edit size={16} />}
          onClick={onEdit}
          sx={{ borderRadius: '8px' }}
        >
          Edit
        </Button>
      </Stack>

      <Stack spacing={2}>
        {/* Map */}
        <Stack spacing={1}>
          <Sheet
            variant="outlined"
            sx={{
              borderRadius: 8,
              overflow: "hidden",
              "& > div": {
                "& > div": {
                  height: "300px !important",
                  borderRadius: "8px",
                },
              },
            }}
          >
            <MapInput
              latitude={event.latitude ?? undefined}
              longitude={event.longitude ?? undefined}
              onChange={() => {}}
            />
          </Sheet>
        </Stack>

        {/* Venue Name */}
        {event.venue_name && (
          <Stack spacing={0.5}>
            <Typography
              level="body-sm"
              fontWeight={600}
              sx={{ color: "#1e293b", mb: 0.5 }}
            >
              Venue:
            </Typography>
            <Typography level="body-md" sx={{ color: "#374151" }}>
              {event.venue_name}
            </Typography>
          </Stack>
        )}

        {/* Address */}
        <Stack spacing={0.5}>
          <Typography
            level="body-sm"
            fontWeight={600}
            sx={{ color: "#1e293b", mb: 0.5 }}
          >
            Address:
          </Typography>
          <Typography startDecorator={<Place fontSize="small" />} level="body-md">
            {fullAddress || "Address not specified"}
          </Typography>
        </Stack>
      </Stack>
    </Sheet>
  );
};

export default LocationInfoSection;
