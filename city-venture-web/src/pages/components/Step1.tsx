import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import { useBusinessBasics } from "@/src/hooks/useBusiness";
import api from "@/src/services/api";
import type { BusinessAmenity } from "@/src/types/Amenity";
import type { Business } from "@/src/types/Business";
import {
  FormControl,
  Input,
  Select,
  Option,
  Textarea,
  FormLabel,
  Checkbox,
  List,
  ListItem,
} from "@mui/joy";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { HotelIcon, StoreIcon } from "lucide-react";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  businessAmenities: BusinessAmenity[];
  setBusinessAmenities: React.Dispatch<React.SetStateAction<BusinessAmenity[]>>;
};

const Step1: React.FC<Props> = ({ data, setData }) => {
  const { 
    businessCategories,
    selectedCategories, 
    setSelectedCategories 
  } = useBusinessBasics(api, data, setData);

  // Toggle category selection
  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prev) => {
      const newSelection = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];
      
      // Update form data
      setData((prevData) => ({
        ...prevData,
        category_ids: newSelection,
        // Set first selected as primary if no primary set
        primary_category_id: prevData.primary_category_id && newSelection.includes(prevData.primary_category_id)
          ? prevData.primary_category_id
          : newSelection[0],
      }));
      
      return newSelection;
    });
  };

  // Set primary category
  const handleSetPrimary = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      setData((prev) => ({
        ...prev,
        primary_category_id: categoryId,
      }));
    }
  };

  return (
    <PageContainer gap={0} padding={0}>
      <Container gap="0">
        <Typography.CardTitle>Business Information</Typography.CardTitle>
        <Typography.CardSubTitle>
          Please provide your business information.
        </Typography.CardSubTitle>
      </Container>

      <Container>
        <FormControl required>
          <FormLabel>Business Name</FormLabel>
          <Input
            placeholder="Enter your business name"
            fullWidth
            value={data.business_name}
            onChange={(e) =>
              setData((prev) => ({ ...prev, business_name: e.target.value }))
            }
          />
        </FormControl>

        <FormControl required>
          <FormLabel>Business Email</FormLabel>
          <Input
            placeholder="Enter your business Email"
            fullWidth
            value={data.email}
            onChange={(e) =>
              setData((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </FormControl>

        <FormControl required>
          <FormLabel>Business Phone Number</FormLabel>
          <Input
            placeholder="Enter your business phone number"
            fullWidth
            value={data.phone_number}
            onChange={(e) =>
              setData((prev) => ({ ...prev, phone_number: e.target.value }))
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel
            sx={{
              mb: 0.75,
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Description
          </FormLabel>
          <Textarea
            maxRows={4}
            minRows={3}
            size="md"
            variant="outlined"
            placeholder="Describe your business..."
            value={data.description}
            onChange={(e) =>
              setData((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </FormControl>

        <FormControl required>
          <FormLabel
            sx={{
              mb: 0.75,
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
            }}
          >
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
            }}
            sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}
          >
            <ToggleButton
              value="accommodation"
              sx={{
                flex: 1,
                minWidth: "120px",
                borderRadius: "10px",
                px: 2,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.75,
                textTransform: "none",
                border: "1px solid",
                borderColor: "#e5e7eb",
                backgroundColor: "#fafafa",
                color: "#374151",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#f5f7ff",
                  borderColor: "#d0d7ff",
                },
                "&.Mui-selected": {
                  backgroundColor: "#eaf2ff",
                  borderColor: "#2563eb",
                  color: "#1d4ed8",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "#e0ecff",
                  borderColor: "#1e40af",
                },
                "&.Mui-focusVisible": {
                  outline: "2px solid #93c5fd",
                  outlineOffset: 2,
                },
              }}
            >
              <HotelIcon fontSize="small" />
              <Typography.Body>Accommodation</Typography.Body>
            </ToggleButton>
            <ToggleButton
              value="shop"
              sx={{
                flex: 1,
                minWidth: "120px",
                borderRadius: "10px",
                px: 2,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.75,
                textTransform: "none",
                border: "1px solid",
                borderColor: "#e5e7eb",
                backgroundColor: "#fafafa",
                color: "#374151",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#f5f7ff",
                  borderColor: "#d0d7ff",
                },
                "&.Mui-selected": {
                  backgroundColor: "#eaf2ff",
                  borderColor: "#2563eb",
                  color: "#1d4ed8",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "#e0ecff",
                  borderColor: "#1e40af",
                },
                "&.Mui-focusVisible": {
                  outline: "2px solid #93c5fd",
                  outlineOffset: 2,
                },
              }}
            >
              <StoreIcon fontSize="small" />
              <Typography.Body>Shop</Typography.Body>
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>

        <FormControl required>
          <FormLabel
            sx={{
              mb: 0.75,
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Business Categories
          </FormLabel>
          <Typography.CardSubTitle sx={{ mb: 1 }}>
            Select one or more categories that describe your business
          </Typography.CardSubTitle>
          <List
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 1,
            }}
          >
            {businessCategories.map((category) => (
              <ListItem
                key={category.id}
                sx={{
                  p: 0,
                  border: "1px solid",
                  borderColor: selectedCategories.includes(category.id)
                    ? "#2563eb"
                    : "#e5e7eb",
                  borderRadius: "8px",
                  backgroundColor: selectedCategories.includes(category.id)
                    ? "#eaf2ff"
                    : "#fafafa",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <Checkbox
                  label={category.title}
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  sx={{ p: 1.5, width: "100%" }}
                />
              </ListItem>
            ))}
          </List>
          {selectedCategories.length > 1 && (
            <FormControl sx={{ mt: 2 }}>
              <FormLabel>Primary Category</FormLabel>
              <Select
                value={data.primary_category_id?.toString() ?? ""}
                onChange={(_e, value) => {
                  if (value) handleSetPrimary(Number(value));
                }}
              >
                {selectedCategories.map((catId) => {
                  const cat = businessCategories.find((c) => c.id === catId);
                  return (
                    <Option key={catId} value={catId.toString()}>
                      {cat?.title ?? `Category ${catId}`}
                    </Option>
                  );
                })}
              </Select>
            </FormControl>
          )}
        </FormControl>
      </Container>
    </PageContainer>
  );
};

export default Step1;
