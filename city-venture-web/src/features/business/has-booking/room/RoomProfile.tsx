import PageContainer from "@/src/components/PageContainer";
import { colors } from "@/src/utils/Colors";
import { AspectRatio, Box, Chip, Grid, Divider } from "@mui/joy";
import { useRoom } from "@/src/context/RoomContext";
import { useBusiness } from "@/src/context/BusinessContext";
import DynamicTab from "@/src/components/ui/DynamicTab";
import { useState, useEffect, useMemo } from "react";
import Container from "@/src/components/Container";
import NoDataFound from "@/src/components/NoDataFound";
import Button from "@/src/components/Button";
import IconButton from "@/src/components/IconButton";
import {
  ArrowLeft,
  Edit,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  DollarSign,
  Home,
  MapPin,
  Users,
  Maximize,
  Trash2,
  Star,
  X,
  Upload,
} from "lucide-react";
import {
  deleteData,
  getData,
  insertData,
  deleteData as deleteService,
} from "@/src/services/Service";
import { uploadRoomPhoto, deleteRoomPhoto } from "@/src/utils/uploadRoomPhoto";
import { useNavigate } from "react-router-dom";
import Typography from "@/src/components/Typography";
import Alert from "@/src/components/Alert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import HotelIcon from "@mui/icons-material/Hotel";
import BuildIcon from "@mui/icons-material/Build";
import Calendar from "@/src/components/ui/Calendar";
import type { Amenity } from "@/src/types/Amenity";
import {
  fetchBlockedDatesByRoomId,
  generateBlockedCalendarEvents,
} from "@/src/services/RoomBlockedDatesService";
import type { RoomBlockedDate } from "@/src/types/RoomBlockedDates";
import Reviews from "./Reviews";
const RoomProfile = () => {
  const { roomDetails } = useRoom();
  const { businessDetails } = useBusiness();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleting, setIsDeleting] = useState(false);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<RoomBlockedDate[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "success";
      case "Reserved":
        return "neutral";
      case "Occupied":
        return "warning";
      case "Maintenance":
        return "danger";
      default:
        return "neutral";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Available":
        return <CheckCircleIcon sx={{ fontSize: "1.25rem" }} />;
      case "Reserved":
        return <EventSeatIcon sx={{ fontSize: "1.25rem" }} />;
      case "Occupied":
        return <HotelIcon sx={{ fontSize: "1.25rem" }} />;
      case "Maintenance":
        return <BuildIcon sx={{ fontSize: "1.25rem" }} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (roomDetails) {
      fetchAmenities();
      fetchBookings();
      fetchBlockedDates();
      fetchPhotos();
    }
  }, [roomDetails?.id]);

  const fetchBlockedDates = async () => {
    if (!roomDetails?.id) return;
    try {
      const dates = await fetchBlockedDatesByRoomId(roomDetails.id);
      setBlockedDates(dates);
    } catch (error) {
      console.error("Failed to fetch blocked dates:", error);
      setBlockedDates([]);
    }
  };

  const fetchPhotos = async () => {
    if (!roomDetails?.id) return;
    try {
      // First try to get from room_photos table
      const photosResponse = await getData(`room-photos`);
      const roomPhotos = Array.isArray(photosResponse)
        ? photosResponse.filter((p: any) => p.room_id === roomDetails.id)
        : [];

      const photoUrls = roomPhotos.map((p: any) => p.file_url);

      // Add primary room image if exists
      if (
        roomDetails.room_image &&
        !photoUrls.includes(roomDetails.room_image)
      ) {
        photoUrls.unshift(roomDetails.room_image);
      }

      setPhotos(photoUrls);
    } catch (error) {
      console.error("Failed to fetch photos:", error);
      // Fallback to room image only
      if (roomDetails.room_image) {
        setPhotos([roomDetails.room_image]);
      }
    }
  };

  const fetchAmenities = async () => {
    if (!roomDetails?.id) return;
    try {
      const roomAmenityResponse = await getData("room-amenities");
      const amenityResponse = await getData("amenities");
      const filtered = Array.isArray(roomAmenityResponse)
        ? (roomAmenityResponse
            .filter((ra) => ra.room_id === roomDetails.id)
            .map((ra) => {
              const match: Amenity | undefined = (
                amenityResponse as Amenity[]
              ).find((a: Amenity) => a.id === ra.amenity_id);
              return match ? { ...match, ...ra } : null;
            })
            .filter(Boolean) as Amenity[])
        : [];
      setAmenities(filtered);
    } catch (error) {
      console.error("Failed to fetch amenities:", error);
    }
  };

  const fetchBookings = async () => {
    if (!roomDetails?.id) return;
    try {
      const response = await getData(`booking/room/${roomDetails.id}`);
      setBookings(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  const handleRemoveAmenity = async (amenityId: number) => {
    if (!roomDetails?.id) return;

    try {
      // Find the room_amenity record
      const roomAmenityResponse = await getData("room-amenities");
      const roomAmenityRecord = Array.isArray(roomAmenityResponse)
        ? roomAmenityResponse.find(
            (ra: any) =>
              ra.room_id === roomDetails.id && ra.amenity_id === amenityId
          )
        : null;

      if (roomAmenityRecord) {
        await deleteService(roomAmenityRecord.id, "room-amenities");
        await fetchAmenities();

        setAlertConfig({
          open: true,
          type: "success",
          title: "Amenity Removed",
          message: "Amenity has been removed from this room.",
        });
      }
    } catch (error) {
      console.error("Failed to remove amenity:", error);
      setAlertConfig({
        open: true,
        type: "error",
        title: "Failed to Remove",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !roomDetails?.id) return;

    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setAlertConfig({
        open: true,
        type: "error",
        title: "Invalid File",
        message: "Please select an image file.",
      });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Upload to Supabase
      const { fileUrl, fileFormat, fileSize } = await uploadRoomPhoto({
        file,
        businessName: businessDetails?.business_name || "business",
        roomNumber: roomDetails.room_number || "room",
        isProfile: false,
      });

      // Save to room_photos table with proper fields
      await insertData(
        {
          room_id: roomDetails.id,
          file_url: fileUrl,
          file_format: fileFormat,
          file_size: fileSize,
        },
        "room-photos"
      );

      await fetchPhotos();

      setAlertConfig({
        open: true,
        type: "success",
        title: "Photo Uploaded",
        message: "Room photo has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Failed to upload photo:", error);
      setAlertConfig({
        open: true,
        type: "error",
        title: "Upload Failed",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoUrl: string, index: number) => {
    if (!roomDetails?.id) return;

    // Don't allow deleting the primary room image
    if (index === 0 && photoUrl === roomDetails.room_image) {
      setAlertConfig({
        open: true,
        type: "warning",
        title: "Cannot Delete",
        message:
          "Cannot delete the primary room image. Please set a new primary image first.",
      });
      return;
    }

    try {
      const photosResponse = await getData(`room-photos`);
      const photoRecord = Array.isArray(photosResponse)
        ? photosResponse.find(
            (p: any) => p.file_url === photoUrl && p.room_id === roomDetails.id
          )
        : null;

      if (photoRecord) {
        // Delete from Supabase storage
        await deleteRoomPhoto(photoUrl);

        // Delete from database
        await deleteService(photoRecord.id, "room-photos");
        await fetchPhotos();

        setAlertConfig({
          open: true,
          type: "success",
          title: "Photo Deleted",
          message: "Room photo has been deleted successfully.",
        });
      }
    } catch (error) {
      console.error("Failed to delete photo:", error);
      setAlertConfig({
        open: true,
        type: "error",
        title: "Delete Failed",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleDeleteClick = () => {
    setAlertConfig({
      open: true,
      type: "warning",
      title: "Delete Room",
      message: `Are you sure you want to delete Room ${roomDetails?.room_number}? This action cannot be undone and all associated data will be permanently removed.`,
      onConfirm: confirmDeleteRoom,
    });
  };

  const confirmDeleteRoom = async () => {
    try {
      if (!roomDetails?.id) return;
      setIsDeleting(true);
      await deleteData(roomDetails.id as string, "room");

      setAlertConfig({
        open: true,
        type: "success",
        title: "Room Deleted",
        message: `Room ${roomDetails?.room_number} has been successfully deleted.`,
        onConfirm: () => navigate("/business/rooms"),
      });
    } catch (err) {
      console.error("Failed to delete room:", err);
      setIsDeleting(false);
      setAlertConfig({
        open: true,
        type: "error",
        title: "Delete Failed",
        message: `Failed to delete Room ${roomDetails?.room_number}. ${
          err instanceof Error ? err.message : "Please try again."
        }`,
      });
    }
  };

  if (!roomDetails || Object.keys(roomDetails).length === 0) {
    return <NoDataFound message="No room data found." />;
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: <Home size={18} /> },
    { id: "bookings", label: "Bookings", icon: <CalendarIcon size={18} /> },
    { id: "pricing", label: "Pricing", icon: <DollarSign size={18} /> },
    { id: "photos", label: "Photos", icon: <ImageIcon size={18} /> },
    { id: "reviews", label: "Reviews", icon: <Star size={18} /> },
  ];

  return (
    <PageContainer>
      {/* Header with Back Button */}
      <Container
        elevation={2}
        direction="row"
        justify="space-between"
        align="center"
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            variant="outlined"
            colorScheme="secondary"
            onClick={() => navigate("/business/rooms")}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography.Header>{roomDetails.room_type}</Typography.Header>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
            >
              <Chip
                size="md"
                color={getStatusColor(roomDetails?.status || "Available")}
                variant="solid"
                sx={{
                  display: { xs: "none", sm: "none", md: "flex", lg: "flex" },
                }}
              >
                {roomDetails?.status || "Available"}
              </Chip>
              <Typography.Body
                size="sm"
                sx={{
                  color: "text.secondary",
                  display: { xs: "none", sm: "none", md: "flex", lg: "flex" },
                }}
              >
                <MapPin
                  size={14}
                  style={{ display: "inline", marginRight: 4 }}
                />
                Floor {roomDetails?.floor} • Room {roomDetails?.room_number}
              </Typography.Body>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            colorScheme="secondary"
            startDecorator={<Edit size={18} />}
            onClick={() => navigate("/business/room-edit")}
          >
            Edit Room
          </Button>
          <IconButton
            variant="outlined"
            colorScheme="error"
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            <Trash2 size={18} />
          </IconButton>
        </Box>
      </Container>

      <Grid container spacing={2}>
        <Grid sm={12} md={12} lg={12} xl={8}>
          {/* Main Image */}
          <Container padding="0">
            <AspectRatio
              ratio="21/9"
              sx={{ width: "100%", borderRadius: "12px", overflow: "hidden" }}
            >
              <img
                src={roomDetails?.room_image || ""}
                alt={`Room ${roomDetails?.room_number}`}
                style={{ objectFit: "cover" }}
              />
            </AspectRatio>
          </Container>

          {/* Tabs */}
          <DynamicTab
            tabs={tabs}
            activeTabId={activeTab}
            onChange={(tabId) => setActiveTab(String(tabId))}
            padding={"20px 0"}
          />

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <Container elevation={2}>
              {/* Room Info Grid */}
              <Grid container spacing={2}>
                <Grid xs={6} sm={3}>
                  <Container elevation={1}>
                    <Container align="center" padding="0" direction="row">
                      <Home size={18} color={colors.primary} />
                      <Typography.Label size="sm">Room Type</Typography.Label>
                    </Container>
                    <Typography.Body weight="semibold">
                      {roomDetails?.room_type}
                    </Typography.Body>
                  </Container>
                </Grid>

                <Grid xs={6} sm={3}>
                  <Container elevation={1}>
                    <Container align="center" padding="0" direction="row">
                      <Users size={18} color={colors.primary} />
                      <Typography.Label size="sm">Capacity</Typography.Label>
                    </Container>
                    <Typography.Body weight="semibold">
                      {roomDetails?.capacity} Guests
                    </Typography.Body>
                  </Container>
                </Grid>

                <Grid xs={6} sm={3}>
                  <Container elevation={1}>
                    <Container align="center" padding="0" direction="row">
                      <Maximize size={18} color={colors.primary} />
                      <Typography.Label size="sm">Room Size</Typography.Label>
                    </Container>
                    <Typography.Body weight="semibold">
                      {roomDetails?.room_size} m²
                    </Typography.Body>
                  </Container>
                </Grid>

                <Grid xs={6} sm={3}>
                  <Container elevation={1}>
                    <Container align="center" padding="0" direction="row">
                      <DollarSign size={18} color={colors.primary} />
                      <Typography.Label size="sm">Base Price</Typography.Label>
                    </Container>
                    <Typography.Body weight="semibold">
                      ₱{roomDetails?.room_price}/night
                    </Typography.Body>
                  </Container>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Description */}
              <Box sx={{ mb: 3 }}>
                <Typography.CardTitle sx={{ mb: 1.5 }}>
                  Description
                </Typography.CardTitle>
                <Typography.Body
                  sx={{ lineHeight: 1.7, color: "text.secondary" }}
                >
                  {roomDetails?.description ||
                    "Experience luxury and comfort in our Deluxe Ocean View Suite. This spacious room features floor-to-ceiling windows with breathtaking ocean views, a king-size bed with premium linens, and a modern bathroom with a rain shower. Perfect for couples seeking a romantic getaway or business travelers who appreciate refined elegance."}
                </Typography.Body>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Amenities */}
              <Box>
                <Typography.CardTitle sx={{ mb: 1.5 }}>
                  Amenities
                </Typography.CardTitle>
                <Grid container spacing={1.5}>
                  {amenities.length > 0 ? (
                    amenities.map((amenity) => (
                      <Grid xs={6} sm={4} md={3} key={amenity.id}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            p: 1.5,
                            bgcolor: "primary.softBg",
                            borderRadius: "8px",
                            position: "relative",
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "6px",
                              bgcolor: "primary.solidBg",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <CheckCircleIcon
                              sx={{
                                fontSize: "1rem",
                                color: "white",
                              }}
                            />
                          </Box>
                          <Typography.Body size="sm" weight="normal">
                            {amenity.name}
                          </Typography.Body>
                        </Box>
                      </Grid>
                    ))
                  ) : (
                    <Grid xs={12}>
                      <Typography.Body sx={{ color: "text.secondary" }}>
                        No amenities listed. Go to Edit Room to add amenities.
                      </Typography.Body>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Container>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && <Reviews />}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <Container elevation={2}>
              <Typography.CardTitle sx={{ mb: 2 }}>
                Upcoming Bookings
              </Typography.CardTitle>
              {bookings.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {bookings.slice(0, 3).map((booking) => (
                    <Box
                      key={booking.id}
                      sx={{
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography.Body weight="semibold">
                          {booking.tourist_id}
                        </Typography.Body>
                        <Typography.Body
                          size="sm"
                          sx={{ color: "text.secondary" }}
                        >
                          {new Date(booking.check_in_date).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            booking.check_out_date
                          ).toLocaleDateString()}
                        </Typography.Body>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography.Body weight="semibold">
                          ₱{booking.total_price}
                        </Typography.Body>
                        <Chip
                          size="sm"
                          color={
                            booking.booking_status === "Reserved"
                              ? "success"
                              : "neutral"
                          }
                        >
                          {booking.booking_status}
                        </Chip>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <NoDataFound
                  icon="inbox"
                  title="No Bookings"
                  message="This room has no upcoming bookings."
                  size="small"
                />
              )}
            </Container>
          )}

          {/* Pricing Tab */}
          {activeTab === "pricing" && (
            <Container elevation={2}>
              {/* Base & Weekend Pricing Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid xs={12} md={6}>
                  <Box
                    sx={{
                      p: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "12px",
                      bgcolor: "background.surface",
                    }}
                  >
                    <Typography.Label
                      size="sm"
                      sx={{ color: "text.secondary", mb: 1 }}
                    >
                      Base Price
                    </Typography.Label>
                    <Typography.Title
                      sx={{ fontSize: "2rem", fontWeight: 600, mb: 0.5 }}
                    >
                      ₱{roomDetails?.room_price || 250}
                    </Typography.Title>
                    <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
                      per night
                    </Typography.Body>
                  </Box>
                </Grid>

                <Grid xs={12} md={6}>
                  <Box
                    sx={{
                      p: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "12px",
                      bgcolor: "background.surface",
                    }}
                  >
                    <Typography.Label
                      size="sm"
                      sx={{ color: "text.secondary", mb: 1 }}
                    >
                      Weekend Price
                    </Typography.Label>
                    <Typography.Title
                      sx={{ fontSize: "2rem", fontWeight: 600, mb: 0.5 }}
                    >
                      ₱320
                    </Typography.Title>
                    <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
                      Fri-Sun nights
                    </Typography.Body>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Seasonal Pricing */}
              <Box>
                <Typography.CardTitle sx={{ mb: 2 }}>
                  Seasonal Pricing
                </Typography.CardTitle>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "8px",
                    }}
                  >
                    <Box>
                      <Typography.Body weight="semibold">
                        Peak Season (Jun-Aug)
                      </Typography.Body>
                    </Box>
                    <Typography.Body
                      weight="bold"
                      sx={{ fontSize: "1.125rem" }}
                    >
                      ₱380/night
                    </Typography.Body>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "8px",
                    }}
                  >
                    <Box>
                      <Typography.Body weight="semibold">
                        High Season (Dec-Feb)
                      </Typography.Body>
                    </Box>
                    <Typography.Body
                      weight="bold"
                      sx={{ fontSize: "1.125rem" }}
                    >
                      ₱320/night
                    </Typography.Body>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "8px",
                    }}
                  >
                    <Box>
                      <Typography.Body weight="semibold">
                        Low Season (Mar-May, Sep-Nov)
                      </Typography.Body>
                    </Box>
                    <Typography.Body
                      weight="bold"
                      sx={{ fontSize: "1.125rem" }}
                    >
                      ₱250/night
                    </Typography.Body>
                  </Box>
                </Box>
              </Box>
            </Container>
          )}

          {/* Photos Tab */}
          {activeTab === "photos" && (
            <Container elevation={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography.CardTitle>Room Photos</Typography.CardTitle>
                <Button
                  variant="solid"
                  colorScheme="primary"
                  size="sm"
                  startDecorator={<Upload size={16} />}
                  onClick={() =>
                    document.getElementById("photo-upload-input")?.click()
                  }
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? "Uploading..." : "Upload Photo"}
                </Button>
                <input
                  id="photo-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: "none" }}
                />
              </Box>
              <Grid container spacing={2}>
                {photos.map((photo, index) => (
                  <Grid xs={12} sm={6} md={4} key={index}>
                    <Box sx={{ position: "relative" }}>
                      <AspectRatio ratio="16/9">
                        <img src={photo} alt={`Room ${index + 1}`} />
                      </AspectRatio>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          mt: 1,
                          alignItems: "center",
                        }}
                      >
                        {index === 0 && (
                          <Chip size="sm" color="primary">
                            Primary
                          </Chip>
                        )}
                        {index !== 0 && (
                          <IconButton
                            size="sm"
                            variant="outlined"
                            colorScheme="error"
                            onClick={() => handleDeletePhoto(photo, index)}
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                ))}
                {photos.length === 0 && (
                  <Grid xs={12}>
                    <NoDataFound
                      icon="file"
                      title="No Photos"
                      message="No photos uploaded for this room."
                      size="small"
                    />
                  </Grid>
                )}
              </Grid>
            </Container>
          )}
        </Grid>
        {/* Right Column - Performance & Availability */}
        <Grid xs={12} md={12} lg={12} xl={4} spacing={2}>
          <Container padding="0" gap="20px">
            {/* Availability Calendar */}
            <Container elevation={2}>
              <Typography.CardTitle>Availability</Typography.CardTitle>
              <Calendar
                events={[
                  // Booking events
                  ...bookings.map((booking) => ({
                    date: new Date(booking.check_in_date),
                    status:
                      booking.booking_status === "Reserved"
                        ? ("Reserved" as const)
                        : booking.booking_status === "Checked-In"
                        ? ("Occupied" as const)
                        : ("Available" as const),
                    label: `Booking #${booking.id?.slice(0, 8) || "N/A"}`,
                    bookingId: booking.id,
                  })),
                  // Blocked date events
                  ...generateBlockedCalendarEvents(blockedDates),
                ]}
              />
            </Container>

            {/* Quick Actions */}
            {/* <Container elevation={2}>
              <Typography.CardTitle sx={{ mb: 2 }}>
                Quick Actions
              </Typography.CardTitle>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button fullWidth variant="outlined" colorScheme="secondary">
                  Block Dates
                </Button>
                <Button fullWidth variant="outlined" colorScheme="secondary">
                  Update Pricing
                </Button>
                <Button fullWidth variant="outlined" colorScheme="secondary">
                  Manage Amenities
                </Button>
                <Button fullWidth variant="outlined" colorScheme="error">
                  Deactivate Room
                </Button>
              </Box>
            </Container> */}
          </Container>
        </Grid>
      </Grid>

      {/* Alert Dialog */}
      <Alert
        open={alertConfig.open}
        onClose={() => setAlertConfig((prev) => ({ ...prev, open: false }))}
        onConfirm={
          alertConfig.onConfirm ||
          (() => setAlertConfig((prev) => ({ ...prev, open: false })))
        }
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.type === "warning" ? "Delete" : "OK"}
        showCancel={alertConfig.type === "warning"}
      />
    </PageContainer>
  );
};

export default RoomProfile;
