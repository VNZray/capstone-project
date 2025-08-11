import React from 'react';
import Text from '../Text';
import type { TouristSpot } from '../../types/TouristSpot';
import '../styles/TouristSpotTable.css';

interface TouristSpotTableProps {
  spots: TouristSpot[];
  onViewDetails: (spot: TouristSpot) => void;
}

const TouristSpotTable: React.FC<TouristSpotTableProps> = ({
  spots,
  onViewDetails,
}) => {

  const filteredSpots = spots.filter(
    (spot) => spot.spot_status === 'active' || spot.spot_status === 'inactive'
  );

  return (
    <div className="table-container">
      <div className="table-header">
        <Text variant="bold" color="text-color" className="header-cell name-cell">
          Name
        </Text>
        <Text variant="bold" color="text-color" className="header-cell description-cell">
          Description
        </Text>
        <Text variant="bold" color="text-color" className="header-cell category-cell">
          Category
        </Text>
        <Text variant="bold" color="text-color" className="header-cell type-cell">
          Type
        </Text>
        <Text variant="bold" color="text-color" className="header-cell actions-cell">
          Actions
        </Text>
      </div>
      
      {filteredSpots.map((spot) => (
        <div key={spot.id} className="table-row">
          <Text variant="normal" color="text-color" className="row-cell name-cell">
            {spot.name}
          </Text>
          <Text variant="normal" color="text-color" className="row-cell description-cell">
            {spot.description.length > 50 ? `${spot.description.substring(0, 50)}...` : spot.description}
          </Text>
          <Text variant="normal" color="text-color" className="row-cell category-cell">
            {spot.category}
          </Text>
          <Text variant="normal" color="text-color" className="row-cell type-cell">
            {spot.type}
          </Text>
          <div className="row-cell actions-cell">
            <button
              className="view-details-button"
              onClick={() => onViewDetails(spot)}
            >
              <Text variant="normal" color="white">
                View Full Details
              </Text>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TouristSpotTable;
