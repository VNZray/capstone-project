import React from "react";
import { Modal, ModalDialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/joy";
import Button from "@/src/components/Button";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmDialog: React.FC<Props> = ({
  open,
  title = "Confirm",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog variant="outlined" role="alertdialog">
        <DialogTitle>{title}</DialogTitle>
        {description && (
          <DialogContent>
            <Typography level="body-sm">{description}</Typography>
          </DialogContent>
        )}
        <DialogActions>
          <Button variant="outlined" colorScheme="primary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="solid" colorScheme="primary" onClick={onConfirm} disabled={loading}>
            {confirmLabel}
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default ConfirmDialog;
