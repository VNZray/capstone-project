import Text from "@/src/components/Text";
import React from "react";
import type { Business } from "@/src/types/Business";
import CardHeader from "@/src/components/CardHeader";
import { useAddress } from "@/src/hooks/useAddress";
import { useCategoryAndType } from "@/src/hooks/useCategoryAndType";
import { Card, CardContent, Divider, Typography } from "@mui/joy";
import type { Permit } from "@/src/types/Permit";
import { Avatar } from "@mui/joy";
import {
  BusinessOutlined,
  PlaceOutlined,
  EmailOutlined,
  PhoneOutlined,
} from "@mui/icons-material";

import {
  PersonOutline,
  DescriptionOutlined,
  ArticleOutlined,
} from "@mui/icons-material";
import type { Address } from "@/src/types/Address";

type Props = {
  data: Business;
  addressData: Address;
  api: string;
  permitData: Permit[];
};

const Step7: React.FC<Props> = ({
  data,
  permitData,
  addressData,
}) => {
  const { address } = useAddress(addressData?.barangay_id);
  const { categoryAndType } = useCategoryAndType(data?.business_type_id);

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value?: string | number;
  }) => (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Text variant="medium" color="dark">
        {label}:
      </Text>
      <Text variant="normal" color="dark">
        {value || "-"}
      </Text>
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
    <Card variant="outlined" sx={{ borderRadius: "sm" }}>
      <CardContent>
        <Typography
          level="title-md"
          sx={{
            mb: 1,
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {icon} {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );

  return (
    <div className="stepperContent">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: 8,
        }}
      >
        <Card variant="soft" sx={{ borderRadius: "lg" }}>
          <CardContent>
            <CardHeader
              title="Review Your Information"
              color="white"
              margin="0 0 8px 0"
            />
            <Text variant="normal" color="dark">
              Please review your details carefully before submitting your
              business registration.
            </Text>
          </CardContent>
        </Card>

        {/* BUSINESS SUMMARY CARD */}
        <Card
          variant="outlined"
          sx={{ borderRadius: "lg", bgcolor: "neutral.softBg" }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* IMAGE */}
            <Avatar
              src={data.business_image || ""}
              alt={data.business_name}
              variant="solid"
              size="lg"
              sx={{ bgcolor: "primary.500", fontSize: "1.5rem" }}
            >
              <BusinessOutlined />
            </Avatar>

            {/* INFO */}
            <div>
              {/* Business Name */}
              <Typography level="title-lg" fontWeight="lg">
                {data.business_name || "Unnamed Business"}
              </Typography>

              <div style={{ display: "flex", gap: 16 }}>
                {/* Location */}
                <Typography
                  level="body-sm"
                  startDecorator={<PlaceOutlined fontSize="small" />}
                >
                  {addressData?.province_id}, {addressData?.municipality_id},{" "}
                  {addressData?.barangay_id || "-"}
                </Typography>

                {/* Email + Phone */}
                <Typography
                  level="body-sm"
                  startDecorator={<EmailOutlined fontSize="small" />}
                >
                  {data.email}
                </Typography>
                <Typography
                  level="body-sm"
                  startDecorator={<PhoneOutlined fontSize="small" />}
                >
                  {data.phone_number}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BASIC INFO */}
        <Section
          title="Basic Information"
          icon={<PersonOutline color="primary" />}
        >
          <InfoRow label="Business Name" value={data.business_name} />
          <InfoRow label="Type" value={categoryAndType?.type_name} />
          <InfoRow label="Category" value={categoryAndType?.category_name} />
        </Section>

        {/* CONTACT */}
        <Section
          title="Contact Information"
          icon={<PhoneOutlined color="primary" />}
        >
          <InfoRow label="Phone" value={data.phone_number} />
          <InfoRow label="Email" value={data.email} />
        </Section>

        {/* LOCATION */}
        <Section title="Location" icon={<PlaceOutlined color="primary" />}>
          <InfoRow label="Province" value={address?.province_name} />
          <InfoRow label="Municipality" value={address?.municipality_name} />
          <InfoRow label="Barangay" value={address?.barangay_name} />
          <InfoRow label="Latitude" value={data.latitude} />
          <InfoRow label="Longitude" value={data.longitude} />
        </Section>

        {/* DESCRIPTION */}
        <Section
          title="Business Description"
          icon={<DescriptionOutlined color="primary" />}
        >
          <Text variant="normal" color="dark">
            {data.description || "-"}
          </Text>
        </Section>

        {/* PERMITS */}
        <Section
          title="Business Permits"
          icon={<ArticleOutlined color="primary" />}
        >
          {permitData && permitData.length > 0 ? (
            permitData.map((permit, index) => (
              <div
                key={index}
                className="flex justify-between py-2 border-b border-gray-100"
              >
                <Text variant="medium" color="dark">
                  {permit.permit_type.replace("_", " ")}
                </Text>
                <a
                  href={permit.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View File
                </a>
              </div>
            ))
          ) : (
            <Text variant="normal" color="dark">
              No permits uploaded yet.
            </Text>
          )}
        </Section>
      </div>
    </div>
  );
};

export default Step7;
