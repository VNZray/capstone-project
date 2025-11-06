import React, { useState } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
  Select,
  Option,
  Textarea,
  Button,
  Stack,
  Alert,
} from "@mui/joy";
import type { Report } from "@/src/types/Report";
import { apiService } from "@/src/utils/api";

interface UpdateStatusModalProps {
  open: boolean;
  onClose: () => void;
  report: Report;
  onStatusUpdated: () => void;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  open,
  onClose,
  report,
  onStatusUpdated,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(report.status);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusOptions = [
    { value: "submitted", label: "Submitted" },
    { value: "under_review", label: "Under Review" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "rejected", label: "Rejected" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiService.updateReportStatus(report.id, {
        status: selectedStatus,
        remarks: remarks.trim() || undefined,
        updated_by: undefined, // TODO: Get from auth context
      });

      onStatusUpdated();
      onClose();
      setRemarks("");
    } catch (err) {
      console.error("Failed to update report status:", err);
      setError("Failed to update report status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedStatus(report.status);
    setRemarks("");
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleCancel}>
      <ModalDialog size="md" sx={{ width: 500 }}>
        <ModalClose />
        
        <Typography level="h4" sx={{ mb: 2 }}>
          Update Report Status
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && (
              <Alert color="danger" variant="soft">
                {error}
              </Alert>
            )}

            <FormControl required>
              <FormLabel>New Status</FormLabel>
              <Select
                value={selectedStatus}
                onChange={(_, value) => setSelectedStatus(value as string)}
              >
                {statusOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Remarks (Optional)</FormLabel>
              <Textarea
                placeholder="Add any comments or notes about this status change..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                minRows={3}
                maxRows={6}
              />
              <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                {remarks.length}/500 characters
              </Typography>
            </FormControl>

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="solid"
                loading={loading}
                disabled={selectedStatus === report.status && !remarks.trim()}
              >
                Update Status
              </Button>
            </Stack>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
};

export default UpdateStatusModal;
