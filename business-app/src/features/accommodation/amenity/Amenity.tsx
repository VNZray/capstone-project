import React from "react";
import Text from "@/src/components/Text";
import { Card, CardContent } from "@mui/joy";
import { Button } from "@mui/joy";
import { Wifi, Tv, Coffee, Plus } from "lucide-react"; // Example icons

const amenities = [
  { id: 1, name: "Free WiFi", icon: <Wifi size={24} /> },
  { id: 2, name: "Television", icon: <Tv size={24} /> },
  { id: 3, name: "Coffee Maker", icon: <Coffee size={24} /> },
];

const Amenity = () => {
  return (
    <div style={{ padding: "1rem" }}>
      <Text variant="title">Amenities</Text>

      {/* Grid of amenity cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {amenities.map((amenity) => (
          <Card
            key={amenity.id}
            variant="outlined"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: 2,
              textAlign: "center",
            }}
          >
            {amenity.icon}
            <CardContent>
              <Text variant="card-title">{amenity.name}</Text>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Amenity Button */}
      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <Button
          variant="solid"
          startDecorator={<Plus size={20} />}
          color="primary"
        >
          Add Amenity
        </Button>
      </div>
    </div>
  );
};

export default Amenity;
