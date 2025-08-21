import React, { useEffect, useMemo, useState } from "react";
import { apiService } from "../../utils/api";
import ApprovalTable from "../approval/ApprovalTable";
import OverviewCard from "./OverviewCard";
import ViewModal from "../approval/ViewModal";
import NavCard from "../approval/NavCard";
import { Box, Divider, Grid, IconButton, Input, Stack, Typography } from "@mui/joy";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import HotelRoundedIcon from "@mui/icons-material/HotelRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import "../styles/approval/ApprovalDashboard.css";

interface PendingItem {
  id: string;
  name: string;
  description?: string | null;
  type?: string | null;
  created_at?: string | null;
  province?: string | null;
  municipality?: string | null;
  barangay?: string | null;
  contact_phone?: string | null;
  website?: string | null;
  entry_fee?: number | null;
  action_type: "new" | "edit";
  [k: string]: unknown;
}

interface PendingEdit extends PendingItem {
  tourist_spot_id?: string | number;
  submitted_at?: string | null;
  original_name?: string | null;
  original_description?: string | null;
  original_type?: string | null;
  original_province?: string | null;
  original_municipality?: string | null;
  original_barangay?: string | null;
  original_contact_phone?: string | null;
  original_website?: string | null;
  original_entry_fee?: number | null;
  existingSpot?: Record<string, unknown> | null;
}

type TabType =
  | "overview"
  | "tourist_spots"
  | "events"
  | "businesses"
  | "accommodations";

const makeMock = (prefix: string) => [
  {
    id: "1",
    name: `${prefix} A`,
    action_type: "new" as const,
    submitted_at: "2024-01-15",
  }
];

const ApprovalDashboard: React.FC = () => {
  const [pendingSpots, setPendingSpots] = useState<PendingItem[]>([]);
  const [pendingEdits, setPendingEdits] = useState<PendingEdit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedItem, setSelectedItem] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [spotsData, editsData] = await Promise.all([
          apiService.getPendingTouristSpots(),
          apiService.getPendingEditRequests(),
        ]);

        const spots = (spotsData as unknown[] | null) || [];
        const edits = (editsData as unknown[] | null) || [];

        const transformedSpots: PendingItem[] = spots.map((s) => {
          const rec = (s as Record<string, unknown>) || {};
          return {
            ...rec,
            id: String(rec["id"] ?? ""),
            name: String(rec["name"] ?? rec["title"] ?? ""),
            description: (rec["description"] as string) ?? null,
            action_type: "new",
          } as PendingItem;
        });

        const transformedEditsBase = edits.map((e) => {
          const rec = (e as Record<string, unknown>) || {};
          return {
            ...rec,
            id: String(rec["id"] ?? rec["request_id"] ?? ""),
            tourist_spot_id: rec["tourist_spot_id"] ?? rec["spot_id"] ?? null,
            name: String(rec["name"] ?? rec["new_name"] ?? ""),
            description: (rec["description"] as string) ?? null,
            province_id: rec["province_id"] ?? null,
            municipality_id: rec["municipality_id"] ?? null,
            barangay_id: rec["barangay_id"] ?? null,
            contact_phone: (rec["contact_phone"] as string) ?? null,
            website: (rec["website"] as string) ?? null,
            entry_fee: (rec["entry_fee"] as number) ?? null,
            submitted_at: (rec["submitted_at"] as string) ?? null,
            action_type: "edit",
          } as Record<string, unknown>;
        });

        setPendingSpots(transformedSpots);

        const spotById = new Map<string, Record<string, unknown>>();
        for (const s of transformedSpots) if (s && s.id) spotById.set(String(s.id), s as Record<string, unknown>);

        const enriched: PendingEdit[] = transformedEditsBase.map((edRec) => {
          const ed = edRec as Record<string, unknown>;
          const tourist_spot_id = ed["tourist_spot_id"] ?? ed["spot_id"];
          const existing = tourist_spot_id ? spotById.get(String(tourist_spot_id)) : undefined;

          const fallbackExisting: Record<string, unknown> = {
            name: ed["original_name"] ?? null,
            description: ed["original_description"] ?? null,
            type: ed["original_type"] ?? null,
            province: ed["original_province"] ?? null,
            municipality: ed["original_municipality"] ?? null,
            barangay: ed["original_barangay"] ?? null,
            contact_phone: ed["original_contact_phone"] ?? null,
            website: ed["original_website"] ?? null,
            entry_fee: ed["original_entry_fee"] ?? null,
          };

          const existingSpot = (existing ?? fallbackExisting) as Record<string, unknown> | null;
          const original_name = (existingSpot?.["name"] ?? null) as string | null;
          const original_description = (existingSpot?.["description"] ?? null) as string | null;
          const original_type = (existingSpot?.["type"] ?? null) as string | null;

          return {
            ...(ed as Record<string, unknown>),
            id: String(ed["id"] ?? ed["request_id"] ?? ""),
            name: String(ed["name"] ?? original_name ?? existingSpot?.["name"] ?? ""),
            original_name,
            original_description,
            original_type,
            original_province: (ed["original_province"] ?? existingSpot?.["province"] ?? null) as string | null,
            original_municipality: (ed["original_municipality"] ?? existingSpot?.["municipality"] ?? null) as string | null,
            original_barangay: (ed["original_barangay"] ?? existingSpot?.["barangay"] ?? null) as string | null,
            original_contact_phone: (ed["original_contact_phone"] ?? existingSpot?.["contact_phone"] ?? null) as string | null,
            original_website: (ed["original_website"] ?? existingSpot?.["website"] ?? null) as string | null,
            original_entry_fee: (ed["original_entry_fee"] ?? existingSpot?.["entry_fee"] ?? null) as number | null,
            existingSpot: existingSpot ?? null,
            action_type: "edit",
          } as PendingEdit;
        });

        setPendingEdits(enriched);
      } catch (err) {
        console.error("Error loading approval data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const [spotsData, editsData] = await Promise.all([
        apiService.getPendingTouristSpots(),
        apiService.getPendingEditRequests(),
      ]);
      // reuse effect logic by setting state directly (simple refresh)
      const spotsArr = (spotsData as unknown[] | null) || [];
      setPendingSpots(
        spotsArr.map((s) => {
          const rec = (s as Record<string, unknown>) || {};
          return {
            ...rec,
            id: String(rec["id"] ?? ""),
            name: String(rec["name"] ?? rec["title"] ?? ""),
            description: (rec["description"] as string) ?? null,
            action_type: "new",
          } as PendingItem;
        })
      );

      const editsArr = (editsData as unknown[] | null) || [];
      setPendingEdits(
        editsArr.map((e) => {
          const rec = (e as Record<string, unknown>) || {};
          return {
            ...rec,
            id: String(rec["id"] ?? rec["request_id"] ?? ""),
            name: String(rec["name"] ?? ""),
            action_type: "edit",
          } as PendingEdit;
        })
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    id: string,
    action: "approve" | "reject",
    reason?: string
  ) => {
    setProcessingId(id);
    try {
      const items = [...pendingSpots, ...pendingEdits];
      const item = items.find((i) => String(i.id) === String(id));
      if (!item) return;

      if (item.action_type === "new") {
        if (action === "approve") await apiService.approveTouristSpot(id);
        else await apiService.rejectTouristSpot(id, reason ?? "");
      } else {
        if (action === "approve") await apiService.approveEditRequest(id);
        else await apiService.rejectEditRequest(id, reason ?? "");
      }

      window.alert(
        `${action === "approve" ? "Approved" : "Rejected"} successfully!`
      );
      await refresh();
    } catch (err) {
      console.error(err);
      window.alert(`Error performing ${action}. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = (id: string) => handleAction(id, "approve");
  const handleReject = (id: string) => {
    const r = window.prompt("Please provide a reason for rejection:");
    if (r === null) return;
    return handleAction(id, "reject", r || "");
  };

  const handleView = (item: Record<string, unknown>) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);

  const mockEvents = makeMock("Event");
  const mockBusinesses = makeMock("Business");
  const mockAccommodations = makeMock("Accommodation");

  const allPendingItems = [...pendingSpots, ...pendingEdits];
  const allItems: PendingItem[] = allPendingItems as PendingItem[];

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((i) => String(i.name ?? "").toLowerCase().includes(q));
  }, [allItems, query]);

  if (loading)
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
        <Stack spacing={1} alignItems="center">
          <div className="loading-spinner" />
          <Typography level="body-md" sx={{ color: 'text.tertiary' }}>Loading approval data...</Typography>
        </Stack>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1400, mx: "auto" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography level="h3">Content Approvals</Typography>
          <Typography level="body-md" sx={{ color: "text.tertiary" }}>
            Review and manage submissions from the public and partners.
          </Typography>
        </Box>
        <IconButton size="sm" variant="soft" color="neutral" onClick={refresh} aria-label="Refresh">
          <RefreshRoundedIcon />
        </IconButton>
      </Stack>

      {/* Navigation Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {(
          [
            { key: "overview", label: "Overview", count: allItems.length, icon: <DashboardRoundedIcon />, tab: "overview" as TabType },
            { key: "tourist_spots", label: "Tourist Spots", count: allItems.length, icon: <PlaceRoundedIcon />, tab: "tourist_spots" as TabType },
            { key: "events", label: "Events", count: mockEvents.length, icon: <EventRoundedIcon />, tab: "events" as TabType },
            { key: "businesses", label: "Businesses", count: mockBusinesses.length, icon: <BusinessRoundedIcon />, tab: "businesses" as TabType },
            { key: "accommodations", label: "Accommodations", count: mockAccommodations.length, icon: <HotelRoundedIcon />, tab: "accommodations" as TabType },
          ] as const
        ).map((n) => (
          <Grid key={n.key} xs={12} sm={6} md={2.4}>
            <NavCard
              label={n.label}
              count={n.count}
              icon={n.icon}
              active={activeTab === n.tab}
              onClick={() => setActiveTab(n.tab)}
            />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Content Sections */}
      {activeTab === "overview" && (
        <Grid container spacing={2}>
          <Grid xs={12} md={6} lg={3}>
            <OverviewCard
              title="Tourist Spots"
              count={allItems.length}
              icon="📍"
              items={allItems}
              onApprove={handleApprove}
              onView={handleView}
            />
          </Grid>
          <Grid xs={12} md={6} lg={3}>
            <OverviewCard title="Events" count={mockEvents.length} icon="📅" items={mockEvents} />
          </Grid>
          <Grid xs={12} md={6} lg={3}>
            <OverviewCard title="Businesses" count={mockBusinesses.length} icon="🏢" items={mockBusinesses} />
          </Grid>
          <Grid xs={12} md={6} lg={3}>
            <OverviewCard title="Accommodations" count={mockAccommodations.length} icon="🛏️" items={mockAccommodations} />
          </Grid>
        </Grid>
      )}

      {activeTab === "tourist_spots" && (
        <>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" sx={{ mb: 3 }}>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              startDecorator={<SearchRoundedIcon />}
              placeholder="Search tourist spots"
            />
          </Stack>
          <ApprovalTable
            items={filteredItems}
            contentType="tourist spots"
            onView={handleView}
            onApprove={handleApprove}
            onReject={handleReject}
            processingId={processingId}
          />
        </>
      )}

      {activeTab === "events" && (
        <ApprovalTable
          items={mockEvents}
          contentType="events"
          onView={handleView}
          onApprove={() => alert("Events approval not yet implemented")}
          onReject={() => alert("Events rejection not yet implemented")}
          processingId={processingId}
        />
      )}

      {activeTab === "businesses" && (
        <ApprovalTable
          items={mockBusinesses}
          contentType="businesses"
          onView={handleView}
          onApprove={() => alert("Businesses approval not yet implemented")}
          onReject={() => alert("Businesses rejection not yet implemented")}
          processingId={processingId}
        />
      )}

      {activeTab === "accommodations" && (
        <ApprovalTable
          items={mockAccommodations}
          contentType="accommodations"
          onView={handleView}
          onApprove={() => alert("Accommodations approval not yet implemented")}
          onReject={() => alert("Accommodations rejection not yet implemented")}
          processingId={processingId}
        />
      )}

      <ViewModal isOpen={!!selectedItem} onClose={closeModal} item={selectedItem ?? {}} />
    </Box>
  );
};

export default ApprovalDashboard;
