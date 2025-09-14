import React, { useEffect, useState } from "react";
import { apiService } from "@/src/utils/api";
import type { TouristSpot, TouristSpotSchedule } from "@/src/types/TouristSpot";
import {
  Alert,
  Button,
  Grid,
  Stack,
  Typography,
} from "@mui/joy";
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
    <Stack spacing={1}>
      {/* Header with Back Button */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography level="h2">Tourist Spot Details</Typography>
        <Button variant="plain" onClick={onBack}>
          ← Back
        </Button>
      </Stack>

      {/* Two-column responsive layout */}
      <Grid container spacing={1}>
        {/* Left Column - Main Information */}
        <Grid xs={24} lg={8}>
          <Stack spacing={2}>
            <ImagesInfoSection 
              images={images} 
              onEdit={() => handleSectionEdit(4)} 
            />
            <BasicInfoSection 
              spot={spot} 
              onEdit={() => handleSectionEdit(0)} 
            />
            <HoursInfoSection 
              schedules={schedules} 
              onEdit={() => handleSectionEdit(3)} 
            />
          </Stack>
        </Grid>

        {/* Right Column - Location and Admin */}
        <Grid xs={12} lg={4}>
          <Stack spacing={2}>
            <LocationInfoSection 
              spot={spot} 
              onEdit={() => handleSectionEdit(1)} 
            />
            <SocialsInfoSection 
              spot={spot} 
              onEdit={() => handleSectionEdit(2)} 
            />
            <AdminInfoSection 
              spot={spot} 
              onEdit={() => handleSectionEdit(5)} 
            />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default TouristSpotDetails;
