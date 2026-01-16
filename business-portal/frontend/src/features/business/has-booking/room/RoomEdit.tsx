import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "@/src/context/RoomContext";
import { useBusiness } from "@/src/context/BusinessContext";
import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import Alert from "@/src/components/Alert";
import {
  Box,
  Grid,
  Input,
  Textarea,
  Select,
  Option,
  FormControl,
  FormLabel,
  Chip,
  AspectRatio,
  Divider,
  Sheet,
  List,
  ListItem,
  ListItemButton,
  ListItemDecorator,
  ListItemContent,
  Autocomplete,
} from "@mui/joy";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  X,
  Info,
  Palette,
  DollarSign,
  Camera,
  Plus,
  Upload,
} from "lucide-react";
import {
  getData,
  updateData,
  insertData,
  deleteData as deleteService,
} from "@/src/services/Service";
import { uploadRoomPhoto } from "@/src/utils/uploadRoomPhoto";
import type { Amenity } from "@/src/types/Amenity";
import NoDataFound from "@/src/components/NoDataFound";
import { SeasonalPricingForm } from "./components/SeasonalPricing";

const RoomEdit = () => {
  const navigate = useNavigate();
  const { roomDetails, refreshRoom } = useRoom();
  const { businessDetails } = useBusiness();
  const [isSaving, setIsSaving] = useState(false);
  const [currentSection, setCurrentSection] = useState<
    "basic" | "amenities" | "pricing" | "photos"
  >("basic");

  // Form states
  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "",
    floor: "",
    room_size: "",
    capacity: "",
    description: "",
    room_price: "",
    per_hour_rate: "",
  });

  const [profileImage, setProfileImage] = useState<string>("");
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [amenitySearchValue, setAmenitySearchValue] = useState<string>("");
  const [isAddingNewAmenity, setIsAddingNewAmenity] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);

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

  useEffect(() => {
    if (roomDetails) {
      setFormData({
        room_number: roomDetails.room_number || "",
        room_type: roomDetails.room_type || "",
        floor: roomDetails.floor?.toString() || "",
        room_size: roomDetails.room_size?.toString() || "",
        capacity: roomDetails.capacity?.toString() || "",
        description: roomDetails.description || "",
        room_price: roomDetails.room_price?.toString() || "",
        per_hour_rate: roomDetails.per_hour_rate?.toString() || "",
      });
      if (roomDetails.room_image) {
        setProfileImage(roomDetails.room_image);
        setPhotos([roomDetails.room_image]);
      }
    }
  }, [roomDetails]);

  useEffect(() => {
    fetchAmenities();
    fetchRoomAmenities();
  }, [roomDetails?.id]);

  const fetchAmenities = async () => {
    try {
      const response = await getData("amenities");
      setAmenities(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to fetch amenities:", error);
    }
  };

  const fetchRoomAmenities = async () => {
    if (!roomDetails?.id) return;
    try {
      const response = await getData("room-amenities");
      const filtered = Array.isArray(response)
        ? response
            .filter((ra) => ra.room_id === roomDetails.id)
            .map((ra) => ra.amenity_id)
        : [];
      setSelectedAmenities(filtered);
    } catch (error) {
      console.error("Failed to fetch room amenities:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleCreateNewAmenity = async (amenityName: string) => {
    if (!amenityName.trim()) return;

    setIsAddingNewAmenity(true);
    try {
      await insertData({ name: amenityName.trim() }, "amenities");
      await fetchAmenities();

      // Find and select the newly created amenity
      const response = await getData("amenities");
      const newAmenity = Array.isArray(response)
        ? response.find((a: Amenity) => a.name === amenityName.trim())
        : null;

      if (newAmenity) {
        setSelectedAmenities((prev) => [...prev, String(newAmenity.id)]);
      }

      setAmenitySearchValue("");

      setAlertConfig({
        open: true,
        type: "success",
        title: "Amenity Created",
        message: `"${amenityName}" has been added to amenities list.`,
      });
    } catch (error) {
      console.error("Failed to create amenity:", error);
      setAlertConfig({
        open: true,
        type: "error",
        title: "Failed to Create Amenity",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsAddingNewAmenity(false);
    }
  };

  const handleProfilePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

    setIsUploadingProfile(true);
    try {
      // Upload to Supabase
      const { fileUrl } = await uploadRoomPhoto({
        file,
        businessName: businessDetails?.business_name || "business",
        roomNumber: formData.room_number || "room",
        isProfile: true,
      });

      // Update room image in database
      await updateData(roomDetails.id, { room_image: fileUrl }, "room");

      setProfileImage(fileUrl);
      await refreshRoom();

      setAlertConfig({
        open: true,
        type: "success",
        title: "Profile Photo Updated",
        message: "Room profile photo has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to upload profile photo:", error);
      setAlertConfig({
        open: true,
        type: "error",
        title: "Upload Failed",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewPhotos((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveNewPhoto = (index: number) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!roomDetails?.id) return;

    setIsSaving(true);
    try {
      // Upload new photos
      let uploadedPhotoUrl = roomDetails.room_image;
      // TODO: Implement file upload service
      // if (newPhotos.length > 0) {
      //   const timestamp = Date.now();
      //   const photoPath = `room/${roomDetails.id}/photos/${timestamp}-${newPhotos[0].name}`;
      //   uploadedPhotoUrl = await uploadFile(
      //     newPhotos[0],
      //     photoPath,
      //     "room-photos"
      //   );
      // }

      // Update room data
      const updatePayload = {
        room_number: formData.room_number,
        room_type: formData.room_type,
        floor: parseInt(formData.floor),
        room_size: parseFloat(formData.room_size),
        capacity: parseInt(formData.capacity),
        description: formData.description,
        room_price: parseFloat(formData.room_price),
        per_hour_rate: formData.per_hour_rate
          ? parseFloat(formData.per_hour_rate)
          : null,
        room_image: uploadedPhotoUrl,
      };

      await updateData(roomDetails.id, updatePayload, "room");

      // Update room amenities
      // First, get current room amenities from database
      const currentRoomAmenities = await getData("room-amenities");
      const currentAmenityIds = Array.isArray(currentRoomAmenities)
        ? currentRoomAmenities
            .filter((ra: any) => ra.room_id === roomDetails.id)
            .map((ra: any) => String(ra.amenity_id))
        : [];

      // Find amenities to add (in selectedAmenities but not in current)
      const amenitiesToAdd = selectedAmenities.filter(
        (id) => !currentAmenityIds.includes(id)
      );

      // Find amenities to remove (in current but not in selectedAmenities)
      const amenitiesToRemove = currentRoomAmenities
        ? (currentRoomAmenities as any[]).filter(
            (ra: any) =>
              ra.room_id === roomDetails.id &&
              !selectedAmenities.includes(String(ra.amenity_id))
          )
        : [];

      // Add new amenities
      for (const amenityId of amenitiesToAdd) {
        await insertData(
          {
            room_id: roomDetails.id,
            amenity_id: parseInt(amenityId),
          },
          "room-amenities"
        );
      }

      // Remove unselected amenities
      for (const ra of amenitiesToRemove) {
        await deleteService(ra.id, "room-amenities");
      }

      await refreshRoom();

      setAlertConfig({
        open: true,
        type: "success",
        title: "Room Updated",
        message: "Room details have been successfully updated.",
        onConfirm: () => navigate("/business/room-profile"),
      });
    } catch (error) {
      console.error("Failed to save room:", error);
      setAlertConfig({
        open: true,
        type: "error",
        title: "Update Failed",
        message:
          error instanceof Error ? error.message : "Failed to update room.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!roomDetails) {
    return <NoDataFound message="No room data found." />;
  }

  const sections = [
    { id: "basic", label: "Basic Information", icon: <Info size={18} /> },
    {
      id: "amenities",
      label: "Amenities & Features",
      icon: <Palette size={18} />,
    },
    { id: "pricing", label: "Pricing", icon: <DollarSign size={18} /> },
    { id: "photos", label: "Photos", icon: <Camera size={18} /> },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <Container direction="row" justify="space-between" align="center">
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="plain"
            colorScheme="secondary"
            onClick={() => navigate("/business/room-profile")}
            startDecorator={<ArrowLeft size={20} />}
          >
            Back
          </Button>
          <Box>
            <Typography.Header>Edit Room</Typography.Header>
            <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
              Update room details and settings
            </Typography.Body>
          </Box>
        </Box>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          startDecorator={<Save size={20} />}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </Container>

      {/* Main Content with Side Navigation */}
      <Grid container spacing={2}>
        {/* Left Sidebar Navigation */}
        <Grid xs={12} md={3}>
          <Container>
            <Sheet
              variant="outlined"
              sx={{
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <List>
                {sections.map((section) => (
                  <ListItem key={section.id}>
                    <ListItemButton
                      selected={currentSection === section.id}
                      onClick={() =>
                        setCurrentSection(section.id as typeof currentSection)
                      }
                      sx={{
                        py: 1.5,
                        "&.Mui-selected": {
                          bgcolor: "primary.softBg",
                          borderLeft: "3px solid",
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <ListItemDecorator>{section.icon}</ListItemDecorator>
                      <ListItemContent>
                        <Typography.Body size="sm" weight="semibold">
                          {section.label}
                        </Typography.Body>
                      </ListItemContent>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Sheet>
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "background.level1",
                borderRadius: "8px",
              }}
            >
              <Typography.Label size="xs" sx={{ color: "text.secondary" }}>
                Info
              </Typography.Label>
              <Typography.Body size="xs" sx={{ mt: 0.5 }}>
                Changes are saved automatically as you edit. Click "Save
                Changes" to finalize.
              </Typography.Body>
            </Box>
          </Container>
        </Grid>

        {/* Right Content Area */}
        <Grid xs={12} md={9}>
          <Container>
            {/* Basic Information Section */}
            {currentSection === "basic" && (
              <Grid container spacing={3}>
                {/* Profile Photo Upload */}
                <Grid xs={12}>
                  <Box>
                    <Typography.Label
                      size="sm"
                      sx={{ mb: 1, display: "block" }}
                    >
                      Room Profile Photo
                    </Typography.Label>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <AspectRatio
                        ratio="16/9"
                        sx={{
                          width: 200,
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={profileImage || "/placeholder-room.jpg"}
                          alt="Room Profile"
                          style={{ objectFit: "cover" }}
                        />
                      </AspectRatio>
                      <Box>
                        <Button
                          variant="outlined"
                          colorScheme="secondary"
                          size="sm"
                          startDecorator={<Upload size={16} />}
                          onClick={() =>
                            document
                              .getElementById("profile-photo-upload")
                              ?.click()
                          }
                          disabled={isUploadingProfile}
                        >
                          {isUploadingProfile ? "Uploading..." : "Upload Photo"}
                        </Button>
                        <input
                          id="profile-photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePhotoUpload}
                          style={{ display: "none" }}
                        />
                        <Typography.Body
                          size="xs"
                          sx={{ color: "text.secondary", mt: 0.5 }}
                        >
                          Recommended: 1920x1080px (16:9 ratio)
                        </Typography.Body>
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid xs={12}>
                  <Divider />
                </Grid>

                <Grid xs={12} md={4}>
                  <FormControl>
                    <FormLabel>
                      <Typography.Label size="sm">Room Number</Typography.Label>
                    </FormLabel>
                    <Input
                      value={formData.room_number}
                      onChange={(e) =>
                        handleInputChange("room_number", e.target.value)
                      }
                      placeholder="301"
                      size="lg"
                    />
                  </FormControl>
                </Grid>
                <Grid xs={12} md={4}>
                  <FormControl>
                    <FormLabel>
                      <Typography.Label size="sm">Room Type</Typography.Label>
                    </FormLabel>
                    <Select
                      value={formData.room_type}
                      onChange={(_, value) =>
                        handleInputChange("room_type", value as string)
                      }
                      size="lg"
                    >
                      <Option value="King Suite">King Suite</Option>
                      <Option value="Queen Suite">Queen Suite</Option>
                      <Option value="Deluxe">Deluxe</Option>
                      <Option value="Standard">Standard</Option>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid xs={12} md={4}>
                  <FormControl>
                    <FormLabel>
                      <Typography.Label size="sm">
                        Maximum Capacity
                      </Typography.Label>
                    </FormLabel>
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) =>
                        handleInputChange("capacity", e.target.value)
                      }
                      placeholder="2"
                      size="lg"
                      endDecorator="Guests"
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} md={4}>
                  <FormControl>
                    <FormLabel>
                      <Typography.Label size="sm">
                        Room Size (m²)
                      </Typography.Label>
                    </FormLabel>
                    <Input
                      type="number"
                      value={formData.room_size}
                      onChange={(e) =>
                        handleInputChange("room_size", e.target.value)
                      }
                      placeholder="45"
                      size="lg"
                      endDecorator="m²"
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} md={4}>
                  <FormControl>
                    <FormLabel>
                      <Typography.Label size="sm">
                        Floor Number
                      </Typography.Label>
                    </FormLabel>
                    <Input
                      type="number"
                      value={formData.floor}
                      onChange={(e) =>
                        handleInputChange("floor", e.target.value)
                      }
                      placeholder="3"
                      size="lg"
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12}>
                  <FormControl>
                    <FormLabel>
                      <Typography.Label size="sm">Description</Typography.Label>
                    </FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Experience luxury and comfort..."
                      minRows={4}
                      size="lg"
                    />
                    <Typography.Body
                      size="xs"
                      sx={{ color: "text.secondary", mt: 0.5 }}
                    >
                      {formData.description.length} / 500 characters
                    </Typography.Body>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {/* Amenities Section */}
            {currentSection === "amenities" && (
              <Box>
                <Typography.CardTitle sx={{ mb: 2 }}>
                  Room Amenities
                </Typography.CardTitle>
                <Typography.Body
                  size="sm"
                  sx={{ color: "text.secondary", mb: 3 }}
                >
                  Select amenities available in this room. Click on amenities to
                  select or deselect them.
                </Typography.Body>

                {/* Autocomplete Search Input */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Autocomplete
                      placeholder="Search and add amenities..."
                      options={amenities.filter(
                        (amenity) =>
                          !selectedAmenities.includes(String(amenity.id))
                      )}
                      getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.name
                      }
                      value={null}
                      inputValue={amenitySearchValue}
                      onInputChange={(_, newValue) =>
                        setAmenitySearchValue(newValue)
                      }
                      onChange={(_, newValue) => {
                        if (newValue && typeof newValue !== "string") {
                          handleAmenityToggle(String(newValue.id));
                          setAmenitySearchValue("");
                        }
                      }}
                      freeSolo
                      size="lg"
                      sx={{
                        width: "100%",
                      }}
                    />
                    {amenitySearchValue.trim() &&
                      !amenities.some(
                        (a) =>
                          a.name.toLowerCase() ===
                          amenitySearchValue.trim().toLowerCase()
                      ) && (
                        <Button
                          variant="solid"
                          colorScheme="primary"
                          onClick={() =>
                            handleCreateNewAmenity(amenitySearchValue)
                          }
                          disabled={isAddingNewAmenity}
                          startDecorator={<Plus size={18} />}
                          sx={{ flexShrink: 0 }}
                        >
                          Add New
                        </Button>
                      )}
                  </Box>
                  {amenitySearchValue.trim() &&
                    !amenities.some(
                      (a) =>
                        a.name.toLowerCase() ===
                        amenitySearchValue.trim().toLowerCase()
                    ) && (
                      <Typography.Body
                        size="xs"
                        sx={{ color: "text.secondary", mt: 1 }}
                      >
                        "{amenitySearchValue}" not found. Click "Add New" to
                        create it.
                      </Typography.Body>
                    )}
                </Box>

                {/* Selected Amenities */}
                {selectedAmenities.length > 0 && (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1.5,
                      }}
                    >
                      <Typography.Label size="sm">
                        Selected Amenities ({selectedAmenities.length})
                      </Typography.Label>
                      <Typography.Body
                        size="xs"
                        sx={{ color: "text.secondary" }}
                      >
                        Click X to remove
                      </Typography.Body>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1.5,
                        mb: 3,
                        p: 2,
                        bgcolor: "primary.softBg",
                        borderRadius: "8px",
                      }}
                    >
                      {amenities
                        .filter((amenity) =>
                          selectedAmenities.includes(String(amenity.id))
                        )
                        .map((amenity) => (
                          <Chip
                            key={amenity.id}
                            variant="solid"
                            color="primary"
                            endDecorator={
                              <Box
                                component="span"
                                sx={{
                                  ml: 0.5,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  "&:hover": {
                                    opacity: 0.8,
                                  },
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAmenityToggle(String(amenity.id));
                                }}
                              >
                                <X size={14} />
                              </Box>
                            }
                            sx={{
                              px: 2,
                              py: 1,
                              fontSize: "0.875rem",
                            }}
                          >
                            {amenity.name}
                          </Chip>
                        ))}
                    </Box>
                  </>
                )}

                {/* All Available Amenities */}
                <Typography.Label size="sm" sx={{ mb: 1.5 }}>
                  Available Amenities{" "}
                  {selectedAmenities.length > 0 && "(Click to add)"}
                </Typography.Label>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                  {amenities
                    .filter(
                      (amenity) =>
                        !selectedAmenities.includes(String(amenity.id))
                    )
                    .map((amenity) => (
                      <Chip
                        key={amenity.id}
                        variant="outlined"
                        color="neutral"
                        onClick={() => handleAmenityToggle(String(amenity.id))}
                        sx={{
                          cursor: "pointer",
                          px: 2,
                          py: 1,
                          fontSize: "0.875rem",
                          "&:hover": {
                            bgcolor: "neutral.softHoverBg",
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        {amenity.name}
                      </Chip>
                    ))}
                </Box>

                {selectedAmenities.length === 0 && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      bgcolor: "background.level1",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}
                  >
                    <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
                      No amenities selected. Use the search above or click on
                      amenities to add them.
                    </Typography.Body>
                  </Box>
                )}

                {selectedAmenities.length > 0 && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      bgcolor: "primary.softBg",
                      borderRadius: "8px",
                    }}
                  >
                    <Typography.Label size="sm" sx={{ color: "primary.main" }}>
                      {selectedAmenities.length} amenities selected
                    </Typography.Label>
                  </Box>
                )}
              </Box>
            )}

            {/* Pricing Section */}
            {currentSection === "pricing" && (
              <Box>
                {/* Base Pricing Fields */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid xs={12} md={6}>
                    <FormControl>
                      <FormLabel>
                        <Typography.Label size="sm">
                          Base Price (per night)
                        </Typography.Label>
                      </FormLabel>
                      <Input
                        type="number"
                        value={formData.room_price}
                        onChange={(e) =>
                          handleInputChange("room_price", e.target.value)
                        }
                        placeholder="250"
                        size="lg"
                        startDecorator="₱"
                        endDecorator="per night"
                      />
                    </FormControl>
                  </Grid>

                  <Grid xs={12} md={6}>
                    <FormControl>
                      <FormLabel>
                        <Typography.Label size="sm">
                          Per Hour Rate (Short Stay)
                        </Typography.Label>
                      </FormLabel>
                      <Input
                        type="number"
                        value={formData.per_hour_rate}
                        onChange={(e) =>
                          handleInputChange("per_hour_rate", e.target.value)
                        }
                        placeholder="Leave empty to disable short stay"
                        size="lg"
                        startDecorator="₱"
                        endDecorator="per hour"
                      />
                      <Typography.Body
                        size="xs"
                        sx={{ color: "text.secondary", mt: 0.5 }}
                      >
                        Set this to enable short-stay (hourly) bookings for this
                        room
                      </Typography.Body>
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Seasonal Pricing Form */}
                {roomDetails?.id && businessDetails?.id && (
                  <SeasonalPricingForm
                    businessId={businessDetails.id}
                    roomId={roomDetails.id}
                    defaultPrice={Number(formData.room_price) || 0}
                    onSuccess={() => {
                      setAlertConfig({
                        open: true,
                        type: "success",
                        title: "Pricing Updated",
                        message:
                          "Seasonal pricing has been saved successfully.",
                      });
                    }}
                  />
                )}
              </Box>
            )}

            {/* Photos Section */}
            {currentSection === "photos" && (
              <Box>
                <Typography.CardTitle sx={{ mb: 2 }}>
                  Room Photos
                </Typography.CardTitle>

                <Grid container spacing={2}>
                  {/* Existing Photos */}
                  {photos.map((photo, index) => (
                    <Grid xs={12} sm={6} md={4} key={`existing-${index}`}>
                      <AspectRatio ratio="16/9">
                        <img src={photo} alt={`Room ${index + 1}`} />
                      </AspectRatio>
                      {index === 0 && (
                        <Chip size="sm" color="primary" sx={{ mt: 1 }}>
                          Primary
                        </Chip>
                      )}
                    </Grid>
                  ))}

                  {/* New Photos Preview */}
                  {newPhotos.map((file, index) => (
                    <Grid xs={12} sm={6} md={4} key={`new-${index}`}>
                      <Box sx={{ position: "relative" }}>
                        <AspectRatio ratio="16/9">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${index + 1}`}
                          />
                        </AspectRatio>
                        <Button
                          size="sm"
                          variant="solid"
                          colorScheme="error"
                          onClick={() => handleRemoveNewPhoto(index)}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            minHeight: 32,
                            minWidth: 32,
                            p: 0,
                          }}
                        >
                          <X size={16} />
                        </Button>
                      </Box>
                    </Grid>
                  ))}

                  {/* Upload Button */}
                  <Grid xs={12} sm={6} md={4}>
                    <Box
                      sx={{
                        aspectRatio: "16/9",
                        border: "2px dashed",
                        borderColor: "divider",
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "primary.softBg",
                        },
                      }}
                      onClick={() =>
                        document.getElementById("photo-upload")?.click()
                      }
                    >
                      <ImageIcon size={48} opacity={0.3} />
                      <Typography.Body size="sm" sx={{ mt: 1 }}>
                        Click to upload
                      </Typography.Body>
                      <Typography.Body
                        size="xs"
                        sx={{ color: "text.secondary" }}
                      >
                        PNG, JPG up to 10MB
                      </Typography.Body>
                    </Box>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      style={{ display: "none" }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
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
      />
    </PageContainer>
  );
};

export default RoomEdit;
