import React, { useEffect, useMemo, useState } from "react";
import { apiService } from "../../utils/api";
import type { TouristSpot, TouristSpotSchedule } from "../../types/TouristSpot";
import MapInput from "./MapInput";
import {
  Alert,
  Button,
  Chip,
  Divider,
  Grid,
  Link,
  Sheet,
  Stack,
  Table,
  Typography,
} from "@mui/joy";

interface TouristSpotImage {
  id: string;
  tourist_spot_id: string;
  file_url: string;
  file_format: string;
  file_size?: number;
  filename?: string;
  file_name?: string;
  url?: string;
  supabase_url?: string;
  alt_text?: string;
  is_primary: boolean;
  uploaded_at: string;
  updated_at?: string;
}

type Props = {
  spotId: string;
  onBack: () => void;
  onEdit?: () => void;
};

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TouristSpotDetails: React.FC<Props> = ({ spotId, onBack, onEdit }) => {
  const [spot, setSpot] = useState<TouristSpot | null>(null);
  const [schedules, setSchedules] = useState<TouristSpotSchedule[] | null>(
    null
  );
  const [images, setImages] = useState<TouristSpotImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpotDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getTouristSpotById(spotId);
        setSpot(data);

        // Load schedules
        try {
          const sched = await apiService.getTouristSpotSchedules(spotId);
          setSchedules(sched);
        } catch (e) {
          console.warn("Failed to load schedules", e);
          setSchedules([]);
        }

        try {
          const imageData = await apiService.getTouristSpotImages(spotId);
          setImages(imageData || []);
        } catch (e) {
          console.warn("Failed to load images", e);
          setImages([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load tourist spot details.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpotDetails();
  }, [spotId]);

  const feeDisplay = useMemo(() => {
    if (!spot || spot.entry_fee == null) return "N/A";
    try {
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
      }).format(spot.entry_fee);
    } catch {
      return `₱${spot.entry_fee}`;
    }
  }, [spot]);

  const createdDisplay = useMemo(() => {
    if (!spot) return "—";
    try {
      return new Date(spot.created_at).toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return spot.created_at;
    }
  }, [spot]);

  const updatedDisplay = useMemo(() => {
    if (!spot) return "—";
    try {
      return new Date(spot.updated_at).toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return spot.updated_at;
    }
  }, [spot]);

  if (loading)
    return <Typography level="body-md">Loading details...</Typography>;
  if (error)
    return (
      <Alert color="danger" variant="soft">
        {error}
      </Alert>
    );
  if (!spot) return <Alert color="warning">No details found.</Alert>;

  return (
    <Sheet variant="outlined" sx={{ p: 1.5, borderRadius: 8 }}>
      {/* Header with Back Button */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1.5 }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ flexWrap: "wrap" }}
        >
          <Typography level="h3">{spot.name}</Typography>
          <Chip
            size="sm"
            color={
              spot.spot_status === "active"
                ? "success"
                : spot.spot_status === "pending"
                  ? "warning"
                  : "neutral"
            }
          >
            {spot.spot_status}
          </Chip>
        </Stack>
        <Stack direction="row" spacing={1}>
          {onEdit && (
            <Button variant="solid" color="primary" onClick={onEdit}>
              Edit
            </Button>
          )}
          <Button variant="plain" onClick={onBack}>
            ← Back
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ maxWidth: "100%", overflow: "hidden" }}>
        {/* Left Column */}
        <Grid xs={12} lg={9}>
          {/* Name and Status */}
          <Stack spacing={1}></Stack>
          <Stack spacing={2}>
            {/* Images Section */}
            <Stack spacing={1}>
              <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
                Images
              </Typography>
              {images.length > 0 ? (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flexWrap: "wrap", gap: 1 }}
                >
                  {images.slice(0, 4).map((image, index) => (
                    <Sheet
                      key={image.id || index}
                      variant="outlined"
                      sx={{
                        width: index === 0 ? 300 : 140,
                        height: index === 0 ? 200 : 140,
                        borderRadius: 8,
                        overflow: "hidden",
                        position: "relative",
                        "& img": {
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        },
                      }}
                    >
                      <img
                        src={image.file_url || image.supabase_url || image.url}
                        alt={
                          image.alt_text || `Tourist spot image ${index + 1}`
                        }
                      />
                      {image.is_primary && (
                        <Typography
                          level="body-xs"
                          sx={{
                            position: "absolute",
                            top: 4,
                            left: 4,
                            backgroundColor: "primary.solidBg",
                            color: "primary.solidColor",
                            px: 1,
                            py: 0.5,
                            borderRadius: 4,
                          }}
                        >
                          Primary
                        </Typography>
                      )}
                    </Sheet>
                  ))}
                  {images.length > 4 && (
                    <Sheet
                      variant="outlined"
                      sx={{
                        width: 140,
                        height: 140,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "background.level1",
                      }}
                    >
                      <Typography
                        level="body-sm"
                        sx={{ color: "text.tertiary" }}
                      >
                        +{images.length - 4} more
                      </Typography>
                    </Sheet>
                  )}
                </Stack>
              ) : (
                <Sheet
                  variant="outlined"
                  sx={{
                    height: 180,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "background.level1",
                    minHeight: 180,
                    maxWidth: "100%",
                  }}
                >
                  <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                    No images available
                  </Typography>
                </Sheet>
              )}
            </Stack>

            {/* Description */}
            <Stack spacing={0.5}>
              <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
                Description
              </Typography>
              <Typography level="body-md" sx={{ fontWeight: "bold" }}>
                {spot.description || "No description available"}
              </Typography>
            </Stack>

            {/* Category/Type */}
            <Stack spacing={0.5}>
              <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
                Category / Type
              </Typography>
              <Typography level="body-md" sx={{ fontWeight: "bold" }}>
                {spot.type} / {spot.category}
              </Typography>
            </Stack>

            {/* Entry Fee */}
            <Stack spacing={0.5}>
              <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
                Entry Fee
              </Typography>
              <Typography level="body-md" sx={{ fontWeight: "bold" }}>
                {feeDisplay}
              </Typography>
            </Stack>

            {/* Schedule */}
            <Stack spacing={1}>
              <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
                Operating Hours
              </Typography>
              {schedules && schedules.length > 0 ? (
                <Table
                  size="sm"
                  variant="outlined"
                  sx={{
                    "& table": { tableLayout: "fixed" },
                    "& td, & th": { textAlign: "center" },
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ width: "30%" }}>Day</th>
                      <th style={{ width: "40%" }}>Hours</th>
                      <th style={{ width: "30%" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s, idx) => (
                      <tr key={`${s.id ?? idx}`}>
                        <td>{dayNames[s.day_of_week] ?? s.day_of_week}</td>
                        <td>
                          {s.is_closed
                            ? "Closed"
                            : `${s.open_time ?? "—"} - ${s.close_time ?? "—"}`}
                        </td>
                        <td>
                          <Chip
                            size="sm"
                            color={s.is_closed ? "neutral" : "success"}
                            variant="soft"
                          >
                            {s.is_closed ? "Closed" : "Open"}
                          </Chip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  {schedules ? "No operating hours set" : "Loading schedule..."}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Grid>

        {/* Right Column*/}
        <Grid xs={12} lg={3}>
          <Stack spacing={2}>
            {/* Map */}
            <Stack spacing={1}>
              <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
                Location on Map
              </Typography>
              <Sheet
                variant="outlined"
                sx={{
                  borderRadius: 8,
                  overflow: "hidden",
                  maxWidth: "100%",
                  "& > div": {
                    "& > div": {
                      height: "300px !important",
                      borderRadius: "8px",
                    },
                  },
                }}
              >
                <MapInput
                  latitude={spot.latitude ?? undefined}
                  longitude={spot.longitude ?? undefined}
                  onChange={() => {}} // Read-only for details view
                />
              </Sheet>
            </Stack>

            {/* Address */}
            <Stack spacing={0.5}>
              <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
                Address
              </Typography>
              <Typography level="body-md">
                {spot.barangay}, {spot.municipality}, {spot.province}
              </Typography>
            </Stack>

            {/* Contact Information */}
            <Stack spacing={1}>
              <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
                Contact Information
              </Typography>

              <Stack spacing={0.5}>
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  Phone
                </Typography>
                <Typography level="body-md">
                  {spot.contact_phone || "Not provided"}
                </Typography>
              </Stack>

              <Stack spacing={0.5}>
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  Email
                </Typography>
                <Typography level="body-md">
                  {spot.contact_email || "Not provided"}
                </Typography>
              </Stack>

              <Stack spacing={0.5}>
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  Website
                </Typography>
                {spot.website ? (
                  <Link
                    href={spot.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      wordBreak: "break-all",
                      fontSize: "sm",
                    }}
                  >
                    {spot.website.length > 30
                      ? `${spot.website.substring(0, 30)}...`
                      : spot.website}
                  </Link>
                ) : (
                  <Typography level="body-md">Not provided</Typography>
                )}
              </Stack>
            </Stack>

            {/* Admin Info */}
            <Divider sx={{ my: 1 }} />
            <Stack spacing={0.5}>
              <Typography level="title-sm" sx={{ color: "text.tertiary" }}>
                Admin Information
              </Typography>
              <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                Created: {createdDisplay}
              </Typography>
              <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                Updated: {updatedDisplay}
              </Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Sheet>
  );
};

export default TouristSpotDetails;
