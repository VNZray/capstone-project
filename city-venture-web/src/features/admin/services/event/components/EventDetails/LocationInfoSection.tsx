import React from "react";
import { Stack, Typography, Sheet, Chip, Divider } from "@mui/joy";
import { Edit, MapPin, Star } from "lucide-react";
import { Place } from "@mui/icons-material";
import MapInput from "../../../tourist-spot/components/MapInput";
import type { Event, EventLocation } from "@/src/types/Event";
import Button from "@/src/components/Button";
import { colors } from "@/src/utils/Colors";

interface LocationInfoSectionProps {
  event: Event;
  onEdit: () => void;
}

const LocationInfoSection: React.FC<LocationInfoSectionProps> = ({
  event,
  onEdit,
}) => {
  // Use locations array if available, otherwise create from legacy fields
  const locations: EventLocation[] = event.locations && event.locations.length > 0
    ? event.locations
    : event.venue_name || event.barangay_id
    ? [{
        id: "legacy",
        event_id: event.id,
        venue_name: event.venue_name || "",
        venue_address: event.venue_address || "",
        barangay_id: event.barangay_id || 0,
        latitude: event.latitude || 0,
        longitude: event.longitude || 0,
        is_primary: true,
        barangay_name: event.barangay_name,
        municipality_name: event.municipality_name,
        province_name: event.province_name,
      }]
    : [];

  const hasLocations = locations.length > 0;

  // Get primary location for the main map display
  const primaryLocation = locations.find(loc => loc.is_primary) || locations[0];

  const getAddressParts = (loc: EventLocation) => {
    return [
      loc.venue_name,
      loc.barangay_name,
      loc.municipality_name,
      loc.province_name,
    ].filter(Boolean);
  };

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
          Location{locations.length > 1 ? "s" : ""}
        </Typography>
        <Button
          variant="outlined"
          size="sm"
          startDecorator={<Edit size={16} />}
          onClick={onEdit}
          sx={{ borderRadius: "8px" }}
        >
          Edit
        </Button>
      </Stack>

      <Stack spacing={2}>
        {/* Primary Location Map */}
        {primaryLocation && primaryLocation.latitude && primaryLocation.longitude && (
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
                latitude={primaryLocation.latitude ?? undefined}
                longitude={primaryLocation.longitude ?? undefined}
                onChange={() => {}}
              />
            </Sheet>
          </Stack>
        )}

        {/* Locations List */}
        {hasLocations && (
          <Stack spacing={1.5}>
            {locations.map((loc, index) => (
              <React.Fragment key={loc.id || index}>
                {index > 0 && <Divider />}
                <Stack spacing={0.5}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <MapPin size={16} color={colors.primary} />
                    <Typography level="body-md" fontWeight={600}>
                      {loc.venue_name || `Location ${index + 1}`}
                    </Typography>
                    {loc.is_primary && locations.length > 1 && (
                      <Chip 
                        size="sm" 
                        variant="soft" 
                        color="primary"
                        startDecorator={<Star size={12} />}
                      >
                        Primary
                      </Chip>
                    )}
                  </Stack>
                  <Typography
                    startDecorator={<Place fontSize="small" />}
                    level="body-sm"
                    sx={{ color: colors.gray, ml: 2.5 }}
                  >
                    {getAddressParts(loc).length > 0
                      ? getAddressParts(loc).join(", ")
                      : "Address not specified"}
                  </Typography>
                  {loc.venue_address && (
                    <Typography level="body-sm" sx={{ color: colors.gray, ml: 2.5 }}>
                      {loc.venue_address}
                    </Typography>
                  )}
                </Stack>
              </React.Fragment>
            ))}
          </Stack>
        )}

        {!hasLocations && (
          <Typography level="body-md" sx={{ color: colors.gray }}>
            No locations specified
          </Typography>
        )}
      </Stack>
    </Sheet>
  );
};

export default LocationInfoSection;
