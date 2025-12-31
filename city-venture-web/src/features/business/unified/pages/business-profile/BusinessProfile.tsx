import PageContainer from "@/src/components/PageContainer";
import { useBusiness } from "@/src/context/BusinessContext";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
//
import { colors } from "@/src/utils/Colors";
import { Button, Chip, Grid, Sheet, Divider, IconButton } from "@mui/joy";
import BusinessMap from "./components/businessMap"; // <-- new import
import "./BusinessProfile.css";
import { LucidePhone, PhilippinePeso, TimerIcon } from "lucide-react";
import Container from "@/src/components/Container";
import { MdEmail, MdFacebook } from "react-icons/md";
import { HomeWork, LocationCity, Place, Public } from "@mui/icons-material";
import EditDescriptionModal from "./components/EditDescription";
import type { Business, BusinessHours, Room } from "@/src/types/Business";
import React, { useEffect, useState, useCallback } from "react";
import EditContactModal from "./components/EditContactModal";
import EditSocialMediaModal from "./components/EditSocialMediaModal";
import EditAddressModal from "./components/EditAddressModal";
import EditMapCoordinatesModal from "./components/EditMapCoordinatesModal";
import EditBusinessModal from "./components/EditBusinessModal";
import { FaInstagram } from "react-icons/fa";
import { getData } from "@/src/services/Service";
import apiClient from "@/src/services/apiClient";
import EditBusinessHoursModal from "./components/EditBusinessHoursModal";
import type { Amenity } from "@/src/types/Amenity";
import EditAmenitiesModal from "./components/EditAmenitiesModal";
import { useAddress } from "@/src/hooks/useAddress";
import Typography from "@/src/components/Typography";
const BusinessProfile = () => {
  const { businessDetails } = useBusiness();
  const [editBusinessOpen, setEditBusinessOpen] = useState(false);
  const [editDescOpen, setEditDescOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [editSocialMediaOpen, setEditSocialMediaOpen] = useState(false);
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [editMapCoordinatesOpen, setEditMapCoordinatesOpen] = useState(false);
  const [editBusinessHoursOpen, setEditBusinessHoursOpen] = useState(false);
  const [editAmenitiesOpen, setEditAmenitiesOpen] = useState(false);

  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [amenities, setAmenities] = React.useState<Amenity[]>([]);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [priceRange, setPriceRange] = React.useState<{
    min: number;
    max: number;
  }>({ min: 0, max: 0 });

  // Fetch full hierarchical address (province/municipality/barangay) by barangay_id
  const { address } = useAddress(businessDetails?.barangay_id);

  const getBusinessHours = useCallback(async () => {
    if (!businessDetails?.id) return;
    try {
      const response = await apiClient.get(
        `/business-hours/business/${businessDetails.id}`
      );
      const hours = response.data?.data || response.data || [];
      setBusinessHours(Array.isArray(hours) ? hours : []);
    } catch (error) {
      console.error("Failed to fetch business hours:", error);
      setBusinessHours([]);
    }
  }, [businessDetails?.id]);

  const fetchBusinessAmenities = useCallback(async () => {
    if (!businessDetails?.id) return;

    const businessAmenityResponse = await getData("business-amenities");
    const amenityResponse = await getData("amenities");

    const filtered = Array.isArray(businessAmenityResponse)
      ? businessAmenityResponse
          .filter((ba) => ba.business_id === businessDetails.id)
          .map((ba) => {
            const match: Amenity | undefined = (
              amenityResponse as Amenity[]
            ).find((a: Amenity) => a.id === ba.amenity_id);
            return { ...ba, name: match?.name || "Unknown" };
          })
      : [];

    setAmenities(filtered);
  }, [businessDetails?.id]);

  const fetchRooms = useCallback(async () => {
    if (!businessDetails?.id) return;

    const response = await getData("rooms");
    const filtered = Array.isArray(response)
      ? response.filter((room: Room) => room.business_id === businessDetails.id)
      : [];

    setRooms(filtered);

    // Calculate min and max prices from rooms
    if (filtered.length > 0) {
      const prices = filtered
        .map((room: Room) => parseFloat(room.room_price || "0"))
        .filter((price) => price > 0);

      if (prices.length > 0) {
        setPriceRange({
          min: Math.min(...prices),
          max: Math.max(...prices),
        });
      }
    } else {
      setPriceRange({ min: 0, max: 0 });
    }
  }, [businessDetails?.id]);

  React.useEffect(() => {
    fetchBusinessAmenities();
    fetchRooms();
  }, [fetchBusinessAmenities, fetchRooms]);

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const ampm = parseInt(hour) >= 12 ? "PM" : "AM";
    const formattedHour = (((parseInt(hour) + 11) % 12) + 1).toString();
    return `${formattedHour}:${minute} ${ampm}`;
  };

  useEffect(() => {
    if (businessDetails?.id) {
      getBusinessHours();
    }
  }, [businessDetails?.id, getBusinessHours]);

  const [businessData, setBusinessData] = React.useState<Business>({
    id: businessDetails?.id || "",
    business_image: businessDetails?.business_image || "",
    business_name: businessDetails?.business_name || "",
    phone_number: businessDetails?.phone_number || "",
    email: businessDetails?.email || "",
    barangay_id: businessDetails?.barangay_id || 0,
    address: businessDetails?.address || "",
    description: businessDetails?.description || "",
    instagram_url: businessDetails?.instagram_url || "",
    website_url: businessDetails?.website_url || "",
    facebook_url: businessDetails?.facebook_url || "",
    longitude: businessDetails?.longitude || "",
    latitude: businessDetails?.latitude || "",
    min_price: businessDetails?.min_price || "",
    max_price: businessDetails?.max_price || "",
    owner_id: businessDetails?.owner_id || "",
    status: businessDetails?.status || "Pending",
    hasBooking: businessDetails?.hasBooking || false,
    category_ids: businessDetails?.category_ids || [],
    primary_category_id: businessDetails?.primary_category_id,
  });

  const [addressData, setAddressData] = React.useState({
    barangay_id: address?.barangay_id,
    municipality_id: address?.municipality_id,
    province_id: address?.province_id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Active":
        return "success";
      case "Pending":
        return "neutral";
      case "Rejected":
        return "danger";
      case "1":
        return "success";
      case "0":
        return "danger";
      default:
        return "neutral"; // fallback
    }
  };

  const handleSaveBusiness = (business_name: string) => {
    setBusinessData({ ...businessData, business_name: business_name });
  };

  const handleSaveDescription = (description: string) => {
    setBusinessData({ ...businessData, description: description });
  };

  const handleSaveContact = (email: string, phone_number: string) => {
    setBusinessData({
      ...businessData,
      email: email,
      phone_number: phone_number,
    });
  };

  const handleSaveSocialMedia = (fbLink: string, igLink: string) => {
    setBusinessData({
      ...businessData,
      facebook_url: fbLink,
      instagram_url: igLink,
    });
  };

  const handleSaveAddress = (
    province_id: number,
    municipality_id: number,
    barangay_id: number,
    address: string
  ) => {
    setAddressData({
      ...addressData,
      province_id: province_id,
      municipality_id: municipality_id,
      barangay_id: barangay_id,
    });

    setBusinessData({
      ...businessData,
      address: address,
    });
  };

  const handleSaveMapCoordinates = (latitude: string, longitude: string) => {
    setBusinessData({
      ...businessData,
      latitude: latitude,
      longitude: longitude,
    });
  };

  return (
    <PageContainer
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        background: "#fafafa",
        minHeight: "100vh",
      }}
    >
      <div className="business-profile-page">
        <Grid container spacing={4}>
          <Grid
            xs={12}
            md={8}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "32px",
            }}
          >
            {/* --- Business Hero Banner (Redesigned) --- */}
            <div className="bp-hero" role="banner">
              {/* Background image */}
              <div
                className="bp-hero__bg"
                style={{
                  backgroundImage: businessDetails?.business_image
                    ? `url(${businessDetails.business_image})`
                    : undefined,
                }}
              />
              {/* Gradient scrim for readability */}
              <div className="bp-hero__gradient" />

              {/* Removed status badge and top-right edit button as per request */}

              {/* Content Overlay */}
              <div className="bp-hero__content">
                <div className="bp-hero__panel">
                  {/* Business Name with inline edit icon */}
                  <div className="bp-hero__title">
                    <Typography.Title
                      sx={{
                        mb: 0.5,
                      }}
                    >
                      {businessDetails?.business_name || "Business Name"}
                    </Typography.Title>
                    <IconButton
                      aria-label="Edit business"
                      size="sm"
                      variant="soft"
                      onClick={() => setEditBusinessOpen(true)}
                      className="bp-hero__edit-inline"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </div>

                  {/* Address */}
                  <div className="bp-hero__row">
                    <LocationOnIcon className="bp-hero__icon" />
                    <Typography.Body>
                      {businessDetails?.address ||
                      address?.barangay_name ||
                      address?.municipality_name
                        ? `${businessDetails?.address || ""}${
                            businessDetails?.address ? ", " : ""
                          }${address?.barangay_name || ""}${
                            address?.barangay_name ? ", " : ""
                          }${address?.municipality_name || ""}`
                        : "Address not available"}
                    </Typography.Body>
                  </div>

                  {/* Ratings removed as requested */}
                </div>
              </div>
            </div>

            {/* --- Business Details --- */}
            <Container
              elevation={1}
              gap="24px"
              direction="column"
              style={{
                padding: "20px",
                display: "flex",
              }}
            >
              <Container gap="12px" padding="0">
                <Container
                  gap="12px"
                  padding="0"
                  direction="row"
                  align="center"
                  justify="space-between"
                >
                  <Typography.CardTitle>
                    About your business
                  </Typography.CardTitle>

                  <Button
                    className="bp-edit-btn"
                    startDecorator={<EditIcon />}
                    onClick={() => setEditDescOpen(true)}
                    size="sm"
                    variant="outlined"
                  >
                    Edit
                  </Button>
                </Container>

                <Typography.Body>
                  Tell customers about your business, services, and what makes
                  you unique.
                </Typography.Body>

                <Sheet
                  className="bp-desc-sheet"
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: "16px",
                    minHeight: "120px",
                    display: "flex",
                    alignItems: businessDetails?.description
                      ? "flex-start"
                      : "center",
                  }}
                >
                  <Typography.Body>
                    {businessDetails?.description ||
                      "No description available. Add a compelling description to attract more customers."}
                  </Typography.Body>
                </Sheet>
              </Container>

              <Divider sx={{ borderColor: "#e5e7eb", my: 2 }} />

              <Container gap="12px" padding="0">
                <Container
                  gap="12px"
                  padding="0"
                  direction="row"
                  align="center"
                  justify="space-between"
                >
                  <Typography.CardTitle>Amenities</Typography.CardTitle>

                  <Button
                    startDecorator={<EditIcon />}
                    size="sm"
                    variant="outlined"
                    className="bp-edit-btn"
                    onClick={() => setEditAmenitiesOpen(true)}
                  >
                    Edit
                  </Button>
                </Container>

                <Typography.Body>
                  Highlight the features and services available at your
                  business.
                </Typography.Body>

                <Sheet
                  className="bp-amenities-sheet"
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    flex: 1,
                    borderRadius: "16px",
                    minHeight: "100px",
                    display: "flex",
                    alignItems: amenities.length > 0 ? "flex-start" : "center",
                  }}
                >
                  {amenities.length > 0 ? (
                    <div
                      className="bp-amenities"
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        width: "100%",
                      }}
                    >
                      {amenities.map((amenity) => (
                        <Chip
                          key={amenity.id}
                          size="md"
                          variant="soft"
                          color="neutral"
                          sx={{
                            borderRadius: "20px",
                            fontWeight: 500,
                            px: 2,
                            py: 0.5,
                          }}
                        >
                          {amenity.name}
                        </Chip>
                      ))}
                    </div>
                  ) : (
                    <Typography.Body>
                      No amenities listed. Add amenities to showcase what you
                      offer.
                    </Typography.Body>
                  )}
                </Sheet>
              </Container>

              <Divider sx={{ borderColor: "#e5e7eb", my: 2 }} />

              <Container gap="12px" padding="0">
                <Container
                  gap="12px"
                  padding="0"
                  direction="row"
                  align="center"
                  justify="space-between"
                >
                  <Typography.CardTitle>Website</Typography.CardTitle>

                  <Button
                    className="bp-edit-btn"
                    startDecorator={<EditIcon />}
                    onClick={() => setEditSocialMediaOpen(true)}
                    size="sm"
                    variant="outlined"
                  >
                    Edit
                  </Button>
                </Container>

                <Typography.Body>
                  Share your online presence and social media links.
                </Typography.Body>

                <Typography.Body
                  startDecorator={
                    <MdFacebook color={colors.secondary} size={24} />
                  }
                >
                  {businessDetails?.facebook_url ? (
                    <a
                      href={businessDetails.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {businessDetails.facebook_url}
                    </a>
                  ) : (
                    "No Facebook URL available"
                  )}
                </Typography.Body>

                <Typography.Body
                  startDecorator={<FaInstagram color={"#E1306C"} size={24} />}
                >
                  {businessDetails?.instagram_url ? (
                    <a
                      href={businessDetails.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {businessDetails.instagram_url}
                    </a>
                  ) : (
                    "No Instagram URL available"
                  )}
                </Typography.Body>

                <Typography.Body>
                  {businessDetails?.website_url ? (
                    <a
                      href={businessDetails.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {businessDetails.website_url}
                    </a>
                  ) : (
                    "No Website URL available"
                  )}
                </Typography.Body>
              </Container>

              <Divider sx={{ borderColor: "#e5e7eb", my: 2 }} />

              <Container gap="12px" padding="0">
                <Container
                  gap="12px"
                  padding="0"
                  direction="row"
                  align="center"
                  justify="space-between"
                >
                  <Typography.CardTitle>Business Hours</Typography.CardTitle>

                  <Button
                    className="bp-edit-btn"
                    startDecorator={<EditIcon />}
                    onClick={() => setEditBusinessHoursOpen(true)}
                    size="sm"
                    variant="plain"
                  >
                    Edit
                  </Button>
                </Container>

                <Typography.Body>
                  Set your operating hours to inform customers when you're
                  available.
                </Typography.Body>

                {businessHours.map((hours: BusinessHours, idx) => {
                  const key = `${hours.day_of_week}-${hours.id ?? idx}`;
                  return (
                    <div
                      key={key}
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <Typography.Body
                        startDecorator={<TimerIcon />}
                        sx={{ display: "inline-flex", alignItems: "center" }}
                      >
                        {hours.day_of_week}: {formatTime(hours.open_time ?? "")}{" "}
                        - {formatTime(hours.close_time ?? "")}
                      </Typography.Body>
                      <Chip
                        size="sm"
                        variant="soft"
                        style={{ marginLeft: "8px" }}
                        color={getStatusColor(hours.is_open ? "1" : "0")}
                      >
                        {hours.is_open ? "Open" : "Closed"}
                      </Chip>
                      {idx < businessHours.length - 1 && (
                        <Divider sx={{ my: 1 }} />
                      )}
                    </div>
                  );
                })}
              </Container>
            </Container>
          </Grid>

          <Grid xs={12} md={4}>
            <Container
              elevation={1}
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <Container gap="12px" padding="0">
                <Container
                  gap="12px"
                  padding="0"
                  direction="row"
                  align="center"
                  justify="space-between"
                >
                  <Typography.CardTitle>Map Location</Typography.CardTitle>

                  <Button
                    className="bp-edit-btn"
                    startDecorator={<EditIcon />}
                    onClick={() => setEditMapCoordinatesOpen(true)}
                    size="sm"
                    variant="outlined"
                  >
                    Edit
                  </Button>
                </Container>

                <Typography.Body>
                  View your business location on the map and update coordinates
                  if needed.
                </Typography.Body>

                {/* Map Component */}
                <BusinessMap
                  latitude={businessDetails?.latitude}
                  longitude={businessDetails?.longitude}
                  name={businessDetails?.business_name}
                  radius={0}
                />
              </Container>

              <Divider sx={{ borderColor: "#e5e7eb", my: 2 }} />

              <Container gap="12px" padding="0">
                <Container
                  gap="12px"
                  padding="0"
                  direction="row"
                  align="center"
                  justify="space-between"
                >
                  <Typography.CardTitle>Address</Typography.CardTitle>

                  <Button
                    className="bp-edit-btn"
                    startDecorator={<EditIcon />}
                    onClick={() => setEditAddressOpen(true)}
                    size="sm"
                    variant="plain"
                  >
                    Edit
                  </Button>
                </Container>

                <Typography.Body>
                  Display your complete business address for easy navigation.
                </Typography.Body>

                <Typography.Body startDecorator={<Public fontSize="small" />}>
                  {address?.province_name || "No address available"}
                </Typography.Body>
                <Typography.Body
                  startDecorator={<LocationCity fontSize="small" />}
                >
                  {address?.municipality_name || "No municipality available"}
                </Typography.Body>
                <Typography.Body startDecorator={<HomeWork fontSize="small" />}>
                  {address?.barangay_name || "No barangay available"}
                </Typography.Body>

                <Typography.Body startDecorator={<Place fontSize="small" />}>
                  {businessDetails?.address || "No exact location available"}
                </Typography.Body>
              </Container>

              <Divider sx={{ borderColor: "#e5e7eb", my: 2 }} />

              <Container gap="12px" padding="0">
                <Container
                  gap="12px"
                  padding="0"
                  direction="row"
                  align="center"
                  justify="space-between"
                >
                  <Typography.CardTitle>
                    Contact Information
                  </Typography.CardTitle>

                  <Button
                    className="bp-edit-btn"
                    startDecorator={<EditIcon />}
                    onClick={() => setEditContactOpen(true)}
                    size="sm"
                    variant="plain"
                  >
                    Edit
                  </Button>
                </Container>

                <Typography.Body>
                  Provide ways for customers to reach out to your business.
                </Typography.Body>

                <Typography.Body
                  startDecorator={
                    <MdEmail color={colors.secondary} size={24} />
                  }
                >
                  {businessDetails?.email ? (
                    <a
                      href={`mailto:${businessDetails.email}`}
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {businessDetails.email}
                    </a>
                  ) : (
                    "No email available"
                  )}
                </Typography.Body>

                <Typography.Body
                  startDecorator={
                    <LucidePhone color={colors.secondary} size={24} />
                  }
                >
                  {businessDetails?.phone_number ? (
                    <a
                      href={`tel:${businessDetails.phone_number}`}
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {businessDetails.phone_number}
                    </a>
                  ) : (
                    "No phone number available"
                  )}
                </Typography.Body>
              </Container>

              <Divider sx={{ borderColor: "#e5e7eb", my: 2 }} />

              <Container gap="12px" padding="0">
                <Container
                  gap="12px"
                  padding="0"
                  direction="row"
                  align="center"
                  justify="space-between"
                >
                  <Typography.CardTitle>Pricing Range</Typography.CardTitle>
                </Container>

                <Sheet
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: "12px",
                  }}
                >
                  {rooms.length > 0 ? (
                    <Typography.Body
                      startDecorator={
                        <PhilippinePeso style={{ color: "#059669" }} />
                      }
                    >
                      ₱{priceRange.min.toLocaleString()}
                      {priceRange.min !== priceRange.max &&
                        ` - ₱${priceRange.max.toLocaleString()}`}
                    </Typography.Body>
                  ) : (
                    <Typography.Body>
                      No rooms listed yet. Add rooms to display price range.
                    </Typography.Body>
                  )}
                </Sheet>
              </Container>
            </Container>
          </Grid>
        </Grid>
      </div>

      <EditBusinessHoursModal
        open={editBusinessHoursOpen && Boolean(businessDetails?.id)}
        businessId={businessDetails?.id?.toString() || ""}
        initialBusinessHours={businessHours as BusinessHours[]}
        onClose={() => setEditBusinessHoursOpen(false)}
        onUpdate={(updated: BusinessHours[]) => setBusinessHours(updated)}
      />

      <EditDescriptionModal
        open={editDescOpen && Boolean(businessDetails?.id)}
        initialDescription={businessDetails?.description || ""}
        businessId={businessDetails?.id || ""}
        onClose={() => setEditDescOpen(false)}
        onSave={handleSaveDescription}
        onUpdate={() => window.location.reload()}
      />

      <EditContactModal
        open={editContactOpen && Boolean(businessDetails?.id)}
        initialEmail={businessDetails?.email || ""}
        initialPhoneNumber={businessDetails?.phone_number || ""}
        businessId={businessDetails?.id || ""}
        onClose={() => setEditContactOpen(false)}
        onSave={handleSaveContact}
        onUpdate={() => window.location.reload()}
      />

      <EditSocialMediaModal
        open={editSocialMediaOpen && Boolean(businessDetails?.id)}
        initialFbLink={businessDetails?.facebook_url || ""}
        initialIgLink={businessDetails?.instagram_url || ""}
        initialWebsiteLink={businessDetails?.website_url || ""}
        businessId={businessDetails?.id || ""}
        onClose={() => setEditSocialMediaOpen(false)}
        onSave={handleSaveSocialMedia}
        onUpdate={() => window.location.reload()}
      />

      <EditAddressModal
        open={editAddressOpen && Boolean(businessDetails?.id)}
        initialProvince={address?.province_id}
        initialMunicipality={address?.municipality_id}
        initialBarangay={address?.barangay_id}
        initialAddress={businessDetails?.address}
        businessId={businessDetails?.id || ""}
        onClose={() => setEditAddressOpen(false)}
        onSave={handleSaveAddress}
        onUpdate={() => window.location.reload()}
      />

      <EditMapCoordinatesModal
        open={editMapCoordinatesOpen && Boolean(businessDetails?.id)}
        initialLatitude={businessDetails?.latitude || ""}
        initialLongitude={businessDetails?.longitude || ""}
        businessId={businessDetails?.id || ""}
        onClose={() => setEditMapCoordinatesOpen(false)}
        onSave={handleSaveMapCoordinates}
        onUpdate={() => window.location.reload()}
      />

      <EditBusinessModal
        open={editBusinessOpen && Boolean(businessDetails?.id)}
        initialBusinessName={businessDetails?.business_name || ""}
        initialBusinessImage={businessDetails?.business_image || ""}
        businessId={businessDetails?.id || ""}
        onClose={() => setEditBusinessOpen(false)}
        onSave={handleSaveBusiness}
        onUpdate={() => window.location.reload()}
      />

      <EditAmenitiesModal
        open={editAmenitiesOpen && Boolean(businessDetails?.id)}
        businessId={businessDetails?.id || ""}
        onClose={() => setEditAmenitiesOpen(false)}
        onSave={handleSaveBusiness}
        onUpdate={() => window.location.reload()}
      />
    </PageContainer>
  );
};

export default BusinessProfile;
