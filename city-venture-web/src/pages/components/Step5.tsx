import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import type { Business } from "@/src/types/Business";
import type { Address } from "@/src/types/Address";
import type { Owner } from "@/src/types/Owner";
import type { User } from "@/src/types/User";
import type { Permit } from "@/src/types/Permit";
import { Card, CardContent, Divider, Chip, Stack } from "@mui/joy";
import { Avatar } from "@mui/joy";
import {
  BusinessOutlined,
  PlaceOutlined,
  EmailOutlined,
  PhoneOutlined,
  PersonOutline,
  DescriptionOutlined,
  ArticleOutlined,
} from "@mui/icons-material";
import { useAddress } from "@/src/hooks/useAddress";
import { useBusinessBasics } from "@/src/hooks/useBusiness";
import api from "@/src/services/api";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  addressData: Address;
  ownerData: Owner;
  userData: User;
  permitData: Permit[];
  // Keeping these props to maintain call signature, but old UI does not use them
  businessHours: any[];
  businessAmenities: any[];
};

const Step5: React.FC<Props> = ({ data, setData, permitData }) => {
  const { address } = useAddress(data?.barangay_id);
  const { businessCategories } = useBusinessBasics(data, setData);

  // Get selected category names
  const selectedCategoryNames = (data.category_ids || [])
    .map((id) => businessCategories.find((c) => c.id === id)?.category)
    .filter(Boolean);

  const primaryCategoryName = data.primary_category_id
    ? businessCategories.find((c) => c.id === data.primary_category_id)
        ?.category
    : selectedCategoryNames[0];

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value?: string | number | null;
  }) => (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Typography.Label size="md">{label}:</Typography.Label>
      <Typography.Body>{value || "-"}</Typography.Body>
    </div>
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
      <CardContent sx={{ py: 1, px: 1.25 }}>
        <Typography.CardTitle
          sx={{ mb: 0.75, display: "flex", alignItems: "center", gap: 1 }}
        >
          {icon} {title}
        </Typography.CardTitle>
        <Divider sx={{ mb: 1.25 }} />
        {children}
      </CardContent>
    </Card>
  );

  return (
    <PageContainer gap={0} padding={0}>
      <Container gap="0" style={{ textAlign: "center" }}>
        <Typography.CardTitle>Review & Submit</Typography.CardTitle>
        <Typography.CardSubTitle>
          Review your information before submitting
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
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1.25,
              p: 1.25,
            }}
          >
            <Avatar
              src={data.business_image || ""}
              alt={data.business_name}
              variant="solid"
              size="lg"
              sx={{ bgcolor: "primary.500", fontSize: "1.5rem" }}
            >
              <BusinessOutlined />
            </Avatar>

            <div>
              <Typography.CardTitle>
                {data.business_name || "Unnamed Business"}
              </Typography.CardTitle>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Typography.CardSubTitle
                  startDecorator={<PlaceOutlined fontSize="small" />}
                  sx={{ color: "#6b7280" }}
                >
                  {address?.province_name}, {address?.municipality_name},{" "}
                  {address?.barangay_name}
                </Typography.CardSubTitle>

                <Typography.Body
                  startDecorator={<EmailOutlined fontSize="small" />}
                  sx={{ color: "#6b7280" }}
                >
                  {data.email}
                </Typography.Body>
                <Typography.Body
                  startDecorator={<PhoneOutlined fontSize="small" />}
                  sx={{ color: "#6b7280" }}
                >
                  {data.phone_number}
                </Typography.Body>
              </div>
            </div>
          </CardContent>
        </Card>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "8px 0",
          }}
        >
          {/* Basic Information */}
          <Section
            title="Basic Information"
            icon={<PersonOutline color="primary" />}
          >
            <InfoRow label="Business Name" value={data.business_name} />
            <InfoRow
              label="Type"
              value={data.hasBooking ? "Accommodation" : "Shop"}
            />
            <InfoRow
              label="Primary Category"
              value={primaryCategoryName || null}
            />
            {selectedCategoryNames.length > 1 && (
              <div style={{ marginTop: 8 }}>
                <Typography.Label size="md">All Categories:</Typography.Label>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}
                >
                  {selectedCategoryNames.map((name, idx) => (
                    <Chip key={idx} size="sm" variant="soft" color="primary">
                      {name}
                    </Chip>
                  ))}
                </Stack>
              </div>
            )}
          </Section>

          {/* Contact */}
          <Section
            title="Contact Information"
            icon={<PhoneOutlined color="primary" />}
          >
            <InfoRow label="Phone" value={data.phone_number} />
            <InfoRow label="Email" value={data.email} />
          </Section>

          {/* Location */}
          <Section title="Location" icon={<PlaceOutlined color="primary" />}>
            <InfoRow label="Province" value={address?.province_name || null} />
            <InfoRow
              label="Municipality"
              value={address?.municipality_name || null}
            />
            <InfoRow label="Barangay" value={address?.barangay_name || null} />
            <InfoRow label="Latitude" value={data.latitude || null} />
            <InfoRow label="Longitude" value={data.longitude || null} />
          </Section>

          {/* Description */}
          <Section
            title="Business Description"
            icon={<DescriptionOutlined color="primary" />}
          >
            <Typography.Body>{data.description || "-"}</Typography.Body>
          </Section>

          {/* Permits */}
          <Section
            title="Business Permits"
            icon={<ArticleOutlined color="primary" />}
          >
            {permitData && permitData.length > 0 ? (
              permitData.map((permit, index) => (
                <div
                  key={`${permit.permit_type}-${index}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <Typography.Body>
                    {permit.permit_type.replace("_", " ")}
                  </Typography.Body>
                  <a
                    href={permit.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#1976d2",
                      textDecoration: "underline",
                      fontWeight: 500,
                    }}
                  >
                    View File
                  </a>
                </div>
              ))
            ) : (
              <Typography.Body>No permits uploaded yet.</Typography.Body>
            )}
          </Section>
        </div>
      </Container>
    </PageContainer>
  );
};

export default Step5;
