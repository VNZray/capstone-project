import React from "react";
import Text from "../Text";
import "../styles/ApprovalTable.css";

// Generic item shape for table rows. The real shapes come from parent components.
type ApprovalTableItem = Record<string, unknown> & {
  id: string;
  name: string;
  action_type: 'new' | 'edit';
  submitted_at?: string;
  created_at?: string;
};

interface ApprovalTableProps {
  items: unknown[];
  contentType: string;
  // callers provide items with varying shapes; use ApprovalTableItem here
  onView: (item: ApprovalTableItem) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  processingId?: string | null;
}

const ApprovalTable: React.FC<ApprovalTableProps> = ({
  items,
  contentType,
  onView,
  onApprove,
  onReject,
  processingId,
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

      {items.map((itemRaw, idx) => {
        const item = itemRaw as ApprovalTableItem;
        const key = String(item.id ?? idx);

        return (
          <div key={key} className="approval-table-row">
            <div className="row-cell action-type-cell">
              <span className={`action-badge ${String(item.action_type ?? '')}`}>
                {String(item.action_type) === 'new' ? 'New' : 'Edit'}
              </span>
            </div>

            <Text variant="normal" color="text-color" className="row-cell name-cell">
              {String(item.name ?? '-')}
            </Text>

            <Text variant="normal" color="text-color" className="row-cell submitted-cell">
              {(() => {
                const dateRaw = (item.created_at as string) || (item.submitted_at as string) || '';
                if (!dateRaw) return '-';
                const d = new Date(dateRaw);
                return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
              })()}
            </Text>

            <div className="row-cell actions-cell">
              <div className="action-buttons">
                <button
                  className="view-button"
                  onClick={() => onView(item)}
                  aria-label={`View ${String(item.name ?? '')}`}
                >
                  <Text variant="normal" color="white">
                    View
                  </Text>
                </button>

                <button
                  className="approve-button"
                  onClick={() => onApprove(String(item.id))}
                  disabled={processingId != null && processingId === String(item.id)}
                  aria-disabled={processingId != null && processingId === String(item.id)}
                >
                  <Text variant="normal" color="white">
                    Approve
                  </Text>
                </button>

                <button
                  className="reject-button"
                  onClick={() => onReject(String(item.id))}
                  disabled={processingId != null && processingId === String(item.id)}
                  aria-disabled={processingId != null && processingId === String(item.id)}
                >
                  <Text variant="normal" color="white">
                    Reject
                  </Text>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApprovalTable;
