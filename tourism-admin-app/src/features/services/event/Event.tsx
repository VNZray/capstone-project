import { useCallback, useEffect, useMemo, useState } from "react";
import { IoAdd } from "react-icons/io5";
import Text from "@/src/components/Text";
import SearchBar from "@/src/components/SearchBar";
import CategoryFilter from "./components/CategoryFilter";
import Pagination from "./components/Pagination";
import EventTable from "./components/EventTable";
import EventDetails from "./components/EventDetails";
import EventForm from "./components/EventForm";
import type { Event } from "./components/EventTable";
import { apiService } from "@/src/utils/api";
import "./components/Event.css";
import Container from "@/src/components/Container";
import { colors } from "@/src/utils/Colors";
import ErrorBoundary from "./components/ErrorBoundary";

const EventPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddEventModalVisible, setAddEventModalVisible] = useState(false);
  const [isEditEventModalVisible, setEditEventModalVisible] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<Event | undefined>(undefined);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilters, setTypeFilters] = useState<string[]>(["All"]);
  const [categoryNameById, setCategoryNameById] = useState<Record<number, string>>({});
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEventForView, setSelectedEventForView] = useState<Event | undefined>(undefined);
  const eventsPerPage = 10;
  const [selectedEditStep, setSelectedEditStep] = useState<number>(0);

  const generateSampleEvents = (count: number): Event[] => {
    const categories = ["Cultural", "Food", "Adventure", "Religious"];
    const today = new Date();
    return Array.from({ length: count }, (_, i) => ({
      id: `${i + 1}`,
      name: `Sample Event ${i + 1}`,
      date: new Date(today.getTime() + i * 86400000).toISOString(),
      categories: [{ category: categories[i % categories.length] }],
      description: "This is a sample event for demo purposes.",
      status: i % 2 === 0 ? "active" : "inactive",
    }));
  };

  const fetchEventsAndCategories = useCallback(async () => {
    setLoading(true);
    
    try {
      try {
        const { categories } = await apiService.getEventCategoriesAndTypes();
        const uniqueTypes = ["All", ...categories.map((c: any) => c.category)];
        setTypeFilters(uniqueTypes);
        const map: Record<number, string> = {};
        categories.forEach((c: any) => {
          if (typeof c.id === "number") map[c.id] = c.category;
        });
        setCategoryNameById(map);
      } catch (catErr) {
        console.warn("Failed to load event categories; using defaults", catErr);
        setTypeFilters(["All", "Cultural", "Food", "Adventure", "Religious"]);
        setCategoryNameById({ 1: "Cultural", 2: "Food", 3: "Adventure", 4: "Religious" });
      }

      try {
        const eventsData = await apiService.getEvents();
        if (Array.isArray(eventsData) && eventsData.length > 0) {
          setEvents(eventsData);
        } else {
          setEvents(generateSampleEvents(12));
        }
      } catch (evErr) {
        console.warn("Failed to load events; showing sample data", evErr);
        setEvents(generateSampleEvents(12));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventsAndCategories();
  }, [fetchEventsAndCategories]);

  const handlePageChange = (page: number) => {
    console.debug('page change requested', page);
    const clamped = Math.max(1, Math.min(page, totalPages || 1));
    setCurrentPage(clamped);
  };
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
  };
  const handleSearch = (query: string) => {
    console.debug('search requested', query);
    setSearchQuery(query);
    setCurrentPage(1);
  };

  
  const handleViewDetails = (eventOrId: Event | string) => {
    const id = typeof eventOrId === 'string' ? eventOrId : eventOrId.id;

    if (typeof eventOrId !== 'string' && eventOrId) {
      // set the event fallback first to ensure it's available when details mounts
      setSelectedEventForView(adaptEvent(eventOrId as any));
      setSelectedEventId(id ?? null);
      return;
    }

    const original = events.find((e) => String(e.id) === String(id));
    if (original) {
      setSelectedEventForView(adaptEvent(original as any));
      setSelectedEventId(id ?? null);
    } else {
      setSelectedEventForView(undefined);
      setSelectedEventId(id ?? null);
    }
  };

  const handleBack = () => {
    setSelectedEventId(null);
    setSelectedEventForView(undefined);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEventForEdit(event);
    setEditEventModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditEventModalVisible(false);
    setSelectedEventForEdit(undefined);
    setSelectedEditStep(0);
  };

  const handleEventUpdated = () => {
    fetchEventsAndCategories();
    setEditEventModalVisible(false);
    setSelectedEventForEdit(undefined);
    setSelectedEditStep(0);
  };

  const adaptEvent = (row: any): Event => {
    let categories: { category: string }[] | undefined = undefined;
    if (Array.isArray(row?.categories)) {
      // Normalize array elements which may be strings, numbers, or objects with ids
      const names = row.categories
        .map((item: any) => {
          if (!item) return undefined;
          if (typeof item === 'string') return item;
          if (typeof item === 'number') return categoryNameById[item];
          if (typeof item.category === 'string') return item.category;
          if (typeof item.name === 'string') return item.name;
          if (typeof item.category_id === 'number') return categoryNameById[item.category_id];
          if (typeof item.id === 'number') return categoryNameById[item.id];
          return undefined;
        })
        .filter(Boolean);
      if (names.length > 0) {
        categories = names.map((n: string) => ({ category: n }));
      }
    } else if (typeof row?.category === 'string' && row.category.trim() !== '') {
      categories = [{ category: row.category }];
    } else if (Array.isArray(row?.category_ids)) {
      const names = (row.category_ids as any[])
        .map((id) => categoryNameById[Number(id)])
        .filter(Boolean);
      if (names.length > 0) categories = names.map((n) => ({ category: n }));
    } else if (typeof row?.category_id === 'number') {
      const n = categoryNameById[row.category_id];
      if (n) categories = [{ category: n }];
    }
    return {
      id: row.id,
      name: row.event_name ?? row.name ?? "Untitled",
      date: row.event_start_date ?? row.date,
      categories,
      description: row.description,
      status: row.status ?? undefined,
    };
  };

  const filteredAndSearchedEvents = useMemo(() => {
    // First adapt all events to the UI shape to ensure fields like `name` exist
    const adapted = events.map((e) => adaptEvent(e as any));

    let filtered = adapted;
    if (selectedType !== "All") {
      filtered = filtered.filter((event) =>
        Array.isArray(event.categories)
          ? event.categories.some((cat) => cat.category === selectedType)
          : false
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((event) => (event.name ?? "").toLowerCase().includes(q));
    }
    return filtered;
  }, [events, selectedType, searchQuery, categoryNameById]);

  const totalPages = Math.ceil(filteredAndSearchedEvents.length / eventsPerPage);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * eventsPerPage;
    return filteredAndSearchedEvents.slice(
      startIndex,
      startIndex + eventsPerPage
    );
  }, [filteredAndSearchedEvents, currentPage, eventsPerPage]);

  // ensure current page stays within bounds when filtered data length changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages]);

  const handleEditFromDetails = async (step: number = 0) => {
    let eventToEdit = events.find((event) => event.id === selectedEventId);

    if (!eventToEdit && selectedEventId) {
      try {
        eventToEdit = await apiService.getEventById(selectedEventId);
      } catch (e) {
        console.error("Failed to load event for editing:", e);
      }
    }

    if (eventToEdit) {
      setSelectedEventForEdit(eventToEdit);
      setSelectedEditStep(step);
      setEditEventModalVisible(true);
    } else {
      setSelectedEventForEdit(undefined);
      setSelectedEditStep(step);
      setEditEventModalVisible(true);
    }
  };

  // compute initial data to pass to details view to avoid fetch race conditions
  const initialDataForDetails: Event | undefined = (() => {
    if (selectedEventForView) return selectedEventForView;
    if (!selectedEventId) return undefined;
    const original = events.find((e) => String(e.id) === String(selectedEventId));
    return original ? adaptEvent(original as any) : undefined;
  })();

  return (
    <>
      <ErrorBoundary>
      {selectedEventForView ? (
        <EventDetails
          eventId={String(selectedEventForView.id ?? selectedEventId ?? '')}
          initialData={initialDataForDetails}
          onBack={handleBack}
          onEdit={handleEditFromDetails}
        />
      ) : (
        <Container background={colors.background} elevation={2} className="event-container">
          <div className="filter-and-search-container">
            <div className="filter">
              <CategoryFilter
                selectedCategory={selectedType}
                onCategorySelect={handleTypeChange}
                categories={typeFilters}
              />
            </div>
            <div className="search-and-add">
              <div className="search">
                <SearchBar
                  value={searchQuery}
                  onChangeText={handleSearch}
                  onSearch={() => handleSearch(searchQuery)}
                  placeholder="Search events..."
                  containerStyle={{ flex: 1, maxWidth: 300 }}
                />
              </div>
              <div className="add">
                <button
                  className="add-button"
                  onClick={() => setAddEventModalVisible(true)}
                >
                  <IoAdd size={20} color="#FFF" />
                  <Text variant="normal" color="white" className="add-button-text">Add</Text>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <Text variant="normal" color="text-color">Loading events...</Text>
            </div>
          ) : (
            <div className="content">
              <EventTable events={paginatedEvents} onViewDetails={handleViewDetails} onEdit={handleEditEvent} />
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              )}
            </div>
          )}
        </Container>
      )}
      </ErrorBoundary>

      <EventForm
        isVisible={isAddEventModalVisible}
        onClose={() => setAddEventModalVisible(false)}
        onEventAdded={fetchEventsAndCategories}
        mode="add"
      />

      <EventForm
        isVisible={isEditEventModalVisible}
        onClose={handleCloseEditModal}
        onEventUpdated={handleEventUpdated}
        initialData={selectedEventForEdit}
        initialStep={selectedEditStep}
        mode="edit"
      />
    </>
  );
};

export default EventPage;