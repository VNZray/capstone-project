import React from "react";
import Text from "../Text";
import "../styles/ApprovalTable.css";

interface ApprovalTableItem {
  id: string;
  name: string;
  action_type: 'new' | 'edit';
  submitted_at?: string;
  created_at?: string;
}

interface ApprovalTableProps {
  items: ApprovalTableItem[];
  contentType: string;
  onView: (item: ApprovalTableItem) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const ApprovalTable: React.FC<ApprovalTableProps> = ({
  items,
  contentType,
  onView,
  onApprove,
  onReject,
}) => {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <Text variant="normal" color="text-color">
          No pending {contentType.toLowerCase()} found
        </Text>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="approval-table-header">
        <Text variant="bold" color="text-color" className="header-cell action-type-cell">
          Action Type
        </Text>
        <Text variant="bold" color="text-color" className="header-cell name-cell">
          Name
        </Text>
        <Text variant="bold" color="text-color" className="header-cell submitted-cell">
          Submitted
        </Text>
        <Text variant="bold" color="text-color" className="header-cell actions-cell">
          Actions
        </Text>
      </div>

      {items.map((item) => (
        <div key={item.id} className="approval-table-row">
          <div className="row-cell action-type-cell">
            <span className={`action-badge ${item.action_type}`}>
              {item.action_type === 'new' ? 'New' : 'Edit'}
            </span>
          </div>
          <Text variant="normal" color="text-color" className="row-cell name-cell">
            {item.name}
          </Text>
          <Text variant="normal" color="text-color" className="row-cell submitted-cell">
            {new Date(item.created_at || item.submitted_at || '').toLocaleDateString()}
          </Text>
          <div className="row-cell actions-cell">
            <div className="action-buttons">
              <button
                className="view-button"
                onClick={() => onView(item)}
              >
                <Text variant="normal" color="white">
                  View
                </Text>
              </button>
              <button
                className="approve-button"
                onClick={() => onApprove(item.id)}
              >
                <Text variant="normal" color="white">
                  Approve
                </Text>
              </button>
              <button
                className="reject-button"
                onClick={() => onReject(item.id)}
              >
                <Text variant="normal" color="white">
                  Reject
                </Text>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApprovalTable;
