import React, { useEffect, useState } from "react";
import { apiService } from "@/src/utils/api";
import type { TouristSpot, TouristSpotSchedule } from "@/src/types/TouristSpot";
import { Alert, Grid, Sheet, Stack, Typography, IconButton } from "@mui/joy";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
import "./TouristSpotDetails/TouristSpotDetails.css";
import {
  BasicInfoSection,
  LocationInfoSection,
  SocialsInfoSection,
  HoursInfoSection,
  ImagesInfoSection,
  AdminInfoSection,
} from "./TouristSpotDetails/index";

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
  onEdit?: (step?: number) => void;
};

const TouristSpotDetails: React.FC<Props> = ({ spotId, onEdit }) => {
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

  const handleSectionEdit = (step: number) => {
    if (onEdit) {
      onEdit(step);
    }
  };

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
    <div className="tsd-page">
      {/* Main content layout: left (details) and right (sidebar) */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid xs={12} md={8}>
          <Stack spacing={1}>
            {/* Hero Banner */}
            <Sheet
              sx={{ p: 1, borderRadius: 15 }}
            >
              <div className="tsd-hero" role="banner">
                <div
                  className="tsd-hero__bg"
                  style={{
                    backgroundImage: images?.[0]?.file_url
                      ? `url(${images[0].file_url})`
                      : undefined,
                  }}
                />
                <div className="tsd-hero__gradient" />

                <div className="tsd-hero__content">
                  <div className="tsd-hero__panel">
                    <div className="tsd-hero__title">
                      <Typography
                        level="h1"
                        fontWeight={700}
                        sx={{
                          fontSize: { xs: "26px", sm: "34px", md: "42px" },
                          lineHeight: 1.15,
                          color: "#fff",
                          letterSpacing: "-0.02em",
                          mb: 0.5,
                        }}
                      >
                        {spot.name}
                      </Typography>
                      {onEdit && (
                        <IconButton
                          aria-label="Edit basic info"
                          size="sm"
                          variant="soft"
                          onClick={() => handleSectionEdit(0)}
                          className="tsd-hero__edit-inline"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>

                    <div className="tsd-hero__row">
                      <LocationOnIcon className="tsd-hero__icon" />
                      <Typography
                        level="body-lg"
                        sx={{
                          color: "#e5e7eb",
                          fontSize: { xs: "14px", md: "16px" },
                        }}
                      >
                        {`${spot.barangay ?? ""}${spot.barangay ? ", " : ""}${
                          spot.municipality ?? ""
                        }${spot.municipality ? ", " : ""}${
                          spot.province ?? ""
                        }` || "Address not available"}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </Sheet>

            {/* Basic Info */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="tsd-card"
            >
              <BasicInfoSection
                spot={spot}
                onEdit={() => handleSectionEdit(0)}
              />
            </Sheet>

            {/* Operating Hours */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="tsd-card"
            >
              <HoursInfoSection
                schedules={schedules}
                onEdit={() => handleSectionEdit(3)}
              />
            </Sheet>

            {/* Images */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="tsd-card"
            >
              <ImagesInfoSection
                images={images}
                onEdit={() => handleSectionEdit(4)}
              />
            </Sheet>
          </Stack>
        </Grid>

        <Grid xs={12} md={4}>
          <Stack spacing={1}>
            {/* Location with map */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="tsd-card"
            >
              <LocationInfoSection
                spot={spot}
                onEdit={() => handleSectionEdit(1)}
              />
            </Sheet>

            {/* Contacts / Socials */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="tsd-card"
            >
              <SocialsInfoSection
                spot={spot}
                onEdit={() => handleSectionEdit(2)}
              />
            </Sheet>

            {/* Admin info */}
            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: 15 }}
              className="tsd-card"
            >
              <AdminInfoSection
                spot={spot}
                onEdit={() => handleSectionEdit(5)}
              />
            </Sheet>
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
};

export default TouristSpotDetails;
