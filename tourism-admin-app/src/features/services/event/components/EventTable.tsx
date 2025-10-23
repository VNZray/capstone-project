import React from "react";
import Text from "../../../../components/Text";
import "../../../../components/styles/touristspots/TouristSpotTable.css";

export interface Event {
  id?: string;
  name: string;
  date: string;
  categories?: { category: string }[];
  description?: string;
  status?: "active" | "inactive" | "pending";
}

interface EventTableProps {
  events: Event[];
  onViewDetails: (eventOrId: Event | string) => void;
  onEdit: (event: Event) => void;
}

const EventTable: React.FC<EventTableProps> = ({ events, onViewDetails, onEdit }) => {
  return (
    <div className="table-container">
      <div className="table-header">
        <Text
          variant="bold"
          color="text-color"
          className="header-cell name-cell"
        >
          Name
        </Text>
        <Text
          variant="bold"
          color="text-color"
          className="header-cell type-cell"
        >
          Category
        </Text>
        <Text
          variant="bold"
          color="text-color"
          className="header-cell description-cell"
        >
          Date
        </Text>
        <Text
          variant="bold"
          color="text-color"
          className="header-cell status-cell"
        >
          Status
        </Text>
        <Text
          variant="bold"
          color="text-color"
          className="header-cell actions-cell"
        >
          Actions
        </Text>
      </div>

      {events.map((event) => (
        <div key={event.id} className="table-row">
          <Text
            variant="normal"
            color="text-color"
            className="row-cell name-cell"
          >
            {event.name}
          </Text>
          <Text
            variant="normal"
            color="text-color"
            className="row-cell type-cell"
          >
            {event.categories?.map((c) => c.category).join(", ")}
          </Text>
          <Text
            variant="normal"
            color="text-color"
            className="row-cell description-cell"
          >
            {event.date}
          </Text>
          <Text
            variant="normal"
            color="text-color"
            className="row-cell status-cell"
          >
            {event.status ?? "—"}
          </Text>
          <div className="row-cell actions-cell">
            <div className="action-buttons">
              <button
                className="edit-button"
                onClick={() => onEdit(event)}
              >
                <Text variant="normal" color="white">
                  Edit
                </Text>
              </button>
              <button
                className="view-details-button"
                onClick={() => onViewDetails(event)}
              >
                <Text variant="normal" color="white">
                  View Details
                </Text>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventTable;