/**
 * Walk-In Booking Modal
 *
 * Allows staff to create bookings for guests who arrive without prior reservation.
 * Supports both existing guest lookup and new guest entry.
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Typography,
  Input,
  Select,
  Option,
  FormControl,
  FormLabel,
  Checkbox,
  Divider,
  Avatar,
  CircularProgress,
  Chip,
} from "@mui/joy";
import { Box } from "@mui/material";
import {
  User,
  Calendar,
  Users,
  Phone,
  Mail,
  Search,
  Bed,
  DollarSign,
  Clock,
  UserPlus,
} from "lucide-react";
import BaseModal from "@/src/components/BaseModal";
import Alert from "@/src/components/Alert";
import { colors } from "@/src/utils/Colors";
import { useBusiness } from "@/src/context/BusinessContext";
import {
  createWalkInBooking,
  searchGuests,
} from "@/src/services/BookingService";
import { fetchAvailableRoomsByDateRange } from "@/src/services/RoomService";
import type {
  WalkInBookingRequest,
  GuestSearchResult,
} from "@/src/types/Booking";
import type { Room } from "@/src/types/Business";

interface WalkInBookingModalProps {
  open: boolean;
  onClose: () => void;
  businessId?: string;
  onSuccess?: (guestName: string) => void | Promise<void>;
}

const tripPurposeOptions = [
  "Leisure",
  "Business",
  "Family",
  "Event",
  "Medical",
  "Education",
  "Other",
];

const WalkInBookingModal: React.FC<WalkInBookingModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { businessDetails } = useBusiness();

  // Form state
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"guest" | "booking" | "confirm">("guest");

  // Guest search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GuestSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestSearchResult | null>(
    null
  );
  const [useExistingGuest, setUseExistingGuest] = useState(true);

  // New guest form
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  // Booking form
  const [checkInDate, setCheckInDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [checkOutDate, setCheckOutDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("12:00");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [pax, setPax] = useState(1);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [numInfants, setNumInfants] = useState(0);
  const [tripPurpose, setTripPurpose] = useState("Leisure");
  const [immediateCheckin, setImmediateCheckin] = useState(true);
  const [bookingType, _setBookingType] = useState<"overnight" | "short-stay">(
    "overnight"
  );

  // Alert state
  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

  // Calculate total price
  const selectedRoom = useMemo(
    () => availableRooms.find((r) => r.id === selectedRoomId),
    [availableRooms, selectedRoomId]
  );

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
  }, [checkInDate, checkOutDate]);

  const totalPrice = useMemo(() => {
    if (!selectedRoom?.room_price || nights <= 0) return 0;
    const price =
      typeof selectedRoom.room_price === "number"
        ? selectedRoom.room_price
        : parseFloat(String(selectedRoom.room_price)) || 0;
    return price * nights;
  }, [selectedRoom, nights]);

  // Search guests with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2 || !useExistingGuest) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchGuests(
          searchQuery,
          businessDetails?.id || undefined
        );
        setSearchResults(results);
      } catch (error) {
        console.error("Guest search failed:", error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, businessDetails?.id, useExistingGuest]);

  // Fetch available rooms when dates change
  const fetchRooms = useCallback(async () => {
    if (!businessDetails?.id || !checkInDate || !checkOutDate) return;

    setLoadingRooms(true);
    try {
      const rooms = await fetchAvailableRoomsByDateRange(
        businessDetails.id,
        checkInDate,
        checkOutDate
      );
      setAvailableRooms(rooms);
      if (rooms.length > 0 && !selectedRoomId) {
        setSelectedRoomId(rooms[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch available rooms:", error);
      setAvailableRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }, [businessDetails?.id, checkInDate, checkOutDate, selectedRoomId]);

  useEffect(() => {
    if (checkInDate && checkOutDate && step === "booking") {
      fetchRooms();
    }
  }, [checkInDate, checkOutDate, step, fetchRooms]);

  // Update pax when adults/children change
  useEffect(() => {
    setPax(numAdults + numChildren + numInfants);
  }, [numAdults, numChildren, numInfants]);

  // Set default check-out date (next day)
  useEffect(() => {
    if (checkInDate && !checkOutDate) {
      const nextDay = new Date(checkInDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay.toISOString().split("T")[0]);
    }
  }, [checkInDate, checkOutDate]);

  const handleSelectGuest = (guest: GuestSearchResult) => {
    setSelectedGuest(guest);
    setGuestName(guest.full_name);
    setGuestPhone(guest.phone_number || "");
    setGuestEmail(guest.email || "");
  };

  const handleNextStep = () => {
    if (step === "guest") {
      if (!useExistingGuest && !guestName.trim()) {
        setAlertConfig({
          open: true,
          type: "error",
          title: "Missing Information",
          message: "Please enter guest name",
        });
        return;
      }
      setStep("booking");
    } else if (step === "booking") {
      if (!selectedRoomId) {
        setAlertConfig({
          open: true,
          type: "error",
          title: "Missing Information",
          message: "Please select a room",
        });
        return;
      }
      if (!checkOutDate || nights <= 0) {
        setAlertConfig({
          open: true,
          type: "error",
          title: "Invalid Dates",
          message: "Please select valid check-in and check-out dates",
        });
        return;
      }
      setStep("confirm");
    }
  };

  const handleSubmit = async () => {
    if (!businessDetails?.id) return;

    setLoading(true);
    try {
      const request: WalkInBookingRequest = {
        pax,
        num_adults: numAdults,
        num_children: numChildren,
        num_infants: numInfants,
        trip_purpose: tripPurpose,
        booking_type: bookingType,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        check_in_time: checkInTime + ":00",
        check_out_time: checkOutTime + ":00",
        total_price: totalPrice,
        balance: immediateCheckin ? 0 : totalPrice,
        room_id: selectedRoomId,
        business_id: businessDetails.id,
        immediate_checkin: immediateCheckin,
        tourist_id: selectedGuest?.tourist_id,
        guest_name: useExistingGuest ? selectedGuest?.full_name : guestName,
        guest_phone: useExistingGuest
          ? selectedGuest?.phone_number
          : guestPhone,
        guest_email: useExistingGuest ? selectedGuest?.email : guestEmail,
      };

      const result = await createWalkInBooking(request);

      setAlertConfig({
        open: true,
        type: "success",
        title: immediateCheckin ? "Guest Checked In" : "Booking Created",
        message: result.message || "Walk-in booking created successfully!",
      });

      // Get guest name for callback
      const guestNameForCallback = useExistingGuest
        ? selectedGuest?.full_name || guestName || "Guest"
        : guestName || "Guest";

      // Reset form and close after short delay
      setTimeout(() => {
        handleClose();
        onSuccess?.(guestNameForCallback);
      }, 1500);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create walk-in booking";
      setAlertConfig({
        open: true,
        type: "error",
        title: "Booking Failed",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset all state
    setStep("guest");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedGuest(null);
    setUseExistingGuest(true);
    setGuestName("");
    setGuestPhone("");
    setGuestEmail("");
    setCheckInDate(new Date().toISOString().split("T")[0]);
    setCheckOutDate("");
    setSelectedRoomId("");
    setAvailableRooms([]);
    setPax(1);
    setNumAdults(1);
    setNumChildren(0);
    setNumInfants(0);
    setTripPurpose("Leisure");
    setImmediateCheckin(true);
    onClose();
  };

  // Dynamic title based on step
  const getTitle = () => {
    return "Walk-In Booking";
  };

  const getDescription = () => {
    if (step === "guest") return "Step 1: Guest Information";
    if (step === "booking") return "Step 2: Booking Details";
    return "Step 3: Confirm Booking";
  };

  // Dynamic actions based on step
  const getActions = () => {
    const actions = [];

    if (step !== "guest") {
      actions.push({
        label: "Back",
        onClick: () => setStep(step === "confirm" ? "booking" : "guest"),
        variant: "outlined" as const,
        colorScheme: "secondary" as const,
        disabled: loading,
      });
    }

    if (step !== "confirm") {
      actions.push({
        label: "Next",
        onClick: handleNextStep,
        variant: "solid" as const,
        colorScheme: "primary" as const,
        disabled:
          (step === "guest" && useExistingGuest && !selectedGuest) ||
          (step === "guest" && !useExistingGuest && !guestName.trim()) ||
          (step === "booking" && !selectedRoomId),
      });
    } else {
      actions.push({
        label: immediateCheckin ? "Check In Guest" : "Create Booking",
        onClick: handleSubmit,
        variant: "solid" as const,
        colorScheme: "success" as const,
        disabled: loading,
      });
    }

    return actions;
  };

  return (
    <>
      <BaseModal
        open={open}
        onClose={handleClose}
        title={getTitle()}
        description={getDescription()}
        actions={getActions()}
        size="md"
        maxWidth={580}
      >
        <Box sx={{ p: 3 }}>
          {/* Step 1: Guest Information */}
          {step === "guest" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControl>
                <Checkbox
                  checked={useExistingGuest}
                  onChange={(e) => {
                    setUseExistingGuest(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedGuest(null);
                    }
                  }}
                  label="Search for existing guest"
                />
              </FormControl>

              {useExistingGuest ? (
                <>
                  <FormControl>
                    <FormLabel>Search Guest</FormLabel>
                    <Input
                      startDecorator={
                        searching ? (
                          <CircularProgress size="sm" />
                        ) : (
                          <Search size={18} />
                        )
                      }
                      placeholder="Search by name, phone, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </FormControl>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                      {searchResults.map((guest) => (
                        <Box
                          key={guest.tourist_id}
                          onClick={() => handleSelectGuest(guest)}
                          sx={{
                            p: 1.5,
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            bgcolor:
                              selectedGuest?.tourist_id === guest.tourist_id
                                ? "primary.softBg"
                                : "transparent",
                            border: "1px solid",
                            borderColor:
                              selectedGuest?.tourist_id === guest.tourist_id
                                ? "primary.500"
                                : "divider",
                            mb: 1,
                            "&:hover": {
                              bgcolor: "background.level1",
                            },
                          }}
                        >
                          <Avatar size="sm">{guest.full_name[0]}</Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography level="body-sm" fontWeight={600}>
                              {guest.full_name}
                            </Typography>
                            <Typography
                              level="body-xs"
                              sx={{ color: "text.tertiary" }}
                            >
                              {guest.email ||
                                guest.phone_number ||
                                "No contact info"}
                            </Typography>
                          </Box>
                          {guest.booking_history && (
                            <Chip size="sm" variant="soft">
                              {guest.booking_history.total_bookings} stays
                            </Chip>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {selectedGuest && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "success.softBg",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: "success.500",
                      }}
                    >
                      <Typography
                        level="body-sm"
                        fontWeight={600}
                        sx={{ color: "success.700" }}
                      >
                        Selected: {selectedGuest.full_name}
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  <FormControl required>
                    <FormLabel>Guest Name</FormLabel>
                    <Input
                      startDecorator={<User size={18} />}
                      placeholder="Enter guest full name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      startDecorator={<Phone size={18} />}
                      placeholder="Enter phone number"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      startDecorator={<Mail size={18} />}
                      placeholder="Enter email address"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </FormControl>
                </>
              )}
            </Box>
          )}

          {/* Step 2: Booking Details */}
          {step === "booking" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl sx={{ flex: 1 }} required>
                  <FormLabel>Check-in Date</FormLabel>
                  <Input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    slotProps={{
                      input: { min: new Date().toISOString().split("T")[0] },
                    }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1 }} required>
                  <FormLabel>Check-out Date</FormLabel>
                  <Input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    slotProps={{ input: { min: checkInDate } }}
                  />
                </FormControl>
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Check-in Time</FormLabel>
                  <Input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Check-out Time</FormLabel>
                  <Input
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                  />
                </FormControl>
              </Box>

              <FormControl required>
                <FormLabel>Select Room</FormLabel>
                {loadingRooms ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size="sm" />
                    <Typography level="body-sm">
                      Loading available rooms...
                    </Typography>
                  </Box>
                ) : availableRooms.length === 0 ? (
                  <Typography level="body-sm" sx={{ color: "warning.500" }}>
                    No rooms available for selected dates
                  </Typography>
                ) : (
                  <Select
                    value={selectedRoomId}
                    onChange={(_, value) => setSelectedRoomId(value as string)}
                    startDecorator={<Bed size={18} />}
                  >
                    {availableRooms.map((room) => (
                      <Option key={room.id} value={room.id}>
                        Room {room.room_number} - {room.room_type} (₱
                        {room.room_price?.toLocaleString()}/night)
                      </Option>
                    ))}
                  </Select>
                )}
              </FormControl>

              <Divider />

              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Adults</FormLabel>
                  <Input
                    type="number"
                    value={numAdults}
                    onChange={(e) =>
                      setNumAdults(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    slotProps={{ input: { min: 1 } }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Children</FormLabel>
                  <Input
                    type="number"
                    value={numChildren}
                    onChange={(e) =>
                      setNumChildren(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    slotProps={{ input: { min: 0 } }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Infants</FormLabel>
                  <Input
                    type="number"
                    value={numInfants}
                    onChange={(e) =>
                      setNumInfants(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    slotProps={{ input: { min: 0 } }}
                  />
                </FormControl>
              </Box>

              <FormControl>
                <FormLabel>Trip Purpose</FormLabel>
                <Select
                  value={tripPurpose}
                  onChange={(_, value) => setTripPurpose(value as string)}
                >
                  {tripPurposeOptions.map((purpose) => (
                    <Option key={purpose} value={purpose}>
                      {purpose}
                    </Option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <Checkbox
                  checked={immediateCheckin}
                  onChange={(e) => setImmediateCheckin(e.target.checked)}
                  label="Check in immediately"
                />
              </FormControl>
            </Box>
          )}

          {/* Step 3: Confirmation */}
          {step === "confirm" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  bgcolor: "background.level1",
                  p: 2,
                  borderRadius: "12px",
                }}
              >
                <Typography level="title-sm" sx={{ mb: 1.5 }}>
                  Guest Information
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <User size={16} />
                    <Typography level="body-sm">
                      {useExistingGuest ? selectedGuest?.full_name : guestName}
                    </Typography>
                  </Box>
                  {(useExistingGuest
                    ? selectedGuest?.phone_number
                    : guestPhone) && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Phone size={16} />
                      <Typography level="body-sm">
                        {useExistingGuest
                          ? selectedGuest?.phone_number
                          : guestPhone}
                      </Typography>
                    </Box>
                  )}
                  {(useExistingGuest ? selectedGuest?.email : guestEmail) && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Mail size={16} />
                      <Typography level="body-sm">
                        {useExistingGuest ? selectedGuest?.email : guestEmail}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  bgcolor: "background.level1",
                  p: 2,
                  borderRadius: "12px",
                }}
              >
                <Typography level="title-sm" sx={{ mb: 1.5 }}>
                  Booking Details
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Bed size={16} />
                    <Typography level="body-sm">
                      Room {selectedRoom?.room_number} -{" "}
                      {selectedRoom?.room_type}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Calendar size={16} />
                    <Typography level="body-sm">
                      {checkInDate} to {checkOutDate} ({nights} night
                      {nights !== 1 ? "s" : ""})
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Clock size={16} />
                    <Typography level="body-sm">
                      {checkInTime} - {checkOutTime}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Users size={16} />
                    <Typography level="body-sm">
                      {pax} guest{pax !== 1 ? "s" : ""} ({numAdults} adult
                      {numAdults !== 1 ? "s" : ""}
                      {numChildren > 0 &&
                        `, ${numChildren} child${
                          numChildren !== 1 ? "ren" : ""
                        }`}
                      {numInfants > 0 &&
                        `, ${numInfants} infant${numInfants !== 1 ? "s" : ""}`}
                      )
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  bgcolor: "primary.softBg",
                  p: 2,
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: "primary.500",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DollarSign size={20} />
                    <Typography level="title-md">Total Amount</Typography>
                  </Box>
                  <Typography
                    level="h4"
                    fontWeight={700}
                    sx={{ color: "primary.500" }}
                  >
                    ₱{totalPrice.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Chip
                size="lg"
                variant="soft"
                color={immediateCheckin ? "success" : "warning"}
                sx={{ alignSelf: "center" }}
              >
                {immediateCheckin
                  ? "Will check in immediately"
                  : "Will be marked as Reserved"}
              </Chip>
            </Box>
          )}
        </Box>
      </BaseModal>

      <Alert
        open={alertConfig.open}
        onClose={() => setAlertConfig((prev) => ({ ...prev, open: false }))}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
      />
    </>
  );
};

export default WalkInBookingModal;
