import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import type { Business, BusinessHours } from "@/src/types/Business";
import type { Address } from "@/src/types/Address";
import type { Owner } from "@/src/types/Owner";
import type { User } from "@/src/types/User";
import type { Permit } from "@/src/types/Permit";
import type { BusinessAmenity } from "@/src/types/Amenity";
import { Card, CardContent, Divider, Chip, Box, Grid } from "@mui/joy";
import { Avatar } from "@mui/joy";
import {
  BusinessOutlined,
  PlaceOutlined,
  EmailOutlined,
  PhoneOutlined,
  PersonOutline,
  DescriptionOutlined,
  ArticleOutlined,
  AccessTime,
  LocalOffer,
} from "@mui/icons-material";
import { useAddress } from "@/src/hooks/useAddress";
import { useEffect, useState } from "react";
import { fetchCategoryTree } from "@/src/services/BusinessService";
import type { CategoryTree } from "@/src/types/Category";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  addressData: Address;
  ownerData: Owner;
  userData: User;
  permitData: Permit[];
  businessHours: BusinessHours[];
  businessAmenities: BusinessAmenity[];
};

const Step5: React.FC<Props> = ({
  data,
  ownerData,
  userData,
  permitData,
  businessHours,
  businessAmenities,
}) => {
  const { address } = useAddress(data?.barangay_id);
  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>(
    []
  );
  const [primaryCategoryName, setPrimaryCategoryName] = useState<string>("");

  // Fetch categories and resolve names
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const tree = await fetchCategoryTree();

        // Flatten tree to get all categories
        const flatCategories: CategoryTree[] = [];
        const flatten = (cats: CategoryTree[]) => {
          for (const cat of cats) {
            flatCategories.push(cat);
            if (cat.children) flatten(cat.children);
          }
        };
        flatten(tree);

        // Resolve category names from IDs
        if (data?.category_ids && data.category_ids.length > 0) {
          const names = data.category_ids
            .map((id) => flatCategories.find((c) => c.id === id)?.title)
            .filter((name): name is string => !!name);
          setSelectedCategoryNames(names);

          // Get primary category name
          if (data.primary_category_id) {
            const primary = flatCategories.find(
              (c) => c.id === data.primary_category_id
            );
            if (primary) setPrimaryCategoryName(primary.title);
          }
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, [data?.category_ids, data?.primary_category_id]);

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value?: string | number | null;
  }) => (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
      <Typography.Label size="sm" weight="semibold">
        {label}:
      </Typography.Label>
      <Typography.Body size="sm">{value || "-"}</Typography.Body>
    </Box>
  );

  const Section = ({
    title,
    children,
    icon,
  }: {
    title: string;
    children: React.ReactNode;
    icon: React.ReactNode;
  }) => (
    <Card
      variant="outlined"
      sx={{ borderRadius: "12px", borderColor: "#e5e7eb" }}
    >
      <CardContent sx={{ py: 1.5, px: 2 }}>
        <Typography.CardTitle
          sx={{
            mb: 1.25,
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: "1rem",
            fontWeight: 600,
          }}
        >
          {icon} {title}
        </Typography.CardTitle>
        <Divider sx={{ mb: 1.5 }} />
        {children}
      </CardContent>
    </Card>
  );

  return (
    <PageContainer gap={0} padding={0}>
      <Container gap="0" style={{ textAlign: "center" }}>
        <Typography.CardTitle>Review & Submit</Typography.CardTitle>
        <Typography.CardSubTitle>
          Review all information before submitting your registration
        </Typography.CardSubTitle>
      </Container>

      <Container>
        {/* Business Summary Card */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: "12px",
            bgcolor: "neutral.softBg",
            border: "1px solid #e5e7eb",
            mb: 2,
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-start" },
              gap: 2,
              p: 2,
            }}
          >
            <Avatar
              src={data.business_image || ""}
              alt={data.business_name}
              variant="solid"
              size="lg"
              sx={{
                bgcolor: "primary.500",
                fontSize: "1.5rem",
                width: 80,
                height: 80,
              }}
            >
              <BusinessOutlined />
            </Avatar>

            <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
              <Typography.CardTitle sx={{ mb: 0.5 }}>
                {data.business_name || "Unnamed Business"}
              </Typography.CardTitle>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 0.5, sm: 2 },
                  flexWrap: "wrap",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography.Body
                  size="sm"
                  startDecorator={<PlaceOutlined fontSize="small" />}
                  sx={{ color: "#6b7280" }}
                >
                  {address?.municipality_name}, {address?.province_name}
                </Typography.Body>

                <Typography.Body
                  size="sm"
                  startDecorator={<EmailOutlined fontSize="small" />}
                  sx={{ color: "#6b7280" }}
                >
                  {data.email}
                </Typography.Body>
                <Typography.Body
                  size="sm"
                  startDecorator={<PhoneOutlined fontSize="small" />}
                  sx={{ color: "#6b7280" }}
                >
                  {data.phone_number}
                </Typography.Body>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          {/* Business Information */}
          <Grid xs={12} md={6}>
            <Section
              title="Business Information"
              icon={<BusinessOutlined color="primary" />}
            >
              <InfoRow label="Business Name" value={data.business_name} />
              <InfoRow
                label="Primary Category"
                value={primaryCategoryName || null}
              />
              {selectedCategoryNames.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography.Label
                    size="sm"
                    weight="semibold"
                    sx={{ mb: 0.5 }}
                  >
                    Category Path:
                  </Typography.Label>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      mt: 0.5,
                    }}
                  >
                    {selectedCategoryNames.map((name, idx) => (
                      <Box
                        key={idx}
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <Chip size="sm" variant="soft" color="primary">
                          {name}
                        </Chip>
                        {idx < selectedCategoryNames.length - 1 && (
                          <span style={{ color: "#64748b" }}>→</span>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              <Box sx={{ mt: 1 }}>
                <InfoRow
                  label="Type"
                  value={
                    data.hasBooking
                      ? "Accommodation (Has Booking)"
                      : "Shop (No Booking)"
                  }
                />
              </Box>
            </Section>
          </Grid>

          {/* Owner Information */}
          <Grid xs={12} md={6}>
            <Section
              title="Owner Information"
              icon={<PersonOutline color="primary" />}
            >
              <InfoRow
                label="Full Name"
                value={`${ownerData.first_name} ${
                  ownerData.middle_name || ""
                } ${ownerData.last_name}`.trim()}
              />
              <InfoRow label="Age" value={ownerData.age} />
              <InfoRow label="Gender" value={ownerData.gender} />
              <InfoRow label="Birthdate" value={ownerData.birthdate} />
              <Divider sx={{ my: 1 }} />
              <InfoRow label="Email" value={userData.email} />
              <InfoRow label="Phone" value={userData.phone_number} />
            </Section>
          </Grid>

          {/* Contact Information */}
          <Grid xs={12} md={6}>
            <Section
              title="Contact Information"
              icon={<PhoneOutlined color="primary" />}
            >
              <InfoRow label="Business Phone" value={data.phone_number} />
              <InfoRow label="Business Email" value={data.email} />
            </Section>
          </Grid>

          {/* Location */}
          <Grid xs={12} md={6}>
            <Section title="Location" icon={<PlaceOutlined color="primary" />}>
              <InfoRow
                label="Province"
                value={address?.province_name || null}
              />
              <InfoRow
                label="Municipality"
                value={address?.municipality_name || null}
              />
              <InfoRow
                label="Barangay"
                value={address?.barangay_name || null}
              />
              {data.latitude && data.longitude && (
                <>
                  <InfoRow label="Latitude" value={data.latitude} />
                  <InfoRow label="Longitude" value={data.longitude} />
                </>
              )}
            </Section>
          </Grid>

          {/* Description */}
          <Grid xs={12}>
            <Section
              title="Business Description"
              icon={<DescriptionOutlined color="primary" />}
            >
              <Typography.Body size="sm">
                {data.description || "No description provided"}
              </Typography.Body>
            </Section>
          </Grid>

          {/* Business Hours */}
          {businessHours && businessHours.some((h) => h.is_open) && (
            <Grid xs={12} md={6}>
              <Section
                title="Business Hours"
                icon={<AccessTime color="primary" />}
              >
                {businessHours
                  .filter((h) => h.is_open)
                  .map((hours, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 0.5,
                      }}
                    >
                      <Typography.Label size="sm" weight="semibold">
                        {hours.day_of_week}:
                      </Typography.Label>
                      <Typography.Body size="sm">
                        {hours.open_time} - {hours.close_time}
                      </Typography.Body>
                    </Box>
                  ))}
              </Section>
            </Grid>
          )}

          {/* Amenities */}
          {businessAmenities && businessAmenities.length > 0 && (
            <Grid xs={12} md={6}>
              <Section title="Amenities" icon={<LocalOffer color="primary" />}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {businessAmenities.map((amenity, index) => (
                    <Chip key={index} size="sm" variant="soft" color="primary">
                      Amenity #{amenity.amenity_id}
                    </Chip>
                  ))}
                </Box>
              </Section>
            </Grid>
          )}

          {/* Permits */}
          <Grid xs={12}>
            <Section
              title="Business Permits"
              icon={<ArticleOutlined color="primary" />}
            >
              {permitData && permitData.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {permitData.map((permit, index) => (
                    <Box
                      key={`${permit.permit_type}-${index}`}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1,
                        borderRadius: "8px",
                        bgcolor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <Typography.Body size="sm" weight="semibold">
                        {permit.permit_type.replace(/_/g, " ").toUpperCase()}
                      </Typography.Body>
                      <a
                        href={permit.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#1976d2",
                          textDecoration: "underline",
                          fontWeight: 500,
                          fontSize: "0.875rem",
                        }}
                      >
                        View File
                      </a>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography.Body
                  size="sm"
                  sx={{ color: "#6b7280", fontStyle: "italic" }}
                >
                  No permits uploaded yet.
                </Typography.Body>
              )}
            </Section>
          </Grid>
        </Grid>
      </Container>
    </PageContainer>
  );
};

export default Step5;
