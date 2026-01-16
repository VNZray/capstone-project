import React from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import Typography from "@/src/components/Typography";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

type Props = {
  latitude: string | number | undefined;
  longitude: string | number | undefined;
  onChange: (lat: string, lng: string) => void;
  height?: number | string; // optional, allows override of default responsive height
};

const MapInput: React.FC<Props> = ({ latitude, longitude, onChange, height }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey!,
  });

  const center = {
    lat: Number(latitude) || 14.5995, // fallback: Manila
    lng: Number(longitude) || 120.9842,
  };

  // Compute responsive height: prefer provided height, otherwise clamp to viewport
  const mapHeight = height ?? 'clamp(240px, 38vh, 380px)';
  const containerStyle = {
    width: '100%',
    height: mapHeight as string,
    borderRadius: '12px',
  } as const;

  return (
    <div style={{ width: "100%", borderRadius: 12, overflow: 'hidden' }}>
      {isLoaded ? (
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
        >
          <Marker
            position={{
              lat: Number(latitude) || center.lat,
              lng: Number(longitude) || center.lng,
            }}
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
      ) : (
        <Typography.Body>Loading map...</Typography.Body>
      )}
    </div>
  );
};

export default MapInput;
