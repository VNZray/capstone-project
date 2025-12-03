import Container from "@/src/components/Container";
import IconButton from "@/src/components/IconButton";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import DynamicTab from "@/src/components/ui/DynamicTab";
import Card from "@/src/components/Card";
import NoDataFound from "@/src/components/NoDataFound";
import { Refresh, MoreVert } from "@mui/icons-material";
import { Input, Option, Select, Menu, MenuItem, Dropdown, MenuButton, ListItemDecorator, Chip } from "@mui/joy";
import { Search, Edit, Eye, Trash2, ListChecks, Calendar, Music, Utensils, PartyPopper, Theater, Trophy, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { getData } from "@/src/services/Service";
import type { BusinessDetails } from "@/src/types/Business";
import type { Category } from "@/src/types/TypeAndCategeory";
import { fetchCategoryTree } from "@/src/services/BusinessService";
import placeholderImage from "@/src/assets/images/placeholder-image.png";

const Event: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filter, setFilter] = useState<"active" | "inactive">("active");
  const [events, setEvents] = useState<BusinessDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Category icon mapping for event types
  const categoryIcons: Record<number, React.ReactNode> = {
    26: <Calendar size={16} />,
    27: <Music size={16} />,
    28: <Utensils size={16} />,
    29: <PartyPopper size={16} />,
    30: <Theater size={16} />,
    31: <Trophy size={16} />,
    32: <Heart size={16} />,
  };

  // Flatten category tree to get all categories
  const flattenCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    const flatten = (items: Category[]) => {
      for (const cat of items) {
        result.push(cat);
        if (cat.children) flatten(cat.children);
      }
    };
    flatten(cats);
    return result;
  };

  const flatCategories = flattenCategories(categories);

  // Get category name by ID
  const getCategoryName = (id: number): string => {
    const cat = flatCategories.find(c => c.id === id);
    return cat?.title || `Category ${id}`;
  };

  // Generate dynamic tabs based on available categories in events
  const tabs = [
    { id: "all", label: "All", icon: <ListChecks size={16} /> },
    ...Array.from(new Set(events.flatMap((event) => event.category_ids || [])))
      .filter((categoryId) => categoryId !== undefined && categoryId !== null)
      .sort((a, b) => a - b)
      .map((categoryId) => ({
        id: String(categoryId),
        label: getCategoryName(categoryId),
        icon: categoryIcons[categoryId] || <Calendar size={16} />,
      })),
  ];

  // Fetch events and categories on component mount
  useEffect(() => {
    fetchEvents();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const tree = await fetchCategoryTree();
      setCategories(tree);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Fetch from events endpoint if available, otherwise use business data with event categories
      const response = await getData("event");
      setEvents(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter events based on search, status, and category
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.barangay_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filter === "active"
        ? event.status?.toLowerCase() === "active"
        : event.status?.toLowerCase() === "inactive";

    const matchesCategory =
      activeTab === "all" || (event.category_ids || []).includes(parseInt(activeTab));

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleView = (id: string) => {
    console.log("View event:", id);
    // Navigate to view page
  };

  const handleEdit = (id: string) => {
    console.log("Edit event:", id);
    // Navigate to edit page
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    console.log("Delete event:", id);
    // Implement delete logic
  };

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
            <Typography.Header>Listed Events</Typography.Header>
          </div>
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
            placeholder="Search events by name, address, or location"
            size="lg"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1 }}
          />
          {/* Status Filter */}
          <Select
            size="lg"
            value={filter}
            onChange={(_, val) => setFilter(val as typeof filter)}
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>

          <IconButton
            variant="solid"
            colorScheme="black"
            size="lg"
            onClick={fetchEvents}
          >
            <Refresh />
          </IconButton>
        </Container>

        {/* Tabs */}
        <DynamicTab
          tabs={tabs}
          activeTabId={activeTab}
          onChange={(tabId) => {
            setActiveTab(String(tabId));
          }}
        />
      </Container>

      <Container background="transparent" padding="0">
        {loading ? (
          <NoDataFound
            icon="database"
            title="Loading..."
            message="Fetching events, please wait."
          />
        ) : filteredEvents.length === 0 ? (
          <NoDataFound
            icon={searchQuery ? "search" : "database"}
            title={searchQuery ? "No Search Results" : "No Events"}
            message={
              searchQuery
                ? `No events match "${searchQuery}". Try a different search term.`
                : "No events found. Add your first event to get started."
            }
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                variant="grid"
                image={event.business_image || placeholderImage}
                aspectRatio="16/9"
                title={event.business_name}
                subtitle={
                  event.address ||
                  `${event.barangay_name || ""}, ${event.municipality_name || ""}`
                }
                size="default"
                elevation={2}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Chip
                    size="sm"
                    color={event.status === "active" ? "success" : "neutral"}
                  >
                    {event.status}
                  </Chip>
                  <Dropdown>
                    <MenuButton
                      slots={{ root: IconButton }}
                      slotProps={{
                        root: {
                          variant: "plain",
                          size: "sm",
                        } as any,
                      }}
                    >
                      <MoreVert />
                    </MenuButton>
                    <Menu placement="bottom-end">
                      <MenuItem onClick={() => handleView(event.id || "")}>
                        <ListItemDecorator>
                          <Eye size={18} />
                        </ListItemDecorator>
                        View Details
                      </MenuItem>
                      <MenuItem onClick={() => handleEdit(event.id || "")}>
                        <ListItemDecorator>
                          <Edit size={18} />
                        </ListItemDecorator>
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleDelete(event.id || "")}
                        color="danger"
                      >
                        <ListItemDecorator>
                          <Trash2 size={18} />
                        </ListItemDecorator>
                        Delete
                      </MenuItem>
                    </Menu>
                  </Dropdown>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </PageContainer>
  );
};

export default Event;
