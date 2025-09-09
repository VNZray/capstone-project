import PageContainer from "@/src/components/PageContainer";
import Text from "@/src/components/Text";
import Paper from "@mui/material/Paper";
import { useBusiness } from "@/src/context/BusinessContext";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import EditIcon from "@mui/icons-material/Edit";
import { useAddress } from "@/src/hooks/useAddress";
import { colors } from "@/src/utils/Colors";
import { Button, Chip, Grid, Typography } from "@mui/joy";
import BusinessMap from "./components/businessMap"; // <-- new import
import { LucidePhone, PhilippinePeso, Globe, TimerIcon } from "lucide-react";
import Container from "@/src/components/Container";
import { MdEmail, MdFacebook } from "react-icons/md";
import { HomeWork, LocationCity, Place, Public, X } from "@mui/icons-material";
import EditDescriptionModal from "./components/EditDescription";
import type { Business, BusinessHours } from "@/src/types/Business";
import React, { useEffect, useState } from "react";
import EditContactModal from "./components/EditContactModal";
import EditSocialMediaModal from "./components/EditSocialMediaModal";
import EditPricingModal from "./components/EditPricingModal";
import EditAddressModal from "./components/EditAddressModal";
import EditMapCoordinatesModal from "./components/EditMapCoordinatesModal";
import EditBusinessModal from "./components/EditBusinessModal";
import { FaInstagram } from "react-icons/fa";
import {
  getData,
  getDataByForeignId,
  getDataById,
  updateData,
} from "@/src/api_function";
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

  const getBusinessHours = async () => {
    if (!businessDetails?.id) return;
    const response = await getData("business-hours");
    const filtered = Array.isArray(response)
      ? response.filter((hours) => hours.business_id === businessDetails.id)
      : [];
    setBusinessHours(filtered);
  };

  const fetchBusinessAmenities = async () => {
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
  };

  React.useEffect(() => {
    fetchBusinessAmenities();
  }, [businessDetails?.id]);

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const ampm = parseInt(hour) >= 12 ? "PM" : "AM";
    const formattedHour = (((parseInt(hour) + 11) % 12) + 1).toString();
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const fetchExternalBookings = async () => {
    if (!businessDetails?.id) return;
    const response = await getData("external-booking");
    const filtered = Array.isArray(response)
      ? response.filter((booking) => booking.business_id === businessDetails.id)
      : [];
    setExternalBooking(filtered);
  };

  useEffect(() => {
    if (businessDetails?.id) {
      fetchExternalBookings();
      getBusinessHours();
    }
  }, [businessDetails?.id]);

  const [businessData, setBusinessData] = React.useState<Business>({
    id: businessDetails?.id || "",
    business_image: businessDetails?.business_image || "",
    business_name: businessDetails?.business_name || "",
    phone_number: businessDetails?.phone_number || "",
    email: businessDetails?.email,
    address_id: businessDetails?.address_id,
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
    business_category_id: businessDetails?.business_category_id,
    business_type_id: businessDetails?.business_type_id,
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
        gap: "20px",
      }}
    >
      <Grid container spacing={2}>
        <Grid
          xs={8}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* --- Business Header --- */}
          <Container
            elevation={2}
            style={{
              padding: "20px",
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div
              style={{
                padding: 0,
                display: "flex",
                justifyContent: "space-between",
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
                  style={{ borderRadius: "8px" }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    fontFamily={"poppins"}
                    level="h2"
                    fontWeight={700}
                  >
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
                    {businessDetails?.address}, {address?.barangay_name},{" "}
                    {address?.municipality_name}, {address?.province_name}
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

              <div>
                <Button
                  color="primary"
                  size="sm"
                  variant="outlined"
                  startDecorator={<EditIcon />}
                  onClick={() => setEditBusinessOpen(true)}
                >
                  Edit
                </Button>
              </div>
            </div>
          </Container>

          {/* --- Business Details --- */}
          <Container
            elevation={2}
            style={{
              padding: "20px",
              display: "flex",
              gap: "40px",
            }}
          >
            <Container gap="10px" padding="0">
              <Container
                gap="10px"
                padding="0"
                direction="row"
                align="center"
                justify="space-between"
              >
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={700}
                >
                  About your business
                </Typography>

                <Button
                  startDecorator={<EditIcon />}
                  onClick={() => setEditDescOpen(true)}
                  size="sm"
                  variant="outlined"
                >
                  Edit
                </Button>
              </Container>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography fontFamily={"poppins"} level="body-md">
                  {businessDetails?.description || "No description available"}
                </Typography>
              </Paper>
            </Container>

            <Container gap="10px" padding="0">
              <Container
                gap="10px"
                padding="0"
                direction="row"
                align="center"
                justify="space-between"
              >
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={700}
                >
                  Pricing
                </Typography>

                <Button
                  startDecorator={<EditIcon />}
                  onClick={() => setEditPricingOpen(true)}
                  size="sm"
                  variant="outlined"
                >
                  Edit
                </Button>
              </Container>

              <Typography
                startDecorator={<PhilippinePeso />}
                fontFamily={"poppins"}
                level="body-md"
              >
                {businessDetails?.min_price?.toLocaleString()}
                {" - "}
                {businessDetails?.max_price?.toLocaleString()}
              </Typography>
            </Container>

            <Container gap="10px" padding="0">
              <Container
                gap="10px"
                padding="0"
                direction="row"
                align="center"
                justify="space-between"
              >
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={700}
                >
                  Amenities
                </Typography>

                <Button
                  startDecorator={<EditIcon />}
                  size="sm"
                  variant="outlined"
                  onClick={() => setEditAmenitiesOpen(true)}
                >
                  Edit
                </Button>
              </Container>

              <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {amenities.map((amenity) => (
                    <Chip
                      key={amenity.id}
                      size="lg"
                      variant="soft"
                      color="primary"
                    >
                      {amenity.name}
                    </Chip>
                  ))}
                </div>
              </Paper>
            </Container>

            {businessDetails?.business_type_id === 1 && (
              <Container gap="10px" padding="0">
                <Container
                  gap="10px"
                  padding="0"
                  direction="row"
                  align="center"
                  justify="space-between"
                >
                  <Typography
                    fontFamily={"poppins"}
                    level="title-lg"
                    fontWeight={700}
                  >
                    Booking Features
                  </Typography>

                  {businessDetails?.hasBooking ? (
                    <Button
                      startDecorator={<EditIcon />}
                      size="sm"
                      variant="outlined"
                    >
                      Edit
                    </Button>
                  ) : (
                    <Button
                      onClick={() => activateBooking(businessDetails.id, true)}
                      color="success"
                      size="sm"
                      variant="solid"
                    >
                      Activate
                    </Button>
                  )}
                </Container>

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
                          elevation={2}
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
            )}

            <Container gap="10px" padding="0">
              <Container
                gap="10px"
                padding="0"
                direction="row"
                align="center"
                justify="space-between"
              >
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={700}
                >
                  Business Hours
                </Typography>

                <Button
                  startDecorator={<EditIcon />}
                  onClick={() => setEditBusinessHoursOpen(true)}
                  size="sm"
                  variant="outlined"
                >
                  Edit
                </Button>
              </Container>
              {businessHours.map((hours: BusinessHours) => (
                <Typography
                  key={hours.id}
                  startDecorator={<TimerIcon />}
                  fontFamily={"poppins"}
                  level="body-md"
                >
                  {hours.day_of_week}: {formatTime(hours.open_time ?? "")} -{" "}
                  {formatTime(hours.close_time ?? "")}
                  <Chip
                    size="md"
                    variant="soft"
                    style={{ marginLeft: "8px" }}
                    color={getStatusColor(hours.is_open ? "1" : "0")}
                  >
                    {hours.is_open ? "Open" : "Closed"}
                  </Chip>
                </Typography>
              ))}
            </Container>
          </Container>
        </Grid>

        <Grid xs={4}>
          <Container
            elevation={2}
            style={{
              padding: "20px",
              display: "flex",
              gap: "40px",
            }}
          >
            <Container gap="10px" padding="0">
              <Container
                gap="10px"
                padding="0"
                direction="row"
                align="center"
                justify="space-between"
              >
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={700}
                >
                  Map Location
                </Typography>

                <Button
                  startDecorator={<EditIcon />}
                  onClick={() => setEditMapCoordinatesOpen(true)}
                  size="sm"
                  variant="outlined"
                >
                  Edit
                </Button>
              </Container>

              {/* Map Component */}
              <BusinessMap
                latitude={businessDetails?.latitude}
                longitude={businessDetails?.longitude}
                name={businessDetails?.business_name}
                radius={0}
              />
            </Container>

            <Container gap="10px" padding="0">
              <Container
                gap="10px"
                padding="0"
                direction="row"
                align="center"
                justify="space-between"
              >
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={700}
                >
                  Contact Information
                </Typography>

                <Button
                  startDecorator={<EditIcon />}
                  onClick={() => setEditContactOpen(true)}
                  size="sm"
                  variant="outlined"
                >
                  Edit
                </Button>
              </Container>

              <Typography
                startDecorator={<MdEmail color={colors.secondary} size={24} />}
                fontFamily={"poppins"}
                level="body-md"
              >
                {businessDetails?.email || "No email available"}
              </Typography>

              <Typography
                startDecorator={
                  <LucidePhone color={colors.secondary} size={24} />
                }
                fontFamily={"poppins"}
                level="body-md"
              >
                {businessDetails?.phone_number || "No phone number available"}
              </Typography>
            </Container>

            <Container gap="10px" padding="0">
              <Container
                gap="10px"
                padding="0"
                direction="row"
                align="center"
                justify="space-between"
              >
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={700}
                >
                  Website
                </Typography>

                <Button
                  startDecorator={<EditIcon />}
                  onClick={() => setEditSocialMediaOpen(true)}
                  size="sm"
                  variant="outlined"
                >
                  Edit
                </Button>
              </Container>

              <Typography
                startDecorator={
                  <MdFacebook color={colors.secondary} size={24} />
                }
                fontFamily={"poppins"}
                level="body-md"
              >
                {businessDetails?.facebook_url || "No Facebook URL available"}
              </Typography>

              <Typography
                startDecorator={<FaInstagram color={"#E1306C"} size={24} />}
                fontFamily={"poppins"}
                level="body-md"
              >
                {businessDetails?.instagram_url || "No Instagram URL available"}
              </Typography>

              <Typography
                startDecorator={<X sx={{ color: "#000", fontSize: "24px" }} />}
                fontFamily={"poppins"}
                level="body-md"
              >
                {businessDetails?.x_url || "No X URL available"}
              </Typography>

              <Typography
                startDecorator={<Globe color="#000" size="24px" />}
                fontFamily={"poppins"}
                level="body-md"
              >
                {businessDetails?.website_url || "No Website URL available"}
              </Typography>
            </Container>

            <Container gap="10px" padding="0">
              <Container
                gap="10px"
                padding="0"
                direction="row"
                align="center"
                justify="space-between"
              >
                <Typography
                  fontFamily={"poppins"}
                  level="title-lg"
                  fontWeight={700}
                >
                  Address
                </Typography>

                <Button
                  startDecorator={<EditIcon />}
                  onClick={() => setEditAddressOpen(true)}
                  size="sm"
                  variant="outlined"
                >
                  Edit
                </Button>
              </Container>

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
          </Container>
        </Grid>
      </Grid>

      <EditBusinessHoursModal
        open={editBusinessHoursOpen}
        businessId={businessDetails?.id?.toString()}
        initialBusinessHours={businessHours as BusinessHours[]}
        onClose={() => setEditBusinessHoursOpen(false)}
        onUpdate={(updated: BusinessHours[]) => setBusinessHours(updated)}
      />

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
        initialXLink={businessDetails?.x_url || ""}
        initialWebsiteLink={businessDetails?.website_url || ""}
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
        addressId={businessDetails?.address_id}
        initialProvince={address?.province_id}
        initialMunicipality={address?.municipality_id}
        initialBarangay={address?.barangay_id}
        initialAddress={businessDetails?.address}
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

      <EditAmenitiesModal
        open={editAmenitiesOpen}
        businessId={businessDetails?.id}
        onClose={() => setEditAmenitiesOpen(false)}
        onSave={handleSaveBusiness}
        onUpdate={() => window.location.reload()}
      />
    </PageContainer>
  );
};

export default BusinessProfile;
