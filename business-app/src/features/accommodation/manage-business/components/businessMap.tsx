import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Text from "@/src/components/Text";
import { colors } from "@/src/utils/Colors";

interface BusinessMapProps {
  latitude?: number | string;
  longitude?: number | string;
  name?: string;
}

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const BusinessMap: React.FC<BusinessMapProps> = ({ latitude, longitude, name }) => {
  if (!latitude || !longitude) {
    return <Text color={colors.gray}>Location coordinates not available</Text>;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    <div style={{ width: "100%", height: 500, borderRadius: "10px", overflow: "hidden" }}>
      <MapContainer center={[lat, lng]} zoom={15} style={{ width: "100%", height: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />
        <Marker position={[lat, lng]} icon={markerIcon}>
          <Popup>{name || "Business Location"}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default BusinessMap;
