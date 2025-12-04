import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoAdd } from "react-icons/io5";
import { Star, Search } from "lucide-react";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import Table, { type TableColumn } from "@/src/components/ui/Table";
import DynamicTab from "@/src/components/ui/DynamicTab";
import NoDataFound from "@/src/components/NoDataFound";
import IconButton from "@/src/components/IconButton";
import { Input, Chip, Stack } from "@mui/joy";
import { apiService } from "@/src/utils/api";
import type { Event as EventType, EventCategory, EventStatus } from "@/src/types/Event";
import { EventForm, FeaturedEventsModal } from "./components";

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
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<EventType | undefined>(undefined);
  const [events, setEvents] = useState<EventType[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryTab, setCategoryTab] = useState<string>("All");
  const [categoryTabs, setCategoryTabs] = useState<Array<{ id: string; label: string }>>([{ id: "All", label: "All" }]);
  const navigate = useNavigate();
  const location = useLocation();

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
      
      // Build category tabs from categories
      const list = ["All", ...categoriesData.map((c: EventCategory) => c.name)];
      setCategoryTabs(list.map((c) => ({ id: c, label: c })));
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

    return filtered;
  }, [events, searchQuery, categoryTab]);

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
      minWidth: 200,
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
            <Button
              startDecorator={<Star />}
              colorScheme="secondary"
              variant="solid"
              onClick={() => setFeaturedModalOpen(true)}
            >
              Featured
            </Button>
          </div>

          <IconButton
            onClick={() => setAddEventModalVisible(true)}
            size="lg"
            floating
            floatPosition="bottom-right"
            hoverEffect="rotate"
          >
            <IoAdd />
          </IconButton>
        </Container>

        {/* Search */}
        <Container
          padding="20px 20px 0 20px"
          direction="row"
          justify="space-between"
          align="center"
        >
          <Input
            startDecorator={<Search />}
            placeholder="Search Events"
            size="lg"
            fullWidth
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Container>

        {/* Category filter tabs */}
        <DynamicTab
          padding="12px 20px 0 20px"
          tabs={categoryTabs}
          activeTabId={categoryTab}
          onChange={(tabId) => setCategoryTab(String(tabId))}
        />
      </Container>

      <Container background="transparent" padding="0">
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
        ) : (
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
    </PageContainer>
  );
};

export default Event;
