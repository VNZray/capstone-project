import React from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Box,
} from "@mui/joy";
import Button from "./Button";
import Typography from "./Typography";

type Action = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

type BaseEditModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actions?: Action[];
  children?: React.ReactNode;
  maxWidth?: string | number;
};

/**
 * BaseEditModal
 * An accessible modal dialog using Joy UI components.
 * - Click outside to close
 * - Escape key closes
 * - Uses custom Typography component for text
 * - Renders header, description, children, and action buttons
 *
 * Usage example (commented at bottom of file):
 */
export default function BaseEditModal({
  open,
  onClose,
  title = "Edit",
  description,
  actions = [],
  children,
  maxWidth = 640,
}: BaseEditModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
          width: { xs: "100%", sm: "100%", md: "60vw", lg: "40vw", xl: "40vw" },
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          borderRadius: "12px",
          p: 0,
        }}
      >
        <ModalClose />


        <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
          <Typography.Header size="sm">{title}</Typography.Header>
        </DialogTitle>

        {description && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Typography.Body size="sm" color="default" sx={{ opacity: 0.7 }}>
              {description}
            </Typography.Body>
          </Box>
        )}

        <Divider />

        <DialogContent
          sx={{
            px: 3,
            py: 3,
            overflow: "auto",
            flex: 1,
          }}
        >
          {children}
        </DialogContent>

        {actions.length > 0 && (
          <>
            <Divider />
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: "flex-end",
                  width: "100%",
                  flexWrap: "wrap",
                }}
              >
                {actions.map((action, idx) => (
                  <Button
                    key={idx}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    variant={
                      action.variant === "primary" ? "solid" : "outlined"
                    }
                    colorScheme={
                      action.variant === "primary" ? "primary" : "secondary"
                    }
                    size="md"
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            </DialogActions>
          </>
        )}
      </ModalDialog>
    </Modal>
  );
}

// Usage example:
//
// <BaseEditModal
//   open={open}
//   onClose={() => setOpen(false)}
//   title="Edit Business Details"
//   description="Update your business information and contact details"
//   actions={[
//     { label: 'Cancel', onClick: () => setOpen(false) },
//     { label: 'Reset', onClick: () => { /* reset logic */ } },
//     { label: 'Save Changes', onClick: () => { /* save logic */ }, variant: 'primary' }
//   ]}
// >
//   <form>...your form fields...</form>
// </BaseEditModal>
