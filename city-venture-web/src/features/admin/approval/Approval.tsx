import React, { useEffect, useMemo, useState } from "react";
import { apiService } from "@/src/utils/api";
import OverviewCard from "./components/OverviewCard";
import ViewModal from "./components/ViewModal";
import NavCard from "./components/NavCard";
import { Divider, Grid, IconButton, CircularProgress, Stack, Button, Select, Option } from "@mui/joy";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import UnifiedApprovalCard from "./components/UnifiedApprovalCard"
import type { EntityType } from "@/src/types/approval";
import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import SearchBar from "@/src/components/SearchBar";
import { colors } from "@/src/utils/Colors";
import DataTable, { type TableColumn } from "@/src/components/ui/Table";
import AppButton from "@/src/components/Button";

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
  const [pendingBusinesses, setPendingBusinesses] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedItem, setSelectedItem] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  type DisplayMode = "cards" | "table";
  const [display, setDisplay] = useState<DisplayMode>("cards");
  const [touristStatus, setTouristStatus] = useState<'all'|'new'|'edit'>('all');
  const [touristCategory, setTouristCategory] = useState<string>('all');
  const [businessCategory, setBusinessCategory] = useState<string>('all');

  // Load persisted UI state
  useEffect(() => {
    try {
      const savedDisplay = localStorage.getItem('approval.display');
      const savedTab = localStorage.getItem('approval.activeTab');
      const savedTStatus = localStorage.getItem('approval.touristStatus');
      const savedTCategory = localStorage.getItem('approval.touristCategory');
      const savedBCategory = localStorage.getItem('approval.businessCategory');
      if (savedDisplay === 'cards' || savedDisplay === 'table') setDisplay(savedDisplay);
      if (savedTab) setActiveTab(savedTab as TabType);
      if (savedTStatus === 'all' || savedTStatus === 'new' || savedTStatus === 'edit') setTouristStatus(savedTStatus);
      if (savedTCategory) setTouristCategory(savedTCategory);
      if (savedBCategory) setBusinessCategory(savedBCategory);
    } catch {}
  }, []);

  // Persist relevant state changes
  useEffect(() => { try { localStorage.setItem('approval.display', display); } catch {} }, [display]);
  useEffect(() => { try { localStorage.setItem('approval.activeTab', activeTab); } catch {} }, [activeTab]);
  useEffect(() => { try { localStorage.setItem('approval.touristStatus', touristStatus); } catch {} }, [touristStatus]);
  useEffect(() => { try { localStorage.setItem('approval.touristCategory', touristCategory); } catch {} }, [touristCategory]);
  useEffect(() => { try { localStorage.setItem('approval.businessCategory', businessCategory); } catch {} }, [businessCategory]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [spotsData, editsData, businessesData] = await Promise.all([
          apiService.getPendingItems("tourist_spots"),
          apiService.getPendingEditsByEntity("tourist_spots"),
          apiService.getPendingItems("businesses"),
        ]);

        const spots = (spotsData as unknown[] | null) || [];
        const edits = (editsData as unknown[] | null) || [];
        const businesses = (businessesData as unknown[] | null) || [];

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

        // Businesses mapping
        const transformedBusinesses: PendingItem[] = businesses.map((b) => {
          const rec = (b as Record<string, unknown>) || {};
          return {
            ...rec,
            id: String(rec["id"] ?? ""),
            name: String(rec["business_name"] ?? rec["name"] ?? ""),
            description: (rec["description"] as string) ?? null,
            created_at: (rec["created_at"] as string) ?? null,
            action_type: "new",
            entityType: "businesses",
          } as PendingItem;
        });
        setPendingBusinesses(transformedBusinesses);
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
      const [spotsData, editsData, businessesData] = await Promise.all([
        apiService.getPendingItems("tourist_spots"),
        apiService.getPendingEditsByEntity("tourist_spots"),
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

      const businessesArr = (businessesData as unknown[] | null) || [];
      setPendingBusinesses(
        businessesArr.map((b) => {
          const rec = (b as Record<string, unknown>) || {};
          return {
            ...rec,
            id: String(rec["id"] ?? ""),
            name: String(rec["business_name"] ?? rec["name"] ?? ""),
            description: (rec["description"] as string) ?? null,
            created_at: (rec["created_at"] as string) ?? null,
            action_type: "new",
            entityType: "businesses",
          } as PendingItem;
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
      const items = [...pendingSpots, ...pendingEdits, ...pendingBusinesses];
      const item = items.find((i) => String(i.id) === String(id));
      if (!item) return;

      const entity =
        ((item as Record<string, unknown>).entityType as
          | EntityType
          | undefined) || "tourist_spots";
      if (item.action_type === "new") {
        if (action === "approve") await apiService.approveNewEntity(entity, id);
        else await apiService.rejectNewEntity(entity, id, reason ?? "");
      } else {
        if (action === "approve")
          await apiService.approveEditEntity(entity, id);
        else await apiService.rejectEditEntity(entity, id, reason ?? "");
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

  const allPendingItems = [...pendingSpots, ...pendingEdits, ...pendingBusinesses];
  const allItems: PendingItem[] = allPendingItems as PendingItem[];

  const filteredTouristSpots = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = pendingSpots.filter((i) => !q || String(i.name ?? '').toLowerCase().includes(q));
    if (touristCategory !== 'all') {
      base = base.filter((i: any) => Array.isArray(i.categories) && i.categories.some((c: any) => c.category === touristCategory));
    }
    if (touristStatus === 'new') return base;
    if (touristStatus === 'edit') {
      // only edits that pass search and category (category currently only on new items; keep edits when status=edit regardless of category filter)
      return [];
    }
    return base;
  }, [pendingSpots, query, touristCategory, touristStatus]);

  const filteredTouristEdits = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pendingEdits.filter(e => !q || String(e.name ?? '').toLowerCase().includes(q));
  }, [pendingEdits, query]);

  const filteredBusinesses = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = pendingBusinesses.filter(b => !q || String(b.name ?? '').toLowerCase().includes(q));
    if (businessCategory !== 'all') base = base.filter((b: any) => (b.business_category_name || '—') === businessCategory);
    return base;
  }, [pendingBusinesses, query, businessCategory]);

  if (loading)
    return (
      <PageContainer padding={20}>
        <Container
          align="center"
          justify="center"
          padding="4rem"
          style={{ minHeight: "60vh" }}
        >
          <CircularProgress size="lg" />
          <Typography.Body size="sm" sx={{ marginTop: "1rem" }}>
            Loading approval data...
          </Typography.Body>
        </Container>
      </PageContainer>
    );

  return (
    <PageContainer padding={20} style={{ height: "100vh" }}>
      {/* Header Section */}
      <Container
        direction="row"
        justify="space-between"
        align="center"
        padding="0"
        gap="1rem"
        style={{ marginBottom: "2rem" }}
      >
        <Container padding="0" gap="0.5rem">
          <Typography.Header size="lg" color="primary">
            Content Approvals
          </Typography.Header>
          <Typography.Body size="sm" color="default">
            Review and manage submissions from the public and partners
          </Typography.Body>
        </Container>
        <Container direction="row" padding="0" gap="0.5rem" align="center">
          <IconButton
            size="sm"
            variant={display === "cards" ? "solid" : "soft"}
            color={display === "cards" ? "primary" : "neutral"}
            aria-label="Cards view"
            onClick={() => setDisplay("cards")}
          >
            <DashboardRoundedIcon />
          </IconButton>
          <IconButton
            size="sm"
            variant={display === "table" ? "solid" : "soft"}
            color={display === "table" ? "primary" : "neutral"}
            aria-label="Table view"
            onClick={() => setDisplay("table")}
          >
            <TableRowsRoundedIcon />
          </IconButton>
          <IconButton
            size="sm"
            variant="soft"
            color="neutral"
            onClick={refresh}
            aria-label="Refresh"
            sx={{
              "&:hover": { backgroundColor: colors.primary + "20" },
            }}
          >
            <RefreshRoundedIcon />
          </IconButton>
        </Container>
      </Container>

      {/* Navigation Cards */}
      <Grid container spacing={1}>
        {(
          [
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
              count: pendingSpots.length + pendingEdits.length,
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
          ] as const
        ).map((n) => (
          <Grid key={n.key} xs={12} sm={6} md={3} lg={3} xl={3}>
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

      <Divider />

      {/* Content Sections */}
      {activeTab === "overview" && (
        <Grid container spacing={2}>
          <Grid xs={12} md={4} lg={4}>
            <OverviewCard
              title="Tourist Spots"
              count={pendingSpots.length + pendingEdits.length}
              icon="📍"
              items={[...pendingSpots, ...pendingEdits]}
              onApprove={handleApprove}
              onView={handleView}
            />
          </Grid>
          <Grid xs={12} md={4} lg={4}>
            <OverviewCard
              title="Events"
              count={mockEvents.length}
              icon="📅"
              items={mockEvents}
              onView={handleView}
            />
          </Grid>
          <Grid xs={12} md={4} lg={4}>
            <OverviewCard
              title="Businesses"
              count={pendingBusinesses.length}
              icon="🏢"
              items={pendingBusinesses}
              onView={handleView}
            />
          </Grid>
        </Grid>
      )}

      {activeTab === "tourist_spots" && (
        <>
          <Stack direction={{ xs:'column', md:'row'}} spacing={1} alignItems={{ xs:'stretch', md:'center'}} justifyContent="space-between" sx={{ mb: 2 }}>
            <div style={{ minWidth: 320, width: 560, maxWidth: '100%' }}>
              <SearchBar value={query} onChangeText={setQuery} onSearch={() => {}} placeholder="Search tourist spots..." />
            </div>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Button size="sm" variant={touristStatus==='all'?'solid':'soft'} onClick={() => setTouristStatus('all')}>All</Button>
              <Button size="sm" variant={touristStatus==='new'?'solid':'soft'} onClick={() => setTouristStatus('new')}>New</Button>
              <Button size="sm" variant={touristStatus==='edit'?'solid':'soft'} onClick={() => setTouristStatus('edit')}>Edit</Button>
              <Select
                size="sm"
                value={touristCategory}
                onChange={(_, v) => setTouristCategory(String(v ?? 'all'))}
                placeholder="Category"
                sx={{ minWidth: 160 }}
              >
                <Option value="all">All Categories</Option>
                {Array.from(new Set(pendingSpots.flatMap((s: any) => (Array.isArray(s.categories)? s.categories.map((c: any) => c.category):[]))))
                  .filter(Boolean)
                  .sort()
                  .map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
              </Select>
            </Stack>
          </Stack>
          {display === "cards" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "12px",
                padding: "8px",
              }}
            >
              {(
                touristStatus === 'edit' ? filteredTouristEdits : touristStatus === 'new' ? filteredTouristSpots : [...filteredTouristSpots, ...filteredTouristEdits]
              ).map((item) => {
                const unified = {
                  id: item.id,
                  entityType: "tourist_spots" as const,
                  actionType: item.action_type,
                  name: item.name,
                  typeLabel: "tourist spot",
                  categoryLabel: (item as any).categories?.[0]?.category || "—",
                  submittedDate: (item as any).submitted_at || (item as any).created_at || "",
                  image: (item as any).primary_image || null,
                  raw: item as any,
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
              {(!loading && ((touristStatus==='edit' ? filteredTouristEdits.length : touristStatus==='new' ? filteredTouristSpots.length : (filteredTouristSpots.length + filteredTouristEdits.length))) === 0) && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.7 }}>No pending tourist spots</div>
              )}
            </div>
          ) : (
            (() => {
              const list = (touristStatus==='edit' ? filteredTouristEdits : touristStatus==='new' ? filteredTouristSpots : [...filteredTouristSpots, ...filteredTouristEdits]) as any[];
              const columns: TableColumn<any>[] = [
                { id: 'name', label: 'Name', minWidth: 200, render: (row) => row.name },
                { id: 'type', label: 'Type', render: () => 'tourist spot' },
                { id: 'category', label: 'Category', render: (row: any) => row.categories?.[0]?.category || '—' },
                { id: 'submitted', label: 'Submitted', render: (row: any) => (row.submitted_at || row.created_at) ? new Date(row.submitted_at || row.created_at).toLocaleDateString() : '—' },
                { id: 'kind', label: 'Kind', render: (row: any) => row.action_type || (filteredTouristEdits.includes(row) ? 'edit' : 'new') },
                { id: 'actions', label: 'Actions', align: 'right', render: (row: any) => (
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <AppButton size="sm" variant="soft" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleView(row); }}>View</AppButton>
                    <AppButton size="sm" variant="outlined" colorScheme="success" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleApprove(String(row.id)); }}>Approve</AppButton>
                    <AppButton size="sm" variant="outlined" colorScheme="error" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleReject(String(row.id)); }}>Reject</AppButton>
                  </div>
                ) },
              ];
              return (
                <DataTable
                  columns={columns}
                  data={list}
                  rowsPerPage={10}
                  rowKey={(r: any) => r.id}
                  emptyMessage="No pending tourist spots"
                />
              );
            })()
          )}
        </>
      )}

      {activeTab === "events" && (
        (() => {
          const columns: TableColumn<any>[] = [
            { id: 'name', label: 'Name', minWidth: 220, render: (row) => row.name },
            { id: 'type', label: 'Type', render: () => 'event' },
            { id: 'submitted', label: 'Submitted', render: (row: any) => row.submitted_at ? new Date(row.submitted_at).toLocaleDateString() : '—' },
            { id: 'actions', label: 'Actions', align: 'right', render: (row: any) => (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <AppButton size="sm" variant="soft" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleView(row); }}>View</AppButton>
                <AppButton size="sm" variant="outlined" colorScheme="success" onClick={(e: React.MouseEvent) => { e.stopPropagation(); alert('Events approval not yet implemented'); }}>Approve</AppButton>
                <AppButton size="sm" variant="outlined" colorScheme="error" onClick={(e: React.MouseEvent) => { e.stopPropagation(); alert('Events rejection not yet implemented'); }}>Reject</AppButton>
              </div>
            ) },
          ];
          return (
            <DataTable
              columns={columns}
              data={mockEvents as any[]}
              rowsPerPage={10}
              rowKey={(r: any) => r.id}
              emptyMessage="No events"
            />
          );
        })()
      )}

      {activeTab === "businesses" && (
        <>
          <Stack direction={{ xs:'column', md:'row'}} spacing={1} alignItems={{ xs:'stretch', md:'center'}} justifyContent="space-between" sx={{ mb: 2 }}>
            <div style={{ minWidth: 320, width: 560, maxWidth: '100%' }}>
              <SearchBar value={query} onChangeText={setQuery} onSearch={() => {}} placeholder="Search businesses..." />
            </div>
            <Select
              size="sm"
              value={businessCategory}
              onChange={(_, v) => setBusinessCategory(String(v ?? 'all'))}
              placeholder="Category"
              sx={{ minWidth: 180 }}
            >
              <Option value="all">All Categories</Option>
              {Array.from(new Set(pendingBusinesses.map((b: any) => b.business_category_name).filter(Boolean))).sort().map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
            </Select>
          </Stack>
        {display === "cards" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "12px",
              padding: "8px",
            }}
          >
            {filteredBusinesses
              .map((biz) => {
                const unified = {
                  id: biz.id,
                  entityType: "businesses" as const,
                  actionType: biz.action_type,
                  name: biz.name,
                  typeLabel: (biz as any).business_type_name || 'business',
                  categoryLabel: (biz as any).business_category_name || '—',
                  submittedDate: biz.created_at || '',
                  image: (biz as any).business_image || null,
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
            {filteredBusinesses.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.7 }}>No pending businesses</div>
            )}
          </div>
        ) : (
          (() => {
            const columns: TableColumn<any>[] = [
              { id: 'name', label: 'Name', minWidth: 200, render: (row) => row.name },
              { id: 'type', label: 'Type', render: (row: any) => row.business_type_name || 'business' },
              { id: 'category', label: 'Category', render: (row: any) => row.business_category_name || '—' },
              { id: 'submitted', label: 'Submitted', render: (row: any) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '—' },
              { id: 'actions', label: 'Actions', align: 'right', render: (row: any) => (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <AppButton size="sm" variant="soft" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleView(row); }}>View</AppButton>
                  <AppButton size="sm" variant="outlined" colorScheme="success" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleApprove(String(row.id)); }}>Approve</AppButton>
                  <AppButton size="sm" variant="outlined" colorScheme="error" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleReject(String(row.id)); }}>Reject</AppButton>
                </div>
              ) },
            ];
            return (
              <DataTable
                columns={columns}
                data={filteredBusinesses as any[]}
                rowsPerPage={10}
                rowKey={(r: any) => r.id}
                emptyMessage="No pending businesses"
              />
            );
          })()
        )}
        </>
      )}


      <ViewModal
        isOpen={!!selectedItem}
        onClose={closeModal}
        item={selectedItem ?? {}}
        onApprove={handleApprove}
        onReject={handleReject}
        processingId={processingId}
      />
    </PageContainer>
  );
};

export default ApprovalDashboard;
