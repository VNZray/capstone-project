// src/pages/manage-business/components/BusinessMap.tsx
import React from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import Text from "@/src/components/Text";

type BusinessMapProps = {
  latitude?: number | string;
  longitude?: number | string;
  radius?: number | string;
  height?: string | number;
  width?: string | number;
  name?: string;
};

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "12px",
};

const BusinessMap: React.FC<BusinessMapProps> = ({
  latitude,
  longitude,
  radius,
  name,
  height = "300px",
  width = "100%",
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string, // ✅ keep in .env
  });

  const center = {
    lat: Number(latitude) || 14.5995, // fallback Manila
    lng: Number(longitude) || 120.9842,
  };

  if (!isLoaded) return <Text>Loading map...</Text>;

  return (
    <GoogleMap
      mapContainerStyle={{ ...containerStyle, borderRadius: radius, height: height, width: width }}
      center={center}
      zoom={15}
    >
      <Marker position={center} title={name || "Business Location"} />
    </GoogleMap>
  );
};

export default BusinessMap;
