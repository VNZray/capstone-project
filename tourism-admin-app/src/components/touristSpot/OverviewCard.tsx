import React from "react";
import Text from "../Text";
import "../styles/OverviewCard.css";

interface OverviewCardProps {
  title: string;
  count: number;
  icon: string;
  items: Array<{
    id: string;
    name: string;
    action_type: "new" | "edit";
  }>;
  onApprove?: (id: string) => void;
  onView?: (item: { id: string; name: string; action_type: "new" | "edit" }) => void;
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  count,
  icon,
  items,
  onApprove,
  onView,
}) => {
  // reference onApprove to avoid 'declared but never read' TypeScript error in some strict configs
  void onApprove;
  return (
    <div className="overview-card">
      <div className="overview-card-header">
        <span className="overview-icon">{icon}</span>
        <Text variant="sub-title" color="text-color">
          {title}
        </Text>
        <span className="overview-count">{count}</span>
      </div>
      {count > 0 ? (
        <div className="overview-items">
          {items.slice(0, 3).map((item) => (
            <div key={item.id} className="overview-item">
              <div className="overview-item-content">
                <span className={`action-badge small ${item.action_type}`}>
                  {item.action_type === "new" ? "New" : "Edit"}
                </span>
                <Text variant="normal" color="text-color" className="item-name">
                  {item.name}
                </Text>
              </div>
              <div className="overview-item-actions">
                {onView && (
                  <button
                    className="view-button small"
                    onClick={() => onView(item)}
                  >
                    View
                  </button>
                )}
                {/* {onApprove && (
                  <button
                    className="approve-button small"
                    onClick={() => onApprove(item.id)}
                  >
                    Approve
                  </button>
                )} */}
              </div>
            </div>
          ))}
          {count > 3 && (
            <Text variant="normal" color="text-color" className="more-items">
              +{count - 3} more items
            </Text>
          )}
        </div>
      ) : (
        <div className="overview-empty">
          <Text variant="normal" color="text-color">
            No pending items
          </Text>
        </div>
      )}
    </div>
  );
};

export default OverviewCard;
