import React, { useState, useEffect } from "react";
import Text from "../Text";
import { apiService } from "../../utils/api";
import "../styles/ApprovalDashboard.css";

interface PendingItem {
  id: string;
  name: string;
  description: string;
  type: string;
  created_at: string;
}

interface PendingEdit {
  id: string;
  tourist_spot_id: string;
  name: string;
  description: string;
  type: string;
  original_name: string;
  submitted_at: string;
}

const ApprovalDashboard: React.FC = () => {
  const [pendingSpots, setPendingSpots] = useState<PendingItem[]>([]);
  const [pendingEdits, setPendingEdits] = useState<PendingEdit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'spots' | 'edits'>('overview');

  useEffect(() => {
    loadApprovalData();
  }, []);

  const loadApprovalData = async () => {
    try {
      setLoading(true);
      // Load only tourist spots and spot edit requests
      const [spotsData, editsData] = await Promise.all([
        apiService.getPendingTouristSpots(),
        apiService.getPendingEditRequests(),
      ]);

      setPendingSpots(spotsData);
      setPendingEdits(editsData);
    } catch (error) {
      console.error("Error loading approval data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSpot = async (id: string) => {
    try {
      await apiService.approveTouristSpot(id);
      alert(`Tourist spot approved successfully!`);
      loadApprovalData(); // Refresh data
    } catch (error) {
      console.error(`Error approving spot:`, error);
      alert(`Error approving tourist spot. Please try again.`);
    }
  };

  const handleApproveEdit = async (id: string) => {
    try {
      await apiService.approveEditRequest(id);
      alert("Edit request approved successfully!");
      loadApprovalData(); // Refresh data
    } catch (error) {
      console.error("Error approving edit:", error);
      alert("Error approving edit request. Please try again.");
    }
  };

  const handleRejectEdit = async (id: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason === null) return; // User cancelled

    try {
      await apiService.rejectEditRequest(id, reason);
      alert("Edit request rejected successfully!");
      loadApprovalData(); // Refresh data
    } catch (error) {
      console.error("Error rejecting edit:", error);
      alert("Error rejecting edit request. Please try again.");
    }
  };

  const spotsIcon = '📍';

  if (loading) {
    return (
      <div className="approval-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <Text variant="normal" color="text-color">
            Loading approval data...
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="approval-dashboard">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Text variant="normal" color="text-color">
            Overview
          </Text>
        </button>
        <button
          className={`tab-button ${activeTab === 'spots' ? 'active' : ''}`}
          onClick={() => setActiveTab('spots')}
        >
          <Text variant="normal" color="text-color">
            Tourist Spots ({pendingSpots.length})
          </Text>
        </button>
        <button
          className={`tab-button ${activeTab === 'edits' ? 'active' : ''}`}
          onClick={() => setActiveTab('edits')}
        >
          <Text variant="normal" color="text-color">
            Edit Requests ({pendingEdits.length})
          </Text>
        </button>
      </div>

      {/* Content Tabs */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <Text variant="sub-title" color="text-color" className="tab-title">
              Overview - Tourist Spots
            </Text>
            <div className="overview-grid">
              <div className="overview-card">
                <div className="overview-card-header">
                  <span className="overview-icon">{spotsIcon}</span>
                  <Text variant="sub-title" color="text-color">
                    Tourist Spots
                  </Text>
                  <span className="overview-count">{pendingSpots.length}</span>
                </div>
                {pendingSpots.length > 0 ? (
                  <div className="overview-items">
                    {pendingSpots.slice(0, 3).map((item) => (
                      <div key={item.id} className="overview-item">
                        <Text variant="normal" color="text-color">
                          {item.name}
                        </Text>
                        <button
                          className="approve-button small"
                          onClick={() => handleApproveSpot(item.id)}
                        >
                          Approve
                        </button>
                      </div>
                    ))}
                    {pendingSpots.length > 3 && (
                      <Text variant="normal" color="text-color">
                        +{pendingSpots.length - 3} more items
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
            </div>
          </div>
        )}

        {activeTab === 'spots' && (
          <div className={`spots-tab`}>
            <Text variant="sub-title" color="text-color" className="tab-title">
              Pending Tourist Spots
            </Text>
            {pendingSpots.length === 0 ? (
              <div className="empty-state">
                <Text variant="normal" color="text-color">
                  No pending tourist spots
                </Text>
              </div>
            ) : (
              <div className="items-list">
                {pendingSpots.map((item) => (
                  <div key={item.id} className="item-row">
                    <div className="item-info">
                      <Text variant="sub-title" color="text-color">
                        {item.name}
                      </Text>
                      <Text variant="normal" color="text-color">
                        {item.description.length > 100
                          ? `${item.description.substring(0, 100)}...`
                          : item.description}
                      </Text>
                      <Text variant="label" color="text-color">
                        Type: {item.type} | Submitted: {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </div>
                    <div className="item-actions">
                      <button
                        className="approve-button"
                        onClick={() => handleApproveSpot(item.id)}
                      >
                        <Text variant="normal" color="white">
                          Approve
                        </Text>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'edits' && (
          <div className="edits-tab">
            <Text variant="sub-title" color="text-color" className="tab-title">
              Pending Edit Requests
            </Text>
            {pendingEdits.length === 0 ? (
              <div className="empty-state">
                <Text variant="normal" color="text-color">
                  No pending edit requests
                </Text>
              </div>
            ) : (
              <div className="edits-list">
                {pendingEdits.map((edit) => (
                  <div key={edit.id} className="edit-item">
                    <div className="edit-info">
                      <Text variant="sub-title" color="text-color">
                        {edit.name}
                      </Text>
                      <Text variant="normal" color="text-color">
                        {edit.description.length > 100
                          ? `${edit.description.substring(0, 100)}...`
                          : edit.description}
                      </Text>
                      <Text variant="label" color="text-color">
                        Original: {edit.original_name} | Type: {edit.type} | 
                        Submitted: {new Date(edit.submitted_at).toLocaleDateString()}
                      </Text>
                    </div>
                    <div className="edit-actions">
                      <button
                        className="approve-button"
                        onClick={() => handleApproveEdit(edit.id)}
                      >
                        <Text variant="normal" color="white">
                          Approve
                        </Text>
                      </button>
                      <button
                        className="reject-button"
                        onClick={() => handleRejectEdit(edit.id)}
                      >
                        <Text variant="normal" color="white">
                          Reject
                        </Text>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalDashboard;
