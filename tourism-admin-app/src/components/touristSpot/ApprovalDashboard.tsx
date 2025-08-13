import React, { useState, useEffect } from "react";
import Text from "../Text";
import { apiService } from "../../utils/api";
import ApprovalTable from "./ApprovalTable";
import OverviewCard from "./OverviewCard";
import ViewModal from "./ViewModal";
import "../styles/ApprovalDashboard.css";

interface PendingItem {
  id: string;
  name: string;
  description: string;
  type: string;
  created_at: string;
  province?: string;
  municipality?: string;
  barangay?: string;
  contact_phone?: string;
  website?: string | null;
  entry_fee?: number | null;
  action_type: "new" | "edit";
}

interface PendingEdit {
  id: string;
  tourist_spot_id: string;
  name: string;
  description: string;
  type: string;
  original_name: string;
  submitted_at: string;
  province?: string;
  municipality?: string;
  barangay?: string;
  contact_phone?: string;
  website?: string | null;
  entry_fee?: number | null;
  action_type: "edit";
  original_description?: string;
  original_type?: string;
  original_province?: string;
  original_municipality?: string;
  original_barangay?: string;
  original_contact_phone?: string;
  original_website?: string | null;
  original_entry_fee?: number | null;
}

type TabType =
  | "overview"
  | "tourist_spots"
  | "events"
  | "businesses"
  | "accommodations";

const ApprovalDashboard: React.FC = () => {
  const [pendingSpots, setPendingSpots] = useState<PendingItem[]>([]);
  const [pendingEdits, setPendingEdits] = useState<PendingEdit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadApprovalData();
  }, []);

  const loadApprovalData = async () => {
    try {
      setLoading(true);
      // Load only tourist spots and spot edit requests (only backend connected)
      const [spotsData, editsData] = await Promise.all([
        apiService.getPendingTouristSpots(),
        apiService.getPendingEditRequests(),
      ]);

      // Transform spots data to include action_type
      const transformedSpots = spotsData.map((spot) => ({
        ...spot,
        action_type: "new" as const,
      }));

      const transformedEdits = editsData.map((edit) => ({
        ...edit,
        action_type: "edit" as const,
        original_description: edit.description,
        original_type: edit.type,
        original_province: edit.province,
        original_municipality: edit.municipality,
        original_barangay: edit.barangay,
        original_contact_phone: edit.contact_phone,
        original_website: edit.website,
        original_entry_fee: edit.entry_fee,
      }));

      setPendingSpots(transformedSpots);
      setPendingEdits(transformedEdits);
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
      loadApprovalData();
    } catch (error) {
      console.error(`Error approving spot:`, error);
      alert(`Error approving tourist spot. Please try again.`);
    }
  };

  const handleRejectSpot = async (id: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason === null) return;

    try {
      await apiService.rejectTouristSpot(id, reason);
      alert(`Tourist spot rejected successfully!`);
      loadApprovalData();
    } catch (error) {
      console.error(`Error rejecting spot:`, error);
      alert(`Error rejecting tourist spot. Please try again.`);
    }
  };

  const handleApproveSpotEdit = async (id: string) => {
    try {
      await apiService.approveEditRequest(id);
      alert("Edit request approved successfully!");
      loadApprovalData();
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

  const handleView = (
    item:
      | PendingItem
      | PendingEdit
      | {
          id: string;
          name: string;
          action_type: "new" | "edit";
          submitted_at: string;
        }
  ) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleApprove = (id: string) => {
    if (activeTab === "tourist_spots") {
      const item = [...pendingSpots, ...pendingEdits].find(
        (item) => item.id === id
      );
      if (item?.action_type === "new") {
        handleApproveSpot(id);
      } else {
        handleApproveSpotEdit(id);
      }
    }
    // For other tabs, implement when backend is ready
  };

  const handleReject = (id: string) => {
    if (activeTab === "tourist_spots") {
      const item = [...pendingSpots, ...pendingEdits].find(
        (item) => item.id === id
      );
      if (item?.action_type === "new") {
        handleRejectSpot(id);
      } else {
        handleRejectEdit(id);
      }
    }
    // For other tabs, implement when backend is ready
  };

  const mockEvents = [
    {
      id: "1",
      name: "Summer Festival 2024",
      action_type: "new" as const,
      submitted_at: "2024-01-15",
    },
    {
      id: "2",
      name: "Cultural Night",
      action_type: "edit" as const,
      submitted_at: "2024-01-14",
    },
  ];

  const mockBusinesses = [
    {
      id: "1",
      name: "Local Restaurant",
      action_type: "new" as const,
      submitted_at: "2024-01-13",
    },
    {
      id: "2",
      name: "Tourist Shop",
      action_type: "edit" as const,
      submitted_at: "2024-01-12",
    },
  ];

  const mockAccommodations = [
    {
      id: "1",
      name: "Beach Resort",
      action_type: "new" as const,
      submitted_at: "2024-01-11",
    },
    {
      id: "2",
      name: "Mountain Lodge",
      action_type: "edit" as const,
      submitted_at: "2024-01-10",
    },
  ];

  const allPendingItems = [...pendingSpots, ...pendingEdits];

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
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <span className="tab-icon">📊</span>
          <Text variant="normal" color="text-color">
            OVERVIEW
          </Text>
        </button>
        <button
          className={`tab-button ${
            activeTab === "tourist_spots" ? "active" : ""
          }`}
          onClick={() => setActiveTab("tourist_spots")}
        >
          <span className="tab-icon">📍</span>
          <Text variant="normal" color="text-color">
            TOURIST SPOTS ({allPendingItems.length})
          </Text>
        </button>
        <button
          className={`tab-button ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          <span className="tab-icon">📅</span>
          <Text variant="normal" color="text-color">
            EVENTS ({mockEvents.length})
          </Text>
        </button>
        <button
          className={`tab-button ${activeTab === "businesses" ? "active" : ""}`}
          onClick={() => setActiveTab("businesses")}
        >
          <span className="tab-icon">🏢</span>
          <Text variant="normal" color="text-color">
            BUSINESSES ({mockBusinesses.length})
          </Text>
        </button>
        <button
          className={`tab-button ${
            activeTab === "accommodations" ? "active" : ""
          }`}
          onClick={() => setActiveTab("accommodations")}
        >
          <span className="tab-icon">🛏️</span>
          <Text variant="normal" color="text-color">
            ACCOMMODATIONS ({mockAccommodations.length})
          </Text>
        </button>
      </div>

      {/* Content Tabs */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            <Text variant="sub-title" color="text-color" className="tab-title">
              Overview - All Pending Items
            </Text>
            <div className="overview-grid">
              <OverviewCard
                title="Tourist Spots"
                count={allPendingItems.length}
                icon="📍"
                items={allPendingItems}
                onApprove={handleApprove}
                onView={handleView}
              />
              <OverviewCard
                title="Events"
                count={mockEvents.length}
                icon="📅"
                items={mockEvents}
              />
              <OverviewCard
                title="Businesses"
                count={mockBusinesses.length}
                icon="🏢"
                items={mockBusinesses}
              />
              <OverviewCard
                title="Accommodations"
                count={mockAccommodations.length}
                icon="🛏️"
                items={mockAccommodations}
              />
            </div>
          </div>
        )}

        {activeTab === "tourist_spots" && (
          <div className="tourist-spots-tab">
            <ApprovalTable
              items={allPendingItems}
              contentType="tourist spots"
              onView={handleView}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>
        )}

        {activeTab === "events" && (
          <div className="events-tab">
            <ApprovalTable
              items={mockEvents}
              contentType="events"
              onView={handleView}
              onApprove={() => alert("Events approval not yet implemented")}
              onReject={() => alert("Events rejection not yet implemented")}
            />
          </div>
        )}

        {activeTab === "businesses" && (
          <div className="businesses-tab">
            <ApprovalTable
              items={mockBusinesses}
              contentType="businesses"
              onView={handleView}
              onApprove={() => alert("Businesses approval not yet implemented")}
              onReject={() => alert("Businesses rejection not yet implemented")}
            />
          </div>
        )}

        {activeTab === "accommodations" && (
          <div className="accommodations-tab">
            <ApprovalTable
              items={mockAccommodations}
              contentType="accommodations"
              onView={handleView}
              onApprove={() =>
                alert("Accommodations approval not yet implemented")
              }
              onReject={() =>
                alert("Accommodations rejection not yet implemented")
              }
            />
          </div>
        )}
      </div>

      {/* View Modal */}
      <ViewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        item={selectedItem}
        contentType={activeTab}
      />
    </div>
  );
};

export default ApprovalDashboard;
