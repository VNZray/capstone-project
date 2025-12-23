import React, { useEffect, useState } from "react";
import { Box, Grid, CircularProgress, Chip } from "@mui/joy";
import DescriptionIcon from "@mui/icons-material/Description";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import BaseModal from "@/src/components/BaseModal";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { colors } from "@/src/utils/Colors";
import placeholderImage from "@/src/assets/images/placeholder-image.png";
import { getPermitsByBusiness } from "@/src/services/approval/PermitService";
import type { Permit } from "@/src/types/Permit";

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Record<string, unknown> | null;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  processingId?: string | null;
}

const ViewModal: React.FC<ViewModalProps> = ({
  isOpen,
  onClose,
  item,
  onApprove,
  onReject,
  processingId,
}) => {
  const [permits, setPermits] = useState<Permit[] | null>(null);
  const [loadingPermits, setLoadingPermits] = useState(false);

  // Fetch permits for businesses
  useEffect(() => {
    const entityType = String((item as any)?.entityType || "").toLowerCase();
    const businessId = String((item as any)?.id || "");
    if (!isOpen || !item || entityType !== "businesses" || !businessId) {
      setPermits(null);
      return;
    }
    (async () => {
      try {
        setLoadingPermits(true);
        const data = await getPermitsByBusiness(businessId);
        setPermits(data || []);
      } catch (e) {
        console.error("Error fetching permits:", e);
        setPermits([]);
      } finally {
        setLoadingPermits(false);
      }
    })();
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const id = String(item.id ?? "");
  const name = String(item.name ?? item.business_name ?? "Untitled");
  const description = String(item.description ?? "No description available");
  const entityType = String(item.entityType ?? "").toLowerCase();

  // Helper to safely get string value
  const getString = (key: string, fallback = "-") => {
    const val = (item as any)[key];
    return val != null && val !== "" ? String(val) : fallback;
  };

  // Get image
  const getImage = () => {
    if (entityType === "businesses") {
      return (item as any).business_image || placeholderImage;
    }
    if (entityType === "tourist_spots") {
      const images = (item as any).images;
      if (Array.isArray(images) && images.length > 0) {
        const primary = images.find(
          (img: any) => img.is_primary || img.isPrimary
        );
        return (
          primary?.file_url ||
          primary?.url ||
          images[0]?.file_url ||
          images[0]?.url ||
          placeholderImage
        );
      }
      return (
        (item as any).primary_image ||
        (item as any).image_url ||
        placeholderImage
      );
    }
    return placeholderImage;
  };

  const image = getImage();

  // Get category
  const getCategory = () => {
    if (entityType === "businesses") {
      return getString("business_category_name");
    }
    if (entityType === "tourist_spots") {
      const categories = (item as any).categories;
      if (Array.isArray(categories) && categories.length > 0) {
        return categories[0].category || "-";
      }
    }
    if (entityType === "events") {
      return getString("category", "Food & Culture");
    }
    return "-";
  };

  const category = getCategory();

  // Get type
  const getType = () => {
    if (entityType === "businesses") return "Business";
    if (entityType === "tourist_spots") return "Tourist Spot";
    if (entityType === "events") return "Event";
    return getString("type", "-");
  };

  const type = getType();

  // Get status
  const status = getString("status", "pending");

  // Get location
  const getLocation = () => {
    const address = getString("address");
    if (address !== "-") return address;

    const parts = [
      getString("street_address", ""),
      getString("barangay_name", getString("barangay", "")),
      getString("municipality_name", getString("municipality", "")),
      getString("province_name", getString("province", "")),
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "-";
  };

  const location = getLocation();

  // Get coordinates
  const latitude = getString("latitude");
  const longitude = getString("longitude");
  const coordinates =
    latitude !== "-" && longitude !== "-" ? `${latitude}, ${longitude}` : "-";

  // Get submitter info
  const submitterName = getString(
    "submitted_by",
    getString("owner_name", "Unknown")
  );
  const submitterEmail = getString("contact_email", getString("email", "-"));
  const submitterPhone = getString("contact_phone", getString("phone", "-"));
  const submittedDate = (() => {
    const date = (item as any).submitted_at || (item as any).created_at;
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return String(date);
    }
  })();

  // Event specific details
  const startDate = (() => {
    const date = getString("start_date");
    if (date === "-") return "-";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return date;
    }
  })();

  const endDate = (() => {
    const date = getString("end_date");
    if (date === "-") return "-";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return date;
    }
  })();

  const entryFee = getString("entry_fee", "Free");
  const expectedAttendees = getString(
    "expected_attendees",
    getString("capacity", "-")
  );

  const handleApproveClick = () => {
    if (!id) return;
    onApprove?.(id);
  };

  const handleRejectClick = () => {
    if (!id) return;
    onReject?.(id);
  };

  const InfoField = ({
    label,
    value,
  }: {
    label: string;
    value: string | React.ReactNode;
  }) => (
    <Box sx={{ marginBottom: "clamp(0.75rem, 2vw, 1rem)" }}>
      <Typography.Label
        size="xs"
        sx={{ opacity: 0.7, marginBottom: "4px", display: "block" }}
      >
        {label}
      </Typography.Label>
      <Typography.Body size="sm">{value}</Typography.Body>
    </Box>
  );

  const SectionHeader = ({
    icon,
    title,
  }: {
    icon: React.ReactNode;
    title: string;
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        marginBottom: "clamp(0.75rem, 2vw, 1rem)",
        paddingBottom: "0.5rem",
        borderBottom: `2px solid ${colors.primary}20`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "24px",
          height: "24px",
          borderRadius: "6px",
          backgroundColor: colors.primary + "20",
          color: colors.primary,
          fontSize: "1rem",
        }}
      >
        {icon}
      </Box>
      <Typography.CardTitle size="sm">{title}</Typography.CardTitle>
    </Box>
  );

  return (
    <BaseModal
      open={isOpen}
      onClose={onClose}
      title="Review Submission"
      description="Carefully review all details before approving"
      size="md"
      actions={[
        {
          label: "Cancel",
          onClick: onClose,
          variant: "soft",
          colorScheme: "primary",
        },
        {
          label: "Reject",
          onClick: handleRejectClick,
          variant: "solid",
          colorScheme: "error",
          disabled: !onReject || (processingId != null && processingId === id),
        },
        {
          label: "Approve",
          onClick: handleApproveClick,
          variant: "solid",
          colorScheme: "success",
          disabled: !onApprove || (processingId != null && processingId === id),
        },
      ]}
    >
      {/* Image Section */}
      <Box
        sx={{
          width: "100%",
          height: {
            xs: "clamp(200px, 50vw, 300px)",
            sm: "clamp(250px, 40vw, 350px)",
          },
          overflow: "hidden",
          backgroundColor: "#f5f5f5",
        }}
      >
        <img
          src={image}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>

      {/* Information Sections */}
      <Box sx={{ padding: "clamp(1rem, 3vw, 2rem)" }}>
        {/* Basic Information */}
        <Box sx={{ marginBottom: "clamp(1.5rem, 4vw, 2rem)" }}>
          <SectionHeader icon={<DescriptionIcon />} title="Basic Information" />
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <InfoField label="Name" value={name} />
            </Grid>
            <Grid xs={12} sm={6}>
              <InfoField label="Category" value={category} />
            </Grid>
            <Grid xs={12} sm={6}>
              <InfoField label="Type" value={type} />
            </Grid>
            <Grid xs={12} sm={6}>
              <InfoField label="Status" value={status} />
            </Grid>
            <Grid xs={12}>
              <InfoField label="Description" value={description} />
            </Grid>
          </Grid>
        </Box>

        {/* Location */}
        <Box sx={{ marginBottom: "clamp(1.5rem, 4vw, 2rem)" }}>
          <SectionHeader icon={<LocationOnIcon />} title="Location" />
          <Grid container spacing={2}>
            <Grid xs={12}>
              <InfoField label="Address" value={location} />
            </Grid>
            {coordinates !== "-" && (
              <Grid xs={12}>
                <InfoField label="Coordinates" value={coordinates} />
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Submitter Information */}
        <Box sx={{ marginBottom: "clamp(1.5rem, 4vw, 2rem)" }}>
          <SectionHeader icon={<PersonIcon />} title="Submitter Information" />
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <InfoField label="Name" value={submitterName} />
            </Grid>
            <Grid xs={12} sm={6}>
              <InfoField label="Submitted On" value={submittedDate} />
            </Grid>
            <Grid xs={12} sm={6}>
              <InfoField label="Email" value={submitterEmail} />
            </Grid>
            <Grid xs={12} sm={6}>
              <InfoField label="Phone" value={submitterPhone} />
            </Grid>
          </Grid>
        </Box>

        {/* Event Details (only for events) */}
        {entityType === "events" && (
          <Box sx={{ marginBottom: "clamp(1.5rem, 4vw, 2rem)" }}>
            <SectionHeader icon={<EventIcon />} title="Event Details" />
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <InfoField label="Start Date" value={startDate} />
              </Grid>
              <Grid xs={12} sm={6}>
                <InfoField label="End Date" value={endDate} />
              </Grid>
              <Grid xs={12} sm={6}>
                <InfoField label="Entry Fee" value={entryFee} />
              </Grid>
              <Grid xs={12} sm={6}>
                <InfoField
                  label="Expected Attendees"
                  value={expectedAttendees}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Permits Section (only for businesses) */}
        {entityType === "businesses" && (
          <Box sx={{ marginBottom: "clamp(1.5rem, 4vw, 2rem)" }}>
            <SectionHeader icon={<DescriptionOutlinedIcon />} title="Permits" />
            {loadingPermits ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  py: 3,
                }}
              >
                <CircularProgress size="sm" />
              </Box>
            ) : !permits || permits.length === 0 ? (
              <Typography.Body
                sx={{
                  color: colors.gray,
                  textAlign: "center",
                  py: 3,
                }}
              >
                No permits available
              </Typography.Body>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {permits.map((permit) => (
                  <Box
                    key={permit.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      border: `1px solid #e0e0e0`,
                      borderRadius: "8px",
                      backgroundColor: colors.background,
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        flex: 1,
                        minWidth: "200px",
                      }}
                    >
                      <Typography.CardTitle sx={{ color: colors.text }}>
                        {permit.permit_type || "Unknown Type"}
                      </Typography.CardTitle>
                      <Typography.Body
                        sx={{
                          color: colors.gray,
                          fontSize: "0.875rem",
                        }}
                      >
                        {permit.file_name || "No filename"}
                      </Typography.Body>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                          flexWrap: "wrap",
                          mt: 0.5,
                        }}
                      >
                        <Chip
                          size="sm"
                          color={
                            permit.status === "approved"
                              ? "success"
                              : permit.status === "rejected"
                              ? "danger"
                              : "warning"
                          }
                          sx={{ fontSize: "0.75rem" }}
                        >
                          {permit.status || "pending"}
                        </Chip>
                        {permit.expiration_date && (
                          <Typography.Body
                            sx={{
                              color: colors.gray,
                              fontSize: "0.75rem",
                            }}
                          >
                            Expires:{" "}
                            {new Date(
                              permit.expiration_date
                            ).toLocaleDateString()}
                          </Typography.Body>
                        )}
                      </Box>
                    </Box>
                    {permit.file_url && (
                      <Button
                        colorScheme="primary"
                        onClick={() => window.open(permit.file_url, "_blank")}
                        sx={{
                          minWidth: "120px",
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                        }}
                      >
                        <OpenInNewIcon sx={{ fontSize: "1rem" }} />
                        View
                      </Button>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </BaseModal>
  );
};

export default ViewModal;
