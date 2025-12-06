import React, { useEffect, useState } from "react";
import { Box, Grid, Chip, Divider } from "@mui/joy";
import { Building2, Mail, Phone, MapPin, Clock, FileText } from "lucide-react";
import Typography from "@/src/components/Typography";
import { colors } from "@/src/utils/Colors";
import { useAddress } from "@/src/hooks/useAddress";
import type { Business } from "@/src/types/Business";
import type { Permit } from "@/src/types/Permit";
import type { BusinessHours } from "@/src/types/Business";
import type { BusinessAmenity } from "@/src/types/Amenity";
import { fetchCategoryTree } from "@/src/services/BusinessService";
import type { CategoryTree } from "@/src/types/Category";

type Props = {
  data: Business;
  permitData: Permit[];
  businessHours: BusinessHours[];
  businessAmenities: BusinessAmenity[];
};

const Step7Review: React.FC<Props> = ({ data, permitData, businessHours }) => {
  const { address } = useAddress(data?.barangay_id);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [primaryCategoryName, setPrimaryCategoryName] = useState<string>("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const tree = await fetchCategoryTree();
        const flatCategories: CategoryTree[] = [];
        const flatten = (cats: CategoryTree[]) => {
          for (const cat of cats) {
            flatCategories.push(cat);
            if (cat.children) flatten(cat.children);
          }
        };
        flatten(tree);

        if (data?.category_ids && data.category_ids.length > 0) {
          const names = data.category_ids
            .map((id) => flatCategories.find((c) => c.id === id)?.title)
            .filter((name): name is string => !!name);
          setCategoryNames(names);
        }

        if (data.primary_category_id) {
          const primary = flatCategories.find(
            (c) => c.id === data.primary_category_id
          );
          if (primary) setPrimaryCategoryName(primary.title);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, [data?.category_ids, data?.primary_category_id]);

  const InfoSection = ({
    icon,
    title,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
  }) => (
    <Box
      sx={{
        p: 3,
        backgroundColor: colors.white,
        borderRadius: "12px",
        border: `1px solid ${colors.offWhite}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        {icon}
        <Typography.Label size="md" sx={{ color: colors.primary }}>
          {title}
        </Typography.Label>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Box>
  );

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value?: string | number;
  }) => (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
      <Typography.Body size="sm" weight="semibold" sx={{ color: colors.gray }}>
        {label}
      </Typography.Body>
      <Typography.Body size="sm">{value || "-"}</Typography.Body>
    </Box>
  );

  const openHours = businessHours.filter((h) => h.is_open);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography.CardTitle size="md" sx={{ mb: 1, color: colors.primary }}>
          Review Your Information
        </Typography.CardTitle>
        <Typography.Body size="sm" sx={{ color: colors.gray }}>
          Please review all details before submitting
        </Typography.Body>
      </Box>

      <Grid container spacing={3}>
        {/* Business Preview Card */}
        {data.business_image && (
          <Grid xs={12}>
            <Box
              sx={{
                borderRadius: "12px",
                overflow: "hidden",
                position: "relative",
                height: "200px",
                backgroundColor: colors.offWhite,
              }}
            >
              <img
                src={data.business_image}
                alt={data.business_name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 2,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                }}
              >
                <Typography.CardTitle size="md" sx={{ color: colors.white }}>
                  {data.business_name}
                </Typography.CardTitle>
              </Box>
            </Box>
          </Grid>
        )}

        {/* Basic Information */}
        <Grid xs={12} md={6}>
          <InfoSection
            icon={<Building2 size={20} color={colors.primary} />}
            title="Basic Information"
          >
            <InfoRow label="Business Name" value={data.business_name} />
            <InfoRow label="Description" value={data.description} />
            <Box sx={{ py: 1 }}>
              <Typography.Body
                size="sm"
                weight="semibold"
                sx={{ color: colors.gray, mb: 1 }}
              >
                Categories
              </Typography.Body>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {categoryNames.length > 0 ? (
                  categoryNames.map((name, index) => (
                    <Chip
                      key={index}
                      size="sm"
                      variant={name === primaryCategoryName ? "solid" : "soft"}
                      sx={{
                        bgcolor:
                          name === primaryCategoryName
                            ? colors.primary
                            : colors.secondary,
                        color: colors.white,
                      }}
                    >
                      {name}
                    </Chip>
                  ))
                ) : (
                  <Typography.Body size="xs" sx={{ color: colors.gray }}>
                    No categories selected
                  </Typography.Body>
                )}
              </Box>
            </Box>
          </InfoSection>
        </Grid>

        {/* Contact Information */}
        <Grid xs={12} md={6}>
          <InfoSection
            icon={<Phone size={20} color={colors.primary} />}
            title="Contact"
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
              <Mail size={18} color={colors.secondary} />
              <Typography.Body size="sm">{data.email || "-"}</Typography.Body>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
              <Phone size={18} color={colors.secondary} />
              <Typography.Body size="sm">
                {data.phone_number || "-"}
              </Typography.Body>
            </Box>
          </InfoSection>
        </Grid>

        {/* Location */}
        <Grid xs={12}>
          <InfoSection
            icon={<MapPin size={20} color={colors.primary} />}
            title="Location"
          >
            <InfoRow label="Address" value={data.address} />
            <InfoRow
              label="Full Address"
              value={
                typeof address === "string"
                  ? address
                  : address
                  ? `${address}`
                  : "Not provided"
              }
            />
          </InfoSection>
        </Grid>

        {/* Business Hours */}
        {openHours.length > 0 && (
          <Grid xs={12} md={6}>
            <InfoSection
              icon={<Clock size={20} color={colors.primary} />}
              title="Business Hours"
            >
              {openHours.map((hour) => (
                <Box
                  key={hour.day_of_week}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography.Body size="sm" weight="semibold">
                    {hour.day_of_week}
                  </Typography.Body>
                  <Typography.Body size="sm" sx={{ color: colors.gray }}>
                    {hour.open_time} - {hour.close_time}
                  </Typography.Body>
                </Box>
              ))}
            </InfoSection>
          </Grid>
        )}

        {/* Permits */}
        {permitData.length > 0 && (
          <Grid xs={12} md={6}>
            <InfoSection
              icon={<FileText size={20} color={colors.primary} />}
              title="Permits"
            >
              <Typography.Body size="sm" sx={{ color: colors.gray }}>
                {permitData.length} permit{permitData.length !== 1 ? "s" : ""}{" "}
                uploaded
              </Typography.Body>
            </InfoSection>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Step7Review;
