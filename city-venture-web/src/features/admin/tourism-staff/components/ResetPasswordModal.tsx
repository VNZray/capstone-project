import React from "react";
import { Modal, ModalDialog, DialogTitle, DialogContent, DialogActions, Typography, Stack, Input, IconButton } from "@mui/joy";
import Button from "@/src/components/Button";
import { ClipboardCopy } from "lucide-react";

type Props = {
  open: boolean;
  email?: string;
  temporaryPassword?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void; // triggers reset
};

const ResetPasswordModal: React.FC<Props> = ({
  open,
  email,
  temporaryPassword,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const canCopy = Boolean(temporaryPassword);
  const handleCopy = async () => {
    if (!temporaryPassword) return;
    try {
      await navigator.clipboard.writeText(temporaryPassword);
    } catch {
      // ignore
    }
  };
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog variant="outlined">
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {!temporaryPassword ? (
            <Typography level="body-sm">
              Generate a temporary password for {email}? The user will be prompted to change it on next login.
            </Typography>
          ) : (
            <Stack spacing={1}>
              <Typography level="body-sm">Temporary password for {email}:</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Input value={temporaryPassword} readOnly sx={{ flex: 1 }} />
                <IconButton onClick={handleCopy} disabled={!canCopy}>
                  <ClipboardCopy size={16} />
                </IconButton>
              </Stack>
              <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                Make sure to copy and share this password securely. It will not be shown again.
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" colorScheme="primary" onClick={onClose} disabled={loading}>
            Close
          </Button>
          {!temporaryPassword && (
            <Button variant="solid" colorScheme="primary" onClick={onConfirm} disabled={loading}>
              Generate
            </Button>
          )}
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default ResetPasswordModal;
