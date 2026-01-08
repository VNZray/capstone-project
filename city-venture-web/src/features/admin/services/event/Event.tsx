import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoAdd } from "react-icons/io5";
import { Star, Search, Calendar, Music, Trophy, GraduationCap, Palette, Users, Utensils, Mountain, Church, CalendarDays } from "lucide-react";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import Table, { type TableColumn } from "@/src/components/ui/Table";
import DynamicTab from "@/src/components/ui/DynamicTab";
import NoDataFound from "@/src/components/NoDataFound";
import IconButton from "@/src/components/IconButton";
import ConfirmDialog from "@/src/components/modals/ConfirmDialog";
import Card from "@/src/components/Card";
import { Input, Chip, Stack, Select, Option } from "@mui/joy";
import { apiService } from "@/src/utils/api";
import type { Event as EventType, EventCategory, EventStatus } from "@/src/types/Event";
import EventForm from "./components/EventForm";
import FeaturedEventsModal from "./components/FeaturedEventsModal";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import placeholderImage from "@/src/assets/images/placeholder-image.png";

// Status color mapping
const statusColors: Record<EventStatus, "success" | "warning" | "danger" | "neutral" | "primary"> = {
  draft: "neutral",
  pending: "warning",
  approved: "primary",
  rejected: "danger",
  published: "success",
  cancelled: "danger",
  completed: "neutral",
  archived: "neutral",
};

// Format date for display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const Event = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddEventModalVisible, setAddEventModalVisible] = useState(false);
  const [isEditEventModalVisible, setEditEventModalVisible] = useState(false);
  const [isFeaturedModalOpen, setFeaturedModalOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<EventType | undefined>(undefined);
  const [events, setEvents] = useState<EventType[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryTab, setCategoryTab] = useState<string>("All");
  
  type DisplayMode = "cards" | "table";
  const [display, setDisplay] = useState<DisplayMode>("cards");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  const location = useLocation();

  // Map category name to an icon
  const categoryIconFor = (name?: string): React.ReactNode => {
    const n = String(name || "").toLowerCase();
    if (n.includes("festival")) return <Calendar size={16} />;
    if (n.includes("concert") || n.includes("music")) return <Music size={16} />;
    if (n.includes("sport")) return <Trophy size={16} />;
    if (n.includes("workshop") || n.includes("education")) return <GraduationCap size={16} />;
    if (n.includes("exhibition") || n.includes("art")) return <Palette size={16} />;
    if (n.includes("community")) return <Users size={16} />;
    if (n.includes("food") || n.includes("dining")) return <Utensils size={16} />;
    if (n.includes("nature") || n.includes("adventure")) return <Mountain size={16} />;
    if (n.includes("religious")) return <Church size={16} />;
    return <CalendarDays size={16} />;
  };

  // Build category tabs from categories, sorted with "Other" at the end
  const categoryTabs = useMemo(() => {
    const sortedCategories = [...categories].sort((a, b) => {
      const aIsOther = a.name.toLowerCase() === "other";
      const bIsOther = b.name.toLowerCase() === "other";
      if (aIsOther && !bIsOther) return 1;
      if (!aIsOther && bIsOther) return -1;
      return a.name.localeCompare(b.name);
    });
    const tabs = sortedCategories.map((c) => ({
      id: c.name,
      label: c.name,
      icon: categoryIconFor(c.name),
    }));
    return [{ id: "All", label: "All", icon: <CalendarDays size={16} /> }, ...tabs];
  }, [categories]);

  const fetchEventsAndCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsData, categoriesData] = await Promise.all([
        apiService.getEvents(),
        apiService.getEventCategories(),
      ]);
      setEvents(eventsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventsAndCategories();
  }, [fetchEventsAndCategories]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleViewDetails = (event: EventType) => {
    navigate(`/tourism/services/event/${event.id}`);
  };

  const handleViewReviews = (event: EventType) => {
    navigate(`/tourism/services/event/${event.id}/reviews`);
  };

  const handleEditEvent = (event: EventType) => {
    setSelectedEventForEdit(event);
    setEditEventModalVisible(true);
  };

  const handleDeleteEvent = (event: EventType) => {
    setSelectedEventForEdit(event);
    setShowDelete(true);
  };

  const doDeleteEvent = async () => {
    if (!selectedEventForEdit) return;
    setDeleteLoading(true);
    try {
      await apiService.deleteEvent(selectedEventForEdit.id);
      setShowDelete(false);
      setSelectedEventForEdit(undefined);
      fetchEventsAndCategories();
    } catch (e: any) {
      console.error("Failed to delete event", e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditEventModalVisible(false);
    setSelectedEventForEdit(undefined);
  };

  const handleEventUpdated = () => {
    fetchEventsAndCategories();
    setEditEventModalVisible(false);
    setSelectedEventForEdit(undefined);
  };

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by category tab
    if (categoryTab && categoryTab !== "All") {
      filtered = filtered.filter((event) => event.category_name === categoryTab);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }

    return filtered;
  }, [events, searchQuery, categoryTab, statusFilter]);

  // Get event cover image
  const getEventImageUrl = (event: EventType): string => {
    return event.cover_image_url || placeholderImage;
  };

  // Define table columns - matching tourist spot style
  const columns: TableColumn<EventType>[] = [
    {
      id: "name",
      label: "Name",
      minWidth: 300,
      render: (row) => (
        <Typography.Body weight="normal">
          {row.name}
        </Typography.Body>
      ),
    },
    {
      id: "description",
      label: "Description",
      minWidth: 300,
      render: (row) => (
        <Typography.Body sx={{ opacity: 0.85 }}>
          {row.description?.substring(0, 60)}{row.description && row.description.length > 60 ? "..." : ""}
        </Typography.Body>
      ),
    },
    {
      id: "date",
      label: "Date",
      minWidth: 180,
      render: (row) => (
        <Typography.Body sx={{ opacity: 0.85 }}>
          {formatDate(row.start_date)}
          {row.end_date && row.end_date !== row.start_date && ` - ${formatDate(row.end_date)}`}
        </Typography.Body>
      ),
    },
    {
      id: "category",
      label: "Category",
      minWidth: 150,
      render: (row) => (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
          {row.category_name ? (
            <Chip color="primary" variant="soft" size="md">
              {row.category_name}
            </Chip>
          ) : (
            <Typography.Body sx={{ opacity: 0.5 }}>Uncategorized</Typography.Body>
          )}
        </Stack>
      ),
    },
    {
      id: "status",
      label: "Status",
      minWidth: 120,
      render: (row) => (
        <Chip
          color={statusColors[row.status]}
          variant="soft"
          size="md"
        >
          {row.status}
        </Chip>
      ),
    },
    {
      id: "is_featured",
      label: "Featured",
      minWidth: 100,
      align: "center",
      render: (row) => (
        row.is_featured ? (
          <Star size={18} fill="gold" color="gold" />
        ) : null
      ),
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 280,
      render: (row) => (
        <Stack direction="row" spacing={0.75}>
          <Button
            variant="outlined"
            colorScheme="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditEvent(row);
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            colorScheme="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewReviews(row);
            }}
          >
            Reviews
          </Button>
          <Button
            variant="outlined"
            colorScheme="error"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteEvent(row);
            }}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  // Handle navigation state coming from the details screen requesting to open edit modal
  useEffect(() => {
    const state = location.state as { editEventId?: string } | null;
    if (state?.editEventId) {
      const openEdit = async () => {
        const { editEventId } = state;
        if (!editEventId) {
          navigate(".", { replace: true, state: {} });
          return;
        }
        try {
          // Prefer existing in-memory list, fallback to API
          let eventToEdit = events.find((e) => e.id === editEventId);
          if (!eventToEdit) {
            eventToEdit = await apiService.getEventById(editEventId);
          }
          setSelectedEventForEdit(eventToEdit);
          setEditEventModalVisible(true);
        } catch (e) {
          console.error("Failed to prepare edit from details:", e);
          setSelectedEventForEdit(undefined);
          setEditEventModalVisible(true);
        } finally {
          // Clear state to avoid reopening on re-render/navigation
          navigate(".", { replace: true, state: {} });
        }
      };
      openEdit();
    }
  }, [location.state, events, navigate]);

  return (
    <PageContainer>
      {/* Event Management */}
      <Container gap="0" padding="0" elevation={3}>
        <Container
          direction="row"
          justify="space-between"
          align="center"
          padding="16px 16px 0 16px"
          style={{ flexWrap: "wrap", rowGap: 12, columnGap: 12 }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flex: 1,
              minWidth: 240,
            }}
          >
            <Typography.Header>Event Management</Typography.Header>
          </div>

          <div
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              display: "flex",
              gap: 12,
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <Button
              variant="solid"
              colorScheme="secondary"
              size="lg"
              onClick={() => setFeaturedModalOpen(true)}
              startDecorator={<Star />}
            >
              Manage Featured
            </Button>

            <Button
              onClick={() => setAddEventModalVisible(true)}
              size="lg"
              variant="solid"
              colorScheme="primary"
              startDecorator={<IoAdd />}
            >
              Add Event
            </Button>
          </div>
        </Container>

        {/* Search & Filters */}
        <Container
          padding="20px 20px 0 20px"
          direction="row"
          justify="space-between"
          align="center"
        >
          <Input
            startDecorator={<Search />}
            placeholder="Search events by name, description, or venue"
            size="lg"
            fullWidth
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Select
            value={statusFilter}
            size="lg"
            onChange={(_, v) => setStatusFilter((v as string) ?? "all")}
            sx={{ ml: 1.5, minWidth: 160 }}
          >
            <Option value="all">All Status</Option>
            <Option value="published">Published</Option>
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="draft">Draft</Option>
            <Option value="cancelled">Cancelled</Option>
            <Option value="completed">Completed</Option>
          </Select>

          <Container direction="row" padding="0" gap="0.5rem" align="center">
            <IconButton
              size="lg"
              variant={display === "cards" ? "solid" : "soft"}
              colorScheme={display === "cards" ? "primary" : "secondary"}
              aria-label="Cards view"
              onClick={() => setDisplay("cards")}
            >
              <DashboardRoundedIcon />
            </IconButton>
            <IconButton
              size="lg"
              variant={display === "table" ? "solid" : "soft"}
              colorScheme={display === "table" ? "primary" : "secondary"}
              aria-label="Table view"
              onClick={() => setDisplay("table")}
            >
              <TableRowsRoundedIcon />
            </IconButton>
          </Container>
        </Container>

        {/* Category filter tabs */}
        <DynamicTab
          padding="16px 20px"
          tabs={categoryTabs}
          activeTabId={categoryTab}
          onChange={(tabId) => setCategoryTab(String(tabId))}
        />
      </Container>

      <Container background="transparent" padding={display === "table" ? "20px" : "0"}>
        {loading ? (
          <Container
            align="center"
            justify="center"
            padding="4rem"
            style={{ minHeight: "400px" }}
          >
            <div className="loading-spinner" />
            <Typography.Body size="normal" sx={{ color: "#666", marginTop: "1rem" }}>
              Loading events...
            </Typography.Body>
          </Container>
        ) : error ? (
          <Container
            align="center"
            justify="center"
            padding="4rem"
            style={{ minHeight: "400px" }}
          >
            <Typography.Body size="normal" sx={{ color: "#ff4d4d" }}>
              Error: {error}
            </Typography.Body>
          </Container>
        ) : events.length === 0 ? (
          <NoDataFound
            icon="database"
            title="No Events Listed"
            message="No events yet. Add your first event above."
          >
            <Button
              onClick={() => setAddEventModalVisible(true)}
              startDecorator={<IoAdd size={20} />}
              colorScheme="primary"
              variant="solid"
              size="md"
            >
              Add Event
            </Button>
          </NoDataFound>
        ) : filteredEvents.length === 0 && searchQuery.trim() !== "" ? (
          <NoDataFound
            icon="search"
            title="No Results Found"
            message={`No events match "${searchQuery}". Try a different search term.`}
          />
        ) : display === "table" ? (
          <Table
            columns={columns}
            data={filteredEvents}
            rowKey="id"
            onRowClick={(row) => handleViewDetails(row)}
            rowsPerPage={10}
            loading={loading}
            emptyMessage="No events found"
            stickyHeader
            maxHeight="600px"
          />
        ) : (
          <>
            <style>
              {`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                  height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(0, 0, 0, 0.2);
                  border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: rgba(0, 0, 0, 0.3);
                }
              `}
            </style>
            <div
              className="custom-scrollbar"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "10px",
                padding: "20px",
                maxHeight: "680px",
                overflowY: "auto",
              }}
            >
              {filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  variant="grid"
                  image={getEventImageUrl(event)}
                  aspectRatio="16/9"
                  title={event.name}
                  subtitle={`${formatDate(event.start_date)}${event.end_date && event.end_date !== event.start_date ? ` - ${formatDate(event.end_date)}` : ""}`}
                  size="sm"
                  elevation={2}
                  actions={[
                    {
                      label: "View",
                      onClick: () => handleViewDetails(event),
                      variant: "solid",
                      colorScheme: "primary",
                      fullWidth: true,
                    },
                    {
                      label: "Edit",
                      onClick: () => handleEditEvent(event),
                      variant: "outlined",
                      colorScheme: "primary",
                      fullWidth: true,
                    },
                    {
                      label: "Delete",
                      onClick: () => handleDeleteEvent(event),
                      variant: "outlined",
                      colorScheme: "error",
                      fullWidth: true,
                    },
                    {
                      label: "Reviews",
                      onClick: () => handleViewReviews(event),
                      variant: "outlined",
                      colorScheme: "secondary",
                      fullWidth: true,
                    },
                  ]}
                >
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                    <Chip
                      size="sm"
                      color={statusColors[event.status]}
                    >
                      {event.status}
                    </Chip>
                    {event.category_name && (
                      <Chip size="sm" color="primary" variant="soft">
                        {event.category_name}
                      </Chip>
                    )}
                    {!!event.is_featured && (
                      <Chip size="sm" color="warning" variant="soft" startDecorator={<Star size={12} />}>
                        Featured
                      </Chip>
                    )}
                  </Stack>
                </Card>
              ))}
            </div>
          </>
        )}
      </Container>

      <EventForm
        isVisible={isAddEventModalVisible}
        onClose={() => setAddEventModalVisible(false)}
        onEventAdded={fetchEventsAndCategories}
        categories={categories}
        mode="add"
      />

      <EventForm
        isVisible={isEditEventModalVisible}
        onClose={handleCloseEditModal}
        onEventUpdated={handleEventUpdated}
        initialData={selectedEventForEdit}
        categories={categories}
        mode="edit"
      />

      <FeaturedEventsModal
        open={isFeaturedModalOpen}
        onClose={() => setFeaturedModalOpen(false)}
        onSuccess={fetchEventsAndCategories}
      />

      <ConfirmDialog
        open={showDelete}
        title="Delete Event"
        description={`Are you sure you want to delete "${selectedEventForEdit?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
        onClose={() => setShowDelete(false)}
        onConfirm={doDeleteEvent}
      />
    </PageContainer>
  );
};

export default Event;
