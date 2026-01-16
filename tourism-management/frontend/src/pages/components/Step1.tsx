import Typography from "@/src/components/Typography";
import { useBusinessBasics } from "@/src/hooks/useBusiness";
import type { BusinessAmenity } from "@/src/types/Amenity";
import type { Business } from "@/src/types/Business";
import type { Category } from "@/src/types/Category";
import {
  FormControl,
  Input,
  Textarea,
  Box,
  Grid,
  Select,
  Option,
} from "@mui/joy";
import { colors } from "@/src/utils/Colors";
import { useState, useEffect } from "react";
import FileUpload from "@/src/components/FileUpload";
import { EmailOutlined, Phone } from "@mui/icons-material";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  businessAmenities: BusinessAmenity[];
  setBusinessAmenities: React.Dispatch<React.SetStateAction<BusinessAmenity[]>>;
};

const Step1: React.FC<Props> = ({ data, setData }) => {
  const { rootCategories, setSelectedCategories, getChildCategories } =
    useBusinessBasics(data, setData);

  const [primaryCategoryId, setPrimaryCategoryId] = useState<number | null>(
    null
  );
  const [secondaryCategoryId, setSecondaryCategoryId] = useState<number | null>(
    null
  );
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);

  const [secondaryCategories, setSecondaryCategories] = useState<Category[]>(
    []
  );
  const [subcategories, setSubcategories] = useState<Category[]>([]);

  // Load secondary categories when primary changes
  useEffect(() => {
    if (primaryCategoryId) {
      getChildCategories(primaryCategoryId).then((children) => {
        setSecondaryCategories(children);
        // Reset secondary and subcategory when primary changes
        setSecondaryCategoryId(null);
        setSubcategoryId(null);
        setSubcategories([]);
      });
    } else {
      setSecondaryCategories([]);
      setSecondaryCategoryId(null);
      setSubcategoryId(null);
      setSubcategories([]);
    }
  }, [primaryCategoryId]);

  // Load subcategories when secondary changes
  useEffect(() => {
    if (secondaryCategoryId) {
      getChildCategories(secondaryCategoryId).then((children) => {
        setSubcategories(children);
        // Reset subcategory when secondary changes
        setSubcategoryId(null);
      });
    } else {
      setSubcategories([]);
      setSubcategoryId(null);
    }
  }, [secondaryCategoryId]);

  // Update category_ids whenever any category changes
  useEffect(() => {
    const categoryIds: number[] = [];
    if (primaryCategoryId) categoryIds.push(primaryCategoryId);
    if (secondaryCategoryId) categoryIds.push(secondaryCategoryId);
    if (subcategoryId) categoryIds.push(subcategoryId);

    const hasAccommodation = primaryCategoryId
      ? rootCategories
          .find((c) => c.id === primaryCategoryId)
          ?.alias?.toLowerCase()
          .includes("accommodation")
      : false;

    setData((prev) => ({
      ...prev,
      primary_category_id: primaryCategoryId ?? undefined,
      category_ids: categoryIds,
      hasBooking: !!hasAccommodation,
    }));

    setSelectedCategories(categoryIds);
  }, [primaryCategoryId, secondaryCategoryId, subcategoryId]);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography.Header sx={{ mb: 1, color: colors.primary }}>
        Business Information
      </Typography.Header>
      <Typography.Body sx={{ mb: 4, color: colors.gray, fontSize: "0.95rem" }}>
        Tell us about your business
      </Typography.Body>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <FormControl required>
          <Typography.Label>Business Name *</Typography.Label>
          <Input
            placeholder="Write the name of your business"
            fullWidth
            value={data.business_name}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                business_name: e.target.value,
              }))
            }
            sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
          />
        </FormControl>

        <FormControl>
          <Typography.Label>Business Profile Image</Typography.Label>
          <FileUpload
            folderName={`${data.id || "temp"}/profile`}
            uploadTo="business-profile"
            onUploadComplete={(publicUrl) =>
              setData((prev) => ({ ...prev, business_image: publicUrl }))
            }
            accept=".jpg,.jpeg,.png,.webp"
            maxSizeMB={5}
            placeholder={
              data.business_image
                ? "Change Image"
                : "Click to upload or drag and drop JPG, PNG, WEBP (Max 5MB)"
            }
          />
          {data.business_image && (
            <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <img
                src={data.business_image}
                alt="Business profile"
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
              <Typography.Body
                sx={{ fontSize: "0.85rem", color: colors.success }}
              >
                ✓ Image uploaded
              </Typography.Body>
            </Box>
          )}
        </FormControl>

        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <FormControl required>
              <Typography.Label>Business Email *</Typography.Label>
              <Input
                placeholder="john.smith@example.com"
                fullWidth
                type="email"
                startDecorator={<EmailOutlined />}
                value={data.email}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, email: e.target.value }))
                }
                sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
              />
            </FormControl>
          </Grid>
          <Grid xs={12} md={6}>
            <FormControl required>
              <Typography.Label>Phone Number *</Typography.Label>
              <Input
                placeholder="(555) 123-4567"
                fullWidth
                startDecorator={<Phone />}
                value={data.phone_number}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, phone_number: e.target.value }))
                }
                sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
              />
              <Typography.Body
                sx={{ fontSize: "0.8rem", color: colors.gray, mt: 0.5 }}
              >
                Format: (XXX) XXX-XXXX
              </Typography.Body>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <FormControl required>
              <Typography.Label>Primary Category *</Typography.Label>
              <Select
                placeholder="Select a primary category..."
                value={primaryCategoryId?.toString() || null}
                onChange={(_, value) => {
                  setPrimaryCategoryId(value ? Number(value) : null);
                }}
                sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
              >
                {rootCategories
                  .filter((cat) => cat.parent_category === null)
                  .map((category) => (
                    <Option key={category.id} value={category.id.toString()}>
                      {category.title}
                    </Option>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={6}>
            <FormControl required>
              <Typography.Label>Secondary Category *</Typography.Label>
              <Select
                placeholder="Select secondary category..."
                disabled={
                  !primaryCategoryId || secondaryCategories.length === 0
                }
                value={secondaryCategoryId?.toString() || null}
                onChange={(_, value) => {
                  setSecondaryCategoryId(value ? Number(value) : null);
                }}
                sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
              >
                {secondaryCategories.map((category) => (
                  <Option key={category.id} value={category.id.toString()}>
                    {category.title}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <FormControl>
          <Typography.Label>Subcategory (Optional)</Typography.Label>
          <Select
            placeholder="Select subcategory..."
            disabled={!secondaryCategoryId || subcategories.length === 0}
            value={subcategoryId?.toString() || null}
            onChange={(_, value) => {
              setSubcategoryId(value ? Number(value) : null);
            }}
            sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
          >
            {subcategories.map((category) => (
              <Option key={category.id} value={category.id.toString()}>
                {category.title}
              </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl required>
          <Typography.Label>Business Email *</Typography.Label>
          <Input
            placeholder="john.smith@example.com"
            fullWidth
            type="email"
            value={data.email}
            onChange={(e) =>
              setData((prev) => ({ ...prev, email: e.target.value }))
            }
            sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
          />
        </FormControl>

        <FormControl required>
          <Typography.Label>Phone Number *</Typography.Label>
          <Input
            placeholder="(555) 123-4567"
            fullWidth
            value={data.phone_number}
            onChange={(e) =>
              setData((prev) => ({ ...prev, phone_number: e.target.value }))
            }
            sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
          />
          <Typography.Body
            sx={{ fontSize: "0.8rem", color: colors.gray, mt: 0.5 }}
          >
            Format: 09XXXXXXXXX
          </Typography.Body>
        </FormControl>

        <FormControl>
          <Typography.Label>Description</Typography.Label>
          <Textarea
            minRows={4}
            placeholder="Describe your business..."
            value={data.description}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            sx={{ borderRadius: "8px", fontSize: "0.95rem" }}
          />
          <Typography.Body
            sx={{ fontSize: "0.8rem", color: colors.gray, mt: 0.5 }}
          >
            Tell us about your business
          </Typography.Body>
        </FormControl>
      </Box>
    </Box>
  );
};

export default Step1;
