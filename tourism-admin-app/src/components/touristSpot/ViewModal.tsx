import React from "react";
import Text from "../Text";
import "../styles/ViewModal.css";

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  contentType: string;
}

const ViewModal: React.FC<ViewModalProps> = ({
  isOpen,
  onClose,
  item,
  contentType,
}) => {
  if (!isOpen || !item) return null;

  const isEdit = item.action_type === 'edit';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <Text variant="sub-title" color="text-color">
            {isEdit ? `Edit Request: ${item.name}` : item.name}
          </Text>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {isEdit ? (
            // Comparison view for edits
            <div className="comparison-grid">
              <div className="comparison-column">
                <Text variant="card-title" color="text-color" className="comparison-title">
                  Current Version
                </Text>
                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Name</Text>
                  <Text variant="normal" color="text-color">{item.original_name}</Text>
                </div>
                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Description</Text>
                  <Text variant="normal" color="text-color">{item.original_description}</Text>
                </div>
                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Type</Text>
                  <Text variant="normal" color="text-color">{item.original_type}</Text>
                </div>
                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Location</Text>
                  <Text variant="normal" color="text-color">
                    {item.original_province}, {item.original_municipality}, {item.original_barangay}
                  </Text>
                </div>
                {item.original_contact_phone && (
                  <div className="detail-section">
                    <Text variant="card-title" color="text-color">Contact Phone</Text>
                    <Text variant="normal" color="text-color">{item.original_contact_phone}</Text>
                  </div>
                )}
                {item.original_website && (
                  <div className="detail-section">
                    <Text variant="card-title" color="text-color">Website</Text>
                    <Text variant="normal" color="text-color">{item.original_website}</Text>
                  </div>
                )}
                {item.original_entry_fee !== null && (
                  <div className="detail-section">
                    <Text variant="card-title" color="text-color">Entry Fee</Text>
                    <Text variant="normal" color="text-color">₱{item.original_entry_fee}</Text>
                  </div>
                )}
              </div>
              <div className="comparison-column">
                <Text variant="card-title" color="text-color" className="comparison-title">
                  Proposed Changes
                </Text>
                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Name</Text>
                  <Text variant="normal" color="text-color">{item.name}</Text>
                </div>
                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Description</Text>
                  <Text variant="normal" color="text-color">{item.description}</Text>
                </div>
                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Type</Text>
                  <Text variant="normal" color="text-color">{item.type}</Text>
                </div>
                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Location</Text>
                  <Text variant="normal" color="text-color">
                    {item.province}, {item.municipality}, {item.barangay}
                  </Text>
                </div>
                {item.contact_phone && (
                  <div className="detail-section">
                    <Text variant="card-title" color="text-color">Contact Phone</Text>
                    <Text variant="normal" color="text-color">{item.contact_phone}</Text>
                  </div>
                )}
                {item.website && (
                  <div className="detail-section">
                    <Text variant="card-title" color="text-color">Website</Text>
                    <Text variant="normal" color="text-color">{item.website}</Text>
                  </div>
                )}
                {item.entry_fee !== null && (
                  <div className="detail-section">
                    <Text variant="card-title" color="text-color">Entry Fee</Text>
                    <Text variant="normal" color="text-color">₱{item.entry_fee}</Text>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Simple view for new items
            <div className="details-view">
              <div className="detail-section">
                <Text variant="card-title" color="text-color">Description</Text>
                <Text variant="normal" color="text-color">{item.description}</Text>
              </div>
              <div className="detail-section">
                <Text variant="card-title" color="text-color">Type</Text>
                <Text variant="normal" color="text-color">{item.type}</Text>
              </div>
              <div className="detail-section">
                <Text variant="card-title" color="text-color">Location</Text>
                <Text variant="normal" color="text-color">
                  {item.province}, {item.municipality}, {item.barangay}
                </Text>
              </div>
              {item.contact_phone && (
                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Contact Phone</Text>
                  <Text variant="normal" color="text-color">{item.contact_phone}</Text>
                </div>
              )}
              {item.website && (
                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Website</Text>
                  <Text variant="normal" color="text-color">{item.website}</Text>
                </div>
              )}
              {item.entry_fee !== null && (
                <div className="detail-section">
                  <Text variant="card-title" color="text-color">Entry Fee</Text>
                  <Text variant="normal" color="text-color">₱{item.entry_fee}</Text>
                </div>
              )}
              <div className="detail-section">
                <Text variant="card-title" color="text-color">Submitted</Text>
                <Text variant="normal" color="text-color">
                  {new Date('created_at' in item ? item.created_at : item.submitted_at).toLocaleDateString()}
                </Text>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
