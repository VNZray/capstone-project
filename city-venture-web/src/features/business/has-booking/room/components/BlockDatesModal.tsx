/**
 * Block Dates Modal
 *
 * Allows staff to block dates for a room (maintenance, renovation, etc.)
 */

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalClose,
  Sheet,
  Typography,
  Input,
  Select,
  Option,
  FormControl,
  FormLabel,
  Textarea,
  Checkbox,
  Chip,
} from "@mui/joy";
import { Box } from "@mui/material";
import {
  Calendar,
  Lock,
  AlertTriangle,
  Wrench,
  Home,
  Info,
} from "lucide-react";
import Button from "@/src/components/Button";
import Alert from "@/src/components/Alert";
import { colors } from "@/src/utils/Colors";
import { useBusiness } from "@/src/context/BusinessContext";
import {
  createBlockedDate,
  bulkBlockDates,
  checkRoomAvailability,
} from "@/src/services/RoomBlockedDatesService";
import type { BlockReason } from "@/src/types/RoomBlockedDates";
import type { Room } from "@/src/types/Business";

interface BlockDatesModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  rooms: Room[];
  preselectedRoomId?: string;
  preselectedDates?: { start: string; end: string };
}

const blockReasonOptions: {
  value: BlockReason;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "Maintenance", label: "Maintenance", icon: <Wrench size={16} /> },
  { value: "Renovation", label: "Renovation", icon: <Home size={16} /> },
  { value: "Private", label: "Private/Reserved", icon: <Lock size={16} /> },
  {
    value: "Seasonal",
    label: "Seasonal Closure",
    icon: <Calendar size={16} />,
  },
  { value: "Other", label: "Other", icon: <Info size={16} /> },
];

const BlockDatesModal: React.FC<BlockDatesModalProps> = ({
  open,
  onClose,
  onSuccess,
  rooms,
  preselectedRoomId,
  preselectedDates,
}) => {
  const { businessDetails } = useBusiness();

  // Form state
  const [loading, setLoading] = useState(false);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>(
    preselectedRoomId ? [preselectedRoomId] : []
  );
  const [startDate, setStartDate] = useState(
    preselectedDates?.start || new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(preselectedDates?.end || "");
  const [blockReason, setBlockReason] = useState<BlockReason>("Maintenance");
  const [notes, setNotes] = useState("");
  const [blockAllRooms, setBlockAllRooms] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityIssues, setAvailabilityIssues] = useState<string[]>([]);

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

  // Update when preselected values change
  useEffect(() => {
    if (preselectedRoomId) {
      setSelectedRoomIds([preselectedRoomId]);
    }
    if (preselectedDates) {
      setStartDate(preselectedDates.start);
      setEndDate(preselectedDates.end);
    }
  }, [preselectedRoomId, preselectedDates]);

  // Check availability when dates or rooms change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!startDate || !endDate || selectedRoomIds.length === 0) {
        setAvailabilityIssues([]);
        return;
      }

      setCheckingAvailability(true);
      const issues: string[] = [];

      try {
        for (const roomId of selectedRoomIds) {
          const result = await checkRoomAvailability(
            roomId,
            startDate,
            endDate
          );
          if (!result.available) {
            const room = rooms.find((r) => r.id === roomId);
            const roomName = room?.room_number || "Unknown";
            if (result.status === "BOOKING_CONFLICT") {
              issues.push(`Room ${roomName}: Has existing booking`);
            } else if (result.status === "BLOCKED") {
              issues.push(`Room ${roomName}: Already blocked`);
            }
          }
        }
      } catch (error) {
        console.error("Availability check failed:", error);
      } finally {
        setCheckingAvailability(false);
        setAvailabilityIssues(issues);
      }
    };

    const timer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timer);
  }, [startDate, endDate, selectedRoomIds, rooms]);

  // Handle block all rooms toggle
  useEffect(() => {
    if (blockAllRooms) {
      setSelectedRoomIds(rooms.map((r) => r.id));
    } else if (!preselectedRoomId) {
      setSelectedRoomIds([]);
    }
  }, [blockAllRooms, rooms, preselectedRoomId]);

  const handleRoomToggle = (roomId: string) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
    setBlockAllRooms(false);
  };

  const handleSubmit = async () => {
    if (!businessDetails?.id) return;

    // Validation
    if (selectedRoomIds.length === 0) {
      setAlertConfig({
        open: true,
        type: "error",
        title: "Missing Selection",
        message: "Please select at least one room",
      });
      return;
    }

    if (!startDate || !endDate) {
      setAlertConfig({
        open: true,
        type: "error",
        title: "Missing Dates",
        message: "Please select start and end dates",
      });
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setAlertConfig({
        open: true,
        type: "error",
        title: "Invalid Dates",
        message: "End date must be after start date",
      });
      return;
    }

    if (availabilityIssues.length > 0) {
      setAlertConfig({
        open: true,
        type: "warning",
        title: "Availability Conflicts",
        message: "Some rooms have conflicts. Continue anyway?",
      });
      // Allow user to proceed after warning
    }

    setLoading(true);
    try {
      if (selectedRoomIds.length === 1) {
        // Single room block
        await createBlockedDate({
          room_id: selectedRoomIds[0],
          business_id: businessDetails.id,
          start_date: startDate,
          end_date: endDate,
          block_reason: blockReason,
          notes: notes || undefined,
        });
      } else {
        // Bulk block multiple rooms
        const result = await bulkBlockDates({
          room_ids: selectedRoomIds,
          business_id: businessDetails.id,
          start_date: startDate,
          end_date: endDate,
          block_reason: blockReason,
          notes: notes || undefined,
        });

        if (result.errors && result.errors.length > 0) {
          setAlertConfig({
            open: true,
            type: "warning",
            title: "Partial Success",
            message: `Blocked ${result.summary.success} of ${result.summary.total} rooms. ${result.summary.failed} failed.`,
          });
          setTimeout(() => {
            handleClose();
            onSuccess?.();
          }, 2000);
          return;
        }
      }

      setAlertConfig({
        open: true,
        type: "success",
        title: "Dates Blocked",
        message: `Successfully blocked dates for ${
          selectedRoomIds.length
        } room${selectedRoomIds.length > 1 ? "s" : ""}`,
      });

      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1500);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to block dates";
      setAlertConfig({
        open: true,
        type: "error",
        title: "Failed to Block Dates",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRoomIds(preselectedRoomId ? [preselectedRoomId] : []);
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setBlockReason("Maintenance");
    setNotes("");
    setBlockAllRooms(false);
    setAvailabilityIssues([]);
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Sheet
          variant="outlined"
          sx={{
            width: "100%",
            maxWidth: 500,
            maxHeight: "90vh",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          }}
        >
          <ModalClose variant="plain" sx={{ m: 1.5, zIndex: 2 }} />

          {/* Header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${colors.warning} 0%, #f59e0b 100%)`,
              color: "white",
              p: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Lock size={28} />
              <Box>
                <Typography level="h4" sx={{ fontWeight: 700, color: "white" }}>
                  Block Dates
                </Typography>
                <Typography
                  level="body-sm"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
                  Mark rooms as unavailable for selected dates
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Content */}
          <Box
            sx={{ p: 3, overflowY: "auto", maxHeight: "calc(90vh - 200px)" }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Date Selection */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl sx={{ flex: 1 }} required>
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    slotProps={{
                      input: { min: new Date().toISOString().split("T")[0] },
                    }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1 }} required>
                  <FormLabel>End Date</FormLabel>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    slotProps={{ input: { min: startDate } }}
                  />
                </FormControl>
              </Box>

              {/* Block Reason */}
              <FormControl required>
                <FormLabel>Reason</FormLabel>
                <Select
                  value={blockReason}
                  onChange={(_, value) => setBlockReason(value as BlockReason)}
                >
                  {blockReasonOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {option.icon}
                        {option.label}
                      </Box>
                    </Option>
                  ))}
                </Select>
              </FormControl>

              {/* Notes */}
              <FormControl>
                <FormLabel>Notes (Optional)</FormLabel>
                <Textarea
                  placeholder="Add any additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  minRows={2}
                />
              </FormControl>

              {/* Room Selection */}
              <FormControl>
                <FormLabel>Select Rooms</FormLabel>
                <Checkbox
                  checked={blockAllRooms}
                  onChange={(e) => setBlockAllRooms(e.target.checked)}
                  label="Block all rooms"
                  sx={{ mb: 1 }}
                />
              </FormControl>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  maxHeight: 150,
                  overflowY: "auto",
                  p: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "8px",
                }}
              >
                {rooms.map((room) => (
                  <Chip
                    key={room.id}
                    variant={
                      selectedRoomIds.includes(room.id) ? "solid" : "outlined"
                    }
                    color={
                      selectedRoomIds.includes(room.id) ? "warning" : "neutral"
                    }
                    onClick={() => handleRoomToggle(room.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    Room {room.room_number}
                  </Chip>
                ))}
              </Box>

              {/* Selection Summary */}
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                {selectedRoomIds.length} room
                {selectedRoomIds.length !== 1 ? "s" : ""} selected
              </Typography>

              {/* Availability Issues */}
              {availabilityIssues.length > 0 && (
                <Box
                  sx={{
                    bgcolor: "warning.softBg",
                    p: 2,
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: "warning.500",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <AlertTriangle size={18} />
                    <Typography level="title-sm" sx={{ color: "warning.700" }}>
                      Conflicts Detected
                    </Typography>
                  </Box>
                  {availabilityIssues.map((issue, index) => (
                    <Typography
                      key={index}
                      level="body-xs"
                      sx={{ color: "warning.700" }}
                    >
                      • {issue}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* Footer Actions */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              colorScheme="secondary"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              colorScheme="warning"
              onClick={handleSubmit}
              loading={loading || checkingAvailability}
              disabled={selectedRoomIds.length === 0 || !startDate || !endDate}
            >
              Block Dates
            </Button>
          </Box>
        </Sheet>
      </Modal>

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

export default BlockDatesModal;
