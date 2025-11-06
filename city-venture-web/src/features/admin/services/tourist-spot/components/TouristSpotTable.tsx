import React from "react";
import Typography from "@mui/joy/Typography";
import type { TouristSpot } from "@/src/types/TouristSpot";
import Chip from "@mui/joy/Chip";
import "./TouristSpotTable.css";

interface TouristSpotTableProps {
  spots: TouristSpot[];
  onViewDetails: (spot: TouristSpot) => void;
  onEdit: (spot: TouristSpot) => void;
}

const TouristSpotTable: React.FC<TouristSpotTableProps> = ({
  spots,
  onViewDetails,
  onEdit,
}) => {
  const filteredSpots = spots.filter(
    (spot) => spot.spot_status === "active" || spot.spot_status === "inactive"
  );

  return (
    <div className="table-container" >
      <div style={{ display: 'flex', background: '#0A1B47', borderRadius: 8, padding: '8px 16px', marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <Typography level="title-md" sx={{ flex: 2, fontWeight: 700, color: '#fff' }}>Name</Typography>
        <Typography level="title-md" sx={{ flex: 3, fontWeight: 700, color: '#fff' }}>Description</Typography>
        <Typography level="title-md" sx={{ flex: 2, fontWeight: 700, color: '#fff' }}>Category</Typography>
        <Typography level="title-md" sx={{ flex: 1, fontWeight: 700, color: '#fff' }}>Status</Typography>
        <Typography level="title-md" sx={{ flex: 2, fontWeight: 700, color: '#fff' }}>Actions</Typography>
      </div>

      {filteredSpots.map((spot) => (
        <div key={spot.id} style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 8, marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', padding: '8px 16px' }}>
          <Typography level="body-md" color="neutral" sx={{ flex: 2 }}>{spot.name}</Typography>
          <Typography level="body-md" color="neutral" sx={{ flex: 3 }}>
            {spot.description.length > 50
              ? `${spot.description.substring(0, 50)}...`
              : spot.description}
          </Typography>
          <div style={{ flex: 2, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {Array.isArray(spot.categories)
              ? spot.categories.map((cat, idx) => (
                  <Chip
                    key={idx}
                    color="primary"
                    variant="soft"
                    size="sm"
                    sx={{ mb: 0.5 }}
                  >
                    {cat.category || String(cat)}
                  </Chip>
                ))
              : null}
          </div>
          <Typography level="body-md" color="neutral" sx={{ flex: 1 }}>{spot.spot_status}</Typography>
          <div style={{ flex: 2, display: 'flex', gap: 8 }}>
            <button
              className="edit-button"
              style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 500 }}
              onClick={() => onEdit(spot)}
            >
              Edit
            </button>
            <button
              className="view-details-button"
              style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 500 }}
              onClick={() => onViewDetails(spot)}
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TouristSpotTable;
