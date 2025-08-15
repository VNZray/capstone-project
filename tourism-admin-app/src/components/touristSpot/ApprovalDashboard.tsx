/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const [selectedItem, setSelectedItem] = useState<unknown>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

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


      const spotsArr = (spotsData as any[]) || [];
      const editsArr = (editsData as any[]) || [];

      const transformedSpots = spotsArr.map((spot: any) => ({
        ...(spot || {}),
        action_type: "new" as const,
      }));

      const transformedEdits = editsArr.map((edit: any) => {

        const pickOriginal = (...keys: string[]) => {
          for (const k of keys) {
            if (edit && typeof edit === "object" && k in edit && edit[k] != null) {
              return edit[k];
            }
          }
          return null;
        };

        return {
          ...(edit || {}),
          action_type: "edit" as const,
          original_name: pickOriginal(
            "original_name",
            "originalName",
            "previous_name",
            "previousName",
            "name_before",
            "name_original",
            "old_name"
          ),

          original_description: pickOriginal(
            "original_description",
            "originalDescription",
            "previous_description",
            "previousDescription",
            "old_description",
            "description_before",
            "description_original"
          ),
          original_type: pickOriginal(
            "original_type",
            "originalType",
            "previous_type",
            "previousType",
            "type_before",
            "type_original"
          ),
          original_province: pickOriginal("original_province", "originalProvince", "previous_province", "province_before"),
          original_municipality: pickOriginal(
            "original_municipality",
            "originalMunicipality",
            "previous_municipality",
            "municipality_before"
          ),
          original_barangay: pickOriginal("original_barangay", "originalBarangay", "previous_barangay", "barangay_before"),
          original_contact_phone: pickOriginal("original_contact_phone", "originalContactPhone", "contact_phone_before"),
          original_website: pickOriginal("original_website", "originalWebsite", "website_before"),
          original_entry_fee: pickOriginal("original_entry_fee", "originalEntryFee", "entry_fee_before"),
        };
      });

      setPendingSpots(transformedSpots as PendingItem[]);

      const spotById = new Map<string, object>();
      for (const s of transformedSpots) {
        const sRec = s as Record<string, unknown> | undefined;
        if (sRec && sRec['id']) spotById.set(String(sRec['id']), sRec as object);
      }

      const enrichedEdits = (transformedEdits as unknown[]).map((edRaw) => {
        const ed = edRaw as Record<string, unknown>;
        const existing = ed.tourist_spot_id ? (spotById.get(String(ed.tourist_spot_id)) as Record<string, unknown> | undefined) : undefined;
        const enriched = {
          ...(ed as object),
          original_name: (ed['original_name'] ?? existing?.['name'] ?? null) as string | null,
          original_description: (ed['original_description'] ?? existing?.['description'] ?? null) as string | null,
          original_type: (ed['original_type'] ?? existing?.['type'] ?? null) as string | null,
          original_province: (ed['original_province'] ?? existing?.['province'] ?? null) as string | null,
          original_municipality: (ed['original_municipality'] ?? existing?.['municipality'] ?? null) as string | null,
          original_barangay: (ed['original_barangay'] ?? existing?.['barangay'] ?? null) as string | null,
          original_contact_phone: (ed['original_contact_phone'] ?? existing?.['contact_phone'] ?? null) as string | null,
          original_website: (ed['original_website'] ?? existing?.['website'] ?? null) as string | null,
          original_entry_fee: (ed['original_entry_fee'] ?? existing?.['entry_fee'] ?? null) as number | null,
          existingSpot: existing ?? null,
        };

        return enriched as unknown as PendingEdit;
      });

      setPendingEdits(enrichedEdits as PendingEdit[]);
    } catch (error) {
      console.error("Error loading approval data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSpot = async (id: string) => {
    try {
      setProcessingId(id);
      await apiService.approveTouristSpot(id);
      window.alert("Tourist spot approved successfully!");
      await loadApprovalData();
    } catch (error) {
      console.error("Error approving spot:", error);
      window.alert("Error approving tourist spot. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSpot = async (id: string) => {
    const reason = window.prompt("Please provide a reason for rejection:");
    if (reason === null) return;

    try {
      setProcessingId(id);
      await apiService.rejectTouristSpot(id, reason);
      window.alert("Tourist spot rejected successfully!");
      await loadApprovalData();
    } catch (error) {
      console.error("Error rejecting spot:", error);
      window.alert("Error rejecting tourist spot. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveSpotEdit = async (id: string) => {
    try {
      setProcessingId(id);
      await apiService.approveEditRequest(id);
      window.alert("Edit request approved successfully!");
      await loadApprovalData();
    } catch (error) {
      console.error("Error approving edit:", error);
      window.alert("Error approving edit request. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectEdit = async (id: string) => {
    const reason = window.prompt("Please provide a reason for rejection:");
    if (reason === null) return; // User cancelled

    try {
      setProcessingId(id);
  console.log(`[ui] rejectEdit: id=${id} reason=${String(reason)}`);
      await apiService.rejectEditRequest(id, reason);
      window.alert("Edit request rejected successfully!");
      await loadApprovalData(); // Refresh data
    } catch (error) {
      console.error("Error rejecting edit:", error);
      window.alert("Error rejecting edit request. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleView = (item: unknown) => {
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
              processingId={processingId}
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
              processingId={processingId}
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
              processingId={processingId}
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
              processingId={processingId}
            />
          </div>
        )}
      </div>

      {/* View Modal */}
  <ViewModal isOpen={isModalOpen} onClose={closeModal} item={selectedItem as Record<string, unknown>} />
    </div>
  );
};

export default ApprovalDashboard;
