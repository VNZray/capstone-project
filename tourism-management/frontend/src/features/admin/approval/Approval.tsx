import React, { useEffect, useMemo, useState } from "react";
import { apiService } from "@/src/utils/api";
import ViewModal from "./components/ViewModal";
import StatCard from "./components/StatCard";
import SubmissionCard from "./components/SubmissionCard";
import { Box, Grid, Chip, Input, CircularProgress } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/Description";
import PlaceIcon from "@mui/icons-material/Place";
import EventIcon from "@mui/icons-material/Event";
import BusinessIcon from "@mui/icons-material/Business";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import BarChartIcon from "@mui/icons-material/BarChart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { EntityType } from "@/src/types/approval";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { colors } from "@/src/utils/Colors";
import placeholderImage from "@/src/assets/images/placeholder-image.png";
import { useNavigate } from "react-router-dom";

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
  const [pendingEvents, setPendingEvents] = useState<PendingItem[]>([]);
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
  const [touristStatus, setTouristStatus] = useState<"all" | "new" | "edit">(
    "all"
  );
  const [touristCategory, setTouristCategory] = useState<string>("all");
  const [businessCategory, setBusinessCategory] = useState<string>("all");

  // Load persisted UI state
  useEffect(() => {
    try {
      const savedDisplay = localStorage.getItem("approval.display");
      const savedTab = localStorage.getItem("approval.activeTab");
      const savedTStatus = localStorage.getItem("approval.touristStatus");
      const savedTCategory = localStorage.getItem("approval.touristCategory");
      const savedBCategory = localStorage.getItem("approval.businessCategory");
      if (savedDisplay === "cards" || savedDisplay === "table")
        setDisplay(savedDisplay);
      if (savedTab) setActiveTab(savedTab as TabType);
      if (
        savedTStatus === "all" ||
        savedTStatus === "new" ||
        savedTStatus === "edit"
      )
        setTouristStatus(savedTStatus);
      if (savedTCategory) setTouristCategory(savedTCategory);
      if (savedBCategory) setBusinessCategory(savedBCategory);
    } catch {}
  }, []);

  // Persist relevant state changes
  useEffect(() => {
    try {
      localStorage.setItem("approval.display", display);
    } catch {}
  }, [display]);
  useEffect(() => {
    try {
      localStorage.setItem("approval.activeTab", activeTab);
    } catch {}
  }, [activeTab]);
  useEffect(() => {
    try {
      localStorage.setItem("approval.touristStatus", touristStatus);
    } catch {}
  }, [touristStatus]);
  useEffect(() => {
    try {
      localStorage.setItem("approval.touristCategory", touristCategory);
    } catch {}
  }, [touristCategory]);
  useEffect(() => {
    try {
      localStorage.setItem("approval.businessCategory", businessCategory);
    } catch {}
  }, [businessCategory]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const safeFetch = (p: Promise<any>) => p.catch(() => []);
        const [spotsData, editsData, businessesData, eventsData] = await Promise.all([
          safeFetch(apiService.getPendingItems("tourist_spots")),
          safeFetch(apiService.getPendingEditsByEntity("tourist_spots")),
          safeFetch(apiService.getPendingItems("businesses")),
          safeFetch(apiService.getPendingItems("events")),
        ]);

        const spots = (spotsData as unknown[] | null) || [];
        const edits = (editsData as unknown[] | null) || [];
        const businesses = (businessesData as unknown[] | null) || [];
        const events = (eventsData as unknown[] | null) || [];

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

        const transformedEvents: PendingItem[] = events.map((e) => {
          const rec = (e as Record<string, unknown>) || {};
          return {
            ...rec,
            id: String(rec["id"] ?? ""),
            name: String(rec["name"] ?? ""),
            description: (rec["description"] as string) ?? null,
            created_at: (rec["created_at"] as string) ?? null,
            action_type: "new",
            entityType: "events",
          } as PendingItem;
        });
        setPendingEvents(transformedEvents);
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
      const safeFetch = (p: Promise<any>) => p.catch(() => []);
      const [spotsData, editsData, businessesData, eventsData] = await Promise.all([
        safeFetch(apiService.getPendingItems("tourist_spots")),
        safeFetch(apiService.getPendingEditsByEntity("tourist_spots")),
        safeFetch(apiService.getPendingItems("businesses")),
        safeFetch(apiService.getPendingItems("events")),
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

      const eventsArr = (eventsData as unknown[] | null) || [];
      setPendingEvents(
        eventsArr.map((e) => {
          const rec = (e as Record<string, unknown>) || {};
          return {
            ...rec,
            id: String(rec["id"] ?? ""),
            name: String(rec["name"] ?? ""),
            description: (rec["description"] as string) ?? null,
            created_at: (rec["created_at"] as string) ?? null,
            action_type: "new",
            entityType: "events",
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
      const items = [...pendingSpots, ...pendingEdits, ...pendingBusinesses, ...pendingEvents];
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
  
  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pendingEvents.filter(
      (e) =>
        !q ||
        String(e.name ?? "")
          .toLowerCase()
          .includes(q)
    );
  }, [pendingEvents, query]);

  const allPendingItems = [
    ...pendingSpots,
    ...pendingEdits,
    ...pendingBusinesses,
    ...pendingEvents,
  ];
  const allItems: PendingItem[] = allPendingItems as PendingItem[];

  const filteredTouristSpots = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = pendingSpots.filter(
      (i) =>
        !q ||
        String(i.name ?? "")
          .toLowerCase()
          .includes(q)
    );
    if (touristCategory !== "all") {
      base = base.filter(
        (i: any) =>
          Array.isArray(i.categories) &&
          i.categories.some((c: any) => c.category === touristCategory)
      );
    }
    if (touristStatus === "new") return base;
    if (touristStatus === "edit") {
      // only edits that pass search and category (category currently only on new items; keep edits when status=edit regardless of category filter)
      return [];
    }
    return base;
  }, [pendingSpots, query, touristCategory, touristStatus]);

  const filteredTouristEdits = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pendingEdits.filter(
      (e) =>
        !q ||
        String(e.name ?? "")
          .toLowerCase()
          .includes(q)
    );
  }, [pendingEdits, query]);

  const filteredBusinesses = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = pendingBusinesses.filter(
      (b) =>
        !q ||
        String(b.name ?? "")
          .toLowerCase()
          .includes(q)
    );
    if (businessCategory !== "all")
      base = base.filter(
        (b: any) => (b.business_category_name || "—") === businessCategory
      );
    return base;
  }, [pendingBusinesses, query, businessCategory]);

  // Helper to extract a display image for tourist spots (new or edits)
  const getTouristSpotImage = (item: any): string | null => {
    if (!item || typeof item !== "object") return null;
    // Direct properties
    const directPrimary = item.primary_image || item.image_url;
    // Images array on pending item
    const imagesArr = Array.isArray(item.images) ? item.images : [];
    const primaryFromArray = imagesArr.find(
      (i: any) => i && (i.is_primary || i.isPrimary)
    );
    const firstImage = imagesArr[0];
    // If this is an edit, inspect existingSpot container
    const existing = item.existingSpot || item.original || null;
    const existingImages =
      existing && Array.isArray(existing.images) ? existing.images : [];
    const existingPrimary = existingImages.find(
      (i: any) => i && (i.is_primary || i.isPrimary)
    );
    const existingFirst = existingImages[0];
    const existingPrimaryImageField = existing
      ? existing.primary_image || existing.image_url
      : null;
    return (
      directPrimary ||
      (primaryFromArray &&
        (primaryFromArray.file_url || primaryFromArray.url)) ||
      (firstImage && (firstImage.file_url || firstImage.url)) ||
      existingPrimaryImageField ||
      (existingPrimary && (existingPrimary.file_url || existingPrimary.url)) ||
      (existingFirst && (existingFirst.file_url || existingFirst.url)) ||
      null ||
      null
    );
  };

  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"all" | EntityType>("all");

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size="lg" />
          <Typography.Body size="sm" sx={{ marginTop: "1rem" }}>
            Loading approval data...
          </Typography.Body>
        </Box>
      </Box>
    );

  return (
    <Box
      sx={{
        padding: "clamp(1rem, 3vw, 2rem)",
        margin: "0 auto",
        backgroundColor: colors.background,
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          marginBottom: "clamp(1.5rem, 4vw, 2.5rem)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box>
            <Typography.Header size="md" weight="bold">
              Content Approvals
            </Typography.Header>
            <Typography.Body size="xs" sx={{ opacity: 0.7, marginTop: "4px" }}>
              Review and manage submissions from the public and partners
            </Typography.Body>
          </Box>
        </Box>
      </Box>

      {/* Stats Overview Cards */}
      <Grid
        container
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{ marginBottom: "clamp(1.5rem, 4vw, 2.5rem)" }}
      >
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<DescriptionIcon sx={{ color: colors.primary }} />}
            title="Pending Reviews"
            count={allItems.length}
            badge="+3 this week"
            iconBgColor={colors.primary + "20"}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<PlaceIcon sx={{ color: colors.success }} />}
            title="Tourist Spots"
            count={pendingSpots.length + pendingEdits.length}
            iconBgColor={colors.success + "20"}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<EventIcon sx={{ color: colors.warning }} />}
            title="Events"
            count={pendingEvents.length}
            iconBgColor={colors.warning + "20"}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<BusinessIcon sx={{ color: colors.info }} />}
            title="Businesses"
            count={pendingBusinesses.length}
            iconBgColor={colors.info + "20"}
          />
        </Grid>
      </Grid>

      {/* Search and Filter Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          marginBottom: "clamp(1.5rem, 4vw, 2rem)",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        {/* Search Bar */}
        <Input
          placeholder="Search submissions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          startDecorator={<SearchIcon />}
          size="lg"
          sx={{
            flex: 1,
            maxWidth: { xs: "100%", sm: "500px" },
            fontSize: "clamp(0.875rem, 2vw, 1rem)",
            "--Input-focusedThickness": "2px",
          }}
        />

        {/* Filter Tabs */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Chip
            variant={currentView === "all" ? "solid" : "soft"}
            color={currentView === "all" ? "primary" : "neutral"}
            onClick={() => setCurrentView("all")}
            sx={{
              cursor: "pointer",
              fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
              padding: "0.5rem 1rem",
              "&:hover": {
                backgroundColor:
                  currentView === "all" ? undefined : colors.primary + "10",
              },
            }}
          >
            All
          </Chip>
          <Chip
            variant={currentView === "tourist_spots" ? "solid" : "soft"}
            color={currentView === "tourist_spots" ? "primary" : "neutral"}
            onClick={() => setCurrentView("tourist_spots")}
            sx={{
              cursor: "pointer",
              fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
              padding: "0.5rem 1rem",
              "&:hover": {
                backgroundColor:
                  currentView === "tourist_spots"
                    ? undefined
                    : colors.primary + "10",
              },
            }}
          >
            Tourist Spots
          </Chip>
          <Chip
            variant={currentView === "events" ? "solid" : "soft"}
            color={currentView === "events" ? "primary" : "neutral"}
            onClick={() => setCurrentView("events")}
            sx={{
              cursor: "pointer",
              fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
              padding: "0.5rem 1rem",
              "&:hover": {
                backgroundColor:
                  currentView === "events" ? undefined : colors.primary + "10",
              },
            }}
          >
            Events
          </Chip>
          <Chip
            variant={currentView === "businesses" ? "solid" : "soft"}
            color={currentView === "businesses" ? "primary" : "neutral"}
            onClick={() => setCurrentView("businesses")}
            sx={{
              cursor: "pointer",
              fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
              padding: "0.5rem 1rem",
              "&:hover": {
                backgroundColor:
                  currentView === "businesses"
                    ? undefined
                    : colors.primary + "10",
              },
            }}
          >
            Businesses
          </Chip>
        </Box>
      </Box>

      {/* Submissions List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {currentView === "all" && (
          <>
            {/* Tourist Spots */}
            {[...filteredTouristSpots, ...filteredTouristEdits].map((item) => {
              const img = getTouristSpotImage(item) || placeholderImage;
              const categoryLabel =
                (item as any).categories?.[0]?.category || "—";
              return (
                <SubmissionCard
                  key={`spot-${item.id}`}
                  image={img}
                  typeBadge="Tourist Spot"
                  typeBadgeColor="success"
                  categoryBadge={
                    categoryLabel !== "—" ? categoryLabel : undefined
                  }
                  title={item.name}
                  description={item.description || "No description available"}
                  submitterName={(item as any).submitted_by || "Admin"}
                  submittedDate={
                    (item as any).submitted_at || (item as any).created_at
                      ? new Date(
                          (item as any).submitted_at || (item as any).created_at
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : undefined
                  }
                  location={
                    [
                      (item as any).municipality_name,
                      (item as any).province_name,
                    ]
                      .filter(Boolean)
                      .join(", ") || undefined
                  }
                  actionType={item.action_type}
                  onView={() => handleView(item as any)}
                  onApprove={() => handleApprove(String(item.id))}
                  onReject={() => handleReject(String(item.id))}
                />
              );
            })}

            {/* Events */}
            {filteredEvents.map((event) => {
              const img = (event as any).primary_image || placeholderImage;
              return (
                <SubmissionCard
                  key={`event-${event.id}`}
                  image={img}
                  typeBadge="Event"
                  typeBadgeColor="warning"
                  categoryBadge={
                    (event as any).category_name || "Food & Culture"
                  }
                  title={event.name}
                  description={event.description || "No description available"}
                  submitterName={(event as any).submitter_name || "Organizer"}
                  submittedDate={
                    (event as any).created_at
                      ? new Date((event as any).created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : undefined
                  }
                  location={
                    (event as any).barangay_name || "Plaza Rizal, Naga City"
                  }
                  actionType={event.action_type}
                  onView={() => handleView(event as any)}
                  onApprove={() => handleApprove(String(event.id))}
                  onReject={() => handleReject(String(event.id))}
                />
              );
            })}

            {/* Businesses */}
            {filteredBusinesses.map((biz) => {
              const img = (biz as any).business_image || placeholderImage;
              const categoryLabel = (biz as any).business_category_name;
              return (
                <SubmissionCard
                  key={`biz-${biz.id}`}
                  image={img}
                  typeBadge="Business"
                  typeBadgeColor="primary"
                  categoryBadge={categoryLabel || undefined}
                  title={biz.name}
                  description={biz.description || "No description available"}
                  submitterName={(biz as any).owner_name || "Business Owner"}
                  submittedDate={
                    biz.created_at
                      ? new Date(biz.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : undefined
                  }
                  location={
                    [(biz as any).municipality_name, (biz as any).province_name]
                      .filter(Boolean)
                      .join(", ") || undefined
                  }
                  actionType={biz.action_type}
                  onView={() => handleView(biz as any)}
                  onApprove={() => handleApprove(String(biz.id))}
                  onReject={() => handleReject(String(biz.id))}
                />
              );
            })}

            {/* Empty State */}
            {filteredTouristSpots.length === 0 &&
              filteredTouristEdits.length === 0 &&
              filteredEvents.length === 0 &&
              filteredBusinesses.length === 0 && (
                <Box
                  sx={{
                    textAlign: "center",
                    padding: "4rem 2rem",
                    opacity: 0.6,
                  }}
                >
                  <Typography.Body size="sm">
                    No pending submissions found
                  </Typography.Body>
                </Box>
              )}
          </>
        )}

        {currentView === "tourist_spots" && (
          <>
            {[...filteredTouristSpots, ...filteredTouristEdits].map((item) => {
              const img = getTouristSpotImage(item) || placeholderImage;
              const categoryLabel =
                (item as any).categories?.[0]?.category || "—";
              return (
                <SubmissionCard
                  key={`spot-${item.id}`}
                  image={img}
                  typeBadge="Tourist Spot"
                  typeBadgeColor="success"
                  categoryBadge={
                    categoryLabel !== "—" ? categoryLabel : undefined
                  }
                  title={item.name}
                  description={item.description || "No description available"}
                  submitterName={(item as any).submitted_by || "Admin"}
                  submittedDate={
                    (item as any).submitted_at || (item as any).created_at
                      ? new Date(
                          (item as any).submitted_at || (item as any).created_at
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : undefined
                  }
                  location={
                    [
                      (item as any).municipality_name,
                      (item as any).province_name,
                    ]
                      .filter(Boolean)
                      .join(", ") || undefined
                  }
                  actionType={item.action_type}
                  onView={() => handleView(item as any)}
                  onApprove={() => handleApprove(String(item.id))}
                  onReject={() => handleReject(String(item.id))}
                />
              );
            })}
            {filteredTouristSpots.length === 0 &&
              filteredTouristEdits.length === 0 && (
                <Box
                  sx={{
                    textAlign: "center",
                    padding: "4rem 2rem",
                    opacity: 0.6,
                  }}
                >
                  <Typography.Body size="sm">
                    No pending tourist spots
                  </Typography.Body>
                </Box>
              )}
          </>
        )}

        {currentView === "events" && (
          <>
            {filteredEvents.map((event) => {
              const img = (event as any).primary_image || placeholderImage;
              return (
                <SubmissionCard
                  key={`event-${event.id}`}
                  image={img}
                  typeBadge="Event"
                  typeBadgeColor="warning"
                  categoryBadge={
                    (event as any).category_name || "Food & Culture"
                  }
                  title={event.name}
                  description={event.description || "No description available"}
                  submitterName={(event as any).submitter_name || "Organizer"}
                  submittedDate={
                    (event as any).created_at
                      ? new Date((event as any).created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : undefined
                  }
                  location={
                    (event as any).barangay_name || "Plaza Rizal, Naga City"
                  }
                  actionType={event.action_type}
                  onView={() => handleView(event as any)}
                  onApprove={() => handleApprove(String(event.id))}
                  onReject={() => handleReject(String(event.id))}
                />
              );
            })}
            {filteredEvents.length === 0 && (
              <Box
                sx={{
                  textAlign: "center",
                  padding: "4rem 2rem",
                  opacity: 0.6,
                }}
              >
                <Typography.Body size="sm">No pending events</Typography.Body>
              </Box>
            )}
          </>
        )}

        {currentView === "businesses" && (
          <>
            {filteredBusinesses.map((biz) => {
              const img = (biz as any).business_image || placeholderImage;
              const categoryLabel = (biz as any).business_category_name;
              return (
                <SubmissionCard
                  key={`biz-${biz.id}`}
                  image={img}
                  typeBadge="Business"
                  typeBadgeColor="primary"
                  categoryBadge={categoryLabel || undefined}
                  title={biz.name}
                  description={biz.description || "No description available"}
                  submitterName={(biz as any).owner_name || "Business Owner"}
                  submittedDate={
                    biz.created_at
                      ? new Date(biz.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : undefined
                  }
                  location={
                    [(biz as any).municipality_name, (biz as any).province_name]
                      .filter(Boolean)
                      .join(", ") || undefined
                  }
                  actionType={biz.action_type}
                  onView={() => handleView(biz as any)}
                  onApprove={() => handleApprove(String(biz.id))}
                  onReject={() => handleReject(String(biz.id))}
                />
              );
            })}
            {filteredBusinesses.length === 0 && (
              <Box
                sx={{
                  textAlign: "center",
                  padding: "4rem 2rem",
                  opacity: 0.6,
                }}
              >
                <Typography.Body size="sm">
                  No pending businesses
                </Typography.Body>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* View Modal */}
      <ViewModal
        isOpen={!!selectedItem}
        onClose={closeModal}
        item={selectedItem ?? {}}
        onApprove={handleApprove}
        onReject={handleReject}
        processingId={processingId}
      />
    </Box>
  );
};

export default ApprovalDashboard;
