import React from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Box, CircularProgress } from "@mui/joy";
import { googleMapsLoaderOptions } from "@/src/lib/googleMaps";

type Props = {
  latitude: string | number | undefined;
  longitude: string | number | undefined;
  onChange: (lat: string, lng: string) => void;
};

const containerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "8px",
};

// Default center (Philippines - Manila area)
const defaultCenter = {
  lat: 14.5995,
  lng: 120.9842,
};

const MapInput: React.FC<Props> = ({ latitude, longitude, onChange }) => {
  const { isLoaded, loadError } = useJsApiLoader(googleMapsLoaderOptions);

  const center = {
    lat: latitude ? Number(latitude) : defaultCenter.lat,
    lng: longitude ? Number(longitude) : defaultCenter.lng,
  };

  const markerPosition = {
    lat: latitude ? Number(latitude) : defaultCenter.lat,
    lng: longitude ? Number(longitude) : defaultCenter.lng,
  };

  if (loadError) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "neutral.100",
          borderRadius: "8px",
          border: "1px solid",
          borderColor: "neutral.300",
        }}
      >
        Error loading maps. Please check your API key.
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "neutral.100",
          borderRadius: "8px",
        }}
      >
        <CircularProgress size="md" />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", borderRadius: "8px", overflow: "hidden" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onClick={(e) => {
          if (e.latLng) {
            const lat = e.latLng.lat().toString();
            const lng = e.latLng.lng().toString();
            onChange(lat, lng);
          }
        }}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        <Marker
          position={markerPosition}
          draggable
          onDragEnd={(e) => {
            if (e.latLng) {
              const lat = e.latLng.lat().toString();
              const lng = e.latLng.lng().toString();
              onChange(lat, lng);
            }
          }}
        />
      </GoogleMap>
    </Box>
  );
};

export default MapInput;
