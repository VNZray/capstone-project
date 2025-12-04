import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import type { BusinessAmenity } from "@/src/types/Amenity";
import type { Business } from "@/src/types/Business";
import {
  FormControl,
  Input,
  Select,
  Option,
  Textarea,
  FormLabel,
  Card,
  Chip,
} from "@mui/joy";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import {
  HotelIcon,
  StoreIcon,
  Building2,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchCategoryTree,
  fetchCategoryChildren,
  type CategoryTree,
} from "@/src/services/CategoryAndType";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  businessAmenities: BusinessAmenity[];
  setBusinessAmenities: React.Dispatch<React.SetStateAction<BusinessAmenity[]>>;
};

const Step1: React.FC<Props> = ({ data, setData }) => {
  const [level1Categories, setLevel1Categories] = useState<CategoryTree[]>([]);
  const [level2Categories, setLevel2Categories] = useState<CategoryTree[]>([]);
  const [level3Categories, setLevel3Categories] = useState<CategoryTree[]>([]);
  const [selectedLevel1, setSelectedLevel1] = useState<number | null>(null);
  const [selectedLevel2, setSelectedLevel2] = useState<number | null>(null);
  const [selectedLevel3, setSelectedLevel3] = useState<number | null>(null);

  // Fetch root categories based on business type
  useEffect(() => {
    const applicableTo = "business";
    fetchCategoryTree(applicableTo).then((tree: CategoryTree[]) => {
      // Filter root categories (no parent)
      const rootCategories = tree.filter(
        (cat: CategoryTree) => !cat.parent_category
      );

      // Filter based on business type
      const filtered = rootCategories.filter((cat: CategoryTree) => {
        if (data.hasBooking) {
          // For accommodation: show accommodation-related categories
          return [
            "accommodation",
            "food-dining",
            "entertainment",
            "services",
          ].includes(cat.alias);
        } else {
          // For shop: show shopping-related categories
          return ["shopping", "food-dining", "services"].includes(cat.alias);
        }
      });

      setLevel1Categories(filtered);
    });
  }, [data.hasBooking]);

  // Fetch level 2 categories when level 1 is selected
  useEffect(() => {
    if (selectedLevel1) {
      fetchCategoryChildren(selectedLevel1).then((children: CategoryTree[]) => {
        setLevel2Categories(children);
        setLevel3Categories([]);
        setSelectedLevel2(null);
        setSelectedLevel3(null);
      });
    } else {
      setLevel2Categories([]);
      setLevel3Categories([]);
    }
  }, [selectedLevel1]);

  // Fetch level 3 categories when level 2 is selected
  useEffect(() => {
    if (selectedLevel2) {
      fetchCategoryChildren(selectedLevel2).then((children: CategoryTree[]) => {
        setLevel3Categories(children);
        setSelectedLevel3(null);
      });
    } else {
      setLevel3Categories([]);
    }
  }, [selectedLevel2]);

  // Update business data when categories change
  useEffect(() => {
    const categoryIds: number[] = [];
    let primaryId = undefined;

    if (selectedLevel1) categoryIds.push(selectedLevel1);
    if (selectedLevel2) {
      categoryIds.push(selectedLevel2);
      primaryId = selectedLevel2; // Level 2 is usually most specific for primary
    }
    if (selectedLevel3) {
      categoryIds.push(selectedLevel3);
      primaryId = selectedLevel3; // Level 3 is most specific
    }

    setData((prev) => ({
      ...prev,
      category_ids: categoryIds,
      primary_category_id: primaryId || categoryIds[0],
    }));
  }, [selectedLevel1, selectedLevel2, selectedLevel3, setData]);

  const getCategoryBadge = (level: number, title: string) => {
    const colors = {
      1: "primary",
      2: "success",
      3: "warning",
    } as const;

    return (
      <Chip
        size="sm"
        color={colors[level as keyof typeof colors]}
        startDecorator={<CheckCircle2 size={14} />}
        sx={{
          fontWeight: 500,
          fontSize: "0.75rem",
        }}
      >
        {title}
      </Chip>
    );
  };

  return (
    <PageContainer gap={0} padding={0}>
      {/* Header Section */}
      <Card
        variant="soft"
        sx={{
          background: "linear-gradient(135deg, #0A1B47 0%, #0077B6 100%)",
          color: "white",
          border: "none",
          p: { xs: 2, md: 3 },
          mb: 3,
          gap: 0,
        }}
      >
        <Typography.CardTitle sx={{ color: "white" }}>
          Business Information
        </Typography.CardTitle>
        <Typography.CardSubTitle sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
          Tell us about your business to get started
        </Typography.CardSubTitle>
      </Card>

      <Container>
        {/* Business Type Selection */}
        <FormControl required>
          <FormLabel
            sx={{
              mb: 1.5,
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Building2 size={18} />
            Business Type
          </FormLabel>
          <ToggleButtonGroup
            color="primary"
            value={data.hasBooking ? "accommodation" : "shop"}
            exclusive
            onChange={(_e, newValue) => {
              if (!newValue) return;
              setData((prev) => ({
                ...prev,
                hasBooking: newValue === "accommodation",
              }));
              // Reset categories when type changes
              setSelectedLevel1(null);
              setSelectedLevel2(null);
              setSelectedLevel3(null);
            }}
            sx={{
              display: "flex",
              gap: 2,
              width: "100%",
            }}
          >
            <ToggleButton
              value="accommodation"
              sx={{
                flex: 1,
                minHeight: "80px",
                borderRadius: "12px !important",
                border: "2px solid #e5e7eb !important",
                backgroundColor: "white",
                color: "#6b7280",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                "&:hover": {
                  backgroundColor: "#f9fafb",
                  borderColor: "#d1d5db !important",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                },
                "&.Mui-selected": {
                  backgroundColor: "#eef2ff !important",
                  borderColor: "#6366f1 !important",
                  color: "#4f46e5",
                  boxShadow: "0 4px 16px rgba(99, 102, 241, 0.25)",
                  "&:hover": {
                    backgroundColor: "#e0e7ff !important",
                  },
                },
              }}
            >
              <HotelIcon size={28} />
              <Typography.Body sx={{ fontWeight: 600 }}>
                Accommodation
              </Typography.Body>
              <Typography.Body sx={{ fontSize: "0.75rem", opacity: 0.7 }}>
                Hotels, Resorts, Inns
              </Typography.Body>
            </ToggleButton>

            <ToggleButton
              value="shop"
              sx={{
                flex: 1,
                minHeight: "80px",
                borderRadius: "12px !important",
                border: "2px solid #e5e7eb !important",
                backgroundColor: "white",
                color: "#6b7280",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                "&:hover": {
                  backgroundColor: "#f9fafb",
                  borderColor: "#d1d5db !important",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                },
                "&.Mui-selected": {
                  backgroundColor: "#f0fdf4 !important",
                  borderColor: "#22c55e !important",
                  color: "#16a34a",
                  boxShadow: "0 4px 16px rgba(34, 197, 94, 0.25)",
                  "&:hover": {
                    backgroundColor: "#dcfce7 !important",
                  },
                },
              }}
            >
              <StoreIcon size={28} />
              <Typography.Body sx={{ fontWeight: 600 }}>
                Shop/Store
              </Typography.Body>
              <Typography.Body sx={{ fontSize: "0.75rem", opacity: 0.7 }}>
                Retail, Services, Dining
              </Typography.Body>
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>

        {/* Category Selection */}
        <Card variant="outlined" sx={{ p: 2, borderRadius: "12px" }}>
          <Typography.Label sx={{ mb: 2, display: "block", fontWeight: 600 }}>
            Category Selection
          </Typography.Label>

          {/* Selected Categories Display */}
          {(selectedLevel1 || selectedLevel2 || selectedLevel3) && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              {selectedLevel1 &&
                getCategoryBadge(
                  1,
                  level1Categories.find((c) => c.id === selectedLevel1)
                    ?.title || ""
                )}
              {selectedLevel2 &&
                getCategoryBadge(
                  2,
                  level2Categories.find((c) => c.id === selectedLevel2)
                    ?.title || ""
                )}
              {selectedLevel3 &&
                getCategoryBadge(
                  3,
                  level3Categories.find((c) => c.id === selectedLevel3)
                    ?.title || ""
                )}
            </div>
          )}

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Level 1 - Main Category */}
            <FormControl required>
              <FormLabel>Main Category</FormLabel>
              <Select
                placeholder="Select a category"
                value={selectedLevel1}
                onChange={(_e, value) => setSelectedLevel1(value)}
                sx={{
                  borderRadius: "8px",
                  "& .MuiSelect-button": {
                    minHeight: "44px",
                  },
                }}
              >
                {level1Categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.title}
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Level 2 - Subcategory */}
            {level2Categories.length > 0 && (
              <FormControl required>
                <FormLabel>
                  Type{" "}
                  {data.hasBooking
                    ? "(e.g., Hotel, Resort, Inn)"
                    : "(e.g., Clothing, Souvenirs)"}
                </FormLabel>
                <Select
                  placeholder="Select a type"
                  value={selectedLevel2}
                  onChange={(_e, value) => setSelectedLevel2(value)}
                  sx={{
                    borderRadius: "8px",
                    "& .MuiSelect-button": {
                      minHeight: "44px",
                    },
                  }}
                >
                  {level2Categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.title}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Level 3 - Specialty */}
            {level3Categories.length > 0 && (
              <FormControl>
                <FormLabel>Specialty (Optional)</FormLabel>
                <Select
                  placeholder="Select a specialty"
                  value={selectedLevel3}
                  onChange={(_e, value) => setSelectedLevel3(value)}
                  sx={{
                    borderRadius: "8px",
                    "& .MuiSelect-button": {
                      minHeight: "44px",
                    },
                  }}
                >
                  <Option value={null as any}>None</Option>
                  {level3Categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.title}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
        </Card>

        {/* Business Details */}
        <FormControl required>
          <FormLabel
            sx={{
              mb: 1,
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Building2 size={18} />
            Business Name
          </FormLabel>
          <Input
            placeholder="Enter your business name"
            value={data.business_name}
            onChange={(e) =>
              setData((prev) => ({ ...prev, business_name: e.target.value }))
            }
            sx={{
              borderRadius: "8px",
              minHeight: "44px",
              fontSize: "0.9375rem",
            }}
          />
        </FormControl>

        <FormControl required>
          <FormLabel
            sx={{
              mb: 1,
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Mail size={18} />
            Business Email
          </FormLabel>
          <Input
            type="email"
            placeholder="business@example.com"
            value={data.email}
            onChange={(e) =>
              setData((prev) => ({ ...prev, email: e.target.value }))
            }
            sx={{
              borderRadius: "8px",
              minHeight: "44px",
              fontSize: "0.9375rem",
            }}
          />
        </FormControl>

        <FormControl required>
          <FormLabel
            sx={{
              mb: 1,
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Phone size={18} />
            Business Phone Number
          </FormLabel>
          <Input
            placeholder="+63 XXX XXX XXXX"
            value={data.phone_number}
            onChange={(e) =>
              setData((prev) => ({ ...prev, phone_number: e.target.value }))
            }
            sx={{
              borderRadius: "8px",
              minHeight: "44px",
              fontSize: "0.9375rem",
            }}
          />
        </FormControl>

        <FormControl>
          <FormLabel
            sx={{
              mb: 1,
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <FileText size={18} />
            Description
          </FormLabel>
          <Textarea
            maxRows={5}
            minRows={4}
            placeholder="Tell us about your business..."
            value={data.description}
            onChange={(e) =>
              setData((prev) => ({ ...prev, description: e.target.value }))
            }
            sx={{
              borderRadius: "8px",
              fontSize: "0.9375rem",
              "& textarea": {
                minHeight: "100px !important",
              },
            }}
          />
        </FormControl>
      </Container>
    </PageContainer>
  );
};

export default Step1;
