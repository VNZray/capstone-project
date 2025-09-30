import PageContainer from "@/src/components/PageContainer";
import { useBusiness } from "@/src/context/BusinessContext";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
//
import { colors } from "@/src/utils/Colors";
import { Button, Chip, Grid, Typography, Sheet, Divider, IconButton } from "@mui/joy";
import BusinessMap from "./components/businessMap"; // <-- new import
import "./BusinessProfile.css";
import { LucidePhone, PhilippinePeso, Globe, TimerIcon } from "lucide-react";
import Container from "@/src/components/Container";
import { MdEmail, MdFacebook } from "react-icons/md";
import { HomeWork, LocationCity, Place, Public, X } from "@mui/icons-material";
import EditDescriptionModal from "./components/EditDescription";
import type { Business, BusinessHours } from "@/src/types/Business";
import React, { useEffect, useState, useCallback } from "react";
import EditContactModal from "./components/EditContactModal";
import EditSocialMediaModal from "./components/EditSocialMediaModal";
import EditPricingModal from "./components/EditPricingModal";
import EditAddressModal from "./components/EditAddressModal";
import EditMapCoordinatesModal from "./components/EditMapCoordinatesModal";
import EditBusinessModal from "./components/EditBusinessModal";
import { FaInstagram } from "react-icons/fa";
import { getData, getDataByForeignId, updateData } from "@/src/services/Service";
import type { ExternalBooking } from "@/src/types/ExternalBooking";
import { bookingLogos } from "@/src/types/BookingLogos";
import EditBusinessHoursModal from "./components/EditBusinessHoursModal";
import type { Amenity } from "@/src/types/Amenity";
import EditAmenitiesModal from "./components/EditAmenitiesModal";
import type { Address } from "@/src/types/Address";

const BusinessProfile = () => {
  const { businessDetails } = useBusiness();
  const [editBusinessOpen, setEditBusinessOpen] = useState(false);
  const [editDescOpen, setEditDescOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [editSocialMediaOpen, setEditSocialMediaOpen] = useState(false);
  const [editPricingOpen, setEditPricingOpen] = useState(false);
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [editMapCoordinatesOpen, setEditMapCoordinatesOpen] = useState(false);
  const [editBusinessHoursOpen, setEditBusinessHoursOpen] = useState(false);
  const [editAmenitiesOpen, setEditAmenitiesOpen] = useState(false);
  const [externalBooking, setExternalBooking] = useState<ExternalBooking[]>([]);

  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [amenities, setAmenities] = React.useState<Amenity[]>([]);

  const [address, setAddress] = useState<Address | null>(null);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!businessDetails?.address_id) {
        setAddress(null);
        return;
      }
      const businessAddress = await getDataByForeignId(
        "address",
        businessDetails.address_id
      );
      setAddress(businessAddress);
    };
    fetchAddress();
  }, [businessDetails?.address_id]);

  const getBusinessHours = useCallback(async () => {
    if (!businessDetails?.id) return;
    const response = await getData("business-hours");
    const filtered = Array.isArray(response)
      ? response.filter((hours) => hours.business_id === businessDetails.id)
      : [];
    setBusinessHours(filtered);
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

  React.useEffect(() => {
    fetchBusinessAmenities();
  }, [fetchBusinessAmenities]);

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const ampm = parseInt(hour) >= 12 ? "PM" : "AM";
    const formattedHour = (((parseInt(hour) + 11) % 12) + 1).toString();
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const fetchExternalBookings = useCallback(async () => {
    if (!businessDetails?.id) return;
    const response = await getData("external-booking");
    const filtered = Array.isArray(response)
      ? response.filter((booking) => booking.business_id === businessDetails.id)
      : [];
    setExternalBooking(filtered);
  }, [businessDetails?.id]);

  useEffect(() => {
    if (businessDetails?.id) {
      fetchExternalBookings();
      getBusinessHours();
    }
  }, [businessDetails?.id, fetchExternalBookings, getBusinessHours]);

  const [businessData, setBusinessData] = React.useState<Business>({
    id: businessDetails?.id || "",
    business_image: businessDetails?.business_image || "",
    business_name: businessDetails?.business_name || "",
    phone_number: businessDetails?.phone_number || "",
    email: businessDetails?.email || "",
    address_id: businessDetails?.address_id || 0,
    address: businessDetails?.address || "",
    description: businessDetails?.description || "",
    instagram_url: businessDetails?.instagram_url || "",
    x_url: businessDetails?.x_url || "",
    website_url: businessDetails?.website_url || "",
    facebook_url: businessDetails?.facebook_url || "",
    longitude: businessDetails?.longitude || "",
    latitude: businessDetails?.latitude || "",
    min_price: businessDetails?.min_price || "",
    max_price: businessDetails?.max_price || "",
    owner_id: businessDetails?.owner_id || "",
    status: businessDetails?.status || "Pending",
    business_category_id: businessDetails?.business_category_id || 0,
    business_type_id: businessDetails?.business_type_id || 0,
    hasBooking: businessDetails?.hasBooking || false,
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

  const handleSaveSocialMedia = (
    fbLink: string,
    igLink: string,
    ttLink: string
  ) => {
    setBusinessData({
      ...businessData,
      facebook_url: fbLink,
      instagram_url: igLink,
      x_url: ttLink,
    });
  };

  const handleSavePricing = (min_price: string, max_price: string) => {
    setBusinessData({
      ...businessData,
      min_price: min_price,
      max_price: max_price,
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

  const activateBooking = async (businessId: string, hasBooking: boolean) => {
    await updateData(businessId, { hasBooking }, "business");
    window.location.reload();
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
                  <Typography
                    fontFamily={"poppins"}
                    level="h1"
                    fontWeight={700}
                    sx={{
                      fontSize: { xs: "26px", sm: "34px", md: "42px" },
                      lineHeight: 1.15,
                      color: "#fff",
                      letterSpacing: "-0.02em",
                      mb: 0.5,
                    }}
                  >
                    {businessDetails?.business_name || "Business Name"}
                  </Typography>
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
                  <Typography
                    fontFamily={"poppins"}
                    level="body-lg"
                    sx={{ color: "#e5e7eb", fontSize: { xs: "14px", md: "16px" } }}
                  >
                    {businessDetails?.address || address?.barangay_name || address?.municipality_name
                      ? `${businessDetails?.address || ""}${businessDetails?.address ? ", " : ""}${address?.barangay_name || ""}${address?.barangay_name ? ", " : ""}${address?.municipality_name || ""}`
                      : "Address not available"}
                  </Typography>
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
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={700}
                  sx={{ color: "#1e293b" }}
                >
                  About your business
                </Typography>

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

              <Typography
                fontFamily={"poppins"}
                level="body-sm"
                sx={{
                  color: "#6b7280",
                  fontWeight: 400,
                  fontSize: "14px"
                }}
              >
                Tell customers about your business, services, and what makes you unique.
              </Typography>

              <Sheet
                className="bp-desc-sheet"
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: "16px",
                  minHeight: "120px",
                  display: "flex",
                  alignItems: businessDetails?.description ? "flex-start" : "center"
                }}
              >
                <Typography
                  fontFamily={"poppins"}
                  level="body-md"
                  sx={{
                    lineHeight: 1.6,
                    color: businessDetails?.description ? "#64748b" : "#94a3b8",
                    fontStyle: businessDetails?.description ? "normal" : "italic"
                  }}
                >
                  {businessDetails?.description || "No description available. Add a compelling description to attract more customers."}
                </Typography>
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
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={700}
                  sx={{ color: "#1e293b" }}
                >
                  Amenities
                </Typography>

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

              <Typography
                fontFamily={"poppins"}
                level="body-sm"
                sx={{
                  color: "#6b7280",
                  fontWeight: 400,
                  fontSize: "14px"
                }}
              >
                Highlight the features and services available at your business.
              </Typography>

              <Sheet
                className="bp-amenities-sheet"
                variant="outlined"
                sx={{
                  p: 2.5,
                  flex: 1,
                  borderRadius: "16px",
                  minHeight: "100px",
                  display: "flex",
                  alignItems: amenities.length > 0 ? "flex-start" : "center"
                }}
              >
                {amenities.length > 0 ? (
                  <div className="bp-amenities" style={{ display: "flex", gap: "10px", flexWrap: "wrap", width: "100%" }}>
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
                          py: 0.5
                        }}
                      >
                        {amenity.name}
                      </Chip>
                    ))}
                  </div>
                ) : (
                  <Typography
                    fontFamily={"poppins"}
                    level="body-md"
                    sx={{
                      color: "#94a3b8",
                      fontStyle: "italic",
                      textAlign: "center",
                      width: "100%"
                    }}
                  >
                    No amenities listed. Add amenities to showcase what you offer.
                  </Typography>
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
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={700}
                  sx={{ color: "#1e293b" }}
                >
                  Website
                </Typography>

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

              <Typography
                fontFamily={"poppins"}
                level="body-sm"
                sx={{
                  color: "#6b7280",
                  fontWeight: 400,
                  fontSize: "14px"
                }}
              >
                Share your online presence and social media links.
              </Typography>

              <Typography
                startDecorator={<MdFacebook color={colors.secondary} size={24} />}
                fontFamily={"poppins"}
                level="body-md"
              >
                {businessDetails?.facebook_url ? (
                  <a href={businessDetails.facebook_url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                    {businessDetails.facebook_url}
                  </a>
                ) : (
                  "No Facebook URL available"
                )}
              </Typography>

              <Typography
                startDecorator={<FaInstagram color={"#E1306C"} size={24} />}
                fontFamily={"poppins"}
                level="body-md"
              >
                {businessDetails?.instagram_url ? (
                  <a href={businessDetails.instagram_url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                    {businessDetails.instagram_url}
                  </a>
                ) : (
                  "No Instagram URL available"
                )}
              </Typography>

              <Typography
                startDecorator={<X sx={{ color: "#000", fontSize: "24px" }} />}
                fontFamily={"poppins"}
                level="body-md"
              >
                {businessDetails?.x_url ? (
                  <a href={businessDetails.x_url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                    {businessDetails.x_url}
                  </a>
                ) : (
                  "No X URL available"
                )}
              </Typography>

              <Typography
                startDecorator={<Globe color="#000" size="24px" />}
                fontFamily={"poppins"}
                level="body-md"
              >
                {businessDetails?.website_url ? (
                  <a href={businessDetails.website_url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                    {businessDetails.website_url}
                  </a>
                ) : (
                  "No Website URL available"
                )}
              </Typography>
            </Container>

            <Divider sx={{ borderColor: "#e5e7eb", my: 2 }} />

            {businessDetails?.business_type_id === 1 && (
              <>
                <Divider sx={{ borderColor: "#e5e7eb", my: 2 }} />

                <Container gap="12px" padding="0">
                  <Container
                    gap="12px"
                    padding="0"
                    direction="row"
                    align="center"
                    justify="space-between"
                  >
                    <Typography
                      fontFamily={"poppins"}
                      level="title-lg"
                      fontWeight={700}
                      sx={{ color: "#1e293b" }}
                    >
                      Booking Features
                    </Typography>

                    {businessDetails?.hasBooking ? (
                      <Button className="bp-edit-btn" startDecorator={<EditIcon />} size="sm" variant="plain">
                        Edit
                      </Button>
                    ) : (
                      <Button
                          className="bp-activate-btn"
                          onClick={() => activateBooking(businessDetails.id!, true)}
                          color="success"
                          size="sm"
                          variant="solid"
                        >
                          Activate
                        </Button>
                    )}
                  </Container>

                  <Typography
                    fontFamily={"poppins"}
                    level="body-sm"
                    sx={{
                      color: "#6b7280",
                      fontWeight: 400,
                      fontSize: "14px"
                    }}
                  >
                    Enable online booking to allow customers to reserve services directly.
                  </Typography>

                  {businessDetails?.hasBooking ? (
                    <Chip color="success" size="md" variant="solid">
                      Activated
                    </Chip>
                  ) : (
                    <>
                      {/* List of external booking links as a card grid */}
                      <Typography
                        fontFamily={"poppins"}
                        level="title-md"
                        fontWeight={600}
                      >
                        {`Currently Using External (Third Party) Booking`}
                      </Typography>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(6, 1fr)",
                          gap: "16px",
                          marginTop: "12px",
                        }}
                      >
                        {externalBooking.map((booking: ExternalBooking) => (
                          <Container
                            elevation={1}
                            key={booking.id}
                            style={{ padding: "12px", textAlign: "center" }}
                          >
                            <a
                              href={booking.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: "block" }}
                            >
                              {bookingLogos[booking.name] ? (
                                <img
                                  src={bookingLogos[booking.name]}
                                  alt={booking.name}
                                  style={{
                                    height: "60px",
                                    width: "60px",
                                    objectFit: "contain",
                                    marginBottom: "8px",
                                  }}
                                />
                              ) : (
                                <span>{booking.name}</span>
                              )}
                            </a>
                            <Typography fontFamily={"poppins"} level="body-md">
                              {booking.name}
                            </Typography>
                          </Container>
                        ))}
                      </div>
                    </>
                  )}
                </Container>
              </>
            )}

            <Container gap="12px" padding="0">
              <Container
                gap="12px"
                padding="0"
                direction="row"
                align="center"
                justify="space-between"
              >
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={700}
                  sx={{ color: "#1e293b" }}
                >
                  Business Hours
                </Typography>

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

              <Typography
                fontFamily={"poppins"}
                level="body-sm"
                sx={{
                  color: "#6b7280",
                  fontWeight: 400,
                  fontSize: "14px"
                }}
              >
                Set your operating hours to inform customers when you're available.
              </Typography>

              {businessHours.map((hours: BusinessHours, idx) => {
                const key = `${hours.day_of_week}-${hours.id ?? idx}`;
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Typography
                      startDecorator={<TimerIcon />}
                      fontFamily={"poppins"}
                      level="body-md"
                      sx={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                      {hours.day_of_week}: {formatTime(hours.open_time ?? "")} - {formatTime(hours.close_time ?? "")}
                    </Typography>
                    <Chip
                      size="sm"
                      variant="soft"
                      style={{ marginLeft: "8px" }}
                      color={getStatusColor(hours.is_open ? "1" : "0")}
                    >
                      {hours.is_open ? "Open" : "Closed"}
                    </Chip>
                    {idx < businessHours.length - 1 && <Divider sx={{ my: 1 }} />}
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
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={700}
                  sx={{ color: "#1e293b" }}
                >
                  Map Location
                </Typography>

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

              <Typography
                fontFamily={"poppins"}
                level="body-sm"
                sx={{
                  color: "#6b7280",
                  fontWeight: 400,
                  fontSize: "14px"
                }}
              >
                View your business location on the map and update coordinates if needed.
              </Typography>

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
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={700}
                  sx={{ color: "#1e293b" }}
                >
                  Address
                </Typography>

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

              <Typography
                fontFamily={"poppins"}
                level="body-sm"
                sx={{
                  color: "#6b7280",
                  fontWeight: 400,
                  fontSize: "14px"
                }}
              >
                Display your complete business address for easy navigation.
              </Typography>

              <Typography
                startDecorator={<Public fontSize="small" />}
                fontFamily={"poppins"}
                level="body-md"
              >
                {address?.province_name || "No address available"}
              </Typography>
              <Typography
                startDecorator={<LocationCity fontSize="small" />}
                fontFamily={"poppins"}
                level="body-md"
              >
                {address?.municipality_name || "No municipality available"}
              </Typography>
              <Typography
                startDecorator={<HomeWork fontSize="small" />}
                fontFamily={"poppins"}
                level="body-md"
              >
                {address?.barangay_name || "No barangay available"}
              </Typography>

              <Typography
                startDecorator={<Place fontSize="small" />}
                fontFamily={"poppins"}
                level="body-md"
              >
                {businessDetails?.address || "No exact location available"}
              </Typography>
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
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={700}
                  sx={{ color: "#1e293b" }}
                >
                  Contact Information
                </Typography>

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

              <Typography
                fontFamily={"poppins"}
                level="body-sm"
                sx={{
                  color: "#6b7280",
                  fontWeight: 400,
                  fontSize: "14px"
                }}
              >
                Provide ways for customers to reach out to your business.
              </Typography>

              <Typography
                startDecorator={<MdEmail color={colors.secondary} size={24} />}
                fontFamily={"poppins"}
                level="body-md"
              >
                {businessDetails?.email ? (
                  <a href={`mailto:${businessDetails.email}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {businessDetails.email}
                  </a>
                ) : (
                  "No email available"
                )}
              </Typography>

              <Typography
                startDecorator={<LucidePhone color={colors.secondary} size={24} />}
                fontFamily={"poppins"}
                level="body-md"
              >
                {businessDetails?.phone_number ? (
                  <a href={`tel:${businessDetails.phone_number}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {businessDetails.phone_number}
                  </a>
                ) : (
                  "No phone number available"
                )}
              </Typography>
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
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={700}
                  sx={{ color: "#1e293b" }}
                >
                  Pricing Range
                </Typography>

                <Button
                  className="bp-edit-btn"
                  startDecorator={<EditIcon />}
                  onClick={() => setEditPricingOpen(true)}
                  size="sm"
                  variant="outlined"
                >
                  Edit
                </Button>
              </Container>

              <Typography
                fontFamily={"poppins"}
                level="body-sm"
                sx={{
                  color: "#6b7280",
                  fontWeight: 400,
                  fontSize: "14px"
                }}
              >
                Display your price range to help customers understand your offerings.
              </Typography>

              <Sheet
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: "12px",
                  background: "rgba(16, 185, 129, 0.05)",
                  border: "1px solid rgba(16, 185, 129, 0.2)"
                }}
              >
                <Typography
                  startDecorator={<PhilippinePeso style={{ color: "#059669" }} />}
                  fontFamily={"poppins"}
                  level="body-md"
                  sx={{
                    fontWeight: 600,
                    color: "#059669",
                    fontSize: "16px"
                  }}
                >
                  ₱{businessDetails?.min_price?.toLocaleString() || "0"}
                  {" - "}
                  ₱{businessDetails?.max_price?.toLocaleString() || "0"}
                </Typography>
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
        initialXLink={businessDetails?.x_url || ""}
        initialWebsiteLink={businessDetails?.website_url || ""}
        businessId={businessDetails?.id || ""}
        onClose={() => setEditSocialMediaOpen(false)}
        onSave={handleSaveSocialMedia}
        onUpdate={() => window.location.reload()}
      />

      <EditPricingModal
        open={editPricingOpen && Boolean(businessDetails?.id)}
        initialMinimumPrice={businessDetails?.min_price || ""}
        initialMaximumPrice={businessDetails?.max_price || ""}
        businessId={businessDetails?.id || ""}
        onClose={() => setEditPricingOpen(false)}
        onSave={handleSavePricing}
        onUpdate={() => window.location.reload()}
      />

      <EditAddressModal
        open={editAddressOpen && Boolean(businessDetails?.id)}
        addressId={businessDetails?.address_id}
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
