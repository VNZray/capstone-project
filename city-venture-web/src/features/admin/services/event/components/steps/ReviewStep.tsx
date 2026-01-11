import React from "react";
import {
  Stack,
  FormControl,
  FormLabel,
  Select,
  Option as SelectOption,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
} from "@mui/joy";
import { MapPin, Calendar, Clock, Users, Phone, Mail, Globe, User } from "lucide-react";
import AppTypography from "@/src/components/Typography";
import { colors } from "@/src/utils/Colors";
import type { EventCategory } from "@/src/types/Event";

interface FormOption {
  id: number;
  label: string;
}

interface LocationData {
  id?: string;
  venue_name: string;
  venue_address: string;
  province_id: string;
  municipality_id: string;
  barangay_id: string;
  latitude: string;
  longitude: string;
  is_primary: boolean;
}

interface EventFormData {
  name: string;
  description: string;
  category_id: string;
  category_ids: string[];
  venue_name: string;
  venue_address: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  is_free: boolean;
  ticket_price?: number;
  max_capacity?: number;
  contact_phone: string;
  contact_email: string;
  website: string;
  registration_url: string;
  organizer_name: string;
  organizer_type: string;
  status?: string;
}

interface LocalImage {
  id?: string;
  file?: File;
  file_url: string;
  is_primary: boolean;
}

interface ReviewStepProps {
  mode: "add" | "edit";
  formData: EventFormData;
  selectedCategories: EventCategory[];
  locations: LocationData[];
  images: LocalImage[];
  provinces: { id: number; province: string }[];
  municipalities: { id: number; municipality: string; province_id: number }[];
  barangays: { id: number; barangay: string; municipality_id: number }[];
  onFormDataChange: (updater: (prev: EventFormData) => EventFormData) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  mode,
  formData,
  selectedCategories,
  locations,
  images,
  provinces,
  municipalities,
  barangays,
  onFormDataChange,
}) => {
  // Helper to format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Not set";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper to format time
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper to get location display
  const getLocationDisplay = (loc: LocationData) => {
    const barangay = barangays.find((b) => b.id === Number(loc.barangay_id));
    const municipality = municipalities.find((m) => m.id === Number(loc.municipality_id));
    const province = provinces.find((p) => p.id === Number(loc.province_id));
    return [barangay?.barangay, municipality?.municipality, province?.province]
      .filter(Boolean)
      .join(", ");
  };

  // Get primary image
  const primaryImage = images.find((img) => img.is_primary) || images[0];

  return (
    <Stack spacing={2}>
      <AppTypography.Header size="sm" weight="semibold" sx={{ color: "#0A1B47" }}>
        Review & Submit
      </AppTypography.Header>

      {mode === "edit" && (
        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select
            placeholder="Select status"
            value={formData.status || null}
            onChange={(_e, value) =>
              onFormDataChange((prev) => ({
                ...prev,
                status: value as string,
              }))
            }
            slotProps={{
              listbox: { sx: { zIndex: 3000, maxHeight: 240, overflow: "auto" } },
            }}
          >
            <SelectOption value="draft">Draft</SelectOption>
            <SelectOption value="published">Published</SelectOption>
            <SelectOption value="cancelled">Cancelled</SelectOption>
          </Select>
        </FormControl>
      )}

      <Grid container spacing={2}>
        {/* Left Column */}
        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            {/* Basic Information Card */}
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <AppTypography.Label size="normal" weight="semibold" sx={{ color: "#0A1B47" }}>
                    Basic Information
                  </AppTypography.Label>
                  <AppTypography.Body size="sm">
                    <strong>Name:</strong> {formData.name || "Not set"}
                  </AppTypography.Body>
                  <AppTypography.Body size="sm">
                    <strong>Description:</strong>{" "}
                    {formData.description
                      ? formData.description.length > 200
                        ? formData.description.substring(0, 200) + "..."
                        : formData.description
                      : "Not set"}
                  </AppTypography.Body>
                  <Box>
                    <AppTypography.Body size="sm" sx={{ mb: 0.5 }}>
                      <strong>Categories:</strong>
                    </AppTypography.Body>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selectedCategories.length > 0 ? (
                        selectedCategories.map((cat) => (
                          <Chip key={cat.id} size="sm" variant="soft" color="primary">
                            {cat.name}
                          </Chip>
                        ))
                      ) : (
                        <AppTypography.Body size="sm" sx={{ color: colors.gray }}>
                          None selected
                        </AppTypography.Body>
                      )}
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Date & Time Card */}
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Calendar size={18} color={colors.primary} />
                    <AppTypography.Label size="normal" weight="semibold" sx={{ color: "#0A1B47" }}>
                      Date & Time
                    </AppTypography.Label>
                  </Box>
                  <AppTypography.Body size="sm">
                    <strong>Start Date:</strong> {formatDate(formData.start_date)}
                  </AppTypography.Body>
                  {formData.end_date && (
                    <AppTypography.Body size="sm">
                      <strong>End Date:</strong> {formatDate(formData.end_date)}
                    </AppTypography.Body>
                  )}
                  {formData.is_all_day ? (
                    <Chip size="sm" variant="soft" color="neutral">
                      All Day Event
                    </Chip>
                  ) : (
                    <>
                      {formData.start_time && (
                        <AppTypography.Body size="sm">
                          <strong>Start Time:</strong> {formatTime(formData.start_time)}
                        </AppTypography.Body>
                      )}
                      {formData.end_time && (
                        <AppTypography.Body size="sm">
                          <strong>End Time:</strong> {formatTime(formData.end_time)}
                        </AppTypography.Body>
                      )}
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Pricing & Capacity Card */}
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Users size={18} color={colors.primary} />
                    <AppTypography.Label size="normal" weight="semibold" sx={{ color: "#0A1B47" }}>
                      Pricing & Capacity
                    </AppTypography.Label>
                  </Box>
                  <AppTypography.Body size="sm">
                    <strong>Admission:</strong>{" "}
                    {formData.is_free ? (
                      <Chip size="sm" variant="soft" color="success">
                        Free Entry
                      </Chip>
                    ) : (
                      `₱${formData.ticket_price?.toFixed(2) || "0.00"}`
                    )}
                  </AppTypography.Body>
                  {formData.max_capacity && (
                    <AppTypography.Body size="sm">
                      <strong>Max Capacity:</strong> {formData.max_capacity} attendees
                    </AppTypography.Body>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            {/* Location(s) Card */}
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <MapPin size={18} color={colors.primary} />
                    <AppTypography.Label size="normal" weight="semibold" sx={{ color: "#0A1B47" }}>
                      Location{locations.length > 1 ? "s" : ""}
                    </AppTypography.Label>
                  </Box>
                  {locations.length > 0 ? (
                    locations.map((loc, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 1.5,
                          borderRadius: "md",
                          bgcolor: loc.is_primary ? "primary.50" : "neutral.50",
                          border: "1px solid",
                          borderColor: loc.is_primary ? "primary.200" : "neutral.200",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <AppTypography.Body size="sm" weight="semibold">
                            {loc.venue_name || "Unnamed Venue"}
                          </AppTypography.Body>
                          {loc.is_primary && (
                            <Chip size="sm" color="primary" variant="soft">
                              Primary
                            </Chip>
                          )}
                        </Box>
                        <AppTypography.Body size="sm" sx={{ color: colors.gray }}>
                          {getLocationDisplay(loc)}
                        </AppTypography.Body>
                        {loc.venue_address && (
                          <AppTypography.Body size="sm" sx={{ color: colors.gray, mt: 0.5 }}>
                            {loc.venue_address}
                          </AppTypography.Body>
                        )}
                      </Box>
                    ))
                  ) : (
                    <AppTypography.Body size="sm" sx={{ color: colors.gray }}>
                      No location set
                    </AppTypography.Body>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Contact & Organizer Card */}
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <User size={18} color={colors.primary} />
                    <AppTypography.Label size="normal" weight="semibold" sx={{ color: "#0A1B47" }}>
                      Contact & Organizer
                    </AppTypography.Label>
                  </Box>
                  {formData.organizer_name && (
                    <AppTypography.Body size="sm">
                      <strong>Organizer:</strong> {formData.organizer_name}
                      {formData.organizer_type && ` (${formData.organizer_type})`}
                    </AppTypography.Body>
                  )}
                  {formData.contact_phone && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Phone size={14} color={colors.gray} />
                      <AppTypography.Body size="sm">{formData.contact_phone}</AppTypography.Body>
                    </Box>
                  )}
                  {formData.contact_email && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Mail size={14} color={colors.gray} />
                      <AppTypography.Body size="sm">{formData.contact_email}</AppTypography.Body>
                    </Box>
                  )}
                  {formData.website && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Globe size={14} color={colors.gray} />
                      <AppTypography.Body size="sm">{formData.website}</AppTypography.Body>
                    </Box>
                  )}
                  {!formData.organizer_name &&
                    !formData.contact_phone &&
                    !formData.contact_email &&
                    !formData.website && (
                      <AppTypography.Body size="sm" sx={{ color: colors.gray }}>
                        No contact information provided
                      </AppTypography.Body>
                    )}
                </Stack>
              </CardContent>
            </Card>

            {/* Images Card */}
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <AppTypography.Label size="normal" weight="semibold" sx={{ color: "#0A1B47" }}>
                    Images ({images.length})
                  </AppTypography.Label>
                  {images.length > 0 ? (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {images.slice(0, 4).map((img, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "md",
                            overflow: "hidden",
                            border: img.is_primary ? "2px solid" : "1px solid",
                            borderColor: img.is_primary ? "primary.500" : "neutral.300",
                            position: "relative",
                          }}
                        >
                          <img
                            src={img.file_url}
                            alt={`Event ${index + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          {img.is_primary && (
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                bgcolor: "primary.500",
                                color: "white",
                                fontSize: "8px",
                                textAlign: "center",
                                py: 0.25,
                              }}
                            >
                              PRIMARY
                            </Box>
                          )}
                        </Box>
                      ))}
                      {images.length > 4 && (
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "md",
                            bgcolor: "neutral.100",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <AppTypography.Body size="sm" sx={{ color: colors.gray }}>
                            +{images.length - 4}
                          </AppTypography.Body>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <AppTypography.Body size="sm" sx={{ color: colors.gray }}>
                      No images uploaded
                    </AppTypography.Body>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ReviewStep;
