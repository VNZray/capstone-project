import PageContainer from "@/src/components/PageContainer";
import Text from "@/src/components/Text";
import Paper from "@mui/material/Paper";
import { useBusiness } from "@/src/context/BusinessContext";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import EditIcon from "@mui/icons-material/Edit";
import { useAddress } from "@/src/hooks/useAddress";
import { colors } from "@/src/utils/Colors";
import { Button, Chip, Grid, Sheet, Typography } from "@mui/joy";
import BusinessMap from "./components/businessMap"; // <-- new import
import { LucidePhone, LucideGlobe, PhilippinePeso } from "lucide-react";
import Container from "@/src/components/Container";
import { MdEmail, MdEventAvailable, MdFacebook } from "react-icons/md";
import {
  Instagram,
  LocalActivityRounded,
  NotificationsActive,
  X,
} from "@mui/icons-material";
import EditDescriptionModal from "./components/EditDescription";
import type { Business } from "@/src/types/Business";
import React, { useState } from "react";
import EditContactModal from "./components/EditContactModal";
import EditSocialMediaModal from "./components/EditSocialMediaModal";
import EditPricingModal from "./components/EditPricingModal";
import EditAddressModal from "./components/EditAddressModal";
import EditMapCoordinatesModal from "./components/EditMapCoordinatesModal";
import EditBusinessModal from "./components/EditBusinessModal";

const BusinessProfile = () => {
  const { businessDetails } = useBusiness();
  const { address } = useAddress(businessDetails?.barangay_id);
  const [editBusinessOpen, setEditBusinessOpen] = useState(false);
  const [editDescOpen, setEditDescOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [editSocialMediaOpen, setEditSocialMediaOpen] = useState(false);
  const [editPricingOpen, setEditPricingOpen] = useState(false);
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [editMapCoordinatesOpen, setEditMapCoordinatesOpen] = useState(false);

  const [businessData, setBusinessData] = React.useState<Business>({
    id: businessDetails?.id || "",
    business_image: businessDetails?.business_image || "",
    business_name: businessDetails?.business_name || "",
    phone_number: businessDetails?.phone_number || "",
    email: businessDetails?.email || "",
    barangay_id: businessDetails?.barangay_id || 0,
    municipality_id: businessDetails?.municipality_id || 0,
    province_id: businessDetails?.province_id || 0,
    description: businessDetails?.description || "",
    instagram_url: businessDetails?.instagram_url || "",
    tiktok_url: businessDetails?.tiktok_url || "",
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
      tiktok_url: ttLink,
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
    barangay_id: number
  ) => {
    setBusinessData({
      ...businessData,
      province_id: province_id,
      municipality_id: municipality_id,
      barangay_id: barangay_id,
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
        gap: "20px",
      }}
    >
      {/* --- Business Header --- */}
      <Paper
        elevation={3}
        style={{
          padding: "20px",
          display: "flex",
          alignItems: "center",
          borderRadius: "16px",

          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            padding: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderRadius: "16px",

            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              width={130}
              height={130}
              className="card-image"
              src={businessDetails?.business_image || ""}
              style={{ borderRadius: "16px" }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Typography fontFamily={"poppins"} level="h1" fontWeight={700}>
                {businessDetails?.business_name || "Business Name"}
              </Typography>
              <Typography
                startDecorator={
                  <LocationOnIcon
                    style={{ color: colors.success }}
                    fontSize="medium"
                  />
                }
                fontFamily={"poppins"}
                level="body-md"
              >
                {address?.barangay_name}, {address?.municipality_name},{" "}
                {address?.province_name}
              </Typography>
              <Typography
                startDecorator={
                  <StarIcon
                    style={{ color: colors.yellow }}
                    fontSize="medium"
                  />
                }
                fontFamily={"poppins"}
                level="body-md"
              >
                Review
              </Typography>
              {businessDetails?.status && (
                <Chip
                  size="lg"
                  color={getStatusColor(businessDetails.status)}
                  variant="soft"
                  sx={{ mt: 1 }}
                >
                  {businessDetails.status}
                </Chip>
              )}
            </div>
          </div>

          <div
            style={{ display: "flex", gap: "12px", height: 50, width: "15%" }}
          >
            <Button
              color="primary"
              size="lg"
              variant="outlined"
              style={{ flex: 1, minHeight: "50px" }}
              startDecorator={<EditIcon />}
              onClick={() => setEditBusinessOpen(true)}
            >
              Edit Business
            </Button>
          </div>
        </div>
      </Paper>

      {/* --- Business Details --- */}
      <Paper
        elevation={3}
        style={{
          padding: "20px",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* About Section */}
        <Sheet
          sx={{
            p: 2,
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
          variant="soft"
          color="primary"
        >
          <Grid container spacing={2}>
            <Grid xs={11}>
              <Typography
                fontFamily={"poppins"}
                level="title-lg"
                fontWeight={600}
              >
                About your business
              </Typography>

              <Typography fontFamily={"poppins"} level="body-md">
                Share your story and attract more customers with a compelling
                description
              </Typography>
            </Grid>
            <Grid xs={1}>
              <Button
                variant="outlined"
                fullWidth
                style={{ height: "100%" }}
                startDecorator={<EditIcon />}
                onClick={() => setEditDescOpen(true)}
              >
                Edit
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid xs={12}>
              <Sheet
                color="primary"
                style={{ padding: "20px", borderRadius: "12px" }}
              >
                <Text variant="paragraph" color={colors.gray}>
                  {businessDetails?.description || "No description available"}
                </Text>
              </Sheet>
            </Grid>
          </Grid>
        </Sheet>

        {/* Contact Information + Social Media */}
        <Grid container spacing={2}>
          {/* Contact Info */}
          <Grid
            xs={6}
            sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <Sheet
              sx={{
                p: 2,
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
              variant="soft"
              color="neutral"
            >
              <Typography
                fontFamily={"poppins"}
                level="title-lg"
                fontWeight={600}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Contact Information
                <Button
                  color="primary"
                  style={{ height: "100%" }}
                  variant="outlined"
                  size="md"
                  startDecorator={<EditIcon />}
                  onClick={() => setEditContactOpen(true)}
                >
                  Edit
                </Button>
              </Typography>
              <Container
                background="transparent"
                style={{ margin: 0, padding: 0 }}
              >
                {/* Phone */}
                <Container direction="row" align="center">
                  <Sheet
                    sx={{
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 50,
                      height: 50,
                    }}
                    color="neutral"
                    variant="soft"
                  >
                    <LucidePhone color={colors.secondary} size={28} />
                  </Sheet>
                  <div>
                    <Typography
                      fontFamily={"poppins"}
                      level="title-md"
                      fontWeight={600}
                    >
                      Contact number
                    </Typography>
                    <Typography fontFamily={"poppins"} level="body-md">
                      {businessDetails?.phone_number || "Not provided"}
                    </Typography>
                  </div>
                </Container>

                {/* Email */}
                <Container direction="row">
                  <Sheet
                    sx={{
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 50,
                      height: 50,
                    }}
                    color="neutral"
                    variant="soft"
                  >
                    <MdEmail size={28} color={colors.secondary} />
                  </Sheet>
                  <div>
                    <Typography
                      fontFamily={"poppins"}
                      level="title-md"
                      fontWeight={600}
                    >
                      Email
                    </Typography>
                    <Typography fontFamily={"poppins"} level="body-md">
                      {businessDetails?.email || "Not provided"}
                    </Typography>
                  </div>
                </Container>
              </Container>
            </Sheet>

            <Sheet
              sx={{
                p: 2,
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
              variant="soft"
              color="neutral"
            >
              <Typography
                fontFamily={"poppins"}
                level="title-lg"
                fontWeight={600}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Address
                <Button
                  color="primary"
                  style={{ height: "100%" }}
                  variant="outlined"
                  size="md"
                  startDecorator={<EditIcon />}
                  onClick={() => setEditAddressOpen(true)}
                >
                  Edit
                </Button>
              </Typography>

              <Container direction="row" align="center">
                <Sheet
                  sx={{
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 50,
                    height: 50,
                  }}
                  color="neutral"
                  variant="soft"
                >
                  <LocationOnIcon color="primary" fontSize="large" />
                </Sheet>
                <div>
                  <Typography
                    fontFamily={"poppins"}
                    level="title-md"
                    fontWeight={600}
                  >
                    Province
                  </Typography>
                  <Typography fontFamily={"poppins"} level="body-md">
                    {address?.province_name}
                  </Typography>
                </div>
              </Container>

              <Container direction="row" align="center">
                <Sheet
                  sx={{
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 50,
                    height: 50,
                  }}
                  color="neutral"
                  variant="soft"
                >
                  <LocationOnIcon color="primary" fontSize="large" />
                </Sheet>
                <div>
                  <Typography
                    fontFamily={"poppins"}
                    level="title-md"
                    fontWeight={600}
                  >
                    Municipality
                  </Typography>
                  <Typography fontFamily={"poppins"} level="body-md">
                    {address?.municipality_name}
                  </Typography>
                </div>
              </Container>

              <Container direction="row" align="center">
                <Sheet
                  sx={{
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 50,
                    height: 50,
                  }}
                  color="neutral"
                  variant="soft"
                >
                  <LocationOnIcon color="primary" fontSize="large" />
                </Sheet>
                <div>
                  <Typography
                    fontFamily={"poppins"}
                    level="title-md"
                    fontWeight={600}
                  >
                    Barangay
                  </Typography>
                  <Typography fontFamily={"poppins"} level="body-md">
                    {address?.barangay_name}
                  </Typography>
                </div>
              </Container>
            </Sheet>

            <Sheet
              sx={{
                p: 2,
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
              variant="soft"
              color="neutral"
            >
              <Typography
                fontFamily={"poppins"}
                level="title-lg"
                fontWeight={600}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Map Coordinates
                <Button
                  color="primary"
                  style={{ height: "100%" }}
                  variant="outlined"
                  size="md"
                  startDecorator={<EditIcon />}
                  onClick={() => setEditMapCoordinatesOpen(true)}
                >
                  Edit
                </Button>
              </Typography>

              <Container direction="row" align="center">
                <Sheet
                  sx={{
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 50,
                    height: 50,
                  }}
                  color="neutral"
                  variant="soft"
                >
                  <LocationOnIcon color="primary" fontSize="large" />
                </Sheet>
                <div>
                  <Typography
                    fontFamily={"poppins"}
                    level="title-md"
                    fontWeight={600}
                  >
                    Latitude
                  </Typography>
                  <Typography fontFamily={"poppins"} level="body-md">
                    {businessDetails?.latitude}
                  </Typography>
                </div>
              </Container>

              <Container direction="row" align="center">
                <Sheet
                  sx={{
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 50,
                    height: 50,
                  }}
                  color="neutral"
                  variant="soft"
                >
                  <LocationOnIcon color="primary" fontSize="large" />
                </Sheet>
                <div>
                  <Typography
                    fontFamily={"poppins"}
                    level="title-md"
                    fontWeight={600}
                  >
                    Longitude
                  </Typography>
                  <Typography fontFamily={"poppins"} level="body-md">
                    {businessDetails?.longitude}
                  </Typography>
                </div>
              </Container>

              {/* Map Component */}
              <BusinessMap
                latitude={businessDetails?.latitude}
                longitude={businessDetails?.longitude}
                name={businessDetails?.business_name}
              />
            </Sheet>
          </Grid>

          {/* Social Media */}
          <Grid
            xs={6}
            sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <Sheet
              sx={{
                p: 2,
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
              variant="soft"
              color="neutral"
            >
              <Typography
                fontFamily={"poppins"}
                level="title-lg"
                fontWeight={600}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Pricing
                <Button
                  color="primary"
                  style={{ height: "100%" }}
                  variant="outlined"
                  size="md"
                  startDecorator={<EditIcon />}
                  onClick={() => setEditPricingOpen(true)}
                >
                  Edit
                </Button>
              </Typography>

              <Container direction="row" align="center">
                <Sheet
                  sx={{
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 50,
                    height: 50,
                  }}
                  color="neutral"
                  variant="soft"
                >
                  <PhilippinePeso color={colors.secondary} size={28} />
                </Sheet>
                <div>
                  <Typography
                    fontFamily={"poppins"}
                    level="title-md"
                    fontWeight={600}
                  >
                    Price Range
                  </Typography>
                  <Typography fontFamily={"poppins"} level="body-md">
                    ₱{businessDetails?.min_price?.toLocaleString()}
                    {" - "}₱{businessDetails?.max_price?.toLocaleString()}
                  </Typography>
                </div>
              </Container>
            </Sheet>

            <Sheet
              sx={{
                p: 2,
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
              variant="soft"
              color="neutral"
            >
              <Typography
                fontFamily={"poppins"}
                level="title-lg"
                fontWeight={600}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Social Media
                <Button
                  color="primary"
                  style={{ height: "100%" }}
                  variant="outlined"
                  size="md"
                  startDecorator={<EditIcon />}
                  onClick={() => setEditSocialMediaOpen(true)}
                >
                  Edit
                </Button>
              </Typography>

              <Container
                background="transparent"
                style={{ margin: 0, padding: 0 }}
              >
                {/* Facebook */}
                <Container direction="row" align="center">
                  <Sheet
                    sx={{
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 50,
                      height: 50,
                    }}
                    color="neutral"
                    variant="soft"
                  >
                    <MdFacebook size={28} color={colors.secondary} />
                  </Sheet>
                  <div>
                    <Typography
                      fontFamily={"poppins"}
                      level="title-md"
                      fontWeight={600}
                    >
                      Facebook
                    </Typography>
                    <Typography fontFamily={"poppins"} level="body-md">
                      {businessDetails?.facebook_url || "Not provided"}
                    </Typography>
                  </div>
                </Container>

                {/* Instagram */}
                <Container direction="row" align="center">
                  <Sheet
                    sx={{
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 50,
                      height: 50,
                    }}
                    color="neutral"
                    variant="soft"
                  >
                    <Instagram sx={{ color: "#E1306C" }} />
                  </Sheet>
                  <div>
                    <Typography
                      fontFamily={"poppins"}
                      level="title-md"
                      fontWeight={600}
                    >
                      Instagram
                    </Typography>
                    <Typography fontFamily={"poppins"} level="body-md">
                      {businessDetails?.instagram_url || "Not provided"}
                    </Typography>
                  </div>
                </Container>

                <Container direction="row" align="center">
                  <Sheet
                    sx={{
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 50,
                      height: 50,
                    }}
                    color="neutral"
                    variant="soft"
                  >
                    <X sx={{ color: "#000" }} />
                  </Sheet>
                  <div>
                    <Typography
                      fontFamily={"poppins"}
                      level="title-md"
                      fontWeight={600}
                    >
                      Twitter
                    </Typography>
                    <Typography fontFamily={"poppins"} level="body-md">
                      {businessDetails?.tiktok_url || "Not provided"}
                    </Typography>
                  </div>
                </Container>
              </Container>
            </Sheet>

            {businessDetails?.business_type_id === 1 &&
              (businessDetails?.hasBooking ? (
                <Sheet
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                  variant="soft"
                  color="neutral"
                >
                  <Typography
                    fontFamily={"poppins"}
                    level="title-lg"
                    fontWeight={600}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    Booking Features
                    <Button
                      color="primary"
                      style={{ height: "100%" }}
                      variant="outlined"
                      size="md"
                      startDecorator={<EditIcon />}
                    >
                      Edit
                    </Button>
                  </Typography>

                  <Container direction="row" align="center">
                    <Sheet
                      sx={{
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 50,
                        height: 50,
                      }}
                      color="neutral"
                      variant="soft"
                    >
                      <LucideGlobe color={colors.secondary} size={28} />
                    </Sheet>
                    <div>
                      <Typography
                        fontFamily={"poppins"}
                        level="title-md"
                        fontWeight={600}
                      >
                        Booking System
                      </Typography>
                      <Typography fontFamily={"poppins"} level="body-md">
                        On
                      </Typography>
                    </div>
                  </Container>
                </Sheet>
              ) : (
                <Sheet
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                  variant="soft"
                  color="neutral"
                >
                  <Typography
                    fontFamily={"poppins"}
                    level="title-lg"
                    fontWeight={600}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    Booking Features
                  </Typography>
                  <Container direction="row" align="center">
                    <Sheet
                      sx={{
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 50,
                        height: 50,
                      }}
                      color="neutral"
                      variant="soft"
                    >
                      <LucideGlobe color={colors.secondary} size={28} />
                    </Sheet>
                    <div>
                      <Typography
                        fontFamily={"poppins"}
                        level="title-md"
                        fontWeight={600}
                      >
                        Booking System
                      </Typography>
                      <Typography fontFamily={"poppins"} level="body-md">
                        Off
                      </Typography>
                    </div>
                  </Container>
                  <Container direction="row" align="center">
                    <Sheet
                      sx={{
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 50,
                        height: 50,
                      }}
                      color="neutral"
                      variant="soft"
                    >
                      <LucideGlobe color={colors.secondary} size={28} />
                    </Sheet>
                    <div>
                      <Typography
                        fontFamily={"poppins"}
                        level="title-md"
                        fontWeight={600}
                      >
                        External Booking
                      </Typography>
                      <Typography fontFamily={"poppins"} level="body-md">
                        Not provided
                      </Typography>
                    </div>
                  </Container>
                </Sheet>
              ))}

            {businessDetails?.business_type_id === 2 && (
              <Sheet
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
                variant="soft"
                color="neutral"
              >
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={600}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  Website
                  <Button
                    color="primary"
                    style={{ height: "100%" }}
                    variant="outlined"
                    size="md"
                    startDecorator={<EditIcon />}
                  >
                    Edit
                  </Button>
                </Typography>

                <Container direction="row" align="center">
                  <Sheet
                    sx={{
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 50,
                      height: 50,
                    }}
                    color="neutral"
                    variant="soft"
                  >
                    <LucideGlobe color={colors.secondary} size={28} />
                  </Sheet>
                  <div>
                    <Typography
                      fontFamily={"poppins"}
                      level="title-md"
                      fontWeight={600}
                    >
                      Website
                    </Typography>
                    <Typography fontFamily={"poppins"} level="body-md">
                      {businessDetails?.facebook_url || "Not provided"}
                    </Typography>
                  </div>
                </Container>
              </Sheet>
            )}
          </Grid>
        </Grid>
      </Paper>

      <EditDescriptionModal
        open={editDescOpen}
        initialDescription={businessDetails?.description || ""}
        businessId={businessDetails?.id}
        onClose={() => setEditDescOpen(false)}
        onSave={handleSaveDescription}
        onUpdate={() => window.location.reload()}
      />

      <EditContactModal
        open={editContactOpen}
        initialEmail={businessDetails?.email || ""}
        initialPhoneNumber={businessDetails?.phone_number || ""}
        businessId={businessDetails?.id}
        onClose={() => setEditContactOpen(false)}
        onSave={handleSaveContact}
        onUpdate={() => window.location.reload()}
      />

      <EditSocialMediaModal
        open={editSocialMediaOpen}
        initialFbLink={businessDetails?.facebook_url || ""}
        initialIgLink={businessDetails?.instagram_url || ""}
        initialTtLink={businessDetails?.tiktok_url || ""}
        businessId={businessDetails?.id}
        onClose={() => setEditSocialMediaOpen(false)}
        onSave={handleSaveSocialMedia}
        onUpdate={() => window.location.reload()}
      />

      <EditPricingModal
        open={editPricingOpen}
        initialMinimumPrice={businessDetails?.min_price || ""}
        initialMaximumPrice={businessDetails?.max_price || ""}
        businessId={businessDetails?.id}
        onClose={() => setEditPricingOpen(false)}
        onSave={handleSavePricing}
        onUpdate={() => window.location.reload()}
      />

      <EditAddressModal
        open={editAddressOpen}
        initialProvince={businessDetails?.province_id}
        initialMunicipality={businessDetails?.municipality_id}
        initialBarangay={businessDetails?.barangay_id}
        businessId={businessDetails?.id}
        onClose={() => setEditAddressOpen(false)}
        onSave={handleSaveAddress}
        onUpdate={() => window.location.reload()}
      />

      <EditMapCoordinatesModal
        open={editMapCoordinatesOpen}
        initialLatitude={businessDetails?.latitude || ""}
        initialLongitude={businessDetails?.longitude || ""}
        businessId={businessDetails?.id}
        onClose={() => setEditMapCoordinatesOpen(false)}
        onSave={handleSaveMapCoordinates}
        onUpdate={() => window.location.reload()}
      />

      <EditBusinessModal
        open={editBusinessOpen}
        initialBusinessName={businessDetails?.business_name || ""}
        initialBusinessImage={businessDetails?.business_image || ""}
        businessId={businessDetails?.id}
        onClose={() => setEditBusinessOpen(false)}
        onSave={handleSaveBusiness}
        onUpdate={() => window.location.reload()}
      />
    </PageContainer>
  );
};

export default BusinessProfile;
