import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import ResponsiveText from "@/src/components/ResponsiveText";
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
  Autocomplete,
} from "@mui/joy";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { HotelIcon, StoreIcon } from "lucide-react";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  businessAmenities: BusinessAmenity[];
  setBusinessAmenities: React.Dispatch<React.SetStateAction<BusinessAmenity[]>>;
};

const Step1: React.FC<Props> = ({ data, setData, setBusinessAmenities }) => {
  const { businessCategories, businessTypes, setSelectedType } =
    useBusinessBasics(api, data, setData);
  return (
    <PageContainer gap={0} padding={0}>
      <Container gap="0">
        <ResponsiveText type="title-small" weight="medium">
          Business Information
        </ResponsiveText>
        <ResponsiveText type="body-medium">
          Please provide your business information.
        </ResponsiveText>
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
            value={data.business_type_id?.toString() ?? ""}
            exclusive
            onChange={(_e, newValue) => {
              if (!newValue) return;
              const type_id = Number(newValue);
              setSelectedType(type_id);
              setData((prev) => ({
                ...prev,
                business_type_id: type_id,
              }));
            }}
            sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}
          >
            {businessTypes.map((type) => (
              <ToggleButton
                key={type.id}
                value={type.id.toString()}
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
                {type.type.toLowerCase() === "accommodation" && (
                  <HotelIcon fontSize="small" />
                )}
                {type.type.toLowerCase() === "shop" && (
                  <StoreIcon fontSize="small" />
                )}
                <ResponsiveText type="label-medium" weight="medium">
                  {type.type}
                </ResponsiveText>
              </ToggleButton>
            ))}
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
            Business Category
          </FormLabel>
          <Select
            variant="outlined"
            size="md"
            value={data.business_category_id?.toString() ?? ""}
            onChange={(_e, value) => {
              if (!value) return;
              const category_id = Number(value);
              setData((prev) => ({
                ...prev,
                business_category_id: category_id,
              }));
            }}
          >
            <Option value="">-- Select a category --</Option>
            {businessCategories.map((category) => (
              <Option key={category.id} value={category.id.toString()}>
                {category.category}
              </Option>
            ))}
          </Select>
        </FormControl>
      </Container>
    </PageContainer>
  );
};

export default Step1;
