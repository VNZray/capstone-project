import Container from "@/src/components/Container";
import IconButton from "@/src/components/IconButton";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import DynamicTab from "@/src/components/ui/DynamicTab";
import Card from "@/src/components/Card";
import NoDataFound from "@/src/components/NoDataFound";
import { Refresh, MoreVert } from "@mui/icons-material";
import { Input, Option, Select, Menu, MenuItem, Dropdown, MenuButton, ListItemDecorator, Chip } from "@mui/joy";
import { Search, Edit, Eye, Trash2, ListChecks, Home, Building2, Hotel, TreePine, Palmtree, House, Bed, Coffee, Castle, Mountain } from "lucide-react";
import { useState, useEffect } from "react";
import { getData } from "@/src/services/Service";
import type { BusinessDetails } from "@/src/types/Business";
import type { Category } from "@/src/types/TypeAndCategeory";
import { fetchCategoryTree } from "@/src/services/BusinessService";
import placeholderImage from "@/src/assets/images/placeholder-image.png";

const Accommodation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filter, setFilter] = useState<"active" | "inactive">("active");
  const [accommodations, setAccommodations] = useState<BusinessDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Category icon mapping
  const categoryIcons: Record<number, React.ReactNode> = {
    1: <Building2 size={16} />,
    2: <Palmtree size={16} />,
    10: <Bed size={16} />,
    11: <Home size={16} />,
    12: <Coffee size={16} />,
    16: <House size={16} />,
    17: <Hotel size={16} />,
    18: <Building2 size={16} />,
    19: <Castle size={16} />,
    20: <Mountain size={16} />,
    21: <Home size={16} />,
    22: <TreePine size={16} />,
    23: <Bed size={16} />,
    24: <Building2 size={16} />,
    25: <TreePine size={16} />,
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

  // Generate dynamic tabs based on available categories in accommodations
  const tabs = [
    { id: "all", label: "All", icon: <ListChecks size={16} /> },
    ...Array.from(new Set(accommodations.flatMap((acc) => acc.category_ids || [])))
      .filter((categoryId) => categoryId !== undefined && categoryId !== null)
      .sort((a, b) => a - b)
      .map((categoryId) => ({
        id: String(categoryId),
        label: getCategoryName(categoryId),
        icon: categoryIcons[categoryId] || <Building2 size={16} />,
      })),
  ];

  // Fetch accommodations and categories on component mount
  useEffect(() => {
    fetchAccommodations();
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

  const fetchAccommodations = async () => {
    setLoading(true);
    try {
      const response = await getData("business");
      // Filter for accommodation type businesses (hasBooking = true)
      const accommodationData = Array.isArray(response)
        ? response.filter((business: BusinessDetails) => business.hasBooking === true)
        : [];
      setAccommodations(accommodationData);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter accommodations based on search, status, and category
  const filteredAccommodations = accommodations.filter((acc) => {
    const matchesSearch =
      acc.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.barangay_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filter === "active"
        ? acc.status?.toLowerCase() === "active"
        : acc.status?.toLowerCase() === "inactive";

    const matchesCategory =
      activeTab === "all" || (acc.category_ids || []).includes(parseInt(activeTab));

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleView = (id: string) => {
    console.log("View accommodation:", id);
    // Navigate to view page
  };

  const handleEdit = (id: string) => {
    console.log("Edit accommodation:", id);
    // Navigate to edit page
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this accommodation?")) return;
    console.log("Delete accommodation:", id);
    // Implement delete logic
  };

  return (
    <PageContainer>
      {/* Tourist Spot Management */}
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
            <Typography.Header>Listed Accommodations</Typography.Header>
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
            placeholder="Search accommodations by name, address, or location"
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
            onClick={fetchAccommodations}
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
            message="Fetching accommodations, please wait."
          />
        ) : filteredAccommodations.length === 0 ? (
          <NoDataFound
            icon={searchQuery ? "search" : "database"}
            title={searchQuery ? "No Search Results" : "No Accommodations"}
            message={
              searchQuery
                ? `No accommodations match "${searchQuery}". Try a different search term.`
                : "No accommodations found. Add your first accommodation to get started."
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
            {filteredAccommodations.map((accommodation) => (
              <Card
                key={accommodation.id}
                variant="grid"
                image={accommodation.business_image || placeholderImage}
                aspectRatio="16/9"
                title={accommodation.business_name}
                subtitle={
                  accommodation.address ||
                  `${accommodation.barangay_name || ""}, ${accommodation.municipality_name || ""}`
                }
                size="default"
                elevation={2}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Chip
                    size="sm"
                    color={accommodation.status === "active" ? "success" : "neutral"}
                  >
                    {accommodation.status}
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
                      <MenuItem onClick={() => handleView(accommodation.id || "")}>
                        <ListItemDecorator>
                          <Eye size={18} />
                        </ListItemDecorator>
                        View Details
                      </MenuItem>
                      <MenuItem onClick={() => handleEdit(accommodation.id || "")}>
                        <ListItemDecorator>
                          <Edit size={18} />
                        </ListItemDecorator>
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleDelete(accommodation.id || "")}
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

export default Accommodation;
