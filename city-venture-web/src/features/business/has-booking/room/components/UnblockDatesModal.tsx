/**
 * Unblock Dates Modal
 *
 * Allows staff to view and remove blocked dates for a room
 */

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalClose,
  Sheet,
  Box,
  Chip,
  CircularProgress,
  Table,
} from "@mui/joy";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import IconButton from "@/src/components/IconButton";
import Alert from "@/src/components/Alert";
import { colors } from "@/src/utils/Colors";
import { Unlock, Trash2, Calendar, AlertTriangle } from "lucide-react";
import type { RoomBlockedDate } from "@/src/types/RoomBlockedDates";
import {
  fetchBlockedDatesByRoomId,
  deleteBlockedDate,
} from "@/src/services/RoomBlockedDatesService";

interface UnblockDatesModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  roomId: string;
  roomNumber?: string;
}

const UnblockDatesModal: React.FC<UnblockDatesModalProps> = ({
  open,
  onClose,
  onSuccess,
  roomId,
  roomNumber,
}) => {
  const [loading, setLoading] = useState(true);
  const [blockedDates, setBlockedDates] = useState<RoomBlockedDate[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Alert state
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

  // Load blocked dates
  const loadBlockedDates = async () => {
    try {
      setLoading(true);
      const dates = await fetchBlockedDatesByRoomId(roomId);
      setBlockedDates(dates);
    } catch (error) {
      console.error("Failed to load blocked dates:", error);
      setAlertConfig({
        open: true,
        type: "error",
        title: "Error",
        message: "Failed to load blocked dates",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && roomId) {
      loadBlockedDates();
    }
  }, [open, roomId]);

  // Handle unblock confirmation
  const handleUnblockClick = (blockedDate: RoomBlockedDate) => {
    const startDate = new Date(blockedDate.start_date).toLocaleDateString();
    const endDate = new Date(blockedDate.end_date).toLocaleDateString();

    setAlertConfig({
      open: true,
      type: "warning",
      title: "Unblock Dates",
      message: `Are you sure you want to unblock ${startDate} - ${endDate}? This will make the room available for booking during this period.`,
      onConfirm: () => handleUnblock(blockedDate.id),
    });
  };

  // Handle unblock
  const handleUnblock = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteBlockedDate(id);

      setAlertConfig({
        open: true,
        type: "success",
        title: "Success",
        message: "Dates unblocked successfully",
      });

      // Refresh the list
      await loadBlockedDates();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to unblock dates:", error);
      setAlertConfig({
        open: true,
        type: "error",
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to unblock dates",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "Maintenance":
        return "warning";
      case "Renovation":
        return "primary";
      case "Private":
        return "neutral";
      case "Seasonal":
        return "success";
      default:
        return "neutral";
    }
  };

  const formatDateRange = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString("en-US", options);
    }

    return `${startDate.toLocaleDateString(
      "en-US",
      options
    )} - ${endDate.toLocaleDateString("en-US", options)}`;
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Sheet
          variant="outlined"
          sx={{
            width: { xs: "95%", sm: "600px" },
            maxHeight: "80vh",
            borderRadius: "md",
            p: 3,
            boxShadow: "lg",
            overflow: "auto",
          }}
        >
          <ModalClose variant="plain" sx={{ m: 1 }} />

          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                bgcolor: "primary.softBg",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Unlock size={24} color={colors.primary} />
            </Box>
            <Box>
              <Typography.CardTitle>Manage Blocked Dates</Typography.CardTitle>
              <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
                {roomNumber ? `Room ${roomNumber}` : "View and unblock dates"}
              </Typography.Body>
            </Box>
          </Box>

          {/* Content */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : blockedDates.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                px: 2,
                bgcolor: "background.level1",
                borderRadius: "8px",
              }}
            >
              <Calendar
                size={48}
                color={colors.gray}
                style={{ marginBottom: 16 }}
              />
              <Typography.Body weight="semibold">
                No Blocked Dates
              </Typography.Body>
              <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
                This room has no blocked dates.
              </Typography.Body>
            </Box>
          ) : (
            <Table
              sx={{
                "& thead th": { bgcolor: "background.level1" },
                "& tbody tr:hover": { bgcolor: "background.level1" },
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: "40%" }}>Date Range</th>
                  <th style={{ width: "25%" }}>Reason</th>
                  <th style={{ width: "25%" }}>Notes</th>
                  <th style={{ width: "10%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {blockedDates.map((blocked) => (
                  <tr key={blocked.id}>
                    <td>
                      <Typography.Body size="sm">
                        {formatDateRange(blocked.start_date, blocked.end_date)}
                      </Typography.Body>
                    </td>
                    <td>
                      <Chip
                        size="sm"
                        color={getReasonColor(blocked.block_reason)}
                        variant="soft"
                      >
                        {blocked.block_reason}
                      </Chip>
                    </td>
                    <td>
                      <Typography.Body
                        size="sm"
                        sx={{ color: "text.secondary" }}
                      >
                        {blocked.notes || "—"}
                      </Typography.Body>
                    </td>
                    <td>
                      <IconButton
                        size="sm"
                        variant="outlined"
                        colorScheme="error"
                        onClick={() => handleUnblockClick(blocked)}
                        disabled={deletingId === blocked.id}
                      >
                        {deletingId === blocked.id ? (
                          <CircularProgress size="sm" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Footer */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              variant="outlined"
              colorScheme="secondary"
              onClick={onClose}
            >
              Close
            </Button>
          </Box>
        </Sheet>
      </Modal>

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
        confirmText={alertConfig.type === "warning" ? "Unblock" : "OK"}
        showCancel={alertConfig.type === "warning"}
      />
    </>
  );
};

export default UnblockDatesModal;
