import React, { useMemo } from "react";
import { Chip } from "@mui/joy";
import type { TouristSpot } from "@/src/types/TouristSpot";
import "./TouristSpotTable.css";
import Button from "@/src/components/Button";
import Table, { type TableColumn } from "@/src/components/ui/Table";

interface TouristSpotTableProps {
  spots: TouristSpot[];
  onViewDetails: (spot: TouristSpot) => void;
  onEdit: (spot: TouristSpot) => void;
  onViewReviews?: (spot: TouristSpot) => void;
}

const TouristSpotTable: React.FC<TouristSpotTableProps> = ({
  spots,
  onViewDetails,
  onEdit,
  onViewReviews,
}) => {
  const filteredSpots = spots.filter(
    (spot) => spot.spot_status === "active" || spot.spot_status === "inactive"
  );

  const columns: TableColumn<TouristSpot>[] = useMemo(() => [
    {
      id: "name",
      label: "Name",
      minWidth: 180,
      render: (row, val) => (
        <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {val}
        </span>
      ),
    },
    {
      id: "description",
      label: "Description",
      minWidth: 240,
      render: (_row, val) => (
        <span style={{ opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {val}
        </span>
      ),
    },
    {
      id: "categories",
      label: "Category",
      minWidth: 220,
      render: (row) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Array.isArray(row.categories)
            ? row.categories.map((cat: any, idx: number) => (
                <Chip key={idx} color="primary" variant="soft" size="sm" sx={{ mb: 0.5 }}>
                  {cat.category || String(cat)}
                </Chip>
              ))
            : null}
        </div>
      ),
    },
    {
      id: "spot_status",
      label: "Status",
      minWidth: 120,
      render: (row, val) => (
        <span style={{ textTransform: 'capitalize' }}>{val}</span>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 260,
      render: (row) => (
        <div style={{ display: 'flex', gap: 8, whiteSpace: 'nowrap' }}>
          <Button variant="outlined" colorScheme="primary" size="sm" onClick={() => onEdit(row)}>
            Edit
          </Button>
          <Button variant="outlined" colorScheme="success" size="sm" onClick={() => onViewDetails(row)}>
            View Details
          </Button>
          <Button variant="outlined" colorScheme="primary" size="sm" onClick={() => onViewReviews?.(row)}>
            Reviews
          </Button>
        </div>
      ),
    },
  ], [onEdit, onViewDetails, onViewReviews]);

  return (
    <div className="table-container">
      <Table
        columns={columns}
        data={filteredSpots}
        rowsPerPage={10}
        emptyMessage="No tourist spots found"
        radius="12px"
      />
    </div>
  );
};

export default TouristSpotTable;
