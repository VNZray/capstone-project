import React from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import Text from "@/src/components/Text";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

type Props = {
  latitude: string | number | undefined;
  longitude: string | number | undefined;
  onChange: (lat: string, lng: string) => void;
};

const containerStyle = {
  width: "100%",
  height: "350px",
  borderRadius: "12px",
};

const MapInput: React.FC<Props> = ({ latitude, longitude, onChange }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey!,
  });

  const center = {
    lat: Number(latitude) || 14.5995, // fallback: Manila
    lng: Number(longitude) || 120.9842,
  };

  return (
    <div style={{ width: "100%" }}>
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
        <Text color="white">Loading map...</Text>
      )}
    </div>
  );
};

export default MapInput;
