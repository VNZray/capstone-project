import React, { useEffect, useState } from "react";
import { apiService } from "@/src/utils/api";
import apiClient from "@/src/services/apiClient";
// Replaced table with unified compact cards view (still can reintroduce table if needed)
import UnifiedApprovalCard from "./UnifiedApprovalCard";
import OverviewCard from "./OverviewCard";
import ViewModal from "./ViewModal";
import NavCard from "./NavCard";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Input,
  Stack,
  Typography,
  Table,
  Button as JoyButton,
  Select,
  Modal,
  ModalDialog,
  Textarea,
} from "@mui/joy";
import Option from "@mui/joy/Option";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Alert from "@/src/components/Alert";

import type { EntityType, UnifiedApprovalItem } from "@/src/types/approval";
import {
  initializeEmailJS,
  sendAccountCredentials,
} from "@/src/services/email/EmailService";

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
  action_type: "new" | "edit" | "delete";
  entityType?: EntityType;
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

type TabType = EntityType | "overview";

const makeMock = (prefix: string) => [
  {
    id: "1",
    name: `${prefix} A`,
    action_type: "new" as const,
    submitted_at: "2024-01-15",
    entityType: prefix.toLowerCase().includes("event")
      ? ("events" as const)
      : prefix.toLowerCase().includes("business")
      ? ("businesses" as const)
      : ("accommodations" as const),
  },
];

const ApprovalDashboard: React.FC = () => {
  const [pendingSpots, setPendingSpots] = useState<PendingItem[]>([]);
  const [pendingEdits, setPendingEdits] = useState<PendingEdit[]>([]);
  const [pendingBusinesses, setPendingBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedItem, setSelectedItem] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  // Filters to be wired in a later step
  type DisplayMode = "cards" | "table";
  const [display, setDisplay] = useState<DisplayMode>("cards");
  const [statusTab, setStatusTab] = useState<"all" | "new" | "edit">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Alerts
  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string
  ) => {
    setAlertConfig({ open: true, type, title, message });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, open: false }));
  };

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [itemToRejectId, setItemToRejectId] = useState<string | null>(null);

  // Initialize EmailJS on component mount
  useEffect(() => {
    initializeEmailJS();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [spotsData, editsData, deletionsData, bizData] = await Promise.all([
          apiService.getPendingItems("tourist_spots"),
          apiService.getPendingEditsByEntity("tourist_spots"),
          apiService.getPendingDeletionRequests(),
          apiService.getPendingItems("businesses"),
        ]);

        const spots = (spotsData as unknown[] | null) || [];
        const edits = (editsData as unknown[] | null) || [];
        const deletions = (deletionsData as unknown[] | null) || [];

        const transformedSpots: PendingItem[] = spots.map((s) => {
          const rec = (s as Record<string, unknown>) || {};
          return {
            ...rec,
            id: String(rec["id"] ?? ""),
            name: String(rec["name"] ?? rec["title"] ?? ""),
            description: (rec["description"] as string) ?? null,
            action_type: "new",
            entityType: "tourist_spots",
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
            entityType: "tourist_spots",
          } as Record<string, unknown>;
        });

        setPendingSpots(transformedSpots);

        const spotById = new Map<string, Record<string, unknown>>();
        for (const s of transformedSpots)
          if (s && s.id)
            spotById.set(String(s.id), s as Record<string, unknown>);

        setPendingBusinesses((bizData as any[]) || []);
        const enriched: PendingEdit[] = transformedEditsBase.map((edRec) => {
          const ed = edRec as Record<string, unknown>;
          const tourist_spot_id = ed["tourist_spot_id"] ?? ed["spot_id"];
          const existing = tourist_spot_id
            ? spotById.get(String(tourist_spot_id))
            : undefined;

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

          const existingSpot = (existing ?? fallbackExisting) as Record<
            string,
            unknown
          > | null;
          const original_name = (existingSpot?.["name"] ?? null) as
            | string
            | null;
          const original_description = (existingSpot?.["description"] ??
            null) as string | null;
          const original_type = (existingSpot?.["type"] ?? null) as
            | string
            | null;

          return {
            ...(ed as Record<string, unknown>),
            id: String(ed["id"] ?? ed["request_id"] ?? ""),
            name: String(
              ed["name"] ?? original_name ?? existingSpot?.["name"] ?? ""
            ),
            original_name,
            original_description,
            original_type,
            original_province: (ed["original_province"] ??
              existingSpot?.["province"] ??
              null) as string | null,
            original_municipality: (ed["original_municipality"] ??
              existingSpot?.["municipality"] ??
              null) as string | null,
            original_barangay: (ed["original_barangay"] ??
              existingSpot?.["barangay"] ??
              null) as string | null,
            original_contact_phone: (ed["original_contact_phone"] ??
              existingSpot?.["contact_phone"] ??
              null) as string | null,
            original_website: (ed["original_website"] ??
              existingSpot?.["website"] ??
              null) as string | null,
            original_entry_fee: (ed["original_entry_fee"] ??
              existingSpot?.["entry_fee"] ??
              null) as number | null,
            existingSpot: existingSpot ?? null,
            action_type: "edit",
            entityType: "tourist_spots",
          } as PendingEdit;
        });

        setPendingEdits(enriched);
        setPendingDeletions(
          deletions.map((d) => {
            const rec = (d as Record<string, unknown>) || {};
            return {
              ...rec,
              id: String(rec["id"] ?? rec["request_id"] ?? ""),
              name: String(rec["name"] ?? rec["spot_name"] ?? "Deletion Request"),
              description: `Deletion Reason: ${rec["reason"] ?? "No reason provided"}`,
              action_type: "delete",
              entityType: "tourist_spots",
            } as PendingItem;
          })
        );
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
      const [spotsData, editsData, deletionsData, bizData] = await Promise.all([
        apiService.getPendingItems("tourist_spots"),
        apiService.getPendingEditsByEntity("tourist_spots"),
        apiService.getPendingDeletionRequests(),
        apiService.getPendingItems("businesses"),
      ]);
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
            entityType: "tourist_spots",
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
            entityType: "tourist_spots",
          } as PendingEdit;
        })
      );
      
      const deletionsArr = (deletionsData as unknown[] | null) || [];
      setPendingDeletions(
        deletionsArr.map((d) => {
          const rec = (d as Record<string, unknown>) || {};
          return {
            ...rec,
            id: String(rec["id"] ?? rec["request_id"] ?? ""),
            name: String(rec["name"] ?? rec["spot_name"] ?? "Deletion Request"),
            description: `Deletion Reason: ${rec["reason"] ?? "No reason provided"}`,
            action_type: "delete",
            entityType: "tourist_spots",
          } as PendingItem;
        })
      );

      setPendingBusinesses(((bizData as any[]) || []).map((b) => ({ ...b })));
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

      if (item) {
        const entity =
          ((item as Record<string, unknown>).entityType as
            | EntityType
            | undefined) || "tourist_spots";
        if (item.action_type === "new") {
          if (action === "approve")
            await apiService.approveNewEntity(entity, id);
          else await apiService.rejectNewEntity(entity, id, reason ?? "");
        } else {
          if (action === "approve")
            await apiService.approveEditEntity(entity, id);
          else await apiService.rejectEditEntity(entity, id, reason ?? "");
        }
      } else {
        const biz = pendingBusinesses.find((b) => String(b.id) === String(id));
        if (!biz) return;

        if (action === "approve") {
          // Approve the business first
          await apiService.approveNewEntity("businesses", id);

          // Try to send email notification to owner with credentials
          try {
            // Fetch business details to get owner information
            const businessResponse = await apiClient.get(`/business/${id}`);
            const business = businessResponse.data?.data;

            if (business && business.owner_id) {
              // Fetch owner details
              const ownerResponse = await apiClient.get(
                `/owner/${business.owner_id}`
              );
              const owner = ownerResponse.data?.data;

              if (owner && owner.user_id) {
                // Fetch user details (contains email)
                const userResponse = await apiClient.get(
                  `/user/${owner.user_id}`
                );
                const user = userResponse.data?.data;

                if (user && user.email) {
                  const ownerName =
                    `${owner.first_name || ""} ${
                      owner.last_name || ""
                    }`.trim() || "Business Owner";
                  const defaultPassword = "owner123"; // Default password - should match what was set during registration

                  // Send credentials email
                  const emailSent = await sendAccountCredentials(
                    user.email,
                    ownerName,
                    user.email,
                    defaultPassword
                  );

                  if (emailSent) {
                    console.log(
                      "✅ Credentials email sent successfully to:",
                      user.email
                    );
                  } else {
                    console.warn(
                      "⚠️ Failed to send credentials email, but business was approved"
                    );
                  }
                }
              }
            }
          } catch (emailError) {
            // Don't fail the approval if email fails
            console.error("❌ Error sending credentials email:", emailError);
            console.log("Business was approved but email notification failed");
          }
        } else {
          await apiService.rejectNewEntity("businesses", id, reason ?? "");
        }
      }

      showAlert(
        "success",
        "Success",
        `${action === "approve" ? "Approved" : "Rejected"} successfully!`
      );
      
      if (action === "reject") {
        setRejectModalOpen(false);
        setRejectReason("");
        setItemToRejectId(null);
      }
      
      await refresh();
    } catch (err) {
      console.error(err);
      showAlert("error", "Error", `Error performing ${action}. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = (id: string) => handleAction(id, "approve");
  const handleReject = (id: string) => {
    setItemToRejectId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleView = (item: Record<string, unknown>) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);

  const mockEvents = makeMock("Event");
  // Accommodations removed from approval scope per latest requirements

  const allPendingItems = [...pendingSpots, ...pendingEdits];
  const allItems: PendingItem[] = allPendingItems as PendingItem[];

  // Note: per-tab filtering is applied within each section below

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography level="h3">Content Approvals</Typography>
          <Typography level="body-md" sx={{ color: "text.tertiary" }}>
            Review and manage submissions from the public and partners.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            size="sm"
            variant={display === "cards" ? "solid" : "soft"}
            color={display === "cards" ? "primary" : "neutral"}
            onClick={() => setDisplay("cards")}
            aria-label="Cards view"
          >
            <DashboardRoundedIcon />
          </IconButton>
          <IconButton
            size="sm"
            variant={display === "table" ? "solid" : "soft"}
            color={display === "table" ? "primary" : "neutral"}
            onClick={() => setDisplay("table")}
            aria-label="Table view"
          >
            <TableRowsRoundedIcon />
          </IconButton>
          <IconButton
            size="sm"
            variant="soft"
            color="neutral"
            onClick={refresh}
            aria-label="Refresh"
          >
            <RefreshRoundedIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Navigation Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            key: "overview",
            label: "Overview",
            count: allItems.length,
            icon: <DashboardRoundedIcon />,
            tab: "overview" as TabType,
          },
          {
            key: "tourist_spots",
            label: "Tourist Spots",
            count: allItems.length,
            icon: <PlaceRoundedIcon />,
            tab: "tourist_spots" as TabType,
          },
          {
            key: "events",
            label: "Events",
            count: mockEvents.length,
            icon: <EventRoundedIcon />,
            tab: "events" as TabType,
          },
          {
            key: "businesses",
            label: "Businesses",
            count: pendingBusinesses.length,
            icon: <BusinessRoundedIcon />,
            tab: "businesses" as TabType,
          },
        ].map((n) => (
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
            <OverviewCard
              title="Events"
              count={mockEvents.length}
              icon="📅"
              items={mockEvents}
            />
          </Grid>
          <Grid xs={12} md={6} lg={3}>
            <OverviewCard
              title="Businesses"
              count={pendingBusinesses.length}
              icon="🏢"
              items={pendingBusinesses}
            />
          </Grid>
        </Grid>
      )}

      {activeTab === "tourist_spots" && (
        <>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            sx={{ mb: 3 }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ flex: 1 }}
            >
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                startDecorator={<SearchRoundedIcon />}
                placeholder="Search tourist spots"
                sx={{ minWidth: 240 }}
              />
              <Stack direction="row" spacing={0.5} alignItems="center">
                <JoyButton
                  size="sm"
                  variant={statusTab === "all" ? "solid" : "soft"}
                  onClick={() => setStatusTab("all")}
                >
                  All
                </JoyButton>
                <JoyButton
                  size="sm"
                  variant={statusTab === "new" ? "solid" : "soft"}
                  onClick={() => setStatusTab("new")}
                >
                  New
                </JoyButton>
                <JoyButton
                  size="sm"
                  variant={statusTab === "edit" ? "solid" : "soft"}
                  onClick={() => setStatusTab("edit")}
                >
                  Edit
                </JoyButton>
              </Stack>
              <Select
                size="sm"
                placeholder="Category"
                value={categoryFilter}
                onChange={(_, v) => setCategoryFilter(String(v ?? "all"))}
                sx={{ minWidth: 160 }}
              >
                <Option value="all">All Categories</Option>
                {Array.from(
                  new Set(
                    (pendingSpots as any[]).flatMap((s) =>
                      (s.categories || []).map((c: any) => c.category)
                    )
                  )
                )
                  .filter(Boolean)
                  .map((c: string) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
              </Select>
            </Stack>
          </Stack>
          {(() => {
            const byQuery = (arr: any[]) => {
              const q = query.trim().toLowerCase();
              if (!q) return arr;
              return arr.filter((i) =>
                String(i.name ?? "")
                  .toLowerCase()
                  .includes(q)
              );
            };
            const applyCategory = (arr: any[]) => {
              if (categoryFilter === "all") return arr;
              return arr.filter(
                (i: any) =>
                  Array.isArray(i.categories) &&
                  i.categories.some((c: any) => c.category === categoryFilter)
              );
            };
            const newItems = applyCategory(byQuery(pendingSpots));
            const edits = byQuery(pendingEdits);
            let list: any[];
            if (statusTab === "new") list = newItems;
            else if (statusTab === "edit") list = edits;
            else list = [...newItems, ...edits];

            if (display === "cards") {
              return (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(240px, 1fr))",
                    gap: "12px",
                    padding: "8px",
                  }}
                >
                  {list.map((item: any) => {
                    const actionType =
                      item.action_type ??
                      (pendingEdits.includes(item) ? "edit" : "new");
                    const unified: UnifiedApprovalItem = {
                      id: item.id,
                      entityType: "tourist_spots",
                      actionType: actionType as any,
                      name: item.name,
                      typeLabel: "tourist spot",
                      categoryLabel: item.categories?.[0]?.category || "—",
                      submittedDate: item.submitted_at || item.created_at || "",
                      image: item.primary_image || null,
                      raw: item,
                    };
                    return (
                      <UnifiedApprovalCard
                        key={`ts-${item.id}`}
                        item={unified}
                        onView={(u) => handleView(u.raw)}
                        onApprove={(u) => handleApprove(String(u.id))}
                        onReject={(u) => handleReject(String(u.id))}
                      />
                    );
                  })}
                  {!loading && list.length === 0 && (
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        textAlign: "center",
                        opacity: 0.7,
                      }}
                    >
                      No pending tourist spots
                    </div>
                  )}
                </div>
              );
            }
            // table view
            return (
              <Table
                size="sm"
                stripe="odd"
                hoverRow
                variant="outlined"
                sx={{
                  "--TableCell-paddingX": "8px",
                  "--TableCell-paddingY": "8px",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ width: "40%" }}>Name</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Submitted</th>
                    <th>Kind</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item: any) => (
                    <tr key={`ts-row-${item.id}`}>
                      <th scope="row">{item.name}</th>
                      <td>tourist spot</td>
                      <td>{item.categories?.[0]?.category || "—"}</td>
                      <td>
                        {(item.submitted_at || item.created_at || "") &&
                          new Date(
                            item.submitted_at || item.created_at
                          ).toLocaleDateString()}
                      </td>
                      <td>
                        {item.action_type ??
                          (pendingEdits.includes(item) ? "edit" : "new")}
                      </td>
                      <td>
                        <Stack direction="row" spacing={0.5}>
                          <JoyButton
                            size="sm"
                            variant="soft"
                            onClick={() => handleView(item)}
                          >
                            View
                          </JoyButton>
                          <JoyButton
                            size="sm"
                            variant="outlined"
                            color="success"
                            onClick={() => handleApprove(String(item.id))}
                          >
                            Approve
                          </JoyButton>
                          <JoyButton
                            size="sm"
                            variant="outlined"
                            color="danger"
                            onClick={() => handleReject(String(item.id))}
                          >
                            Reject
                          </JoyButton>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                  {!loading && list.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ textAlign: "center", opacity: 0.7 }}
                      >
                        No pending tourist spots
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            );
          })()}
        </>
      )}

      {activeTab === "events" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "12px",
            padding: "8px",
          }}
        >
          {mockEvents.map((ev) => {
            const unified: UnifiedApprovalItem = {
              id: ev.id,
              entityType: "events",
              actionType: "new",
              name: ev.name,
              typeLabel: "event",
              categoryLabel: "—",
              submittedDate: ev.submitted_at || "",
              image: null,
              raw: ev as any,
            };
            return (
              <UnifiedApprovalCard
                key={`event-${ev.id}`}
                item={unified}
                onView={(u) => handleView(u.raw)}
                onApprove={() => showAlert("info", "Not Implemented", "Event approval not implemented")}
                onReject={() => showAlert("info", "Not Implemented", "Event rejection not implemented")}
              />
            );
          })}
          {mockEvents.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                opacity: 0.7,
              }}
            >
              No events
            </div>
          )}
        </div>
      )}

      {activeTab === "businesses" &&
        (display === "cards" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "12px",
              padding: "8px",
            }}
          >
            {pendingBusinesses
              .filter(
                (b: any) =>
                  !query ||
                  String(b.business_name || b.name || "")
                    .toLowerCase()
                    .includes(query.trim().toLowerCase())
              )
              .map((biz: any) => {
                const unified: UnifiedApprovalItem = {
                  id: biz.id,
                  entityType: "businesses",
                  actionType: "new",
                  name: biz.business_name || biz.name,
                  typeLabel: biz.business_type_name || "business",
                  categoryLabel: biz.business_category_name || "—",
                  submittedDate: biz.created_at || "",
                  image: biz.business_image || null,
                  raw: biz as any,
                };
                return (
                  <UnifiedApprovalCard
                    key={`biz-${biz.id}`}
                    item={unified}
                    onView={(u) => handleView(u.raw)}
                    onApprove={(u) => handleApprove(String(u.id))}
                    onReject={(u) => handleReject(String(u.id))}
                  />
                );
              })}
            {pendingBusinesses.length === 0 && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  opacity: 0.7,
                }}
              >
                No pending businesses
              </div>
            )}
          </div>
        ) : (
          <Table
            size="sm"
            stripe="odd"
            hoverRow
            variant="outlined"
            sx={{
              "--TableCell-paddingX": "8px",
              "--TableCell-paddingY": "8px",
            }}
          >
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Name</th>
                <th>Type</th>
                <th>Category</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingBusinesses
                .filter(
                  (b: any) =>
                    !query ||
                    String(b.business_name || b.name || "")
                      .toLowerCase()
                      .includes(query.trim().toLowerCase())
                )
                .map((biz: any) => (
                  <tr key={`biz-row-${biz.id}`}>
                    <th scope="row">{biz.business_name || biz.name}</th>
                    <td>{biz.business_type_name || "business"}</td>
                    <td>{biz.business_category_name || "—"}</td>
                    <td>
                      {biz.created_at
                        ? new Date(biz.created_at).toLocaleDateString()
                        : ""}
                    </td>
                    <td>
                      <Stack direction="row" spacing={0.5}>
                        <JoyButton
                          size="sm"
                          variant="soft"
                          onClick={() => handleView(biz)}
                        >
                          View
                        </JoyButton>
                        <JoyButton
                          size="sm"
                          variant="outlined"
                          color="success"
                          onClick={() => handleApprove(String(biz.id))}
                        >
                          Approve
                        </JoyButton>
                        <JoyButton
                          size="sm"
                          variant="outlined"
                          color="danger"
                          onClick={() => handleReject(String(biz.id))}
                        >
                          Reject
                        </JoyButton>
                      </Stack>
                    </td>
                  </tr>
                ))}
              {pendingBusinesses.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", opacity: 0.7 }}>
                    No pending businesses
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        ))}

      <ViewModal
        isOpen={!!selectedItem}
        onClose={closeModal}
        item={selectedItem ?? {}}
        onApprove={handleApprove}
        onReject={handleReject}
        processingId={processingId}
      />

      <Alert
        open={alertConfig.open}
        onClose={closeAlert}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        showCancel={false}
      />

      {/* Reject Modal */}
      <Modal
        open={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectReason("");
          setItemToRejectId(null);
        }}
      >
        <ModalDialog>
          <Typography level="h4">Reject Submission</Typography>
          <Typography level="body-sm">
            Please provide a reason for rejecting this submission.
          </Typography>
          <Stack spacing={2} mt={2}>
            <Textarea
              minRows={3}
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <JoyButton
                variant="outlined"
                color="primary"
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectReason("");
                  setItemToRejectId(null);
                }}
              >
                Cancel
              </JoyButton>
              <JoyButton
                variant="solid"
                color="danger"
                disabled={!rejectReason.trim() || processingId !== null}
                onClick={() => {
                  if (itemToRejectId) {
                    handleAction(itemToRejectId, "reject", rejectReason);
                  }
                }}
              >
                Reject
              </JoyButton>
            </Stack>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default ApprovalDashboard;
