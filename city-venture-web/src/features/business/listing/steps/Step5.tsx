import CustomTypography from "@/src/components/Typography";
import React, { useEffect, useState } from "react";
import type { Business } from "@/src/types/Business";
import { useAddress } from "@/src/hooks/useAddress";
import { Card, CardContent, Divider, Typography, Chip } from "@mui/joy";
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
import type { CategoryTree } from "@/src/types/Category";
import { fetchCategoryTree } from "@/src/services/BusinessService";

type Props = {
  data: Business;
  addressData: Address;
  permitData: Permit[];
};

const Step7: React.FC<Props> = ({ data, permitData }) => {
  const { address } = useAddress(data?.barangay_id);
  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>([]);
  const [primaryCategoryName, setPrimaryCategoryName] = useState<string>("");

  // Fetch categories and resolve names
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const tree = await fetchCategoryTree();
        
        // Resolve category names from IDs
        if (data?.category_ids && data.category_ids.length > 0) {
          const flatCategories: CategoryTree[] = [];
          const flatten = (cats: CategoryTree[]) => {
            for (const cat of cats) {
              flatCategories.push(cat);
              if (cat.children) flatten(cat.children);
            }
          };
          flatten(tree);
          
          const names = data.category_ids
            .map(id => flatCategories.find(c => c.id === id)?.title)
            .filter((name): name is string => !!name);
          setSelectedCategoryNames(names);
          
          // Get primary category name
          if (data.primary_category_id) {
            const primary = flatCategories.find(c => c.id === data.primary_category_id);
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
    value?: string | number;
  }) => (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <CustomTypography.Label size="sm" weight="semibold">
        {label}:
      </CustomTypography.Label>
      <CustomTypography.Body size="xs">{value || "-"}</CustomTypography.Body>
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
      <CardContent sx={{ py: 1, px: 1.25 }}>
        <Typography
          level="title-md"
          sx={{
            mb: 0.75,
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {icon} {title}
        </Typography>
        <Divider sx={{ mb: 1.25 }} />
        {children}
      </CardContent>
    </Card>
  );

  return (
    <>
      <style>
        {`
          .br-section {
            box-shadow: none !important;
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .stepperContent {
            background: transparent;
          }
        `}
      </style>
      <div
        className="stepperContent"
        style={{
          padding: "16px 16px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            width: "100%",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              paddingBottom: 8,
              textAlign: "center",
              borderBottom: "1px solid #e5e7eb",
              marginBottom: 12,
              paddingTop: 4,
            }}
          >
            <CustomTypography.Label
              size="lg"
              sx={{ color: "#111827", mb: 0.75 }}
            >
              Review & Submit
            </CustomTypography.Label>
            <CustomTypography.Body size="xs" sx={{ color: "#6b7280" }}>
              Review your information before submitting
            </CustomTypography.Body>
          </div>
          <div style={{ paddingRight: 6 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: "0 8px",
              }}
            >
              {/* BUSINESS SUMMARY CARD */}
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

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {/* Location */}
                      <Typography
                        level="body-sm"
                        startDecorator={<PlaceOutlined fontSize="small" />}
                        sx={{ color: "#6b7280" }}
                      >
                        {address?.province_name}, {address?.municipality_name},{" "}
                        {address?.barangay_name}
                      </Typography>

                      {/* Email + Phone */}
                      <Typography
                        level="body-sm"
                        startDecorator={<EmailOutlined fontSize="small" />}
                        sx={{ color: "#6b7280" }}
                      >
                        {data.email}
                      </Typography>
                      <Typography
                        level="body-sm"
                        startDecorator={<PhoneOutlined fontSize="small" />}
                        sx={{ color: "#6b7280" }}
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
              <InfoRow label="Primary Category" value={primaryCategoryName || "-"} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <CustomTypography.Label size="sm" weight="semibold">
                  Categories:
                </CustomTypography.Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "flex-end", maxWidth: "60%" }}>
                  {selectedCategoryNames.length > 0 ? (
                    selectedCategoryNames.map((name, idx) => (
                      <Chip
                        key={idx}
                        size="sm"
                        variant={name === primaryCategoryName ? "solid" : "soft"}
                        color={name === primaryCategoryName ? "primary" : "neutral"}
                      >
                        {name}{name === primaryCategoryName ? " (Primary)" : ""}
                      </Chip>
                    ))
                  ) : (
                    <CustomTypography.Body size="xs">-</CustomTypography.Body>
                  )}
                </div>
              </div>
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
              <Section
                title="Location"
                icon={<PlaceOutlined color="primary" />}
              >
                <InfoRow label="Province" value={address?.province_name} />
                <InfoRow
                  label="Municipality"
                  value={address?.municipality_name}
                />
                <InfoRow label="Barangay" value={address?.barangay_name} />
                <InfoRow label="Latitude" value={data.latitude} />
                <InfoRow label="Longitude" value={data.longitude} />
              </Section>

              {/* DESCRIPTION */}
              <Section
                title="Business Description"
                icon={<DescriptionOutlined color="primary" />}
              >
                <CustomTypography.Body size="sm">
                  {data.description || "-"}
                </CustomTypography.Body>
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
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      <CustomTypography.Body size="sm" weight="semibold">
                        {permit.permit_type.replace("_", " ")}
                      </CustomTypography.Body>
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
                  <CustomTypography.Body size="sm">
                    No permits uploaded yet.
                  </CustomTypography.Body>
                )}
              </Section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step7;
