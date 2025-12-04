import { useState, useEffect } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Stack,
  Box,
  Chip,
  IconButton,
  Input,
  FormControl,
  FormLabel,
  Alert,
} from "@mui/joy";
import { GripVertical, Star, Trash2, Plus, Calendar, MapPin } from "lucide-react";
import Button from "@/src/components/Button";
import Typography from "@/src/components/Typography";
import { apiService } from "@/src/utils/api";
import type { Event } from "@/src/types/Event";

interface FeaturedEventsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FeaturedEventsModal: React.FC<FeaturedEventsModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  // Store featured events directly as Event[] - they have is_featured=true and featured_order
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedItem, setDraggedItem] = useState<Event | null>(null);

  // Fetch featured and available events
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [featured, allEvents] = await Promise.all([
        apiService.getFeaturedEvents(),
        apiService.getEvents({ status: "active" }),
      ]);

      setFeaturedEvents(featured);

      // Filter out already featured events
      const featuredIds = new Set(featured.map((f) => f.id));
      const available = allEvents.filter((e: Event) => !featuredIds.has(e.id));
      setAvailableEvents(available);
    } catch (err) {
      console.error("Error fetching featured events:", err);
      setError("Failed to load featured events");
    } finally {
      setLoading(false);
    }
  };

  // Handle feature event
  const handleFeatureEvent = async (event: Event) => {
    try {
      const nextOrder = featuredEvents.length + 1;
      await apiService.featureEvent(event.id, nextOrder);
      await fetchData();
      setShowAddSection(false);
      setSearchTerm("");
    } catch (err) {
      console.error("Error featuring event:", err);
      setError("Failed to feature event");
    }
  };

  // Handle unfeature event
  const handleUnfeatureEvent = async (eventId: string) => {
    try {
      await apiService.unfeatureEvent(eventId);
      await fetchData();
    } catch (err) {
      console.error("Error unfeaturing event:", err);
      setError("Failed to remove from featured");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: Event) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetItem: Event) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const oldIndex = featuredEvents.findIndex((f) => f.id === draggedItem.id);
    const newIndex = featuredEvents.findIndex((f) => f.id === targetItem.id);

    // Reorder locally first for instant feedback
    const newOrder = [...featuredEvents];
    newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, draggedItem);

    // Update with new order values (index + 1)
    setFeaturedEvents(newOrder);

    // Save new order to backend
    try {
      await apiService.updateFeaturedOrder(
        newOrder.map((item, index) => ({
          event_id: item.id,
          display_order: index + 1,
        }))
      );
    } catch (err) {
      console.error("Error updating order:", err);
      setError("Failed to update order");
      fetchData(); // Revert to server state
    }

    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Filter available events
  const filteredAvailable = availableEvents.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.venue_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ width: 600, maxHeight: "90vh", overflow: "auto" }}>
        <ModalClose />
        <Typography.Header>Manage Featured Events</Typography.Header>
        <Typography.Body color="secondary" size="sm">
          Drag and drop to reorder featured events. The order determines their display priority.
        </Typography.Body>

        {error && (
          <Alert color="danger" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Featured Events List */}
        <Box sx={{ mt: 3 }}>
          <Typography.Body weight="semibold" sx={{ mb: 2 }}>
            <Star size={16} style={{ marginRight: 8, display: "inline" }} />
            Featured Events ({featuredEvents.length})
          </Typography.Body>

          {loading ? (
            <Typography.Body color="secondary">Loading...</Typography.Body>
          ) : featuredEvents.length === 0 ? (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                border: "2px dashed",
                borderColor: "neutral.300",
                borderRadius: "lg",
              }}
            >
              <Typography.Body color="secondary">No featured events yet</Typography.Body>
              <Typography.Body color="secondary" size="sm">
                Add events to feature them on the homepage
              </Typography.Body>
            </Box>
          ) : (
            <Stack spacing={1}>
              {featuredEvents.map((featured, index) => (
                <Box
                  key={featured.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, featured)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, featured)}
                  onDragEnd={handleDragEnd}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: "md",
                    border: "1px solid",
                    borderColor:
                      draggedItem?.id === featured.id ? "primary.400" : "neutral.200",
                    bgcolor:
                      draggedItem?.id === featured.id ? "primary.50" : "background.surface",
                    cursor: "grab",
                    "&:hover": {
                      borderColor: "neutral.400",
                    },
                  }}
                >
                  <GripVertical size={20} style={{ color: "#9CA3AF", flexShrink: 0 }} />

                  <Chip size="sm" variant="outlined" sx={{ flexShrink: 0 }}>
                    #{index + 1}
                  </Chip>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography.Body weight="semibold" sx={{ 
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {featured.name}
                    </Typography.Body>
                    <Stack direction="row" spacing={2}>
                      {featured.start_date && (
                        <Typography.Body size="xs" color="secondary">
                          <Calendar size={12} style={{ marginRight: 4, display: "inline" }} />
                          {formatDate(featured.start_date)}
                        </Typography.Body>
                      )}
                      {featured.venue_name && (
                        <Typography.Body size="xs" color="secondary">
                          <MapPin size={12} style={{ marginRight: 4, display: "inline" }} />
                          {featured.venue_name}
                        </Typography.Body>
                      )}
                    </Stack>
                  </Box>

                  <IconButton
                    size="sm"
                    variant="plain"
                    color="danger"
                    onClick={() => handleUnfeatureEvent(featured.id)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Add Featured Event Section */}
        <Box sx={{ mt: 3 }}>
          {!showAddSection ? (
            <Button
              variant="outlined"
              colorScheme="black"
              startDecorator={<Plus size={16} />}
              onClick={() => setShowAddSection(true)}
              fullWidth
            >
              Add Featured Event
            </Button>
          ) : (
            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "neutral.200",
                borderRadius: "md",
              }}
            >
              <Typography.Body weight="semibold" sx={{ mb: 2 }}>
                Select Event to Feature
              </Typography.Body>

              <FormControl sx={{ mb: 2 }}>
                <FormLabel>Search Events</FormLabel>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or venue..."
                />
              </FormControl>

              {filteredAvailable.length === 0 ? (
                <Typography.Body color="secondary" size="sm">
                  {searchTerm
                    ? "No matching events found"
                    : "All active events are already featured"}
                </Typography.Body>
              ) : (
                <Stack spacing={1} sx={{ maxHeight: 200, overflow: "auto" }}>
                  {filteredAvailable.slice(0, 10).map((event) => (
                    <Box
                      key={event.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1.5,
                        borderRadius: "sm",
                        border: "1px solid",
                        borderColor: "neutral.200",
                        "&:hover": {
                          bgcolor: "neutral.50",
                        },
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography.Body weight="semibold" size="sm" sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {event.name}
                        </Typography.Body>
                        <Stack direction="row" spacing={2}>
                          {event.start_date && (
                            <Typography.Body size="xs" color="secondary">
                              <Calendar size={10} style={{ marginRight: 4, display: "inline" }} />
                              {formatDate(event.start_date)}
                            </Typography.Body>
                          )}
                          {event.venue_name && (
                            <Typography.Body size="xs" color="secondary">
                              <MapPin size={10} style={{ marginRight: 4, display: "inline" }} />
                              {event.venue_name}
                            </Typography.Body>
                          )}
                        </Stack>
                      </Box>
                      <Button
                        size="sm"
                        variant="solid"
                        colorScheme="black"
                        onClick={() => handleFeatureEvent(event)}
                      >
                        Feature
                      </Button>
                    </Box>
                  ))}
                </Stack>
              )}

              <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="plain"
                  colorScheme="gray"
                  onClick={() => {
                    setShowAddSection(false);
                    setSearchTerm("");
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          )}
        </Box>

        {/* Modal Actions */}
        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: "flex-end" }}>
          <Button variant="outlined" colorScheme="gray" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="solid"
            colorScheme="black"
            onClick={() => {
              onSuccess();
              onClose();
            }}
          >
            Done
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default FeaturedEventsModal;
