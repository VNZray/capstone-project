/**
 * Delete Confirmation Modal Component
 * Confirmation dialog for deleting an emergency facility
 */

import { Modal, ModalDialog, ModalClose, Stack, Box } from "@mui/joy";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { AlertTriangle } from "lucide-react";
import type { EmergencyFacility } from "@/src/types/EmergencyFacility";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  facility: EmergencyFacility | null;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  facility,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  if (!facility) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalDialog sx={{ maxWidth: 400 }}>
        <ModalClose />

        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "danger.100",
              color: "danger.500",
              mb: 2,
            }}
          >
            <AlertTriangle size={32} />
          </Box>

          <Typography.CardTitle sx={{ mb: 1 }}>
            Delete Emergency Facility
          </Typography.CardTitle>

          <Typography.Body sx={{ color: "text.secondary" }}>
            Are you sure you want to delete <strong>{facility.name}</strong>?
            This action cannot be undone.
          </Typography.Body>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            colorScheme="error"
            onClick={onConfirm}
            fullWidth
            loading={isLoading}
          >
            Delete
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
