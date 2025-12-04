import Container from "@/src/components/Container";
import IconButton from "@/src/components/IconButton";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import DynamicTab from "@/src/components/ui/DynamicTab";
import Card from "@/src/components/Card";
import NoDataFound from "@/src/components/NoDataFound";
import { Refresh, MoreVert } from "@mui/icons-material";
import {
  Input,
  Option,
  Select,
  Menu,
  MenuItem,
  Dropdown,
  MenuButton,
  ListItemDecorator,
  Chip,
} from "@mui/joy";
import {
  Search,
  Edit,
  Eye,
  Trash2,
  ListChecks,
  UtensilsCrossed,
  Coffee,
  Gift,
  Shirt,
  Store,
  ShoppingBag,
  ShoppingCart,
  Cake,
  Pill,
  BookOpen,
  Smartphone,
  Gem,
  Building,
  ShoppingBasket,
  Hammer,
  Dumbbell,
  Baby,
  Armchair,
  Dog,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getData } from "@/src/services/Service";
import type { BusinessDetails } from "@/src/types/Business";
import type { CategoryTree } from "@/src/types/Category";
import { fetchCategoryTree } from "@/src/services/BusinessService";
import placeholderImage from "@/src/assets/images/placeholder-image.png";

const Shop: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filter, setFilter] = useState<"active" | "inactive">("active");
  const [shops, setShops] = useState<BusinessDetails[]>([]);
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [loading, setLoading] = useState(true);

  // Category icon mapping for shops
  const categoryIcons: Record<number, React.ReactNode> = {
    3: <UtensilsCrossed size={16} />,
    5: <Coffee size={16} />,
    13: <Gift size={16} />,
    14: <Shirt size={16} />,
    15: <Gift size={16} />,
    26: <Store size={16} />,
    27: <ShoppingCart size={16} />,
    28: <Cake size={16} />,
    29: <Pill size={16} />,
    30: <BookOpen size={16} />,
    31: <Smartphone size={16} />,
    32: <Gem size={16} />,
    33: <Building size={16} />,
    34: <ShoppingBasket size={16} />,
    35: <Hammer size={16} />,
    36: <Dumbbell size={16} />,
    37: <Baby size={16} />,
    38: <Armchair size={16} />,
    39: <Dog size={16} />,
  };

  // Flatten category tree to get all categories
  const flattenCategories = (cats: CategoryTree[]): CategoryTree[] => {
    const result: CategoryTree[] = [];
    const flatten = (items: CategoryTree[]) => {
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
    const cat = flatCategories.find((c) => c.id === id);
    return cat?.title || `Category ${id}`;
  };

  // Generate dynamic tabs based on available categories in shops
  const tabs = [
    { id: "all", label: "All", icon: <ListChecks size={16} /> },
    ...Array.from(
      new Set(
        shops.flatMap(
          (shop) => shop.categories?.map((c) => c.category_id) || []
        )
      )
    )
      .filter((categoryId) => categoryId !== undefined && categoryId !== null)
      .sort((a, b) => a - b)
      .map((categoryId) => ({
        id: String(categoryId),
        label: getCategoryName(categoryId),
        icon: categoryIcons[categoryId] || <ShoppingBag size={16} />,
      })),
  ];

  // Fetch shops and categories on component mount
  useEffect(() => {
    fetchShops();
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

  const fetchShops = async () => {
    setLoading(true);
    try {
      const response = await getData("business");
      // Filter for shop type businesses (hasBooking = false means shop)
      const shopData = Array.isArray(response)
        ? response.filter(
            (business: BusinessDetails) => business.hasBooking === false
          )
        : [];
      setShops(shopData);
    } catch (error) {
      console.error("Error fetching shops:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter shops based on search, status, and category
  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.barangay_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filter === "active"
        ? shop.status?.toLowerCase() === "active"
        : shop.status?.toLowerCase() === "inactive";

    const matchesCategory =
      activeTab === "all" ||
      shop.categories?.some((c) => c.category_id === parseInt(activeTab)) ||
      false;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleView = (id: string) => {
    console.log("View shop:", id);
    // Navigate to view page
  };

  const handleEdit = (id: string) => {
    console.log("Edit shop:", id);
    // Navigate to edit page
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shop?")) return;
    console.log("Delete shop:", id);
    // Implement delete logic
  };

  return (
    <PageContainer>
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
            <Typography.Header>Listed Shops</Typography.Header>
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
            placeholder="Search shops by name, address, or location"
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
            onClick={fetchShops}
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
            message="Fetching shops, please wait."
          />
        ) : filteredShops.length === 0 ? (
          <NoDataFound
            icon={searchQuery ? "search" : "database"}
            title={searchQuery ? "No Search Results" : "No Shops"}
            message={
              searchQuery
                ? `No shops match "${searchQuery}". Try a different search term.`
                : "No shops found. Add your first shop to get started."
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
            {filteredShops.map((shop) => (
              <Card
                key={shop.id}
                variant="grid"
                image={shop.business_image || placeholderImage}
                aspectRatio="16/9"
                title={shop.business_name}
                subtitle={
                  shop.address ||
                  `${shop.barangay_name || ""}, ${shop.municipality_name || ""}`
                }
                size="default"
                elevation={2}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Chip
                    size="sm"
                    color={shop.status === "active" ? "success" : "neutral"}
                  >
                    {shop.status}
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
                      <MenuItem onClick={() => handleView(shop.id || "")}>
                        <ListItemDecorator>
                          <Eye size={18} />
                        </ListItemDecorator>
                        View Details
                      </MenuItem>
                      <MenuItem onClick={() => handleEdit(shop.id || "")}>
                        <ListItemDecorator>
                          <Edit size={18} />
                        </ListItemDecorator>
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleDelete(shop.id || "")}
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

export default Shop;
